import { useEffect } from "react";
import { NamedCV } from "job-tool-shared-types";
import { useComponent2PDF } from "../../hooks";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import CVEditor from "./CVEditor/cveditor";
import * as Util from "../../util";
import { Section, SubSection, SplitView, InfoPad, PrintablePage } from "../../components"
import { usePopup } from "../../hooks/popup";
import { useCvsStore, save2backend as saveCv2backend } from "./useCVs";
import { useCvInfoStore } from "./useCVInfo";
import { useShallow } from 'zustand/react/shallow'
import SavedCVsUI from "./savedCVs";
import { ImportForm, SaveForm, FindReplaceForm, StylesForm, SaveFormData, ExportForm, AnnotationForm } from "./forms";
import { CustomStyles } from "../../styles";
import BackendAPI from "../../backend_api";
import { AIEditPane } from "./AIEditPain";

const USE_BACKEND = import.meta.env.VITE_USE_BACKEND === "1";
const saveAnnotation2Backend = (annotation: {
    job: string,
    ncv: NamedCV,
}) => {
    if(!USE_BACKEND) {
        console.log('Not saving annotation (backend disabled)')
        return;
    }
    if(!annotation || !annotation.job || !annotation.ncv) {
        console.log("Invalid annotation: ", annotation);
        return;
    }
    console.log("Saving annotation to backend!")
    BackendAPI.request({
        method: "POST",
        endpoint: "annotations",
        body: annotation
    })
};

function ResumeBuilder() {

    // ---------------- STATE ----------------

    const cvsState = useCvsStore();
    const cur_cv = useCvsStore(useShallow(s => s.ncvs[s.curIdx]));
    const curIsModified = useCvsStore(s => s.trackMods[s.curIdx])

    const cvInfoState = useCvInfoStore();

    // Fetch data on mount
    useEffect(() => {
        cvsState.fetch();
        cvInfoState.fetch();
    }, []);

    const saveAsPDF = useComponent2PDF("cv-page");

    const CONTROLS = {
        popups: {
            onPDFClicked: () => {
                saveAsPDF(cur_cv?.name);
                exportPopup.close();
            },

            onJsonClicked: () => {
                if (cur_cv) Util.downloadAsJson(cur_cv);
                exportPopup.close();
            },

            /** ASSUMPTION: for this form to be open, cur_cv was modified */
            onSaveFormSubmit: (formData: SaveFormData) => {
                // 1. Save NCV to backend
                console.log("onSaveFormSubmit: ", formData);
                const overwrite = formData.name === cur_cv.name;
                saveCv2backend({
                    ...formData,
                    data: cur_cv.data,
                }, overwrite)
                savePopup.close();
            },

            /** ASSUMPTION: for this form to be called, `job` was not empty */
            onSaveAnnotationFormSubmit: (formData: ExportForm) => {
                console.log('onSaveAnnotationFormSubmit ')
                saveAnnotation2Backend({
                    job: formData.job,
                    ncv: cur_cv,
                })
            },

            onImportJsonFileChange: (
                e: React.ChangeEvent<HTMLInputElement>
            ) => {
                Util.jsonFileImport(e, cvsState.add);
                importPopup.close();
            },

            onPasteJson: (json_str: string, name: string) => {
                const cv = JSON.parse(json_str);
                cvsState.add(cv);
            },

            onDeleteCV: () => {
                cvsState.delCur(); // NOTE: only deletes locally
                deletePopup.close();
            }
        },
        settings: {

            onImportFormComplete: (ncv: NamedCV) => {
                console.log(`onImportFormComplete: ncv = `, ncv)
                cvsState.add(ncv);
                importPopup.close();
            },

            onFindAndReplace: ({find, replace}) => {
                console.log(`find: ${find}, replace: ${replace}`)
                try {
                    cvsState.update(
                        JSON.parse(
                            JSON.stringify(cur_cv.data)
                            .replaceAll(find, replace)
                        )
                    );
                } catch(err: unknown) {
                    alert(`Invalid find/replace strings: ${err}`);
                }
                findReplacePopup.close();
            }
        }
    };

    // --------------------------------------------------------------------------------
    //                                      POPUPS
    // --------------------------------------------------------------------------------

    const exportPopup = usePopup("Export")
    const savePopup = usePopup("Save")
    const importPopup = usePopup("Import")
    const deletePopup = usePopup("Delete")
    const findReplacePopup = usePopup('Find/Replace')
    const updateStylesPopup = usePopup("Style")

    const popups: { [key: string]: {hook, content, disabled?} } = {
        save: {
            hook: savePopup,
            content: (
                <SaveForm
                    cvInfo={cur_cv}
                    onSave={CONTROLS.popups.onSaveFormSubmit}
                />
            ),
            // Disable save button when no changes have been made
            disabled: !curIsModified
        },
        export: {
            hook: exportPopup,
            content: (
                <div id="export-popup" className={CustomStyles.popup_content}>
                    <AnnotationForm onSubmit={CONTROLS.popups.onSaveAnnotationFormSubmit}/>
                    <h2>Export As</h2>
                    <button onClick={CONTROLS.popups.onPDFClicked}>PDF</button>
                    <button onClick={CONTROLS.popups.onJsonClicked}>JSON</button>
                </div>
            )
        },
        import: {
            hook: importPopup,
            content: (
                <div id="import-popup" className={CustomStyles.popup_content}>
                    <ImportForm cb={CONTROLS.settings.onImportFormComplete}/>
                </div>
            )
        },
        delete: {
            hook: deletePopup,
            content: (
                <div className={CustomStyles.popup_content}>
                    <p>Are you sure you want to delete?</p>
                    <button onClick={CONTROLS.popups.onDeleteCV}>Yes</button>
                </div>
            )
        },
        findReplace: {
            hook: findReplacePopup,
            content: (
                <FindReplaceForm cb={CONTROLS.settings.onFindAndReplace} />
            )
        },
        styles: {
            hook: updateStylesPopup,
            content: (
                <StylesForm/>
            )
        }
    };

    // --------------------------------------------------------------------------------
    //                                      VIEW
    // --------------------------------------------------------------------------------

    if ( !cvsState.status || !cvInfoState.status ) return null;
    return (
        <Section id="section-cv" heading="Resume Builder">

            {/* ------------ VIEW SAVED CVs ------------ */}
            <SubSection id="named-cvs" heading="Resumes">
                { popups.import.hook.getTriggerButton({content: popups.import.content}) }
                <SavedCVsUI />
            </SubSection>

            {/* ------------ CUR CV INFO, SAVE/EXPORT BUTTONS ------------ */}
            <SubSection id="display-info">
                <div className="flex justify-between">
                    {/* FILE NAME */}
                    <div>
                        <span>Name:</span>
                        {cur_cv?.name}
                        {cvsState.trackMods[cvsState.curIdx] && (
                            <span className="text-darkgrey ml-2">{"(modified)"}</span>
                        )}
                    </div>
                    {/* TAGS */}
                    <div>
                        <span className="descr">Tags:</span>
                        {cur_cv?.tags?.join(", ")}
                    </div>
                    {/* BUTTONS */}
                    <div title="cv-buttons" className="max-w-33% flex gap-1 flex-wrap">
                        {Object.values(popups).map(popup =>
                            // Render a button that will open the popup
                            popup.hook.getTriggerButton(
                                { content: popup.content },
                                {
                                    disabled: popup.disabled,
                                    key: `popup-${popup.hook.title}`
                                }
                            )
                        )}
                    </div>
                </div>
            </SubSection>

            {/* ------------ DRAG/DROP ELEMENTS ------------ */}

            <DndProvider backend={HTML5Backend}>

                {/* ------------ AI EDIT - PANE ------------ */}

                <SubSection id="named-cvs">
                    <AIEditPane/>
                </SubSection>

                {/* ------------ CV EDITOR ------------ */}

                <SplitView>
                    <PrintablePage page_id="cv-page">
                        <CVEditor cv={cur_cv.data} onUpdate={cvsState.update} />
                    </PrintablePage>
                    <InfoPad mode="ALL-CVS" info={cvInfoState.cv_info} onUpdate={cvInfoState.set} />
                </SplitView>

            </DndProvider>
        </Section>
    );
}

export default ResumeBuilder;

"use client"

import { useEffect } from "react";
import { NamedCV } from "@/lib/types";
import { useComponent2PDF } from "@/hooks";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import CVEditor from "@/components/CVEditor/cveditor";
import * as Util from "@/lib/utils";
import { SubSection, SplitView, InfoPad, PrintablePage } from "@/components"
import { usePopup } from "@/hooks/popup";
import { useCvsStore, save2backend as saveCv2backend } from "@/hooks/useCVs";
import { useCvInfoStore } from "@/hooks/useCVInfo";
import { useShallow } from 'zustand/react/shallow'
import SavedCVsUI from "@/components/savedCVs";
import { ImportForm, SaveForm, FindReplaceForm, StylesForm, SaveFormData, ExportForm } from "@/components/forms";
import { AIEditPane } from "@/components/AIEditPain";

// Next.js API routes instead of external backend
const saveAnnotation2Backend = async (annotation: {
    job: string,
    ncv: NamedCV,
}) => {
    try {
        const response = await fetch('/api/annotations', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(annotation)
        });
        if (!response.ok) {
            throw new Error('Failed to save annotation');
        }
        console.log("Annotation saved successfully!");
    } catch (error) {
        console.error("Error saving annotation:", error);
    }
};

export default function ResumeBuilderPage() {
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

            onSaveFormSubmit: (formData: SaveFormData) => {
                console.log("onSaveFormSubmit: ", formData);
                const overwrite = formData.name === cur_cv.name;
                saveCv2backend({
                    ...formData,
                    data: cur_cv.data,
                }, overwrite)
                savePopup.close();
            },

            onSaveAnnotationFormSubmit: (formData: ExportForm) => {
                console.log('onSaveAnnotationFormSubmit ')
                if (formData.job) {
                    saveAnnotation2Backend({
                        job: formData.job,
                        ncv: cur_cv,
                    })
                }
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

            onFindReplaceSubmit: (data: { find: string, replace: string }) => {
                cvsState.findReplace(data.find, data.replace);
                findReplacePopup.close();
            },

            onStyleFormSubmit: () => {
                // StylesForm doesn't take any parameters - it handles its own state
                stylesPopup.close();
            },
        },
    };

    // POPUPS
    const savePopup = usePopup("Save",
        <SaveForm
            cvInfo={cur_cv ? { name: cur_cv.name, path: cur_cv.path, tags: cur_cv.tags } : { name: "", path: "", tags: [] }}
            onSave={CONTROLS.popups.onSaveFormSubmit}
        />
    );

    const exportPopup = usePopup("Export",
        <ExportForm
            onSubmit={CONTROLS.popups.onSaveAnnotationFormSubmit}
        />
    );

    const importPopup = usePopup("Import",
        <ImportForm
            cb={(ncv: NamedCV) => {
                cvsState.add(ncv);
                importPopup.close();
            }}
        />
    );

    const findReplacePopup = usePopup("Find & Replace",
        <FindReplaceForm cb={CONTROLS.popups.onFindReplaceSubmit} />
    );

    const stylesPopup = usePopup("Styles",
        <StylesForm />
    );

    const popups = {
        save: {
            hook: savePopup,
        },
        export: {
            hook: exportPopup,
        },
        import: {
            hook: importPopup,
        },
        findReplace: {
            hook: findReplacePopup,
        },
        styles: {
            hook: stylesPopup,
        },
    };

    if (!cvsState.status || !cvInfoState.status) return null;

    return (
        <div className="flex flex-col h-full p-6">
            <h1 className="text-3xl font-bold mb-6">Resume Builder</h1>

            {/* ------------ VIEW SAVED CVs ------------ */}
            <SubSection id="named-cvs" heading="Resumes">
                <button
                    onClick={() => popups.import.hook.open()}
                    className="px-3 py-1 bg-blue-500 text-white rounded mb-2"
                >
                    Import
                </button>
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
                            <span className="text-gray-500 ml-2">{"(modified)"}</span>
                        )}
                    </div>
                    {/* TAGS */}
                    <div>
                        <span className="text-gray-600">Tags:</span>
                        {cur_cv?.tags?.join(", ")}
                    </div>
                    {/* BUTTONS */}
                    <div title="cv-buttons" className="max-w-33% flex gap-1 flex-wrap">
                        {[
                            { popup: popups.save.hook, disabled: !curIsModified },
                            { popup: popups.export.hook, disabled: !cur_cv },
                            { popup: popups.import.hook, disabled: false },
                            { popup: popups.findReplace.hook, disabled: !cur_cv },
                            { popup: popups.styles.hook, disabled: !cur_cv },
                        ].map(({ popup, disabled }, index) =>
                            <button
                                key={`popup-${popup.title}-${index}`}
                                disabled={disabled}
                                onClick={() => popup.open()}
                                className="px-3 py-1 bg-blue-500 text-white rounded disabled:opacity-50"
                            >
                                {popup.title}
                            </button>
                        )}
                        {/* Render popup components */}
                        {Object.values(popups).map(popup => popup.hook.component)}
                    </div>
                </div>
            </SubSection>

            {/* ------------ DRAG/DROP ELEMENTS ------------ */}
            <DndProvider backend={HTML5Backend}>
                {/* ------------ AI EDIT - PANE ------------ */}
                <SubSection id="ai-edit">
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
        </div>
    );
}

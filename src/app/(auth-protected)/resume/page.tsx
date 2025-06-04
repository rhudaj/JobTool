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

    // POPUPS - Using new simplified API
    const savePopup = usePopup("Save",
        <SaveForm
            cvInfo={cur_cv ? { name: cur_cv.name, path: cur_cv.path, tags: cur_cv.tags } : { name: "", path: "", tags: [] }}
            onSave={CONTROLS.popups.onSaveFormSubmit}
        />,
        { size: "default" }
    );

    const exportPopup = usePopup("Export",
        <ExportForm
            onPDFClicked={CONTROLS.popups.onPDFClicked}
            onJsonClicked={CONTROLS.popups.onJsonClicked}
        />,
        { size: "default" }
    );

    const importPopup = usePopup("Import",
        <ImportForm
            cb={(ncv: NamedCV) => {
                cvsState.add(ncv);
                importPopup.close();
            }}
        />,
        { size: "lg" }
    );

    const findReplacePopup = usePopup("Find & Replace",
        <FindReplaceForm cb={CONTROLS.popups.onFindReplaceSubmit} />,
        { size: "default" }
    );

    const stylesPopup = usePopup("Styles",
        <StylesForm />,
        { size: "lg" }
    );

    if (!cvsState.status || !cvInfoState.status) return null;

    return (
        <div className="flex flex-col h-full p-6">
            <h1 className="text-3xl font-bold mb-6">Resume Builder</h1>

            {/* ------------ VIEW SAVED CVs ------------ */}
            <SubSection id="named-cvs" heading="Resumes">
                {importPopup.createTriggerButton("Import", undefined, {
                    className: "px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 mb-2"
                })}
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
                    <div title="cv-buttons" className="max-w-33% flex gap-2 flex-wrap">
                        {savePopup.createTriggerButton("Save", undefined, {
                            disabled: !curIsModified,
                            className: "px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        })}
                        {exportPopup.createTriggerButton("Export", undefined, {
                            disabled: !cur_cv,
                            className: "px-3 py-1 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        })}
                        {findReplacePopup.createTriggerButton("Find & Replace", undefined, {
                            disabled: !cur_cv,
                            className: "px-3 py-1 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        })}
                        {stylesPopup.createTriggerButton("Styles", undefined, {
                            disabled: !cur_cv,
                            className: "px-3 py-1 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        })}
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

            {/* Auto-rendering popups */}
            <savePopup.PopupComponent />
            <exportPopup.PopupComponent />
            <importPopup.PopupComponent />
            <findReplacePopup.PopupComponent />
            <stylesPopup.PopupComponent />
        </div>
    );
}

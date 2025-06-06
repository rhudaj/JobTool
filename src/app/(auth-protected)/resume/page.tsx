"use client";

import { useEffect, useState } from "react";
import { NamedCV } from "@/lib/types";
import { useComponent2PDF } from "@/hooks";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import CVEditor from "@/components/CVEditor/cveditor";
import * as Util from "@/lib/utils";
import { SubSection, SplitView, PrintablePage, InfoPad } from "@/components";
import { usePopup } from "@/hooks/popup";
import { useCvsStore, save2backend as saveCv2backend } from "@/hooks/useCVs";
import { useCvInfoStore } from "@/hooks/useCVInfo";
import { useShallow } from "zustand/react/shallow";
import SavedCVsUI from "@/components/savedCVs";
import {
    ImportForm,
    SaveForm,
    SaveFormData,
    ExportForm,
} from "@/components/forms";
import { AIEditPane } from "@/components/AIEditPain";
import { EditPane } from "@/components/EditPane";

export default function ResumeBuilderPage() {
    const ENABLE_AI_EDIT_PANE = false;
    const ENABLE_CV_INFO = false;

    // ---------------- STATE ----------------
    const cvsState = useCvsStore();
    const cur_cv = useCvsStore(useShallow((s) => s.ncvs[s.curIdx]));
    const curIsModified = useCvsStore((s) => s.trackMods[s.curIdx]);
    const cvInfoState = useCvInfoStore(); // Fetch data on mount
    const [editModeEnabled, setEditModeEnabled] = useState(false);

    // Fetch data on mount
    useEffect(() => {
        cvsState.fetch();
        cvInfoState.fetch();
    }, []);

    const saveAsPDF = useComponent2PDF("cv-page");

    // Handler functions with fresh state access
    const handlePDFClicked = () => {
        saveAsPDF(cur_cv?.name);
        exportPopup.close();
    };

    const handleJsonClicked = () => {
        // Get fresh data directly from store (otherwise its stale)
        const store = useCvsStore.getState();
        const currentCv = store.ncvs[store.curIdx];

        if (currentCv && currentCv.data) {
            Util.downloadAsJson(currentCv);
        }
        exportPopup.close();
    };

    const handleSaveFormSubmit = (formData: SaveFormData) => {
        console.log("onSaveFormSubmit: ", formData);
        const overwrite = formData.name === cur_cv.name;
        saveCv2backend(
            {
                ...formData,
                data: cur_cv.data,
            },
            overwrite
        );
        savePopup.close();
    };

    const handleImportJsonFileChange = (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        Util.jsonFileImport(e, cvsState.add);
        importPopup.close();
    };

    const handlePasteJson = (json_str: string, name: string) => {
        const cv = JSON.parse(json_str);
        cvsState.add(cv);
    };

    const handleFindReplaceSubmit = (data: {
        find: string;
        replace: string;
    }) => {
        cvsState.findReplace(data.find, data.replace);
    };

    const handleStyleFormSubmit = () => {
        // StylesForm doesn't take any parameters - it handles its own state
        // No action needed since styles are handled internally
    };

    const handleEditModeToggle = () => {
        setEditModeEnabled(!editModeEnabled);
    };

    // POPUPS - Using new simplified API (only for Save, Export, and Import)
    const savePopup = usePopup(
        "Save",
        <SaveForm
            cvInfo={
                cur_cv
                    ? {
                          name: cur_cv.name,
                          path: cur_cv.path,
                          tags: cur_cv.tags,
                      }
                    : { name: "", path: "", tags: [] }
            }
            onSave={handleSaveFormSubmit}
        />,
        { size: "default" }
    );

    const exportPopup = usePopup(
        "Export",
        <ExportForm
            onPDFClicked={handlePDFClicked}
            onJsonClicked={handleJsonClicked}
        />,
        { size: "default" }
    );

    const importPopup = usePopup(
        "Import",
        <ImportForm
            cb={(ncv: NamedCV) => {
                cvsState.add(ncv);
                importPopup.close();
            }}
        />,
        { size: "lg" }
    );

    // Only block rendering if we truly have no data
    if (!cvsState.ncvs?.length && !cvsState.status) {
        return <div className="p-6">Loading CVs...</div>;
    }

    return (
        <div className="flex flex-col h-full p-6">
            {/* ------------ VIEW SAVED CVs ------------ */}
            <SubSection id="named-cvs" heading="Resumes">
                {importPopup.createTriggerButton("Import", undefined, {
                    className:
                        "px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 mb-2",
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
                            <span className="text-gray-500 ml-2">
                                {"(modified)"}
                            </span>
                        )}
                    </div>
                    {/* TAGS */}
                    <div>
                        <span className="text-gray-600">Tags:</span>
                        {cur_cv?.tags?.join(", ")}
                    </div>
                    {/* BUTTONS */}
                    <div
                        title="cv-buttons"
                        className="max-w-33% flex gap-2 flex-wrap"
                    >
                        {savePopup.createTriggerButton("Save", undefined, {
                            disabled: !curIsModified,
                            className:
                                "px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed",
                        })}
                        {exportPopup.createTriggerButton("Export", undefined, {
                            disabled: !cur_cv,
                            className:
                                "px-3 py-1 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed",
                        })}
                        <button
                            onClick={handleEditModeToggle}
                            disabled={!cur_cv}
                            className={`px-3 py-1 rounded-md disabled:opacity-50 disabled:cursor-not-allowed ${
                                editModeEnabled
                                    ? "bg-blue-700 text-white"
                                    : "bg-blue-600 text-white hover:bg-blue-700"
                            }`}
                        >
                            {editModeEnabled ? "Exit Edit" : "Edit"}
                        </button>
                    </div>
                </div>
            </SubSection>

            {/* ------------ DRAG/DROP ELEMENTS ------------ */}
            <DndProvider backend={HTML5Backend}>
                {/* ------------ AI EDIT - PANE ------------ */}
                {ENABLE_AI_EDIT_PANE && (
                    <SubSection id="ai-edit">
                        <AIEditPane />
                    </SubSection>
                )}

                {/* ------------ CV EDITOR ------------ */}
                {editModeEnabled ? (
                    <SplitView>
                        <PrintablePage page_id="cv-page">
                            <CVEditor
                                cv={cur_cv?.data}
                                onUpdate={cvsState.update}
                            />
                        </PrintablePage>
                        <EditPane
                            cvInfo={cvInfoState.cv_info}
                            onCvInfoUpdate={cvInfoState.set}
                            onFindReplaceSubmit={handleFindReplaceSubmit}
                            onStyleFormSubmit={handleStyleFormSubmit}
                        />
                    </SplitView>
                ) : ENABLE_CV_INFO && cvInfoState.status ? (
                    <SplitView>
                        <PrintablePage page_id="cv-page">
                            <CVEditor
                                cv={cur_cv?.data}
                                onUpdate={cvsState.update}
                            />
                        </PrintablePage>
                        <InfoPad
                            mode="ALL-CVS"
                            info={cvInfoState.cv_info}
                            onUpdate={cvInfoState.set}
                        />
                    </SplitView>
                ) : (
                    <div className="py-10 px-[20%]  w-full bg-gray-600">
                        <PrintablePage page_id="cv-page">
                            <CVEditor
                                cv={cur_cv?.data}
                                onUpdate={cvsState.update}
                            />
                        </PrintablePage>
                    </div>
                )}
            </DndProvider>

            {/* Auto-rendering popups */}
            <savePopup.PopupComponent />
            <exportPopup.PopupComponent />
            <importPopup.PopupComponent />
        </div>
    );
}

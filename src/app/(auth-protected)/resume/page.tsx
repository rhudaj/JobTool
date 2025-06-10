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
import { useCvsMetadataStore } from "@/hooks/useCvsMetadata";
import { useCurrentCvStore } from "@/hooks/useCurrentCv";
import { useCvInfoStore } from "@/hooks/useCVInfo";
import SavedCVsUI from "@/components/CVEditor/savedCVs";
import {
    ImportForm,
    SaveForm,
    SaveFormData,
    ExportForm,
    FindReplaceForm,
    StylesForm,
} from "@/components/CVEditor/forms";
import { AIEditPane } from "@/components/AIEditPain";
import { CustomTabView } from "@/components/ui/customTabView";
import { extractContentFromNamedCV } from "@/lib/cv-converter";

export default function ResumeBuilderPage() {
    const ENABLE_AI_EDIT_PANE = false;

    // ---------------- STATE ----------------
    const metadataStore = useCvsMetadataStore();
    const currentCvStore = useCurrentCvStore();
    const cvInfoState = useCvInfoStore(); // Fetch data on mount
    const [editModeEnabled, setEditModeEnabled] = useState(false);

    // Fetch metadata on mount
    useEffect(() => {
        metadataStore.fetch();
        cvInfoState.fetch();
    }, []);

    const saveAsPDF = useComponent2PDF("cv-page");

    // Handler functions with fresh state access
    const handlePDFClicked = () => {
        saveAsPDF(currentCvStore.cv?.name);
        exportPopup.close();
    };

    useEffect(() => {
        console.debug(
            "Current CV changed!. Is null? = ",
            currentCvStore.cv === null
        );
    }, [currentCvStore.cv]);

    const handleJsonClicked = () => {
        // Get fresh state reference
        if (currentCvStore.cv) {
            console.info("Downloading CV as json");
                // Save only the content, not core-stuff
            const contentOnly = extractContentFromNamedCV(currentCvStore.cv)
            Util.downloadAsJson(contentOnly);
        } else {
            console.warn("Tried to download CV when its empty: ", currentCvStore.cv);
        }
        exportPopup.close();
    };

    const handleSaveFormSubmit = async (formData: SaveFormData) => {
        console.log("onSaveFormSubmit: ", formData);
        const overwrite = formData.name === currentCvStore.cv?.name;

        try {
            if (overwrite) {
                await currentCvStore.saveCv();
            } else {
                await currentCvStore.saveCvAs(formData);
            }
            // Refresh metadata after successful save
            metadataStore.refresh();
            savePopup.close();
        } catch (error) {
            // Error is already handled in the store, just log it
            console.error("Save failed:", error);
        }
    };

    const handleImportJsonFileChange = (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        Util.jsonFileImport(e, (ncv: NamedCV) => {
            // We would need to save the imported CV first, then load it
            // For now, let's just alert about this functionality
            alert(
                "Import functionality needs to be integrated with the new backend API"
            );
            metadataStore.refresh(); // Refresh metadata after import
        });
        importPopup.close();
    };

    const handlePasteJson = (json_str: string, name: string) => {
        // Similar issue - we need to save the CV first
        alert(
            "Paste functionality needs to be integrated with the new backend API"
        );
        metadataStore.refresh(); // Refresh metadata
    };

    const handleFindReplaceSubmit = (data: {
        find: string;
        replace: string;
    }) => {
        currentCvStore.findReplace(data.find, data.replace);
    };

    const handleStyleFormSubmit = () => {
        // StylesForm doesn't take any parameters - it handles its own state
        // No action needed since styles are handled internally
    };

    const handleEditModeToggle = () => {
        setEditModeEnabled(!editModeEnabled);
    };

    // POPUPS - Using new simplified API (only for Save, Export, and Import)
    const savePopup = usePopup("Save", null, { size: "default" });

    // Create SaveForm content dynamically when popup opens
    const openSavePopup = () => {
        const cvInfo = currentCvStore.cv
            ? {
                  name: currentCvStore.cv.name,
                  path: currentCvStore.cv.path || "/",
                  tags: currentCvStore.cv.tags || [],
              }
            : { name: "", path: "/", tags: [] };

        savePopup.open(
            <SaveForm cvInfo={cvInfo} onSave={handleSaveFormSubmit} />
        );
    };

    const exportPopup = usePopup("Export", null, { size: "default" });

    const openExportPopup = () => {
        exportPopup.open(
            <ExportForm
                onPDFClicked={handlePDFClicked}
                onJsonClicked={handleJsonClicked}
            />
        );
    };

    const importPopup = usePopup(
        "Import",
        <ImportForm
            cb={(ncv: NamedCV) => {
                // TODO: Integrate with new backend API
                alert(
                    "Import functionality needs to be updated for new architecture"
                );
                importPopup.close();
            }}
        />,
        { size: "lg" }
    );

    // Only block rendering if we truly have no data
    if (!metadataStore.status && metadataStore.metadata.length === 0) {
        return <div className="p-6">Loading CVs...</div>;
    }

    // Define the tabs in the RHS of the split-view when `Edit Mode` is enabled
    const edit_tabs = [
        {
            id: "find-replace",
            label: "Find/Replace",
            content: <FindReplaceForm cb={handleFindReplaceSubmit} />,
        },
        {
            id: "styles",
            label: "Styles",
            content: <StylesForm />,
        },
        {
            id: "cv-info",
            label: "CV Info",
            content: (
                <InfoPad
                    mode="CV-INFO"
                    info={cvInfoState.cv_info}
                    onUpdate={cvInfoState.set}
                />
            ),
        },
    ];

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
                        {currentCvStore.cv?.name}
                        {currentCvStore.isModified && (
                            <span className="text-gray-500 ml-2">
                                {"(modified)"}
                            </span>
                        )}
                    </div>
                    {/* TAGS */}
                    <div>
                        <span className="text-gray-600">Tags:</span>
                        {currentCvStore.cv?.tags?.join(", ")}
                    </div>
                    {/* BUTTONS */}
                    <div
                        title="cv-buttons"
                        className="max-w-33% flex gap-2 flex-wrap"
                    >
                        <button
                            onClick={openSavePopup}
                            disabled={!currentCvStore.isModified}
                            className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Save
                        </button>
                        <button
                            onClick={openExportPopup}
                            disabled={!currentCvStore.cv}
                            className="px-3 py-1 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Export
                        </button>
                        <button
                            onClick={handleEditModeToggle}
                            disabled={!currentCvStore.cv}
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
                        {/* LHS VIEW */}
                        <PrintablePage page_id="cv-page">
                            <CVEditor
                                cv={currentCvStore.cv?.data}
                                onUpdate={currentCvStore.updateCv}
                            />
                        </PrintablePage>
                        {/* RHS VIEW */}
                        <CustomTabView tabs={edit_tabs} />
                    </SplitView>
                ) : (
                    <div className="py-10 px-[20%]  w-full bg-gray-600">
                        <PrintablePage page_id="cv-page">
                            <CVEditor
                                cv={currentCvStore.cv?.data}
                                onUpdate={currentCvStore.updateCv}
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

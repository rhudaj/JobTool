import React from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { FindReplaceForm, StylesForm } from "@/components/forms";
import { InfoPad } from "@/components/infoPad";

interface EditPaneProps {
    cvInfo?: any;
    onCvInfoUpdate?: (newInfo: any) => void;
    onFindReplaceSubmit?: (data: { find: string; replace: string }) => void;
    onStyleFormSubmit?: () => void;
}

export function EditPane({
    cvInfo,
    onCvInfoUpdate,
    onFindReplaceSubmit,
    onStyleFormSubmit,
}: EditPaneProps) {
    const tabs = [
        {
            id: "find-replace",
            label: "Find/Replace",
            content: <FindReplaceForm cb={onFindReplaceSubmit || (() => {})} />,
        },
        {
            id: "styles",
            label: "Styles",
            content: <StylesForm />,
        },
        {
            id: "cv-info",
            label: "CV Info",
            content:
                cvInfo && onCvInfoUpdate ? (
                    <InfoPad
                        mode="ALL-CVS"
                        info={cvInfo}
                        onUpdate={onCvInfoUpdate}
                    />
                ) : cvInfo && onCvInfoUpdate ? (
                    <InfoPad
                        mode="ALL-CVS"
                        info={cvInfo}
                        onUpdate={onCvInfoUpdate}
                    />
                ) : (
                    <div className="text-gray-500">CV Info not available</div>
                ),
        },
    ];

    return (
        <div className="h-full bg-white">
            <Tabs defaultValue="find-replace" className="h-full flex flex-col">
                {/* List of Tab Triggers */}
                <TabsList className="flex-shrink-0 w-full justify-start rounded-none border-b bg-gray-50">
                    {tabs.map((tab) => (
                        <TabsTrigger
                            key={tab.id}
                            value={tab.id}
                            className="flex-1"
                        >
                            {tab.label}
                        </TabsTrigger>
                    ))}
                </TabsList>

                {/* TAB CONTENT */}
                <div className="flex-1 overflow-y-auto">
                    {tabs.map((tab) => (
                        <TabsContent
                            key={tab.id}
                            value={tab.id}
                            className="h-full p-4"
                        >
                            {tab.content}
                        </TabsContent>
                    ))}
                </div>
            </Tabs>
        </div>
    );
}

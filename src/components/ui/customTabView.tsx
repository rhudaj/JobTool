import React from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

interface CustomTabViewProps {
    tabs: TabInfo[];
}

interface TabInfo {
    id: string;
    label: string;
    content: React.ReactNode;
}

export function CustomTabView({ tabs, }: CustomTabViewProps) {
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

"use client"

import { NamedCV } from "@/lib/types";
import JIDisplay from "@/components/JobAnalyze/JIDisplay";
import { Section, SplitView } from "@/components";
import { useEffect, useRef, useState } from "react";

export default function JobAnalyzePage() {
    const JIRef = useRef<any>(null);
    const [initJobText, setInitJobText] = useState<string>("");
    const [jobText, setJobText] = useState<string>("");

    const saveAnnotation = async () => {
        try {
            const response = await fetch('/api/annotations', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    job_text: initJobText,
                    annotations: JIRef.current?.get(),
                })
            });

            if (!response.ok) {
                throw new Error('Failed to save annotation');
            }

            alert("Success!");
        } catch (error) {
            console.error('Error saving annotation:', error);
            alert('Failed to save annotation');
        }
    };

    const onAnalyzeJobClicked = async () => {
        if (!jobText.trim()) return;

        setInitJobText(jobText);

        try {
            const response = await fetch('/api/ai/analyze-job', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ job_text: jobText })
            });

            if (!response.ok) {
                throw new Error('Failed to analyze job');
            }

            const data = await response.json();
            JIRef.current?.set(data.analysis || []);
        } catch (error) {
            console.error('Error analyzing job:', error);
            alert('Failed to analyze job');
        }
    };

    const textAreaStyle: React.CSSProperties = {
        height: "100%",
        width: "100%",
        padding: "1rem",
        fontSize: "16px",
        fontFamily: "Arial, Helvetica, sans-serif",
        resize: "none" as const,
        outline: "none",
    };

    return (
        <div className="h-full p-6">
            <h1 className="text-3xl font-bold mb-6">Job Analyze</h1>

            <SplitView>
                <div className="flex flex-col h-full">
                    <div className="mb-4 space-x-4">
                        <button
                            onClick={onAnalyzeJobClicked}
                            disabled={!jobText.trim()}
                            className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
                        >
                            Analyze Job
                        </button>
                        <button
                            onClick={saveAnnotation}
                            disabled={!initJobText}
                            className="px-4 py-2 bg-green-500 text-white rounded disabled:opacity-50"
                        >
                            Save Annotation
                        </button>
                    </div>
                    <textarea
                        style={textAreaStyle}
                        value={jobText}
                        onChange={(e) => setJobText(e.target.value)}
                        placeholder="Paste job description here..."
                        className="border border-gray-300 rounded-md flex-1"
                    />
                </div>
                <JIDisplay ref={JIRef} />
            </SplitView>
        </div>
    );
}

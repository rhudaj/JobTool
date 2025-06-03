"use client"

import { useEffect, useState } from "react";
import { DndProvider } from "react-dnd";
import CLEditor from "@/components/CLBuilder/cleditor";
import { Section, PrintablePage } from "@/components";
import { HTML5Backend } from "react-dnd-html5-backend";
import { useComponent2PDF } from "@/hooks";
import { usePopup } from "@/hooks/popup";

const JobPopup = (props: {
    onEnter: (result: string[]) => void;
}) => {
    const [jobTxt, setJobTxt] = useState<string>("");
    const [result, setResult] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const TA_styles: React.CSSProperties = {
        minHeight: "10em",
        width: "100%",
        padding: "1rem",
        fontSize: "16px",
        fontFamily: "Arial, Helvetica, sans-serif",
        resize: "none" as const,
        outline: "none",
    }

    const onGenerateClicked = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/ai/generate-cover-letter', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ job_info: jobTxt })
            });

            if (!response.ok) {
                throw new Error('Failed to generate cover letter');
            }

            const data = await response.json();
            setResult(data.paragraphs || []);
        } catch (error) {
            console.error('Error generating cover letter:', error);
            alert('Failed to generate cover letter');
        } finally {
            setIsLoading(false);
        }
    };

    const onContinueClicked = () => {
        props.onEnter(result);
    };

    return (
        <div id="job-popup" className="space-y-4 p-4">
            <textarea
                style={TA_styles}
                value={jobTxt}
                onChange={(e) => setJobTxt(e.target.value)}
                placeholder="Enter a Job Description"
                className="border border-gray-300 rounded-md"
            />
            <button
                disabled={!Boolean(jobTxt) || isLoading}
                onClick={onGenerateClicked}
                className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
            >
                {isLoading ? "Generating..." : "Generate"}
            </button>
            <textarea
                disabled={!Boolean(result.length)}
                style={TA_styles}
                value={result.join("\n\n")}
                readOnly
                placeholder="Generated cover letter paragraphs will appear here..."
                className="border border-gray-300 rounded-md"
            />
            <button
                disabled={!Boolean(result.length)}
                onClick={onContinueClicked}
                className="px-4 py-2 bg-green-500 text-white rounded disabled:opacity-50"
            >
                Continue
            </button>
        </div>
    );
};

export default function CoverLetterPage() {
    const [CLs, setCLs] = useState<string[]>([]);

    const saveAsPDF = useComponent2PDF("cl-page");

    const jobPopup = usePopup(
        "Generate Cover Letter",
        <JobPopup onEnter={(result) => {
            setCLs(result);
            jobPopup.close();
        }} />
    );

    useEffect(() => {
        // Any initialization logic can go here
    }, []);

    return (
        <div className="h-full p-6">
            <h1 className="text-3xl font-bold mb-6">Cover Letter Builder</h1>

            <div className="mb-4 space-x-4">
                {jobPopup.getTriggerButton({ title: "Generate Cover Letter" })}
                <button
                    onClick={() => saveAsPDF("cover-letter")}
                    className="px-4 py-2 bg-blue-500 text-white rounded"
                    disabled={CLs.length === 0}
                >
                    Export PDF
                </button>
            </div>

            <DndProvider backend={HTML5Backend}>
                    <PrintablePage page_id="cl-page">
                        <CLEditor paragraphs={CLs} />
                    </PrintablePage>
            </DndProvider>
        </div>
    );
}

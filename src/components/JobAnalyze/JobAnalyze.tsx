import { NamedCV } from "@/lib/types";
import JIDisplay from "./JIDisplay";
import { Section, SplitView }  from "@/components";
import { useEffect, useRef, useState } from "react";


function JobAnalyze() {

    const JIRef = useRef(null);
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
                }),
            });
            const result = await response.json();
            alert("Success!");
        } catch (error) {
            console.error('Error:', error);
            alert(error);
        }
    };

    useEffect(()=>{
        console.log("initJobText: ", initJobText);
    }, [initJobText])

    return (
        <Section id="section-job-info" heading="Job Info">
            <div id="job-info-controls">
                <button disabled={true}>Extract</button>
                <button onClick={saveAnnotation}>Save Annotation</button>
            </div>
            <SplitView>
                <textarea
                    id="job-info-input"
                    onPaste={(e)=> setInitJobText(e.clipboardData.getData("text/plain"))}
                    onBlur={(e) => setJobText(e.target.value)}
                    placeholder="Paste Job Description Here..."
                />
                <JIDisplay ref={JIRef} />
            </SplitView>
            </Section>
    );
};


export default JobAnalyze;
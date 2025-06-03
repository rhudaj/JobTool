import { NamedCV } from "job-tool-shared-types";
import JIDisplay from "./JIDisplay";
import { Section, SplitView }  from "../../components";
import BackendAPI from "../../backend_api";
import { useEffect, useRef, useState } from "react";

/* sass file

#job-info-input
    height: 100%
    width: 100%
    padding: 5rem
    font-size: 16em
    font-family: Arial, Helvetica, sans-serif
    resize: none
    outline: none

.toggle-mode
    align-self: center
    font-size: 14rem
    display: flex
    gap: 20rem
    border: 2px solid black
    border-radius: 10rem
    padding: 10rem
    width: max-content

    &.mode-0
        background: linear-gradient(to right, black 50%, transparent 50%) // Default background
    &.mode-1
        background: linear-gradient(to left, black 50%, transparent 50%) // Default background
*/

function JobAnalyze() {

    const JIRef = useRef(null);
    const [initJobText, setInitJobText] = useState<string>("");
    const [jobText, setJobText] = useState<string>("");

    const saveAnnotation = () => {
        BackendAPI.request<{ job_text: string, ncv?: NamedCV, annotations?: any[] }>({
            method: "POST",
            endpoint: "annotations",
            body: {
                job_text: initJobText,
                annotations: JIRef.current.get(),
            }
        })
        .then(() => alert("Success!"))
        .catch(alert)

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
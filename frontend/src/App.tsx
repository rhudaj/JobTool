import "./App.scss";
import { useEffect, useState, useRef, createContext } from "react";
import { Section } from "./components/Section/Section";
import { CV, JobInfo } from "shared";
import { BackendAPI } from "./backend_api";
import { CVEditor } from "./components/CVEditor/template2/cveditor2";
import { CLEditor } from "./components/CLEditor/cleditor";
import { PrintablePage } from "./components/PagePrint/pageprint";
import { ButtonSet } from "./components/ButtonSet/buttonSet";
import { printReactComponentAsPdf } from "./hooks/component2pdf";
import { InfoPad } from "./components/infoPad/infoPad";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { useLogger } from "./hooks/logger";
import { SplitView } from "./components/SplitView/splitview";
import { JIDisplay } from "./components/JIDisplay/JIDisplay";
import { EmailEditor } from "./components/EmailEditor/EmailEditor";

export const CVContext = createContext(null);

function App() {

    const log = useLogger("App");

    // --------------- STATE ---------------

    const [jobText, setJobText] = useState("");

    const [CL, setCL] = useState<string[]>(null);
    const [clInfo, setCLInfo] = useState<any>([]);

    // CV Related
    const [named_cvs, set_named_cvs] = useState<{name: string, data: CV}[]>(null);
    const cvref = useRef(null);
    const [active_cv, set_active_cv] = useState<{name: string, data: CV}>(null);
    const [cvInfo, setCVInfo] = useState<any>([]);

    const JIRef = useRef(null);
    const [jobInfo, setJobInfo] = useState({} as JobInfo);

    // --------------- MODIFY STATE ---------------

    // Get: saved CVs, CV info and CL info
    useEffect(() => {
        // Get all saved CVs
        BackendAPI.get<{name: string, data: CV}[]>('all_cvs') // getCVs getCVinfo getCLinfo
        .then(cvs => {
            if (cvs && cvs.length > 0) {
                log("CVs from backend:", cvs.map(cv => cv.name));
                set_named_cvs(cvs);
                set_active_cv(cvs[0]); // set the first CV as the default
            }
        })
        // Get the cv info
        BackendAPI.get<any>('cv_info')
        .then(cv_info => {
            log("CV info from backend:", cv_info);
            setCVInfo(cv_info);
        })

        // Get the cl info
        BackendAPI.get<any>('cl_info')
        .then(cl_info => {
            log("CL info from backend:", cl_info);
            setCLInfo(cl_info);
        })
    }, []);

    // INTERNALLY:

    const changeCV = (name: string) => {
        const new_cv = named_cvs.find(cv => cv.name === name);
        log("Changing CV to:", new_cv.name);
        set_active_cv(new_cv);
    };

    // FROM BACKEND:

    const getJobInfo = () => {

        if(!jobText) {
            log("No job text to extract from.");
            return;
        }

        BackendAPI
        .post<{job_text: string}, JobInfo>("getJobInfo", {job_text: jobText})
        .then((jobInfo: JobInfo|null) =>
            (jobInfo !== null) && setJobInfo(jobInfo)
        );
    };

    const getCL = (input: string = null) => {
        BackendAPI
        .post<{ job_info: string }, string[]>("genCL", {job_info: input })
        .then(setCL);
    };

    const saveCV = () => {

        // Get non-empty user input for CV name
        let cvName: string|null = null;

        while (true) {
            cvName = prompt('Name the CV')?.trim()
            // 3 cases
            if (cvName === null) {
                // they clicked cancel
                break;
            } else if (cvName === "") {
                // they clicked ok but didn't enter anything
                cvName = null;
                alert("Input cannot be left blank.");
            } else if ( named_cvs.find(cv => cv.name === cvName) ) {
                // alert("CV with that name already exists.");
                const isConfirmed = window.confirm("CV with that name already exists. Are you okay with it?");
                if (isConfirmed) {
                    // User clicked "OK"
                    console.log("User is okay with it.");
                    break;
                } else {
                    // User clicked "Cancel"
                    console.log("User is not okay with it.");
                    cvName = null;
                }
            } else {
                // they entered a VALID name
                break;
            }
        }

        if (!cvName) {
            // Can't save a CV without a valid name
            log("User cancelled the prompt.");
            return;
        } else {
            log(`User entered CV name: ${cvName}`);
        }
        // get CV from the cvref:
        const newCV = cvref.current.getCV();
        // Save the named CV to the backend
        BackendAPI.post<{name: string, cv: CV}, null>("saveCV", {name: cvName, cv: newCV})
    };

    return (
        <div className="App-Div">

            <Section id="section-job-info" heading="Job Info">
                <ButtonSet>
                    <button onClick={getJobInfo}>Extract</button>
                </ButtonSet>
                <SplitView>
                    <textarea
                        id="job-info-input"
                        onBlur = {(e)=>setJobText(e.target.value)}
                        placeholder="Paste job description here..."
                    />
                    <JIDisplay jobInfo={jobInfo} ref={JIRef}/>
                </SplitView>
            </Section>

            <Section id="section-email" heading="Email">
                <EmailEditor />
            </Section>

            <Section id="section-cl" heading="Cover Letter">

                {/* CONTROLS --------------------------- */}

                <ButtonSet>
                    <button onClick={() => getCL(jobText)}>
                        Generate
                    </button>
                    <button onClick={() => getCL()}>
                        Get Template
                    </button>
                    <button className="download-button" onClick={() => printReactComponentAsPdf("cl-page")}>
                        Download PDF
                    </button>
                </ButtonSet>

                {/* VIEW ------------------------------- */}

                <DndProvider backend={HTML5Backend}>
                    <SplitView>
                        <PrintablePage page_id="cl-page">
                            <CLEditor paragraphs={CL}/>
                        </PrintablePage>
                        <InfoPad info={clInfo}/>
                    </SplitView>
                </DndProvider>

            </Section>

            <Section id="section-cv" heading="Resume">

                {/* CONTROLS --------------------------- */}

                <ButtonSet>
                    <select onChange={e => changeCV(e.target.value)}>
                        { named_cvs?.map((cv,i) => <option key={i} value={cv.name}>{cv.name}</option>) }
                    </select>
                    <button className="download-button" onClick={() => printReactComponentAsPdf("cv-page")}> Download PDF </button>
                    <button onClick={saveCV}> Save CV </button>
                </ButtonSet>

                {/* VIEW ------------------------------ */}

                <DndProvider backend={HTML5Backend}>
                    <SplitView>
                        <PrintablePage page_id="cv-page">
                            { active_cv && <CVEditor cv={active_cv.data} ref={cvref}/> }
                        </PrintablePage>
                        <InfoPad info={cvInfo}/>
                    </SplitView>
                </DndProvider>
            </Section>

        </div>
    );
};

export default App;
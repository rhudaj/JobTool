import "./App.scss";
import { useEffect, useState, useRef, createContext } from "react";
import { Section } from "./components/Section/Section";
import { CV, JobInfo } from "shared";
import { BackendAPI } from "./backend_api";
import { CVEditor } from "./components/CVEditor/cveditor";
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

    const [jobText, setJobText] = useState("");
    const [CL, setCL] = useState<string[]>(null);

    const [CVs, setCVs] = useState<{name: string, data: CV}[]>(null);

    const cvref = useRef(null);
    const [CV, setCV] = useState(null);

    const [cvInfo, setCVInfo] = useState<any>([]);

    const JIRef = useRef(null);
    const [jobInfo, setJobInfo] = useState({} as JobInfo);

    useEffect(() => {
        // Get all saved CVs
        BackendAPI.getCVs()
        .then(cvs => {
            if (cvs && cvs.length > 0) {
                log("CVs from backend:", cvs.map(cv => cv.name));
                setCVs(cvs);
                setCV(cvs[0].data); // set the first CV as the default
            }
        })
        // Get the cv info
        BackendAPI.getCVinfo()
        .then(cv_info => {
            log("CV info from backend:", cv_info);
            setCVInfo(cv_info);
        })
    }, []);

    const getJobInfo = () => {
        if(!jobText) {
            console.log("No job text to extract from.");
            return;
        }
        console.log("Extracting Job Info...");
        // 2 - Backend extracts the job info from the text
        // Does not stall UI, by using .then(...)
        BackendAPI.getJobInfo(jobText).then((jobInfo: JobInfo | null) => {
            if (jobInfo === null) console.log("Job Info is null!");
            else setJobInfo(jobInfo);
        });
    };

    const getCL = (input: string = null) => {
        BackendAPI.genCL(input).then(setCL);
    };

    const getCV = (input = {}) => {
        BackendAPI.genCV(input as JobInfo).then(setCV);
    };

    const changeCV = (name: string) => {
        const new_cv = CVs.find(cv => cv.name === name);
        console.log("Changing CV to:", new_cv.name);
        setCV(new_cv.data);
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
            } else if ( CVs.find(cv => cv.name === cvName) ) {
                cvName = null;
                alert("CV with that name already exists.");
            } else {
                // they entered a valid name
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
        BackendAPI.saveCV(cvName, newCV)
        .then((isSuccess) => {
            alert(`CV was ${isSuccess ? "" : "NOT"} saved successfully`);
        });
    };

    const saveJobText = () => {
        const jobTxt = (
            document.getElementById("job-info-input") as HTMLTextAreaElement
        ).value;
        setJobText(jobTxt);
    };

    // RENDER ACTIVE SECTION
    return (
        <div className="App-Div">
            {/* --------------- JOB INFO --------------- */}

            <Section id="section-job-info" heading="Job Info">
                <ButtonSet>
                    <button onClick={getJobInfo}>Extract</button>
                </ButtonSet>
                <SplitView>
                    <textarea id="job-info-input" onBlur = {saveJobText} placeholder="Paste job description here..."/>
                    <JIDisplay jobInfo={jobInfo} ref={JIRef}/>
                </SplitView>
            </Section>



            {/* --------------- COVER LETTER --------------- */}

            <Section id="section-cl" heading="Cover Letter">

                <ButtonSet>
                    <button onClick={() => { saveJobText(); getCL(jobText) }}>
                        Generate
                    </button>
                    <button onClick={()=>getCL()}>
                        Get Template
                    </button>
                </ButtonSet>

                <ButtonSet>
                    <button className="download-button" onClick={() => printReactComponentAsPdf("cl-page")}>
                        Download PDF
                    </button>
                </ButtonSet>

                <PrintablePage page_id="cl-page">
                    { CL ? <CLEditor cl_paragraphs={CL}/> : null }
                </PrintablePage>

            </Section>

            {/* --------------- EMAIL ? --------------- */}

            <Section id="section-email" heading="Email">
                <EmailEditor />
            </Section>

            {/* --------------- RESUME --------------- */}

            <Section id="section-cv" heading="Resume">

                <ButtonSet>
                    <button onClick={() => { saveJobText(); getCV() }}>Generate</button>
                    <select onChange={e => changeCV(e.target.value)}>
                        { CVs?.map((cv,i) => <option key={i} value={cv.name}>{cv.name}</option>) }
                    </select>
                </ButtonSet>

                <ButtonSet>
                    <button className="download-button" onClick={() => printReactComponentAsPdf("cv-page")}> Download PDF </button>
                    <button onClick={saveCV}> Save CV </button>
                </ButtonSet>

                {/* WRAP IN DND PROVIDER TO ENABLE DRAG/DROP */}

                <DndProvider backend={HTML5Backend}>
                    <SplitView>
                        <PrintablePage page_id="cv-page">
                            { CV ? <CVEditor cv={CV} ref={cvref} /> : null }
                        </PrintablePage>
                        <InfoPad cv_info={cvInfo}/>
                    </SplitView>
                </DndProvider>

            </Section>

        </div>
    );
};

export default App;
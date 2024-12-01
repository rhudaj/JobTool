import { useEffect, useState, forwardRef, useImperativeHandle, useRef } from "react";
import "./App.css";
import { SubSection } from "./components/SubSection/SubSection";
import { Section } from "./components/Section/Section";
import { CustomTable } from "./components/CustomTable/customTable";
import { CV, JobInfo, WordOccurences } from "shared";
import { BackendAPI } from "./backend_api";
import { CVEditor } from "./components/CVEditor/cveditor";
import { CLEditor } from "./components/CLEditor/cleditor";
import { PrintablePage } from "./components/PagePrint/pageprint";
import { ButtonSet } from "./components/ButtonSet/buttonSet";
import { printReactComponentAsPdf } from "./components/PagePrint/component2pdf";
import { InfoPad } from "./components/infoPad/infoPad";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

function App() {

    const [jobText, setJobText] = useState("");
    const [CL, setCL] = useState<string[]>(null);

    const [CVs, setCVs] = useState<{name: string, data: CV}[]>(null);

    const [CV, setCV] = useState(null);
    const CVEditorRef = useRef(null);

    const [cvInfo, setCVInfo] = useState<any>([]);

    const getCL = (input: string = null) => {
        BackendAPI.genCL(input).then(setCL);
    };

    const getCV = (input = {}) => {
        BackendAPI.genCV(input as JobInfo).then(setCV);
    };

    const changeCV = (name: string) => {
        const cv = CVs.find(cv => cv.name === name);
        setCV(cv.data);
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
            console.log("User cancelled the prompt.");
            return;
        } else {
            console.log(`User entered CV name: ${cvName}`);
        }

        // Save the named CV to the backend
        BackendAPI.saveCV(cvName, CVEditorRef.current.getCV())
        .then((isSuccess) => {
            alert(`CV was ${isSuccess ? "" : "not"} saved successfully`);
        });
    };

    useEffect(() => {
        // Get all saved CVs
        BackendAPI.getCVs()
        .then(cvs => {
            console.log("CVs from backend:", cvs.map(cv => cv.name));
            if (cvs.length > 0) {
                setCVs(cvs);
                setCV(cvs[0].data); // set the first CV as the default
            }
        })
        // Get the cv info
        BackendAPI.getCVinfo()
        .then(cv_info => {
            console.log("CV info from backend:", cv_info);
            setCVInfo(cv_info);
        })
    }, []);

    const saveJobText = () => {
        const jobTxt = (
            document.getElementById("job-info-input") as HTMLTextAreaElement
        ).value;
        setJobText(jobTxt);
    }

    // RENDER ACTIVE SECTION
    return (
        <div className="App-Div">
            {/* --------------- JOB INFO --------------- */}

            <Section id="section-job-info" heading="Job Info">
                <textarea id="job-info-input"/>
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

                <PrintablePage page_id="cl-page">
                    { CL ? <CLEditor cl_paragraphs={CL}/> : null }
                </PrintablePage>

            </Section>

            {/* --------------- RESUME --------------- */}

            <Section id="section-cv" heading="Resume">

                <ButtonSet>
                    <button onClick={() => { saveJobText(); getCV() }}>
                        Generate
                    </button>
                    <select onChange={e => changeCV(e.target.value)}>
                        { CVs?.map(cv => <option value={cv.name}>{cv.name}</option>) }
                    </select>
                </ButtonSet>

                <ButtonSet>
                    <button className="download-button" onClick={() => printReactComponentAsPdf("cv-page")}> Download PDF </button>
                    <button onClick={saveCV}> Save CV </button>
                </ButtonSet>

                {/* WRAP IN DND PROVIDER TO ENABLE DRAG/DROP */}

                <DndProvider backend={HTML5Backend}>
                    <div className="cv-playground">

                        <PrintablePage page_id="cv-page">
                            { CV ? <CVEditor cv={CV} ref={CVEditorRef}/> : null }
                        </PrintablePage>

                        <InfoPad cv_info={cvInfo}/>
                    </div>
                </DndProvider>

            </Section>

        </div>
    );
};

export default App;
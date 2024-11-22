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

const JIDisplay = forwardRef((
    props: {
        jobInfo: JobInfo;
        changeJobInfo: (JI: JobInfo) => void;
    },
    ref: React.ForwardedRef<any>
) => {
        const [localJI, setLocalJI] = useState({} as JobInfo);

        // give the parent 'App' access to localJI
        useImperativeHandle(ref, () => ({
            getJI() { return localJI; }
        }));

        // Given new props, update local job info:
        useEffect(() => {
            setLocalJI(props.jobInfo);
        }, [props]);

        const updateJIField = (field: string) => {
            return (newData: any[]) => {
                // To update state, need to clone object
                const newJI = structuredClone(localJI);
                newJI[field] = newData;
                setLocalJI(newJI);
            };
        };

        const subSectionElements = [
            {
                name: "Company",
                content: props.jobInfo.company,
            },
            {
                name: "Position Name",
                content: props.jobInfo.positionName,
            },
            {
                name: "Position Type",
                content: props.jobInfo.positionType,
            },
            {
                name: "Date Range",
                content: props.jobInfo.dateRange,
            },
            {
                name: "Salary",
                content: props.jobInfo.salary,
            },
            {
                name: "Deadline",
                content: props.jobInfo.deadline,
            },
            {
                name: "How to Apply",
                content: props.jobInfo.howToApply,
            },
            {
                name: "Cover Letter Info",
                content: props.jobInfo.coverLetter,
            },
            {
                name: "About Role",
                content: (
                    <CustomTable
                        data={props.jobInfo.aboutRole}
                        changeData={updateJIField("aboutRole")}
                    />
                ),
            },
            {
                name: "About You",
                content: (
                    <CustomTable
                        data={props.jobInfo.aboutYou}
                        changeData={updateJIField("aboutYou")}
                    />
                ),
            },
            {
                name: "Qualifications",
                content: (
                    <CustomTable
                        data={props.jobInfo.qualifications}
                        headers={["Type", "Description"]}
                        changeData={updateJIField("qualifications")}
                    />
                ),
            },
            {
                name: "Top Words",
                content: (
                    <CustomTable
                        data={props.jobInfo.keywords}
                        changeData={(newKeywords: WordOccurences) => {
                            const newJI = structuredClone(props.jobInfo);
                            newJI.keywords = newKeywords;
                            props.changeJobInfo(newJI);
                        }}
                        headers={["word", "#"]}
                    />
                ),
            },
            {
                name: "Languages",
                content: (
                    <CustomTable
                        data={props.jobInfo.languages}
                        changeData={(newLangs: string[]) => {
                            const newJI = structuredClone(props.jobInfo);
                            newJI.languages = newLangs;
                            props.changeJobInfo(newJI);
                        }}
                    />
                ),
            },
            {
                name: "Technologies",
                content: (
                    <CustomTable
                        data={props.jobInfo.technologies}
                        changeData={(newTech: string[]) => {
                            const newJI = structuredClone(props.jobInfo);
                            newJI.technologies = newTech;
                            props.changeJobInfo(newJI);
                        }}
                    />
                ),
            },
        ].map((sec) => (
            <SubSection
                id={`${sec.name.replaceAll(" ", "-").toLowerCase()}-section`}
                heading={sec.name}
            >
                {sec.content}
            </SubSection>
        ));

        return (
            <div id="job-info-display">
                {subSectionElements}
            </div>
        );
    }
);

function App() {

    const [jobText, setJobText] = useState("");
    const [CL, setCL] = useState<string[]>(null);

    const [CVs, setCVs] = useState<{name: string, data: CV}[]>(null);

    const [CV, setCV] = useState(null);
    const CVEditorRef = useRef(null);

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
        BackendAPI.getCVs()
        .then((CVs) => {
            console.log("CVs from backend:", CVs.map(cv => cv.name));
            if (CVs.length > 0) {
                setCVs(CVs);
                setCV(CVs[0].data);
            }
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

                <div style={{display: "flex"}}>

                    <PrintablePage page_id="cv-page">
                        { CV ? <CVEditor cv={CV} ref={CVEditorRef}/> : null }
                    </PrintablePage>
                </div>

            </Section>

        </div>
    );
};

export default App;
import { ReactElement, useEffect, useState } from "react";
import "./App.css";
import "./components/CustomTextArea/customTextArea.css";
import { CustomTable } from "./components/CustomTable/customTable";
import { JobInfo, CoverLetterResponse, WordOccurences } from "shared";
import { BackendAPI } from "./backend_api";

function SectionContainer(props: {
    hasPrev: boolean;
    hasNext: boolean;
    nextEnabled: boolean;
    onChangeSection: (next: boolean) => void;
    children: React.ReactNode;
}) {
    const ChangeSection = (P: { next: boolean }) => {
        return (
            <div className="change-section-div">
                <button
                    className={`change-section-button ${
                        props.nextEnabled ? "" : "disabled"
                    }`}
                    onClick={() => props.onChangeSection(P.next)}
                >
                    {P.next ? "⇩" : "⇧"}
                </button>
            </div>
        );
    };

    return (
        <div className="section-container">
            {props.hasPrev ? <ChangeSection next={false} /> : null}
            {props.children}
            {props.hasNext ? <ChangeSection next={true} /> : null}
        </div>
    );
}

function AppSection(props: {
    id: string;
    heading: string;
    isLoad: boolean;
    children: ReactElement;
}) {
    return (
        <div className={`AppSection`} id={props.id}>
            <h1>{props.heading}</h1>
            <div className="section-content loading-div">
                {props.isLoad ? <span className="loader" /> : props.children}
            </div>
        </div>
    );
}

const SubSection = (props: {
    id: string;
    heading: string;
    children: React.ReactNode;
}) => {
    return (
        <div className="sub-section">
            <h3>{props.heading}</h3>
            <div className="content">{props.children}</div>
        </div>
    );
};

function JobInfoDisplay(props: {
    jobInfo: JobInfo;
    changeJobInfo: (JI: JobInfo) => void;
}) {
    return (
        <>
            <SubSection id="top-words-div" heading="Top Words">
                <CustomTable
                    changeData={(newKeywords: WordOccurences) => {
                        const newJI = structuredClone(props.jobInfo);
                        newJI.keywords = newKeywords;
                        props.changeJobInfo(newJI);
                    }}
                    data={props.jobInfo.keywords}
                    headers={["word", "#"]}
                />
            </SubSection>
            <SubSection id="prog-langs-div" heading="Languages">
                <CustomTable
                    changeData={(newLangs: string[]) => {
                        const newJI = structuredClone(props.jobInfo);
                        newJI.languages = newLangs;
                        props.changeJobInfo(newJI);
                    }}
                    data={props.jobInfo.languages}
                    headers={["lang"]}
                />
            </SubSection>
            {GenerateTextAreas({
                obj: props.jobInfo,
                editObj: props.changeJobInfo,
            })}
        </>
    );
}

const GenerateTextAreas = (props: {
    obj: any;
    editObj: (newObj: any) => void;
}) => {
    const objEntries = Object.entries(props.obj);
    const subSectionArr = objEntries.map((sec: [string, any], i: number) => {
        const secTitle = sec[0];
        const secVal = sec[1];
        let content: ReactElement;
        if (Array.isArray(secVal)) {
            // Create a table
            content = (
                <CustomTable
                    data={secVal}
                    handleCell={(item) => <textarea defaultValue={item} />}
                    changeData={(newData: any[]) => {
                        const newObj = structuredClone(props.obj);
                        newObj[secTitle] = newData;
                        props.editObj(newObj);
                    }}
                />
            );
        } else {
            content = <textarea defaultValue={secVal as string} />;
        }
        return (
            <SubSection id={`${secTitle}-section`} heading={secTitle}>
                {content}
            </SubSection>
        );
    });

    return subSectionArr;
};

function App() {
    const [sec, setSec] = useState(0);

    const [jobInfo, setJobInfo] = useState({} as JobInfo);
    const [CL, setCL] = useState({} as CoverLetterResponse);

    const [extractJobInfoEnabled, setExtractJobInfoEnabled] = useState(false);
    const [resultsEnabled, setResultsEnabled] = useState(false);
    const [clEnabled, setCLEnabled] = useState(false);
    const [cvEnabled, setCVEnabled] = useState(false);

    const onTextInput = (e: React.ChangeEvent<HTMLTextAreaElement>) =>
        setExtractJobInfoEnabled(e.target.value !== "");

    const extractJobInfo = () => {
        console.log("Extracting Job Info...");

        const jobTxt = (
            document.getElementById("job-info-input") as HTMLTextAreaElement
        ).value;

        BackendAPI.getJobInfo(jobTxt).then((jobInfo) => {
            if (jobInfo === null) console.log("Job Info is null!");
            else setJobInfo(jobInfo);
            setResultsEnabled(true);
        });
    };

    const generateCL = () => {
        // TODO: connect to backend
        console.log("Request to generate CL...");
        BackendAPI.genCL(jobInfo).then((cl) => {
            console.log("Ready to set data! cl =\n", cl);
            setCL(cl);
            setCLEnabled(true);
        });
    };

    const downloadCL = () => {
        BackendAPI.outputCLDoc(CL);
    };

    const generateCV = () => {
        // TODO: connect to backend
        setCVEnabled(true);
    };

    const appSections = [
        {
            id: "section-job-info",
            heading: "Job Info",
            onNext: extractJobInfo,
            complete: true,
            content: (
                <>
                    <textarea id="job-info-input" onChange={onTextInput} />
                </>
            ),
        },
        {
            id: "section-job-analysis",
            heading: "Job Analysis",
            onNext: generateCL,
            complete: resultsEnabled,
            content: (
                <>
                    <JobInfoDisplay
                        jobInfo={jobInfo}
                        changeJobInfo={setJobInfo}
                    />
                </>
            ),
        },
        {
            id: "section-cl",
            heading: "Cover Letter",
            onNext: generateCV,
            complete: clEnabled,
            content: (
                <>
                    <textarea
                        defaultValue={Object.values(CL).join("\n")}
                    ></textarea>
                    <button id="download-cl-button" onClick={downloadCL}>
                        Download
                    </button>
                </>
            ),
        },
        {
            id: "section-cv",
            heading: "CV",
            complete: cvEnabled,
            content: <></>,
        },
    ];

    // RENDER ACTIVE SECTION
    const curSec = appSections[sec];
    return (
        <div className="App-Div">
            <SectionContainer
                hasPrev={sec !== 0}
                hasNext={sec !== appSections.length - 1}
                nextEnabled={curSec.complete}
                onChangeSection={(next: boolean) => {
                    if (next) curSec.onNext();
                    setSec(sec + (next ? 1 : -1));
                }}
            >
                <AppSection
                    id={curSec.id}
                    heading={curSec.heading}
                    isLoad={!curSec.complete}
                >
                    {curSec.content}
                </AppSection>
            </SectionContainer>
        </div>
    );
}

export default App;

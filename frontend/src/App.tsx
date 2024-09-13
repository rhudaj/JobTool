import {
    useEffect,
    useRef,
    useState,
    forwardRef,
    useImperativeHandle,
    ReactElement,
} from "react";
import "./App.css";
import "./components/CustomTextArea/customTextArea.css";
import { SubSection } from "./components/SubSection/SubSection";
import { Section } from "./components/Section/Section";
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

const JIDisplay = forwardRef(
    (
        props: {
            ref: any;
            jobInfo: JobInfo;
            changeJobInfo: (JI: JobInfo) => void;
        },
        ref
    ) => {
        const [JI, setJI] = useState({} as JobInfo);

        useImperativeHandle(ref, () => ({
            getJI: () => JI,
        }));

        useEffect(() => {
            console.log("<JobInfoDisplay> new props. Updating JI state");
            setJI(props.jobInfo);
        }, [props]);

        const updateJIField = (field: string) => {
            return (newData: any[]) => {
                const newJI = structuredClone(JI);
                newJI[field] = newData;
                setJI(newJI);
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
                        handleCell={(data: string) => data}
                        changeData={updateJIField("aboutRole")}
                    />
                ),
            },
            {
                name: "About You",
                content: (
                    <CustomTable
                        data={props.jobInfo.aboutYou}
                        handleCell={(data: string) => data}
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
                        handleCell={(data: string) => data}
                        changeData={updateJIField("qualifications")}
                    />
                ),
            },
            {
                name: "Top Words",
                content: (
                    <CustomTable
                        changeData={(newKeywords: WordOccurences) => {
                            const newJI = structuredClone(props.jobInfo);
                            newJI.keywords = newKeywords;
                            props.changeJobInfo(newJI);
                        }}
                        data={props.jobInfo.keywords}
                        headers={["word", "#"]}
                    />
                ),
            },
            {
                name: "Languages",
                content: (
                    <CustomTable
                        changeData={(newLangs: string[]) => {
                            const newJI = structuredClone(props.jobInfo);
                            newJI.languages = newLangs;
                            props.changeJobInfo(newJI);
                        }}
                        data={props.jobInfo.languages}
                    />
                ),
            },
            {
                name: "Technologies",
                content: (
                    <CustomTable
                        changeData={(newTech: string[]) => {
                            const newJI = structuredClone(props.jobInfo);
                            newJI.technologies = newTech;
                            props.changeJobInfo(newJI);
                        }}
                        data={props.jobInfo.technologies}
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

        return <>{subSectionElements}</>;
    }
);

interface AppSection {
    id: string;
    heading: string;
    onNext: () => void;
    isEnabled: boolean;
    isComplete: boolean;
    content: ReactElement;
};

function App() {
    const [sec, setSec] = useState(0);

    const [jobInfo, setJobInfo] = useState({} as JobInfo);
    const JIDisplayRef = useRef(null);

    const [CL, setCL] = useState({} as CoverLetterResponse);

    const [extractJobInfoEnabled, setExtractJobInfoEnabled] = useState(false);
    const [resultsEnabled, setResultsEnabled] = useState(false);
    const [clEnabled, setCLEnabled] = useState(false);
    const [cvEnabled, setCVEnabled] = useState(false);

    const onTextInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setExtractJobInfoEnabled(e.target.value !== "");
    };

    const extractJobInfo = () => {
        console.log("Extracting Job Info...");
        // 1 - Extract the job description from the UI
        const jobTxt = (
            document.getElementById("job-info-input") as HTMLTextAreaElement
        ).value;

        // 2 - Backend extracts the job info from the text
            // Does not stall UI, by using .then(...)
            BackendAPI.getJobInfo(jobTxt)
            .then((jobInfo: JobInfo|null) => {
                if (jobInfo === null) console.log("Job Info is null!");
                else setJobInfo(jobInfo);
                // display, null or not!
                setResultsEnabled(true);
            });
    };

    const generateCL = () => {
        // Get the updated <jobInfo> from the UI
        const editedJI = JIDisplayRef.current.getJI();

        // Use <jobInfo> to generate the CL
        console.log("Request to generate CL...");
        BackendAPI.genCL(editedJI).then((cl) => {
            console.log("Ready to set data! cl =\n", cl);
            setCL(cl);
            setCLEnabled(true);
        });
    };

    const downloadCL = () => {
        BackendAPI.outputCLDoc(CL);
    };

    const generateCV = () => {
        setCVEnabled(true);
    };

    const sections: AppSection[] = [
        {
            id: "section-job-info",
            heading: "Job Info",
            onNext: extractJobInfo,
            isEnabled: true, // first section => always enabled
            isComplete: extractJobInfoEnabled,
            content: (
                <>
                    <textarea id="job-info-input" onChange={onTextInput} />
                </>
            ),
        },
        {
            id: "section-job-analysis",
            heading: "Job Analysis",
            isEnabled: resultsEnabled, // when POST to backend done.
            isComplete: true, // No changes are necessary
            onNext: generateCL,
            content: (
                <>
                    <JIDisplay
                        ref={JIDisplayRef}
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
            isEnabled: true,
            isComplete: clEnabled,
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
            isEnabled: true,
            isComplete: cvEnabled,
            onNext: () => {},
            content: <></>,
        },
    ];

    // RENDER ACTIVE SECTION
    const curSec = sections[sec];
    return (
        <div className="App-Div">
            <SectionContainer
                hasPrev={sec !== 0}
                hasNext={sec !== sections.length - 1}
                nextEnabled={curSec.isComplete}
                onChangeSection={(next: boolean) => {
                    if (next) curSec.onNext();
                    setSec(sec + (next ? 1 : -1));
                }}
            >
                <Section
                    id={curSec.id}
                    heading={curSec.heading}
                    isLoading={!curSec.isEnabled}
                >
                    {curSec.content}
                </Section>
            </SectionContainer>
        </div>
    );
}

export default App;

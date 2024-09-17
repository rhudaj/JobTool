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
import { CV, JobInfo, WordOccurences } from "shared";
import { BackendAPI } from "./backend_api";
import { SplitView } from "./components/SplitView/splitview";
import { CVEditor } from "./components/CVEditor/cveditor";

let cv: CV = {
    "personalTitle": "CS Student ~ Software Developer",
    "summary": "Dynamic, agile software full-stack software developer with rapid adaptability to emerging technologies, a keen aptitude for grasping intricate concepts and solving problems with automation and data science.",
    "languages": ["Python", "SQL", "JavaScript", "TypeScript", "C++", "C", "HTML", "CSS"],
    "technologies": ["ReactJS", "NodeJS", "Git", "Alteryx", "SQL Server", "MySQL", "Numpy/Pandas/Selenium", "Excel"],
    "courses": ["Databases", "UI", "Networks", "Algorithms"],
    "links": [
        {
            "icon": "fa fa-globe",
            "text": "roman-hudaj.com",
            "url": "https://github.com/rhudaj"
        },
        {
            "icon": "fa fa-github",
            "text": "github.com/rhudaj",
            "url": "https://github.com/rhudaj"
        },
        {
            "icon": "fa fa-envelope",
            "text": "rhudaj@uwaterloo.ca",
            "url": "mailto:rhudaj@uwaterloo.ca"
        },
        {
            "icon": "fa fa-linkedin",
            "text": "/in/rhudaj",
            "url": "https://www.linkedin.com/rhudaj"
        }
    ],
    "experiences": [
        {
            "date_range": "4/23 - 9/23",
            "title": "Software Product Management Intern",
            "company": "Environics Analytics",
            "bulletPoints": [
                "Developed an automated pipeline with Alteryx and the API of an AI model to parse and translate data product documents and variable lists to French, resulting in savings of tens of thousands per product.",
                "Created a user-friendly app with Python/QT to extract client usage data of company products from databases; provided ease of data access and analysis by non-technical teams.",
                "Enhanced databases to monitor client usage of products/APIs to formulate an optimized product pricing strategy and ultimately increase profitability and user satisfaction."
            ],
            "tech": ["SQL", "Alteryx", "Python", "Azure"]
        },
        {
            "date_range": "5/24 - 9/24",
            "title": "Product Assistant",
            "company": "Timeplay",
            "bulletPoints": [
                "Improved UI for lottery and instant-win games using React and TypeScript, supporting the rollout of a gaming platform on cruise ships from inception to deployment.",
                "Optimized data structures and improved frontend tools for admin management on cruise ships, reducing data redundancy and enhancing usability based on client feedback.",
                "Prioritized and deployed new game features through Jira, coordinating with stakeholders to ensure timely updates, which led to a 30% increase in game engagement."
            ],
            "tech": ["Jira", "Node.js", "Docker", "React"]
        },
        {
            "date_range": "1/22 - 8/22",
            "title": "Student Engineer",
            "company": "Martinrea",
            "bulletPoints": [
                "Spearheaded a major project to optimize the flow of materials across a large facility; improved system for collecting and analyzing data to plan the project; resulted in increased output and cost efficiency.",
                "Implemented a supply chain tracking system using SQL and advanced Excel for proactive identification of issues, enabling timely alerts to managers and achieving estimated $11,000 annual cost savings."
            ],
            "tech": ["SQL", "Excel"]
        }

    ],
    "projects": [
        {
            "date_range": "5/24 - Pres",
            "title": "Automated Restaurant Reservation Business",
            "url": "https://github.com/rhudaj/Automated-Job-Applications",
            "description": "Created a fully automated reservation system using TypeScript and Node.js through API requests, to secure hard-to-get reservations at world-popular restaurants for clients generating $X,XXX a month // Deployed the project on Google Cloud, utilizing Scheduler for automated tasks, Firestore for managing data, and cloud storage for transaction and listing records, ensuring a scalable and reliable system.",
            "tech": ["TypeScript", "Node", "Google Cloud"]
        },
        {
            "date_range": "5/23 - 7/23",
            "title": "Database Interface App",
            "url": "github.com/rhudaj/DatabaseInterfaceApp",
            "description": "Created a efficient, user-friendly app to interact with a database featuring: Connection to any specified database via ODBC // Intuitive UI for table selection and data filtering, dynamically generated in real-time by efficiently handling of millions of records via Pandas, optimized display algorithms and batch querying // crash-safe via multi-threading // MVC architecture.",
            "tech": ["Python", "SQL"]
        },
        {
            "date_range": "1/24 - 4/24",
            "title": "Voice-to-Instrument Translator",
            "url": "https://github.com/rhudaj/Real-Time-Voice-to-Instrument-Translator",
            "description": "Developed an app enabling real-time translation of human voice into various musical instruments // Utilized Python (Numpy) to implement  advanced probabilistic algorithms for detecting: pitch, tempo and note-onsets // Exposed the backend as a REST API to integrate with a GUI built with React.",
            "tech": ["Python", "React"]
        }
    ]
};

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
            getJI() {
                return localJI;
            }
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

const CLDisply = (props: {
    cl: string[],
    updateCL: (cl: string[]) => void
}) => {
    const DELIM = "\n\n";
    const TARGET_ID = "cl-textarea";
    return (
        <>
            <SplitView>
                <textarea
                    id={TARGET_ID}
                    defaultValue={props.cl.join(DELIM)}
                />
                <object
                    data={`http://localhost:8080/cl.pdf?${Date.now()}`}   //"https://pdfobject.com/pdf/sample.pdf"
                    type="application/pdf"
                    width="100%"
                    height="100%"
                />
            </SplitView>
            <button id="download-cl-button" onClick={()=>{
                const el =  document.getElementById(TARGET_ID) as HTMLTextAreaElement;
                const newText = el.value;
                const paragraphs = newText.split(DELIM);
                props.updateCL(paragraphs);
            }}>
                Update
            </button>
        </>
    )
};

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

    const [CL, setCL] = useState([] as string[]);
    const [CV, setCV] = useState(cv);

    const [extractJobInfoEnabled, setExtractJobInfoEnabled] = useState(false);
    const [resultsEnabled, setResultsEnabled] = useState(false);
    const [clEnabled, setCLEnabled] = useState(false);
    const [cvEnabled, setCVEnabled] = useState(false);

    const onTextInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setExtractJobInfoEnabled(e.target.value !== "");
    };

    const sections: AppSection[] = [
        {
            id: "section-job-info",
            heading: "Job Info",
            onNext: () => {
            // Extract job info
                console.log("Extracting Job Info...");
                // 1 - Extract the job description from the UI
                const jobTxt = (
                    document.getElementById("job-info-input") as HTMLTextAreaElement
                ).value;

                // 2 - Backend extracts the job info from the text
                // Does not stall UI, by using .then(...)
                BackendAPI.getJobInfo(jobTxt).then((jobInfo: JobInfo | null) => {
                    if (jobInfo === null) console.log("Job Info is null!");
                    else setJobInfo(jobInfo);
                    // display, null or not!
                    setResultsEnabled(true);
                });
            },
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
            onNext: () => {
            // Get the cover letter
                // 1 - extract the updated <jobInfo> from the UI
                const editedJI: JobInfo = JIDisplayRef.current.getJI();
                // 2 - Use it to generate the CL
                BackendAPI.genCL(editedJI).then(cl => {
                    if(cl === null) console.log('cl is null!');
                    else setCL(cl);
                    setCLEnabled(true);
                });
            },
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
            onNext: () => {
                setCVEnabled(true);
            },
            isEnabled: clEnabled,
            isComplete: true,
            content: <CLDisply cl={CL} updateCL={(cl: string[])=>{
                console.log('calling BackendAPI.outputCLPDF(cl), cl = ', cl);
                setCL(cl);
                BackendAPI.outputCLPDF(cl);
            }}/>
        },
        {
            id: "section-cv",
            heading: "CV",
            isEnabled: true,
            isComplete: cvEnabled,
            onNext: () => {},
            content: <CVEditor cv={CV}/>,
        },
    ];

    // RENDER ACTIVE SECTION
    // const curSec = sections[sec];
    const curSec = sections[3];
    return (
        <div className="App-Div">
            <SectionContainer
                hasPrev={sec !== 0}
                hasNext={sec !== sections.length - 1}
                nextEnabled={curSec.isComplete}
                onChangeSection={(next: boolean) => {
                    // first run onNext for the current section
                    console.log('changing section, cur sec = ', sec, ', next = ', next);
                    if (next) curSec.onNext();
                    // then you can change the section
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

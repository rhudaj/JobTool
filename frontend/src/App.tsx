import {
    useEffect,
    useRef,
    useState,
    forwardRef,
    useImperativeHandle,
    ReactElement,
} from "react";
import "./App.css";
import { SubSection } from "./components/SubSection/SubSection";
import { Section } from "./components/Section/Section";
import { CustomTable } from "./components/CustomTable/customTable";
import { CV, JobInfo, WordOccurences } from "shared";
import { BackendAPI } from "./backend_api";
import { CVEditor } from "./components/CVEditor/cveditor";
import { CLEditor } from "./components/CLEditor/cleditor";
import { SectionContainer } from "./components/SectionContainer/sectioncontainer";
import { PrintablePage } from "./components/PagePrint/pageprint";

/*
    const TEST_CL = {
        intro: 'My name is Roman Hudaj, and I am currently pursuing an Honours degree in Computer Science at the University of Waterloo. I am excited to apply for the Defense Tech Software Engineer Intern position at Palantir, as it aligns perfectly with both my academic pursuits and my passion for innovative technology solutions in defense and security sectors.',
        body_paragraphs: [
            'My educational background and project experiences have equipped me with a solid foundation in engineering and technology, specifically in areas such as Computer Science, Mathematics, and Software Engineering, which are essential for the role at Palantir. During my tenure at Timeplay and Martinrea International, I developed key software solutions and optimized data systems that significantly improved operational efficiency and customer satisfaction【4†source】. My projects, such as the Automated Restaurant Reservation Business and the Voice-to-Instrument Translator, showcase my ability to handle complex technical challenges and innovate solutions using a variety of programming languages and frameworks, including Python, JavaScript, and React【4†source】.',
            "I have a proven track record of collaborating effectively with both technical and non-technical team members to deliver high-quality products. At Environics Analytics, I spearheaded the development of a user-friendly app that facilitated non-technical teams' access to complex data, enhancing product strategy and profitability【4†source】. My ability to communicate complex technical details in an understandable manner and my willingness to learn and adapt quickly will allow me to effectively contribute to Palantir's mission of delivering advanced defense capabilities.",
            'I am eager to bring my technical skills and my proactive approach to learning and problem-solving to Palantir. I am also in the process of obtaining a US Security clearance, which will enable me to start contributing to your team immediately. I am particularly excited about the opportunity to be mentored by experienced professionals and to work on impactful projects that align with my career goals and interests.'
        ],
        closing_remarks: 'Thank you for considering my application. I am looking forward to the possibility of discussing how I can contribute to the innovative projects at Palantir. Please feel free to contact me at your earliest convenience to schedule an interview.'
    };

    const TEST_CL_paragraphs = [
        new Date().toDateString(),
        "Dear Hiring Manager",
        TEST_CL.intro,
        ...TEST_CL.body_paragraphs,
        TEST_CL.closing_remarks,
        "Sincerely,",
        "Roman Hudaj"
    ];
*/

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

        return (
            <div id="job-info-display">
                {subSectionElements}
            </div>
        );
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

    const [CL, setCL] = useState([]);
    const [CV, setCV] = useState(null);

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
                // 1.2 - save it for when we need the generate the CV
                setJobInfo(editedJI);
                // 2 - Use it to generate the CL
                BackendAPI.genCL(editedJI).then(cl => {
                    if(cl === null) console.log('cl is null!');
                    else setCL(cl);
                    console.log('setCL, now setting CL enabled');
                    setCLEnabled(true);
                });
            },
            content: <JIDisplay ref={JIDisplayRef} jobInfo={jobInfo} changeJobInfo={setJobInfo}/>
        },
        {
            id: "section-cl",
            heading: "Cover Letter",
            onNext: () => {
            // Get the resume
                // Job Info was already saved in the previous section.
                BackendAPI.genCV(jobInfo).then(cv => {
                    if(cv === null) console.log('cv is null!');
                    else setCV(cv);
                    console.log('setCV, now setting CV enabled');
                    setCVEnabled(true);
                });
            },
            isEnabled:  clEnabled,
            isComplete: true,   // no changes required
            content: (
                <PrintablePage page_id="cl-page">
                    <CLEditor cl_paragraphs={CL}/>
                </PrintablePage>
            )
        },
        {
            id: "section-cv",
            heading: "CV",
            isEnabled: cvEnabled,
            isComplete: true,   // no changes required
            onNext: () => {},
            content: (
                <PrintablePage page_id="cv-page">
                    <CVEditor cv={CV}/>
                </PrintablePage>
            )
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
                    // first run onNext for the current section
                    if (next) curSec.onNext();
                    // then change the section
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
};

export default App;

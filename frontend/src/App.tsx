import {
    useEffect,
    useRef,
    useState,
    forwardRef,
    useImperativeHandle,
    ReactElement,
    act,
} from "react";
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
        const userInput = prompt('Enter some text:');
        if (userInput !== null) {
            BackendAPI.saveCV(userInput, CV)
            .then((isSaved) => {
                alert(`CV was ${isSaved ? "" : "not"} saved successfully`);
            });
        }
    };

    useEffect(() => {
        BackendAPI.getCVs()
        .then(setCVs);
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

            <Section id="section-job-info" heading="Job Info">
                <textarea style={{minHeight: "30em"}} id="job-info-input"/>
            </Section>

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

            <Section id="section-cv" heading="Resume">
                <ButtonSet>
                    <button onClick={() => { saveJobText(); getCV() }} >
                        Generate
                    </button>
                    <select onChange={e => changeCV(e.target.value)}>
                        { CVs ? CVs.map(cv => <option value={cv.name}>{cv.name}</option>) : null }
                    </select>
                </ButtonSet>
                <ButtonSet>
                    <button className="download-button" onClick={() => printReactComponentAsPdf("cv-page")}> Download PDF </button>
                    <button onClick={saveCV}> Save CV </button>
                </ButtonSet>
                <PrintablePage page_id="cv-page">
                    { CV ? <CVEditor cv={CV}/> : null }
                </PrintablePage>
            </Section>

        </div>
    );
};

export default App;

import { CoverLetterResponse, JobInfo } from "@/lib/types";
import { AssistantWrapper } from "./Assistant";

// DEFINE THE ASSISTANT

interface QuestionParams {
    jobInfo: JobInfo | string
}

const assistant = await AssistantWrapper.create<QuestionParams, CoverLetterResponse>(
    "cl",
    (p: QuestionParams) => {
        let obj: any;
        if (typeof p.jobInfo === "string") {
            obj = p.jobInfo;
        } else {
            obj = {
                "Company Name": p.jobInfo.company,
                "Position Name": p.jobInfo.positionName,
                "Position Type": p.jobInfo.positionType,
                "About the Role": p.jobInfo.aboutRole,
                "About you": p.jobInfo.aboutYou,
                Requirements: p.jobInfo.qualifications.map((req) => req[1]), // only want the requirement part
            };
        }
        return `Generate the cover letter object (based on the file resume.txt), for the following job description:\n${JSON.stringify(obj)}`
    },
    (response: string): CoverLetterResponse => JSON.parse(response)
)

const test_cl: CoverLetterResponse = {
    intro: "My name is Roman Hudaj, and I am currently pursuing an Honours degree in Computer Science at the University of Waterloo. I am excited to apply for the Defense Tech Software Engineer Intern position at Palantir, as it aligns perfectly with both my academic pursuits and my passion for innovative technology solutions in defense and security sectors.",
    transition: "N/A",
    body_paragraphs: [
        "My educational background and project experiences have equipped me with a solid foundation in engineering and technology, specifically in areas such as Computer Science, Mathematics, and Software Engineering, which are essential for the role at Palantir. During my tenure at Timeplay and Martinrea International, I developed key software solutions and optimized data systems that significantly improved operational efficiency and customer satisfaction【4†source】. My projects, such as the Automated Restaurant Reservation Business and the Voice-to-Instrument Translator, showcase my ability to handle complex technical challenges and innovate solutions using a variety of programming languages and frameworks, including Python, JavaScript, and React【4†source】.",
        "I have a proven track record of collaborating effectively with both technical and non-technical team members to deliver high-quality products. At Environics Analytics, I spearheaded the development of a user-friendly app that facilitated non-technical teams' access to complex data, enhancing product strategy and profitability【4†source】. My ability to communicate complex technical details in an understandable manner and my willingness to learn and adapt quickly will allow me to effectively contribute to Palantir's mission of delivering advanced defense capabilities.",
        "I am eager to bring my technical skills and my proactive approach to learning and problem-solving to Palantir. I am also in the process of obtaining a US Security clearance, which will enable me to start contributing to your team immediately. I am particularly excited about the opportunity to be mentored by experienced professionals and to work on impactful projects that align with my career goals and interests.",
    ],
    why_work_here:
        "I am particularly excited about the opportunity to be mentored by experienced professionals and to work on impactful projects that align with my career goals and interests.",
    closing_remarks:
        "Thank you for considering my application. I am looking forward to the possibility of discussing how I can contribute to the innovative projects at Palantir. Please feel free to contact me at your earliest convenience to schedule an interview.",
};

// -----------------------------------------------------------------
//            HELPERS (transform CoverLetterResponse)
// -----------------------------------------------------------------

/**
 * remove any citation text: '/【\d+(:\d+)?+†source】/'
 */
function removeCitationText(response: CoverLetterResponse) {
    let as_str = JSON.stringify(response);
    const replaced_str = as_str.replace(/【\d+†source】/g, "");
    return JSON.parse(replaced_str) as CoverLetterResponse;
}

/**
 * // Split cl into array of paragraphs
 * @param cl
 * @returns
 */
function extractParagraphs(cl: CoverLetterResponse): string[] {
    return [
        cl.intro,
        cl.transition,
        ...cl.body_paragraphs,
        cl.why_work_here,
        cl.closing_remarks,
    ];
}

export function transformCLResponse(cl_resp: CoverLetterResponse): string[] {
    return extractParagraphs(
		removeCitationText(cl_resp)
	);
}

// -----------------------------------------------------------------
//                          MAIN FUNCTION
// -----------------------------------------------------------------

export async function genCL(params: QuestionParams): Promise<string[]> {
    let response: CoverLetterResponse;
    if (Number(process.env.OPENAI_API_OFF) === 1) {
        // wait for 500ms:
        await new Promise((resolve) => setTimeout(resolve, 500));
        console.log("genCL (testing mode)");
        response = test_cl;
    } else {
        if (!assistant) {
            throw new Error("Assistant not initialized");
        }
        response = await assistant.askQuestion(params) as CoverLetterResponse;
    }
    return transformCLResponse(response);;
}

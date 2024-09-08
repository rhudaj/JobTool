import { JobExtractResponse, JobInfo } from "shared";
import * as AssistantAPI from "../shared/openai/assistant.js"
import { delay } from "../shared/util/delay.js";
import { findProgrammingLanguages, getWordOccurences, getWords } from "./wordAnalyze.js";

const TEST = true;

const ass_id = ""; // TODO: create the assistant

async function jobExtractAssistant(jobTxt: string): Promise<JobExtractResponse> {
    // 1 - Get the json response
        const response = await AssistantAPI.askAssistant({
            assistant_id: ass_id,
            question: `Extract the information from the following job description:\n${jobTxt}`
        });
    // 2 - Cast it to the desired format
        return (response as JobExtractResponse);
};

/**
 * Given a job description, extract the details necessary for:
 * 1. Creating a new cover letter.
 * 2. Creating a tailored cv.
 * @param jobTxt
*/
export async function extractFromJobDesc(jobTxt: string) {
    // 1 - Analyze the text yourself
        const words = getWords(jobTxt);
    // 2 - Get assistant response
        let assResp: JobExtractResponse;
        if (TEST) {
            await delay(1000);
            assResp = {
                "company": "Palantir",
                "positionName": "Defense Tech Software Engineer Intern",
                "positionType": "Internship",
                "aboutRole": [
                    "Supporting work specifically focusing on delivering Palantir Defense capabilities to critical mission partners.",
                    "Involved throughout the product lifecycle - from idea generation, design, and prototyping to execution and shipping.",
                    "Paired with a mentor dedicated to growth and success.",
                    "Collaborate closely with technical and non-technical counterparts to understand customers' problems and build products that tackle them."
                ],
                "aboutYou": [
                    "Ability to communicate and collaborate with a variety of individuals, including engineers, users, and non-technical team members.",
                    "Willingness to learn and make decisions independently.",
                    "Ability to ask questions when needed."
                ],
                "requirements": [
                    "Required: Engineering background in fields such as Computer Science, Mathematics, Software Engineering, and Physics.",
                    "Required: Familiarity with data structures, storage systems, cloud infrastructure, front-end frameworks, and other technical tools.",
                    "Required: Active US Security clearance, or eligibility and willingness to obtain a US Security clearance prior to start of internship.",
                    "Required: Experience coding in programming languages such as Java, C++, Python, JavaScript, or similar languages.",
                    "Required: Must be planning on graduating in 2026. This should be the final internship before graduating."
                ],
                "other": [
                    "Offer deadline: By applying to this position, you commit to confirming your decision within two weeks of receiving your written offer."
                ],
                "dateRange": "n/a",
                "salary": "$10,000/month",
                "deadline": "n/a",
                "howToApply": "Submit an updated resume/CV in PDF format and thoughtful responses to the application questions."
            };
        } else {
            assResp = await jobExtractAssistant(jobTxt)
        }
    // Return
        return {
            ...assResp,
            keywords: getWordOccurences(words),
            languages: findProgrammingLanguages(words),
            technologies: [],
        } as JobInfo;
};
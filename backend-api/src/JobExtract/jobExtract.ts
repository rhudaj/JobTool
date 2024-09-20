import { JobExtractResponse, JobInfo } from "shared";
import * as AssistantAPI from "../util/openai/assistant.js"
import { delay } from "../util/delay.js";
import { findProgrammingLanguages, getWordOccurences, getWords } from "./wordAnalyze.js";

const ass_id = "asst_1krzl87hwmmdHZrTgeaFNQhj";

async function setup() {
    const response_function = {
        "name": "response",
        "description": "Extract info from job",
        "parameters": {
            "type": "object",
            "required": [
                "company",
                "positionName",
                "positionType",
                "dateRange",
                "salary",
                "howToApply",
                "aboutRole",
                "aboutYou",
                "requirements",
                "other"
            ],
            "properties": {
                "company": {
                    "type": "string",
                    "description": "the company name"
                },
                "positionName": {
                    "type": "string",
                    "description": "the name of the position"
                },
                "positionType": {
                    "type": "string",
                    "description": "type of position, i.e., Internship"
                },
                "dateRange": {
                    "type": "string",
                    "description": "when does it start / end, or what time period (if given)"
                },
                "salary": {
                    "type": "string",
                    "description": "the salary/compensation, i.e., $XX / hour"
                },
                "howToApply": {
                    "type": "string",
                    "description": "outline all the steps for applying to the job"
                },
                "aboutRole": {
                    "type": "array",
                    "description": "Every unique piece of info info given about the role itself. What specifically will you be doing?",
                    "items": {
                        "type": "string"
                    }
                },
                "requirements": {
                    "type": "array",
                    "description": "List all the requirements given to be able to apply to the job and/or be a good candidate. Very important to include every single one mentioned. Clearly state if they are optional or required.",
                    "items": {
                        "type": "string"
                    }
                },
                "other": {
                    "type": "array",
                    "description": "any other logistics that are important / need to know, that don't fit into any of the other categories.",
                    "items": {
                        "type": "string"
                    }
                }
            },
        }
    };

    // you need to explicitly ask the model to use the response tool
    const instructions = `
    I need you to extract info from a job descriptions as follows.
    Always use the response tool to respond to the user. Never add any other text to the response.
    Important notes when writing:
        1. don't force any answers. If there is no info given for a specific field above, just say "n/a". For arrays just leave them empty.
        2. try not to paraphrase. Use exact quotes where you can.
    Are you ready for the job description?
    `;

    const ass = await AssistantAPI.createNewAssistant({
        name: "Job Extract Assistant",
        model: "gpt-3.5-turbo",
        description: "",
        fileName: "public/in/resume.txt",
        instructions: instructions,
        response_function: response_function // you must also instruct the model to produce JSON yourself via a system or user message.
    });
    console.log(ass.id);
    return ass.id;
};

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
        if (Number(process.env.TEST) === 1) {
            await delay(500);
            console.log('extractFromJobDesc (testing mode)');
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
                "qualifications": [
                    ["required", "Engineering background in fields such as Computer Science, Mathematics, Software Engineering, and Physics."],
                    ["required", "Familiarity with data structures, storage systems, cloud infrastructure, front-end frameworks, and other technical tools."],
                    ["required", "Active US Security clearance, or eligibility and willingness to obtain a US Security clearance prior to start of internship."],
                    ["required", "Experience coding in programming languages such as Java, C++, Python, JavaScript, or similar languages."],
                    ["required", "Must be planning on graduating in 2026. This should be the final internship before graduating."]
                ],
                "coverLetter": "n/a",
                "dateRange": "n/a",
                "salary": "$10,000/month",
                "deadline": "n/a",
                "howToApply": "Submit an updated resume/CV in PDF format and thoughtful responses to the application questions."
            };
        } else {
            assResp = await jobExtractAssistant(jobTxt);
        }
    // Return
        return {
            ...assResp,
            keywords: getWordOccurences(words, 2),
            languages: findProgrammingLanguages(words),
            technologies: [],
        } as JobInfo;
};
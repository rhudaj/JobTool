import * as AssistantAPI from "../util/openai/assistant.js"
import { CoverLetterResponse, CV, JobInfo } from "shared"
import { delay } from "../util/delay.js";
import { cv } from "./cv.js";

const test_cv = {} as CV;
const ass_id = "";

export async function setup() {
    const response_function = {
        "name": "response",
        "description": "Output cover letter",
        "parameters": {
            "type": "object",
            "required": [
                "intro",
                "body_paragraphs",
                "closing_remarks"
            ],
            "properties": {
                "intro": {
                    "type": "string",
                    "description": "Introduce yourself by mentioning your name, where you go to school, and why you are applying for this position."
                },
                "body_paragraphs": {
                    "type": "array",
                    "description": "<Provide 2-3 paragraphs to explain how your background aligns with the job requirements (based on your relevant skills and experiences)>",
                    "items": {
                        "type": "string"
                    }
                },
                "closing_remarks": {
                    "type": "string",
                    "description": "Express enthusiasm for the opportunity and a desire for further communication."
                }
            },
        }
    };

    // you need to explicitly ask the model to use the response tool
    const instructions = `
    You write in the first-person perspective of the person in the resume.
    Given a single job description, you will produce a single cover letter.
    Imporant: always use the response tool to respond to the user. Never add any other text to the response.
    `;

    const ass = await AssistantAPI.createNewAssistant({
        name: "CoverLetterGenerator",
        model: "gpt-3.5-turbo",
        description: "Generate cover letters for specific jobs using the given resume file (resume.txt)",
        fileName: "public/in/resume.txt",
        instructions: instructions,
        response_function: response_function // you must also instruct the model to produce JSON yourself via a system or user message.
    });
    console.log(ass.id);
    return ass.id;
};

interface TailorCVJobInfo {

};
2
// MAIN FUNCTION
export async function tailorCV(og_cv: CV, info: TailorCVJobInfo): Promise<CV> {
    let response: CV;
    if(Number(process.env.TEST) === 1) {
        await delay(500);
        console.log('genCV (testing mode)');
        response = test_cv;
    } else {
        // 1 - into the desired format
        const input = {
            // TODO: define
        };
        // 2 - get the response from assistant
        const inputTxt = JSON.stringify(input);
        response = await AssistantAPI.askAssistant({
            assistant_id: ass_id,
            question: `... ${inputTxt}`
        });
    }
    return response;
};
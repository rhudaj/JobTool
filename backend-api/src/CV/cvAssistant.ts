import * as AssistantAPI from "../util/openai/assistant.js"
import { CV, TailorCVInfo } from "shared"
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
    You write text that appears in a resume. Use proper resume language.
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

// MAIN FUNCTION
export async function tailorCV(textSegments: Map<string, string>, info: TailorCVInfo): Promise<CV> {
    let response: CV;
    if(Number(process.env.TEST) === 1) {
        await delay(500);
        console.log('genCV (testing mode)');
        response = test_cv;
    } else {
        // 1 - Put <info> as context to the model
        const CONTEXT = "...";
        // 2 - Open up a thread of questions w' Assistant
        // 3 - For each part of CV (textSegments), Ask Assistant to modify that part
        // 4 - Return the modified parts
    }
    return response;
};
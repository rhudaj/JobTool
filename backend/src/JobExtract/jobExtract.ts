// import { JobExtractResponse, JobInfo } from "job-tool-shared-types";
// import * as AssistantAPI from "../util/openai_assistant.js"
// import { delay } from "../util/delay.js";
// import { findProgrammingLanguages, getWordOccurences, getWords } from "./wordAnalyze.js";

// const TEST_response: JobExtractResponse = {
//     "company": "Veeva Systems",
//     "positionName": "Engineering Development Program",
//     "positionType": "Internship",
//     "dateRange": "n/a",
//     "salary": "$25 - $30 / hr",
//     "deadline": "n/a",
//     "howToApply": "At the time of application, please attach the most updated version of your academic transcript.",
//     "coverLetter": "n/a",
//     "aboutRole": [
//         "Join our Engineering Development Program as a front-end, back-end, or full-stack, where you'll work on small teams in a dynamic, agile environment, releasing features every four weeks.",
//         "Help us design our solutions.",
//         "Contribute to technical and functional design decisions, troubleshoot and provide technical product support, and be responsible for all aspects of the software development lifecycle."
//     ],
//     "qualifications": [
//         [
//             "required",
//             "Located near Toronto, Ontario and able to work in the office 4 days/week during your internship"
//         ],
//         [
//             "required",
//             "Working toward Bachelor’s Degree in Computer Science or a related technical degree"
//         ],
//         ["required", "Graduation date is by Summer 2027 or earlier"],
//         ["required", "Overall GPA must be 3.3 or higher"],
//         ["required", "Proficiency in Java"],
//         [
//             "required",
//             "Solid CS fundamentals (data structures, algorithms, and object-oriented design)"
//         ],
//         [
//             "optional",
//             "Working knowledge of frontend technologies such as JavaScript, HTML, and React"
//         ],
//         ["optional", "Working knowledge of relational databases"],
//         ["optional", "Relevant internship/project experience is a plus"]
//     ],
//     "aboutYou": [
//         "Mission-driven",
//         "Committed to making a positive impact on customers, employees, and communities"
//     ]
// };


// const ass_id = "asst_1krzl87hwmmdHZrTgeaFNQhj";

// async function setup() {
//     const response_function = {
//         "name": "response",
//         "description": "Extract info from job",
//         "parameters": {
//             "type": "object",
//             "required": [
//                 "company",
//                 "positionName",
//                 "positionType",
//                 "dateRange",
//                 "salary",
//                 "howToApply",
//                 "aboutRole",
//                 "aboutYou",
//                 "requirements",
//                 "other"
//             ],
//             "properties": {
//                 "company": {
//                     "type": "string",
//                     "description": "the company name"
//                 },
//                 "positionName": {
//                     "type": "string",
//                     "description": "the name of the position"
//                 },
//                 "positionType": {
//                     "type": "string",
//                     "description": "type of position, i.e., Internship"
//                 },
//                 "dateRange": {
//                     "type": "string",
//                     "description": "when does it start / end, or what time period (if given)"
//                 },
//                 "salary": {
//                     "type": "string",
//                     "description": "the salary/compensation, i.e., $XX / hour"
//                 },
//                 "howToApply": {
//                     "type": "string",
//                     "description": "outline all the steps for applying to the job"
//                 },
//                 "aboutRole": {
//                     "type": "array",
//                     "description": "Every unique piece of info info given about the role itself. What specifically will you be doing?",
//                     "items": {
//                         "type": "string"
//                     }
//                 },
//                 "requirements": {
//                     "type": "array",
//                     "description": "List all the requirements given to be able to apply to the job and/or be a good candidate. Very important to include every single one mentioned. Clearly state if they are optional or required.",
//                     "items": {
//                         "type": "string"
//                     }
//                 },
//                 "other": {
//                     "type": "array",
//                     "description": "any other logistics that are important / need to know, that don't fit into any of the other categories.",
//                     "items": {
//                         "type": "string"
//                     }
//                 }
//             },
//         }
//     };

//     // you need to explicitly ask the model to use the response tool
//     const instructions = `
//     I need you to extract info from a job descriptions as follows.
//     Always use the response tool to respond to the user. Never add any other text to the response.
//     Important notes when writing:
//         1. don't force any answers. If there is no info given for a specific field above, just say "n/a". For arrays just leave them empty.
//         2. try not to paraphrase. Use exact quotes where you can.
//     Are you ready for the job description?
//     `;

//     const ass = await AssistantAPI.createNewAssistant({
//         name: "Job Extract Assistant",
//         model: "gpt-3.5-turbo",
//         description: "",
//         fileName: "public/in/resume.txt",
//         instructions: instructions,
//         response_function: response_function // you must also instruct the model to produce JSON yourself via a system or user message.
//     });
//     console.log(ass.id);
//     return ass.id;
// };

// async function jobExtractAssistant(jobTxt: string): Promise<JobExtractResponse> {
//     // 1 - Get the json response
//         const response = await AssistantAPI.askAssistant({
//             assistant_id: ass_id,
//             question: `Extract the information from the following job description:\n${jobTxt}`
//         });
//     // 2 - Cast it to the desired format
//         return (response as JobExtractResponse);
// };

// /**
//  * Given a job description, extract the details necessary for:
//  * 1. Creating a new cover letter.
//  * 2. Creating a tailored cv.
//  * @param jobTxt
// */
// export async function extractFromJobDesc(jobTxt: string) {
//     // 1 - Analyze the text yourself
//         const words = getWords(jobTxt);
//     // 2 - Get assistant response
//         let assResp: JobExtractResponse;
//         // if (Number(process.env.OPENAI_API_OFF) === 1) {
//         //     await delay(500);
//         //     console.log('extractFromJobDesc (testing mode)');
//         //     assResp = TEST_response;
//         // } else {
//         //     assResp = await jobExtractAssistant(jobTxt);
//         // }
//     // Return
//         return {
//             ...assResp,
//             // keywords: getWordOccurences(words, 2),
//             languages: findProgrammingLanguages(words),
//             technologies: [],
//         } as JobInfo;
// };
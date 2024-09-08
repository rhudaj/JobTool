import * as AssistantAPI from "../shared/openai/assistant.js"
import { CoverLetterResponse, JobInfo } from "shared"
import { delay } from "../shared/util/delay.js";

const TEST = true;

const test_cl = {
    intro: 'Dear Hiring Manager at Palantir,\n' +
        '\n' +
        'My name is Roman Hudaj, and I am currently pursuing an Honours degree in Computer Science at the University of Waterloo. I am excited to apply for the Defense Tech Software Engineer Intern position at Palantir, as it aligns perfectly with both my academic pursuits and my passion for innovative technology solutions in defense and security sectors.',
    body_paragraphs: [
        'My educational background and project experiences have equipped me with a solid foundation in engineering and technology, specifically in areas such as Computer Science, Mathematics, and Software Engineering, which are essential for the role at Palantir. During my tenure at Timeplay and Martinrea International, I developed key software solutions and optimized data systems that significantly improved operational efficiency and customer satisfaction【4†source】. My projects, such as the Automated Restaurant Reservation Business and the Voice-to-Instrument Translator, showcase my ability to handle complex technical challenges and innovate solutions using a variety of programming languages and frameworks, including Python, JavaScript, and React【4†source】.',
        "I have a proven track record of collaborating effectively with both technical and non-technical team members to deliver high-quality products. At Environics Analytics, I spearheaded the development of a user-friendly app that facilitated non-technical teams' access to complex data, enhancing product strategy and profitability【4†source】. My ability to communicate complex technical details in an understandable manner and my willingness to learn and adapt quickly will allow me to effectively contribute to Palantir's mission of delivering advanced defense capabilities.",
        'I am eager to bring my technical skills and my proactive approach to learning and problem-solving to Palantir. I am also in the process of obtaining a US Security clearance, which will enable me to start contributing to your team immediately. I am particularly excited about the opportunity to be mentored by experienced professionals and to work on impactful projects that align with my career goals and interests.'
    ],
    closing_remarks: 'Thank you for considering my application. I am looking forward to the possibility of discussing how I can contribute to the innovative projects at Palantir. Please feel free to contact me at your earliest convenience to schedule an interview.\n' +
        '\n' +
        'Sincerely,\n' +
        'Roman Hudaj'
};

const ass_id = "asst_kiS7Nbb0VeXRd1T8kraFE3JY";

/* Old Instructions:
Based on my personal resume and the job description I gave you, answer the prompt:

    Write a note to let them know what interests you / why you think you'd be a good fit.

- If any specific questions were asked in the job description, answer them.
- Start with a brief introduction on yourself (school, major, why your interested, etc.)
- Then outly how you meet the job requirements clearly.
    - Don't use any repetitive or summarizing sentences such as "In summary..." or "And that's how I...".
    - Most of your info should be from the resume. Don't include long unnecessary sentences.
    - Don't leave any blanks in your answer like "[Your Name]". The answer should be complete.
- At the end mention that you'd love to share more about yourself.

V2 Instructions:
- Answer with the info from your resume based on the job requirements.
    - Don't use any repetitive or summarizing sentences such as "In summary..." or "And that's how I...".
    - Most of the details should be from your resume. Don't include long unnecessary sentences.
    - Don't leave any blanks in your answer like "[Your Name]". The answer should be complete.

MORE:
- Be sure to use the keywords in the job-description. Also, make sure to use proof from the resume when demonstrating how you meet the requirements.

MORE:
You write in the first-person perspective of a student/proffesional with the skills/experiences listed in the resume below.
[RESUME START]
{resume}
[RESUME END]
You will be answering questions based on the following job description:
[JOB DESC. START]
{job}
[JOB DESC. END]
*/

async function setup() {
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

async function genCL(jobInfo: JobInfo) {
    // 1 - Into the desired format
        const input = {
            "Company Name": jobInfo.company,
            "Position Name": jobInfo.positionName,
            "Position Type": jobInfo.positionType,
            "About the Role": jobInfo.aboutRole,
            "About you": jobInfo.aboutYou,
            "Requirements": jobInfo.requirements
        };
        const inputTxt = JSON.stringify(input);

    // 1 - Get the json response
        if(TEST) {
            await delay(1000);
            return test_cl;
        }

        const response = await AssistantAPI.askAssistant({
            assistant_id: ass_id,
            question: `Generate the cover letter object (based on the file resume.txt), for the following job description:\n${inputTxt}`
        });
        console.log("response:\n", response);
    // 2 - Cast it to the desired format
        return (response as CoverLetterResponse);
};



export { setup, genCL }
import { extractFromJobDesc } from "./JobExtract/jobExtract.js";
import express from "express";
import cors from "cors";
import { JobInfo } from "shared";
import { genCL, transformCLResponse } from "./CL/clAssistant.js";
import { outputCLDoc } from "./CL/create_doc.js";
import { Log } from "./shared/util/files.js";
import * as fs from "fs"
import { outputCLPDF } from "./CL/create_pdf.js";

let LOG: Log;
const TEST: boolean = Number(process.env.TEST) === 1;

// Create an instance of the express application
const app = express();

const corsOptions = {
    origin: "*",
    credentials: true, //access-control-allow-credentials:true
    optionSuccessStatus: 200,
};
app.use(cors(corsOptions)); // Use this after the variable declaration
app.use(express.json({ type: "application/json" })); // parses incoming requests with JSON payloads

// Start the server and listen to the port
const port = process.env.PORT;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

// { job_text: string } => extractFromJobDesc => JobInfo
app.post("/getJobInfo", async (req, res) => {
    const jobTxt = req.body.job_text as string;
    const jobInfo = await extractFromJobDesc(jobTxt); // run function
    console.log("jobInfo.keywords.length = ", jobInfo.keywords.length);
    if (jobInfo) {
        if(!TEST) {
            LOG = new Log(`LOG_${jobInfo.company}_${new Date().getSeconds()}`);
            LOG.addFile(`jobText`, jobTxt);
            LOG.addFile(`jobInfo.json`, jobInfo);
        }
        res.json(jobInfo); // send result (as a JSON response)
    } else {
        res.status(404).send("Error getting job info from job text.");
    }
});

// JobInfo => generateCoverLetter => cl_response => [ paragraphs ]
app.post("/genCL", async (req, res) => {
    const jobInfo = req.body as JobInfo;
    const cl_response = await genCL(jobInfo); // run function
    if (cl_response) {
        if(!TEST) {
            LOG.addFile("cl.json", cl_response);
        }
        // convert to string[]
        const cl_paragraphs = transformCLResponse(cl_response);
        // outputCLPDF(cl_paragraphs, pdf_path);
        res.json(cl_paragraphs); // send result (as a JSON response)
    } else {
        res.status(404).send("Error getting cl_response info from jobInfo.");
    }
});

const pdf_path = process.cwd() + "/public/cl.pdf";

app.post("/outputCLDoc", async (req, res) => {
    console.log("outputCLDoc called");
    const cl_paragraphs = req.body as string[];
    if (!cl_paragraphs) return console.log("Invalid request.body");
    const buff: Buffer = await outputCLDoc(cl_paragraphs);
    if (buff !== null) {
        res.end(buff);
    } else {
        res.status(404).send("Error downloading cover letter as .docx");
    }
});

app.post('/outputCLPDF', async (req, res) => {
    console.log("outputCLPDF called");
    const cl_paragraphs = req.body as string[];
    console.log('cl_paragraphs = ', cl_paragraphs);
    if (!cl_paragraphs) return console.log("Invalid request.body");
    outputCLPDF(cl_paragraphs, pdf_path);
    res.status(200).send("PDF updated!");
});

app.get('/cl.pdf', (req, res) => {
    var file = fs.createReadStream(pdf_path);
    res.setHeader('Content-Type', 'application/pdf');
    // Content-Disposition:
    //      "attachment; filename=cl.pdf"   => to download instead
    //      "inline; filename=cl.pdf"       => to display
    res.setHeader('Content-Disposition', 'inline; filename=cl.pdf');
    file.pipe(res);
});

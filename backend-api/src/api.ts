import { extractFromJobDesc } from "./JobExtract/jobExtract.js";
import express from "express";
import cors from "cors";
import { JobInfo } from "shared";
import { genCL, transformCLResponse } from "./CL/clAssistant.js";
import { Log } from "./shared/util/files.js";

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
        const cl_paragraphs: string[] = transformCLResponse(cl_response);
        // outputCLPDF(cl_paragraphs, pdf_path);
        res.json(cl_paragraphs); // send result (as a JSON response)
    } else {
        res.status(404).send("Error getting cl_response info from jobInfo.");
    }
});
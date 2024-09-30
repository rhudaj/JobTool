import { extractFromJobDesc } from "./JobExtract/jobExtract.js";
import express from "express";
import cors from "cors";
import { JobInfo } from "shared";
import { genCL, transformCLResponse } from "./CL/clAssistant.js";
import { Log } from "./util/files.js";
import { cv } from "./CV/cv.js";
import { tailorCV } from "./CV/cvAssistant.js";

let LOG: Log;
const TEST: boolean = Number(process.env.TEST) === 1;
const PORT = process.env.PORT;

const app = express();
app
    .use(
        cors({
            origin:'*',
            credentials: true,
            optionsSuccessStatus:200
        })
    )
    .use(
        // parses incoming requests with JSON payloads
        express.json({ type: "application/json" })
    );

// Start the server and listen to the port
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
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

// JobInfo => genCL() => cl_response => [ paragraphs ]
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

// (none) => tailorCV() => CV
app.post("/tailorCV", async (req, res) => {
    // no body
    const old_cv = cv;
    const info = {};
    const new_cv = null;
    // const new_cv = await tailorCV(undefined, undefined); // run function
    if (new_cv) {
        if(!TEST) {
            LOG.addFile("old_cv.json", old_cv);
            LOG.addFile("new_cv.json", new_cv);
        }
        res.json(new_cv); // send result (as a JSON response)
    } else {
        res.status(404).send("Error getting new CV.");
    }
});
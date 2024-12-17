import { extractFromJobDesc } from "./JobExtract/jobExtract.js";
import express from "express";
import cors from "cors";
import { CV, JobInfo } from "shared";
import { genCL, transformCLResponse } from "./CL/clAssistant.js";
import { Log } from "./util/files.js";
import { tailorCV } from "./CV/cvAssistant.js";
import * as in_out from "./util/inOut.js";

let LOG: Log = new Log();
const TEST: boolean = Number(process.env.TEST) === 1;
const PORT = process.env.PORT;

/* #############################################################################
                            SETUP SERVER
##############################################################################*/

const app = express();
app .use(
        cors({
            origin:'*',
            credentials: true,
            optionsSuccessStatus:200
        })
    )
    .use(
        // Parses incoming requests with JSON payloads
        express.json({ type: "application/json" })
    );

// Start the server and listen to the port
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}. TEST mode enabled: ${TEST}`);
});

/* ##########################################################
                            genCL
############################################################*/

// JobInfo => genCL() => cl_response => [ paragraphs ]
app.post("/genCL", async (req, res) => {
    console.log("genCL posted to!");
    const jobInfo = req.body as JobInfo|any;
    console.log("\tbody (jobInfo), type: ", typeof jobInfo);
    let jobInfoAsStr: string;
    // test if jobInfo matches the JobInfo interface:
    if( jobInfo.job_info ) {
        jobInfoAsStr = jobInfo.job_info as string;
    }
    const cl_response = await genCL(jobInfoAsStr ? jobInfoAsStr : jobInfo); // run function
    console.log("cl_response = ", cl_response);
    if (cl_response) {
        if(!TEST) {
            if(!LOG.isSetup()) LOG.setup(`LOG_someCompany_${new Date().getSeconds()}`)
            LOG.addFile("cl.json", cl_response);
        }
        // convert to string[]
        const cl_paragraphs: string[] = transformCLResponse(cl_response);
        // send result (as a JSON response)
        res.json(cl_paragraphs);
    } else {
        res.status(404).send("Error getting cl_response info from jobInfo.");
    }
});

/* ##########################################################
                            saveCV
############################################################*/

app.post("/saveCV", async (req, res) => {
    console.log('saveCV posted to!');
    const namedCV = req.body as {name: string, cv: CV};
    if (namedCV) {
        in_out.saveCV(namedCV.name, namedCV.cv);
        res.status(200).send("CV saved successfully.");
    } else {
        res.status(404).send("Error saving CV.");
    }
});

/* ##########################################################
                            getJobInfo
############################################################*/

// { job_text: string } => extractFromJobDesc => JobInfo
app.post("/job_info", async (req, res) => {
    const jobTxt = req.body.job_text as string;
    const jobInfo = await extractFromJobDesc(jobTxt); // run function
    console.log("jobInfo.keywords.length = ", jobInfo.keywords.length);
    if (jobInfo) {
        if(!TEST) {
            LOG.setup(`LOG_${jobInfo.company}_${new Date().getSeconds()}`)
            LOG.addFile(`jobText`, jobTxt);
            LOG.addFile(`jobInfo.json`, jobInfo);
        }
        res.json(jobInfo); // send result (as a JSON response)
    } else {
        res.status(404).send("Error getting job info from job text.");
    }
});

/* ##########################################################
                        (GET) cv_info
############################################################*/

app.get("/cv_info", async (req, res) => {
    console.log('cv_info requested');
    const cv_info = in_out.getCVinfo();
    if ( ! cv_info ) {
        res.status(404).send("No CV info found.");
    } else {
        res.json(cv_info);
    }
});

/* ##########################################################
                        (GET) cl_info
############################################################*/

app.get("/cl_info", async (req, res) => {
    console.log('cl_info requested');
    const cv_info = in_out.getCLinfo();
    if ( ! cv_info ) {
        res.status(404).send("No CV info found.");
    } else {
        res.json(cv_info);
    }
});

/* ##########################################################
                        (GET) all_cvs
############################################################*/

// Send all CV files to the frontend.
app.get("/all_cvs", async (req, res) => {
    console.log('all_cvs requested');
    const namedCVs = in_out.getNamedCVs();
    if ( ! namedCVs ) {
        res.status(404).send("No CVs found.");
    } else {
        res.json(namedCVs);
    }
});

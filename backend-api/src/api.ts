import { extractFromJobDesc } from "./JobExtract/jobExtract.js";
import express from "express";
import cors from "cors"
import { JobInfo } from "shared";
import { genCL } from "./CL/clAssistant.js";

// Create an instance of the express application
const app = express();

const corsOptions ={
	origin:'*',
	credentials:true,            //access-control-allow-credentials:true
	optionSuccessStatus:200,
};
app.use(cors(corsOptions)); // Use this after the variable declaration

// the app handdles only json requests in the body
app.use(express.json());

// Start the server and listen to the port
const port = process.env.PORT;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

// { job_text: string } => extractFromJobDesc => JobInfo
app.post("/getJobInfo", async (req, res) => {
    const jobTxt = req.body.job_text as string;
    const jobInfo = await extractFromJobDesc(jobTxt); // run function
    console.log('jobInfo.keywords: ', jobInfo.keywords);
    if (jobInfo) {
        res.json(jobInfo);  // send result (as a JSON response)
    } else {
        res.status(404).send("Error getting job info from job text.");
    }
});


// JobInfo => generateCoverLetter => CoverLetterResponse
app.post("/genCL", async (req, res) => {
    const jobInfo = req.body as JobInfo;
    const cl_response = await genCL(jobInfo); // run function
    if (cl_response) {
        res.json(cl_response); // send result (as a JSON response)
    } else {
        res.status(404).send("Error getting cl_response info from jobInfo.");
    }
});

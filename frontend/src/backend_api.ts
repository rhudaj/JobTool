import { CoverLetterResponse, JobInfo } from "shared";
const URL = "http://localhost:8080";

export class BackendAPI {
    private static async POST(func: string, body: any) {
        const url = URL + "/" + func;
        try {
            var resp = await fetch(url, {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body)
            });
        } catch (err: unknown) {
            console.log("Something went wrong with fetch @", url, "err: ", err);
            return null;
        }
        console.log("response status = ", resp.status);
        return resp.ok ? await resp.json() : null;
    };

    static async getJobInfo(jobTxt: string): Promise<JobInfo | null> {
        console.log("BackendAPI.getJobInfo called");
        const data = await this.POST("getJobInfo", {
            "job_text": jobTxt,
        });
        console.log("data from backend = ", data);
        return (Object.keys(data).length === 0) ? null : data;
    };

    static async genCL(jobInfo: JobInfo): Promise<CoverLetterResponse | null> {
        console.log("BackendAPI.genCL called!");
        const data = await this.POST("genCL", jobInfo);
        return data ? data : null;
    };
}

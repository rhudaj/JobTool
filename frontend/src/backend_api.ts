import { CV, JobInfo } from "shared";

/**
 * BackendAPI class
 * @note the user should have to construct one,
 * which will automatically test that the server is running.
 */
export class BackendAPI {
    static HOST = "http://localhost:8080";

    // TODO: test if server is running

    private static async POST(func: string, body: any): Promise<Response | null> {
        // server is running:
        const url = BackendAPI.HOST + "/" + func;
        console.log("Attempting POST => ", url);
        try {
            var resp = await fetch(url, {
                method: "post",
                headers: {
                    "Content-Type": "application/json", // that the request body contains JSON.
                },
                body: JSON.stringify(body),
            });
        } catch (err: unknown) {
            console.log("Something went wrong with fetch @", url, "err: ", err);
            return null;
        }
        console.log("response status = ", resp.status);
        return resp.ok ? resp : null;
    };

    static async getJobInfo(jobTxt: string): Promise<JobInfo | null> {
        console.log("BackendAPI.getJobInfo called");
        const resp = await this.POST("getJobInfo", {
            job_text: jobTxt,
        });
        if (!resp) return null;
        const data = await resp.json();
        console.log("data from backend = ", data);
        return Object.keys(data).length === 0 ? null : data;
    };

    static async genCV(jobInfo: JobInfo): Promise<CV | null> {
        console.log("BackendAPI.genCV called, jobInfo = ", jobInfo);
        const resp = await this.POST("genCV", jobInfo);
        console.log("genCV response = ", resp);
        if (!resp) return null;
        const data: CV = await resp.json();
        return data ? data : null;
    };

    static async genCL(jobInfo: JobInfo|string): Promise<string[] | null> {
        if(typeof jobInfo === "string") jobInfo = { "job_info": jobInfo } as any;
        const resp = await this.POST("genCL", jobInfo);
        if (!resp) return null;
        const data: string[] = await resp.json();
        return data ? data : null;
    };
}

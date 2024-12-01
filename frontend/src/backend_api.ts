import { CV, JobInfo } from "shared";
import { useLogger } from "./hooks/logger";

/**
 * BackendAPI class
 * @note the user should have to construct one,
 * which will automatically test that the server is running.
 */
export class BackendAPI {

    private static HOST = "http://localhost:8080";
    private static log = useLogger("BackendAPI");

    // TODO: test if server is running

    private static async POST(func: string, body: any): Promise<Response | null> {
        // server is running:
        const url = BackendAPI.HOST + "/" + func;
        BackendAPI.log("Attempting POST => ", url);
        try {
            var resp = await fetch(url, {
                method: "post",
                headers: {
                    "Content-Type": "application/json", // that the request body contains JSON.
                },
                body: JSON.stringify(body),
            });
        } catch (err: unknown) {
            BackendAPI.log("Something went wrong with fetch @", url, "err: ", err);
            return null;
        }
        BackendAPI.log("response status = ", resp.status);
        return resp.ok ? resp : null;
    };

    private static async GET(func: string): Promise<Response | null> {
        const url = BackendAPI.HOST + "/" + func;
        BackendAPI.log("Attempting GET => ", url);
        try {
            var resp = await fetch(url);
        } catch (err: unknown) {
            BackendAPI.log("Something went wrong with fetch @", url, "err: ", err);
            return null;
        }
        BackendAPI.log("response status = ", resp.status);
        return resp.ok ? resp : null;
    }

    static async getJobInfo(jobTxt: string): Promise<JobInfo | null> {
        BackendAPI.log("BackendAPI.getJobInfo called");
        const resp = await this.POST("getJobInfo", {
            job_text: jobTxt,
        });
        if (!resp) return null;
        const data = await resp.json();
        BackendAPI.log("data from backend = ", data);
        return Object.keys(data).length === 0 ? null : data;
    };

    static async genCV(jobInfo: JobInfo): Promise<CV | null> {
        BackendAPI.log("BackendAPI.genCV called, jobInfo = ", jobInfo);
        const resp = await this.POST("genCV", jobInfo);
        BackendAPI.log("genCV response = ", resp);
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

    static async saveCV(name: string, cv: CV): Promise<boolean> {
        const resp = await this.POST("saveCV", { name, cv });
        return resp ? resp.ok : false;
    };

    static async getCVs(): Promise<{name: string, data: CV}[] | null> {
        const resp = await this.GET("getCVs");
        if (!resp) return null;
        const data = await resp.json();
        return data ? data : null;
    };

    static async getCVinfo(): Promise<any> {
        const resp = await this.GET("getCVinfo");
        if (!resp) return null;
        const data = await resp.json();
        return data ? data : null;
    };
}

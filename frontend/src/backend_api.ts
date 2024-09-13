import { CoverLetterResponse, JobInfo } from "shared";

/*
    Factory function:
*/
function createPostEndpoint<bodyType, responseType>() {
    return (body: bodyType) => {};
}

/**
 * BackendAPI class
 * @note the user should have to construct one,
 * which will automatically test that the server is running.
 */
let serverIsOn = false;
export class BackendAPI {
    static HOST = "http://localhost:8080";

    private static async testServer(): Promise<boolean> {
        try {
            await fetch(this.HOST, {
                method: "get",
                headers: {
                    "Content-Type": "application/json", // that the request body contains JSON.
                },
            });
        } catch (e: unknown) {
            console.log("Server could not be reached! Ensure it is up");
            console.log("fetch error: ", e);
            return false;
        }
        serverIsOn = true;
        return true;
    }

    private static async POST(
        func: string,
        body: any
    ): Promise<Response | null> {
        // test if the server is up:
        if (serverIsOn || !(await this.testServer())) return null;
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
    }

    static async getJobInfo(jobTxt: string): Promise<JobInfo | null> {
        console.log("BackendAPI.getJobInfo called");
        const resp = await this.POST("getJobInfo", {
            job_text: jobTxt,
        });
        if (!resp) return null;
        const data = await resp.json();
        console.log("data from backend = ", data);
        return Object.keys(data).length === 0 ? null : data;
    }

    static async genCL(jobInfo: JobInfo): Promise<CoverLetterResponse | null> {
        console.log("BackendAPI.genCL called!");
        const resp = await this.POST("genCL", jobInfo);
        if (!resp) return null;
        const data = await resp.json();
        return data ? data : null;
    }

    static async outputCLDoc(cl: CoverLetterResponse): Promise<void> {
        console.log("outputCLDoc called, cl = ", cl);
        // Get the .docx file
        const resp: Response = await this.POST("outputCLDoc", cl);
        if (!resp) return null;
        console.log("response = ", resp);
        const buff = await resp.arrayBuffer();
        // Download
        const url = window.URL.createObjectURL(new Blob([buff]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", "cl.docx");
        document.body.appendChild(link);
        link.click();
    }
}

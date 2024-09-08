import { CoverLetterResponse, JobInfo } from "shared";
const URL = "http://localhost:8080";

export class BackendAPI {
    private static async POST(func: string, body: any): Promise<Response|null> {
        const url = URL + "/" + func;
        console.log('Attempting POST => ', url);
        try {
            var resp = await fetch(url, {
                method: "post",
                headers: {
                    "Content-Type": "application/json" // that the request body contains JSON.
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
        const data = await resp.json();
        console.log("data from backend = ", data);
        return Object.keys(data).length === 0 ? null : data;
    }

    static async genCL(jobInfo: JobInfo): Promise<CoverLetterResponse | null> {
        console.log("BackendAPI.genCL called!");
        const resp = await this.POST("genCL", jobInfo);
        const data = await resp.json();
        return data ? data : null;
    }

    static async outputCLDoc(cl: CoverLetterResponse): Promise<void> {
        console.log("outputCLDoc called, cl = ", cl);
        const response: Response = await this.POST("outputCLDoc", cl);
        console.log("response = ", response);
        const buff = await response.arrayBuffer();
        // Download
        const url = window.URL.createObjectURL(new Blob([buff]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'cl.docx');
        document.body.appendChild(link);
        link.click();
    }
}

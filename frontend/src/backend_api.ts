import { CV, JobInfo } from "shared";
import { useLogger } from "./hooks/logger";

/**
 * BackendAPI class
 * @todo the user should have to construct one,
 * which will automatically test that the server is running.
 */

export class BackendAPI {
    private static HOST = "http://localhost:8080";
    private static log = useLogger("BackendAPI");

    // Centralized request method
    private static async request<T>(
        method: "GET" | "POST",
        endpoint: string,
        body?: any,
    ): Promise<T|null> {

        const url = `${this.HOST}/${endpoint}`;

        this.log(`Attempting ${method} =>`, url);

        try {
            const options: RequestInit = {
                method,
                headers: { "Content-Type": "application/json" },
                ...(body && { body: JSON.stringify(body) }),
            };

            const response = await fetch(url, options);

            this.log("Response status =", response.status);

            if (!response.ok) {
                throw new Error(`Request failed with status: ${response.status}`);
            }

            const data: T = await response.json();
            return data;
        } catch (err: unknown) {
            this.log("Request error at", url, "err:", err);
            return null;
        }
    }

    // Generic POST method
    // "getJobInfo":    { job_text: string }     => getJobInfo   => JobInfo
    // "genCL":         { job_info: string }     => genCL        => string[]
    // "saveCV":        {name: string, cv: CV}   => saveCV       => nothing
    static async post<IN, OUT>(endpoint: string, body: IN): Promise<OUT | null> {
        return await this.request<OUT>("POST", endpoint, body);
    }

    // Generic GET method
    static async get<OUT>(endpoint: string): Promise<OUT | null> {
        return await this.request<OUT>("GET", endpoint, undefined);
    }
}

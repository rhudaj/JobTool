// external
import { Request, Response } from "express";
import { Router } from "express";
// internal
import { DB } from "./db.js";
import { NamedCV } from "job-tool-shared-types";
import { genCL } from "./assistants/coverLetter.js";
import { resumeItemAssistant } from "./assistants/editResumeItem.js";

const router = Router();

interface Resource {
    name: string
    paths: Resource[]|Endpoint[]
};

interface Endpoint<BODY_T=any, RESP_T=any> {
    method: string
    params?: string
    requireBody?: boolean       // default = false
    logicFunction: (data: BODY_T, params?: any) => Promise<RESP_T> | RESP_T // if requireBody
};

// GENERALIZED HANDLER
const handleRequest = async (
    path: string,
    req: Request,
    res: Response,
    endp: Endpoint<any, any>
) => {

    console.log(`${endp.method} REQUEST MADE TO: ${path} (params: ${JSON.stringify(req.params)})`);

    if (endp.requireBody && (!req.body)) {
        console.warn("Request body missing.");
        return res.status(400).json({ error: "Request body is required" });
    }

    // may or may not be a result
    endp.logicFunction(req.body, req.params)
    // if it succeeds, it will return a result (possibly void)
    .then(result => {
        if(result) res.status(200).json(result)
        else res.status(200) // no data to send back
    })
    // if it fails, it will return an error
    .catch(error => {
        console.warn("Error processing request:", error)
        res.statusMessage = `Error processing request to ${path}: ${error}`
        return res.status(404);
    })
};

/* #############################################################################
                                DEFINE ENPOINTS
##############################################################################*/

const resources: Resource[] = [
    {
        name: "AI",
        paths: [
            {
                name: "genCL",
                paths: [
                    {
                        method: "post",
                        requireBody: true,
                        logicFunction: async (jobInfo: any) => genCL({jobInfo})
                    }
                ]
            },
            {
                name: "EditItem",
                paths: [
                    {
                        method: "post",
                        logicFunction: async (params: any) => resumeItemAssistant.askQuestion(params)
                    }
                ]
            }
        ]

    },
    {
        name: "cvs",
        paths: [
            {
                // GET ALL CVS
                method: "get",
                logicFunction: () => DB.all_cvs()
            },
            {
                // CREATE NEW CV
                method: "post",
                requireBody: true,
                logicFunction: async (data: NamedCV) => {
                    await DB.save_new_cv(data)
                }
            },
            {
                // UPDATE EXISTING CV
                method: "put",
                params: ":name",
                requireBody: true,
                logicFunction: async (data: NamedCV, params: { name: string }) => {
                    DB.update_cv(data, params.name)
                }
            },
            {
                // DELETE CV
                method: "delete",
                params: ":name",
                logicFunction: async (_, params: { name: string }) => {
                    DB.delete_cv(params.name)
                }
            }
        ]
    },
    {
        name: "cv_info",
        paths: [
            {
                method: "get",
                logicFunction: () => DB.cv_info()
            },
            {
                method: "put",
                requireBody: true,
                logicFunction: async (data: any) => {
                    console.log("PUT request to /cv_info")
                    DB.save_cv_info(data)
                }
            }
        ]
    },
    {
        name: "annotations",
        paths: [
            {
                method: "post",
                logicFunction: async (data: { job: string, ncv?: NamedCV, annotations?: any }) => {
                    DB.save_annotation(data)
                }
            }
        ]
    }
];

// recursively attach all endpoints
function attachEndpoints(resource: Resource, full_path: string = "") {
    full_path += "/" + resource.name
    resource.paths.forEach((path: Resource|Endpoint, i: number) => {
        if ("paths" in path) {
            // RECURSIVE CASE (path is a Resource)
            attachEndpoints(path, full_path);
        } else {
            // BASE CASE (path is an Endpoint):
            const endp = path as Endpoint;
            let p = full_path
            if(endp.params) p += "/" + endp.params
            router[endp.method](p, (req, res) => handleRequest(p, req, res, endp))
            console.log(`Attached Endpoint: (${endp.method}) ${p}`)
        }
    });
}

resources.forEach((r: Resource) => attachEndpoints(r));

export default router;
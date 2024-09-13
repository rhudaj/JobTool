import { CV, JobInfo } from "shared";

/**
 * Given a job description, create a tailored cv
 * @param og_cv
 * @param jobTxt
*/
export function tailorCV(og_cv: CV, job: JobInfo): CV {
    const new_cv = og_cv;
    // 1 - Create a new summary
        new_cv.summary = "";
    // 2 - Update lists (out of ALL options, pick the best ones).
        new_cv.languages = [];
        new_cv.technologies = [];
        new_cv.courses = [];
    // 3 - Update keywords
        new_cv.experiences = new_cv.experiences.map(exp=>{
            exp.bulletPoints = exp.bulletPoints.map(bp=>"");
            return exp;
        });
        new_cv.projects = new_cv.projects.map(proj=>{
            proj.description = "";
            return proj;
        });
    return new_cv;
};
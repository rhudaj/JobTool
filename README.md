# Directory Structure
* **src** : all typescript source files
    * **JobExtract** : resume.
        * **jobExtract** : defines ```extractFromJobDesc: (jobTxt: string) => JobInfo```
    * **CL** : cover letters.
        * **clAssistant** : defines ```genCL: (jobTxt: string) => CoverLetterResponse```, for creating a cover letter for a given job description (*in/job.txt*) based on a resume (*in/resume.txt*)
        * **create_doc** : defines ```outputCLDoc: CoverLetterResponse => void```, which creates a *.docx* file from a cover letter.
    * **CV** : resume.
        * **cv** : defines ```CV```, the info & structure of a CV.
        * **tailorCV** : defines ```tailorCV: (og_cv: CV, jobText: JobInfo)```, Given a job description, create a tailored cv
        * **updateLatex** : defines ```UpdateLatexCV: (cv: CV) => void```, which updates the latex file of the cv.
* **public** : all input / output files (.txt, .docx, .json, ...)
export type WordOccurences = [string, number][]

// JOB -----------------------------------------------

export interface JobExtractResponse {
    company: string,
    positionName: string,
    positionType: string,
    aboutRole: string[],
    aboutYou: string[],
    qualifications: [reqType, string][],
    coverLetter: string,    // ***
    dateRange: string,
    salary: string,
    deadline: string,
    howToApply: string,
};

type reqType = "required" | "optional";

export interface JobInfo {
    // USED FOR CV ------------
    company: string,
    positionName: string,
    aboutRole: string[],
    aboutYou: string[],
    qualifications: [reqType, string][],
    // ---- DONE MANUALLY ------
    keywords: WordOccurences,
    languages: string[],
    technologies: string[],
    // ---- DONE MANUALLY ------
    // USED FOR CV ------------
    // META INFO --------------
    positionType: string,
    dateRange: string,
    salary: string,
    deadline: string,
    howToApply: string,
    coverLetter: string,
    // ------------------------
};

// CL ------------------------------------------------

export interface CoverLetterResponse {
    intro: string;
    body_paragraphs: string[];
    closing_remarks: string;
};

// CV ------------------------------------------------

export interface JobExperience {
    date_range: string,
    title: string,
    company: string,
    bulletPoints: string[],
    tech: string[]
};

export interface Project {
    date_range: string,
    title: string,
    url: string,
    description: string,
    tech: string[]
};

interface Link {
    icon: string,
    text: string,
    url: string
};

export interface CV {
    personalTitle: string,
    summary: string,
    languages: string[],
    technologies: string[],
    courses: string[],
    links: Link[],
    experiences: JobExperience[],
    projects: Project[],
};



// TAILOR CV -----------------------------------------

export interface TailorCVInfo {
    company: string,
    positionName: string,
    aboutRole: string[],
    aboutYou: string[],
    qualifications: [reqType, string][],
    keywords: WordOccurences,
    languages: string[],
    technologies: string[]
};

// GEN CL --------------------------------------------

// create an interface called 'GenCLInfo' that is the same as the interface TailorCVInfo
export interface GenCLInfo extends TailorCVInfo {}
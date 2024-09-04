export type WordOccurences = [string, number][]

// JOB -----------------------------------------------

export interface JobExtractResponse {
    company: string,
    positionName: string,
    positionType: string,
    aboutRole: string,
    aboutYou: string,
    requirements: string[],
    other: string[],
    dateRange: string,
    salary: string,
    deadline: string,
    howToApply: string,
};

export interface JobInfo {
    company: string,
    positionName: string,
    positionType: string,
    aboutRole: string,
    aboutYou: string,
    requirements: string[],
    other: string[],
    dateRange: string,
    salary: string,
    deadline: string,
    howToApply: string,
    // ***
    keywords: WordOccurences,
    languages: string[],
    technologies: string[],
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
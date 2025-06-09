// Consolidated types previously from shared package

export type WordOccurences = [string, number][];

export interface JobExtractResponse {
    company: string;
    positionName: string;
    positionType: string;
    aboutRole: string[];
    aboutYou: string[];
    qualifications: [reqType, string][];
    coverLetter: string;
    dateRange: string;
    salary: string;
    deadline: string;
    howToApply: string;
}

export type reqType = "required" | "optional";

export interface JobInfo {
    company: string;
    positionName: string;
    aboutRole: string[];
    aboutYou: string[];
    aboutCompany: string[];
    qualifications: [reqType, string][];
    languages: string[];
    technologies: string[];
    positionType: string;
    dateRange: string;
    salary: string;
    deadline: string;
    howToApply: string;
}

export interface CoverLetterResponse {
    intro: string;
    transition: string;
    body_paragraphs: string[];
    why_work_here: string;
    closing_remarks: string;
}

/* ---------------------------------------------------------------
                        (NAMED) CV
--------------------------------------------------------------- */

export interface CVMetaInfo {
    name: string,
    path?: string,
    tags?: string[]
}

export type NamedCV = CVMetaInfo & {
    data: CV;
};

// MAIN CV STRUCTURE ----------------------------------------------

export interface CV {
    header_info: {
        name: string,
        links: Link[]
    },
    sections: CVSection[]
}

export interface CVSection {
    name: string;
    bucket_type?: string;
    items: SectionItem[];
}

// SECTION ITEMS ------------------------------------------------------

export type SectionItem = Summary | Experience

export interface Summary {
    summary: string;
    languages: string[];
    technologies: string[];
}

export interface Experience extends CVCoreExperience, CVContentExperience {}

// SECTION – REUSABLE/SUB-ITEMS -------------------------------------------

export interface DateRange {
    start: MonthYear;
    end: MonthYear;
}

export interface MonthYear {
    month: number;
    year: number;
}

export interface Link {
    icon: string;
    url: string;
    text?: string;
}

/* ---------------------------------------------------------------
                        NEW CV STRUCTURE (with cv_core)
--------------------------------------------------------------- */

// New NamedCV structure that uses CVContent
export type NamedCVContent = CVMetaInfo & {
    data: CVContent;
};

// New CV content structure that references cv_core by ID
export interface CVContent {
    sections: CVContentSection[]
}

export interface CVContentSection {
    name: string;
    bucket_type?: string;
    items: CVContentItem[];
}

export type CVContentItem = Summary | CVContentExperience

export interface CVContentExperience {
    id: string;
    description: string[];
    item_list: string[];
}

/* ---------------------------------------------------------------
                CV Core structure (stored separately)
--------------------------------------------------------------- */


// CV Core structure (stored separately)
export interface CVCore {
    full_name: string;
    contact_links: Link[];
    sections: CVCoreSection[];
}

export interface CVCoreSection {
    id: string;
    items: CVCoreExperience[];
}

export interface CVCoreExperience {
    id: string;
    title: string;
    date: DateRange;
    role?: string;
    location?: string;
    link?: Link;
}

/* ---------------------------------------------------------------
                        UNUSED (keeping for compatibility)
--------------------------------------------------------------- */

export interface TailorCVInfo {
    company: string;
    positionName: string;
    aboutRole: string[];
    aboutYou: string[];
    qualifications: [reqType, string][];
    keywords: WordOccurences;
    languages: string[];
    technologies: string[];
}

export interface GenCLInfo extends TailorCVInfo {}

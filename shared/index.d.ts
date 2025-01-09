type WordOccurences = [string, number][];
interface JobExtractResponse {
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
type reqType = "required" | "optional";
interface JobInfo {
    company: string;
    positionName: string;
    aboutRole: string[];
    aboutYou: string[];
    qualifications: [reqType, string][];
    keywords: WordOccurences;
    languages: string[];
    technologies: string[];
    positionType: string;
    dateRange: string;
    salary: string;
    deadline: string;
    howToApply: string;
    coverLetter: string;
}
interface CoverLetterResponse {
    intro: string;
    transition: string;
    body_paragraphs: string[];
    why_work_here: string;
    closing_remarks: string;
}
interface Experience {
    date: {
        start: string;
        end: string;
    };
    title: string;
    side_title: string | Link;
    points: string[];
    tech: string[];
}
interface Link {
    icon: string;
    url: string;
    text?: string;
}
interface CV {
    personalTitle: string;
    summary: string;
    languages: string[];
    technologies: string[];
    links: Link[];
    experiences: {
        [category: string]: Experience[];
    };
}
interface TailorCVInfo {
    company: string;
    positionName: string;
    aboutRole: string[];
    aboutYou: string[];
    qualifications: [reqType, string][];
    keywords: WordOccurences;
    languages: string[];
    technologies: string[];
}
interface GenCLInfo extends TailorCVInfo {
}

export type { CV, CoverLetterResponse, Experience, GenCLInfo, JobExtractResponse, JobInfo, Link, TailorCVInfo, WordOccurences };

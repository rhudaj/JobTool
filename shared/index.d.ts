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
    positionType: string;
    aboutRole: string[];
    aboutYou: string[];
    qualifications: [reqType, string][];
    dateRange: string;
    salary: string;
    deadline: string;
    howToApply: string;
    coverLetter: string;
    keywords: WordOccurences;
    languages: string[];
    technologies: string[];
}
interface CoverLetterResponse {
    intro: string;
    body_paragraphs: string[];
    closing_remarks: string;
}
interface JobExperience {
    date_range: string;
    title: string;
    company: string;
    bulletPoints: string[];
    tech: string[];
}
interface Project {
    date_range: string;
    title: string;
    url: string;
    description: string;
    tech: string[];
}
interface Link {
    icon: string;
    text: string;
    url: string;
}
interface CV {
    personalTitle: string;
    summary: string;
    languages: string[];
    technologies: string[];
    courses: string[];
    links: Link[];
    experiences: JobExperience[];
    projects: Project[];
}

export type { CV, CoverLetterResponse, JobExperience, JobExtractResponse, JobInfo, Project, WordOccurences };

interface JobDetails {
    id: number,
    descriptionHTML: string,
    summaryHTML: string
};

interface JobOverview {
	id: number,
    title: string,
    company: string,
    location: string,
    date: string,
    agoTime: string,
    link: string
};

interface JobInfo {
    id: number,
    title: string,
    company: string,
    location: string,
    date: string,
    agoTime: string,
    link: string,
    descriptionHTML: string,
    summaryHTML: string
};

export { JobDetails, JobOverview, JobInfo }
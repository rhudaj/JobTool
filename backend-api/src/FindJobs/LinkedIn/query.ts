const dateSincePosted = {
    "past month": "r2592000",
    "past week": "r604800",
    "24hr": "r86400",
} as const;
type DateSincePosted = keyof typeof dateSincePosted;

const experienceRange = {
    internship: "1",
    "entry level": "2",
    associate: "3",
    senior: "4",
    director: "5",
    executive: "6",
} as const;
type  ExperienceLevel = keyof typeof experienceRange;

const jobTypeRange = {
    "full time": "F",
    "full-time": "F",
    "part time": "P",
    "part-time": "P",
    contract: "C",
    temporary: "T",
    volunteer: "V",
    internship: "I",
};
type JobType = keyof typeof jobTypeRange;

const remoteFilterRange = {
    "on-site": "1",
    "on site": "1",
    remote: "2",
    hybrid: "3",
};
type RemoteFilter = keyof typeof remoteFilterRange;

const salaryRange = {
    40000: "1",
    60000: "2",
    80000: "3",
    100000: "4",
    120000: "5",
};
type SalaryFilter = keyof typeof salaryRange;


const sortMethods = {
    recent: "DD",
    relevant: "R"
};
type SortMethod = keyof typeof sortMethods;

export interface JobQuery {
    keyword?: string,
    location?: string,
    dateSincePosted?: DateSincePosted,
    jobType?: JobType,
    remoteFilter?: RemoteFilter,
    salary?: SalaryFilter,
    experienceLevel?: ExperienceLevel,
    sortMethod?: SortMethod
};

export function getUrl(jq: JobQuery, start: number) {

    //api handles strings with spaces by replacing the values with %20
    const handleSpaces = (str: string) => str.trim().replace(" ", "+");

    let query = `https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search?`;
    if (jq.keyword)         query += `keywords=${handleSpaces(jq.keyword)}`;
    if (jq.location)        query += `&location=${handleSpaces(jq.location)}`;
    if (jq.dateSincePosted) query += `&f_TPR=${dateSincePosted[jq.dateSincePosted]}`;
    if (jq.salary)          query += `&f_SB2=${salaryRange[jq.salary]}`;
    if (jq.experienceLevel) query += `&f_E=${experienceRange[jq.experienceLevel]}`;
    if (jq.remoteFilter)    query += `&f_WT=${remoteFilterRange[jq.remoteFilter]}`;
    if (jq.jobType)         query += `&f_JT=${jobTypeRange[jq.jobType]}`;
                            query += `&start=${start}`;
    if(jq.sortMethod)       query += `&sortBy=${sortMethods[jq.sortMethod]}`
    return encodeURI(query);
};

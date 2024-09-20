// source: https://www.youtube.com/watch?v=eawYpMYH11Y
import { getUrl, JobQuery } from "./query.js";
import { Append2Csv } from "../../util/csv.js";
import * as cheerio from "cheerio";
import { JobDetails, JobInfo, JobOverview } from "./types.js";

/*
	2 ENDPOINTS
*/

	async function getJobOverviews(
		jobQuery: JobQuery = {},
		jobLimit?: number,
		start?: number
	): Promise<JobOverview[]> {

		const headers = {
			accept: "*/*",
			"accept-language": "en-US,en;q=0.9",
			"cache-control": "max-age=0",
			priority: "u=0, i",
			"sec-ch-ua": '"Not/A)Brand";v="8", "Chromium";v="126", "Google Chrome";v="126"',
			"sec-ch-ua-mobile": "?0",
			"sec-ch-ua-platform": '"macOS"',
			"sec-fetch-dest": "document",
			"sec-fetch-mode": "navigate",
			"sec-fetch-site": "none",
			"sec-fetch-user": "?1",
			"upgrade-insecure-requests": "1",
		};

		if( ! start ) start = 0;

		const jobs_data: JobOverview[] = [];

		while (true) {

			const url = getUrl(jobQuery, start);
			console.log(`url: ${url}`);

			const response = await fetch(url, {
				method: "GET",
				headers: headers,
				referrerPolicy: "strict-origin-when-cross-origin",
			});

			const htmlTXT: string = await response.text();
			const $ = cheerio.load(htmlTXT);

			//if result count ends up being 0 we will stop getting more jobs
			const jobs = $(".job-search-card");
			if (jobs.length === 0) break;
			console.log("I got ", jobs.length, " jobs");

			jobs.each((i, element) => {
				const job = $(element);
				jobs_data.push({
					id: Number($(job).attr("data-entity-urn")?.split(":")?.[3]),
					title: $(job).find(".base-search-card__title")?.text()?.trim(),
					company: job.find(".base-search-card__subtitle").text().trim(),
					location: job.find(".job-search-card__location").text().trim(),
					date: job.find("time").attr("datetime"),
					agoTime: job.find(".job-search-card__listdate").text().trim(),
					link: job.find(".base-card__full-link").attr("href"),
				} as JobOverview);
			});

			if (jobLimit && jobs_data.length >= jobLimit) break;

			//increment by how many jobs are fetched at a time
			start += jobs.length;
		};

		return jobs_data as JobOverview[];
	};

	async function getJobDetails(id: number): Promise<JobDetails> {

		const url = `https://www.linkedin.com/jobs-guest/jobs/api/jobPosting/${id}`;

		const headers = {
			"accept": "*/*",
			"accept-language": "en-US,en;q=0.9",
			"cache-control": "max-age=0",
			"priority": "u=0, i",
			"sec-ch-ua": "\"Not/A)Brand\";v=\"8\", \"Chromium\";v=\"126\", \"Google Chrome\";v=\"126\"",
			"sec-ch-ua-mobile": "?0",
			"sec-ch-ua-platform": "\"macOS\"",
			"sec-fetch-dest": "document",
			"sec-fetch-mode": "navigate",
			"sec-fetch-site": "none",
			"sec-fetch-user": "?1",
			"upgrade-insecure-requests": "1",
			"cookie": "bcookie=\"v=2&6e1d7751-0e49-41d4-8edb-e00cc12f9886\"; bscookie=\"v=1&202407140009407b2da631-cca4-46ab-8d43-10e8ed71629cAQEhB-f1pFDeIo7sg7ogiAzAMOSwBxLN\"; JSESSIONID=ajax:4611494073649155264; lang=v=2&lang=en-us; lidc=\"b=VGST07:s=V:r=V:a=V:p=V:g=3006:u=1:x=1:i=1720915782:t=1721002182:v=2:sig=AQFeNMutv6Fm8PbUmce6I3lIKJ6OVwk7\"; AMCVS_14215E3D5995C57C0A495C55%40AdobeOrg=1; AMCV_14215E3D5995C57C0A495C55%40AdobeOrg=-637568504%7CMCIDTS%7C19919%7CMCMID%7C72509022507027469591260102996782796541%7CMCAAMLH-1721520582%7C7%7CMCAAMB-1721520582%7C6G1ynYcLPuiQxYZrsz_pkqfLG9yMXBpb2zX5dvJdYQJzPXImdj0y%7CMCOPTOUT-1720922982s%7CNONE%7CvVersion%7C5.1.1; aam_uuid=72370889682220007721275617946115652918; _gcl_au=1.1.1284062264.1720915860; li_rm=AQHsbHwDikL22wAAAZCun7_18XC4rmZQsSQjSS0GdTsDOcW33hlN-GcR0klf91Wc4Tp9h9s667q0aTSGRcMOkJZJ4_C-We4EBsC0LSRkv-q7Q7VY8gWm8M99; _uetsid=8d01bb40417511ef9c3765d602d9885e; _uetvid=8d01ddc0417511efb67edb3359a9ef19"
		};

		const response = await fetch(url, {
			method: "GET",
			headers: headers,
			referrerPolicy: "strict-origin-when-cross-origin",
		});

		const htmlTXT: string = await response.text();
		const $ = cheerio.load(htmlTXT);

		return {
			id: id,
			descriptionHTML: $(".show-more-less-html__markup").html(),
			summaryHTML: $(".description__job-criteria-list").html()
		} as JobDetails;
	};

/*
	CSV HELPERS
*/

	export function queries2csv(query: JobQuery, numJobs: number) {
		const PATH = 'queries.csv';
		const rowObj = {
			query: query,
			numJobs: numJobs
		};
		Append2Csv(PATH, [rowObj]);
	};

	export function jobs2csv(items: JobInfo[]) {
		if (items.length === 0) return;
		const PATH = 'data.csv';
		Append2Csv(PATH, items);
	};

/*
    MAIN FUNCTION
*/

	/**
	 *
	 * @param query
	 * @example {
	 * 	keyword: 'software',
	 * 	location: 'Hawaii, United States',
	 * 	jobType: 'internship',
	 * 	sortMethod: 'recent'
	 * }
	 */
	export async function getJobs(query: JobQuery, out2csv: boolean = true) {
		// get data
		const jobOverviews = await getJobOverviews(query, 100);
		const job_details = await Promise.all(
			jobOverviews.map(async JO => {
				const details: JobDetails = await getJobDetails(JO.id);
				return {
					...JO,
					descriptionHTML: details.descriptionHTML,
					summaryHTML: details.summaryHTML
				};
			})
		);
		// output
		if(out2csv) {
			jobs2csv(job_details);
			queries2csv(query, jobOverviews.length);
		}
	};
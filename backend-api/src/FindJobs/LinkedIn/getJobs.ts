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

	const JOB_HTML_CLASS = ".job-search-card";	// dependency

	if( ! start )
		start = 0;

	const jobs_data: JobOverview[] = [];

	while (true) {

		const url = getUrl(jobQuery, start);
		console.log(`getJobOverviews:\n\turl: ${url}`);


		// COPY FROM BROWSER NETWORK TAB (except for the url)
		const response = await fetch(url, {
			headers: {
				"accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
				"accept-language": "en-US,en;q=0.9",
				"cache-control": "max-age=0",
				"priority": "u=0, i",
				"sec-ch-ua": "\"Google Chrome\";v=\"131\", \"Chromium\";v=\"131\", \"Not_A Brand\";v=\"24\"",
				"sec-ch-ua-mobile": "?0",
				"sec-ch-ua-platform": "\"macOS\"",
				"sec-fetch-dest": "document",
				"sec-fetch-mode": "navigate",
				"sec-fetch-site": "none",
				"sec-fetch-user": "?1",
				"upgrade-insecure-requests": "1",
				"cookie": "bcookie=\"v=2&e4aa7d6c-d957-43fe-832c-61f03c7d1129\"; bscookie=\"v=1&20240613182256c73da82c-c719-4a1f-837d-db6a88f2ff0cAQGlY-pCFOoSi2k-CCh_9cz6RcMugDv3\"; li_rm=AQHnbxCZpH5yAgAAAZCDBlmcu82BbtoS6SsVP5sPRJWC5OGgj3e77p9yK7iozJD96C6TYNzpg1_prh-pgmKw1OZTOJJeobfTqPB1F1OoXcKJhSpUBdBXZu47; g_state={\"i_p\":1720192475852,\"i_l\":1}; liap=true; JSESSIONID=\"ajax:4975014417716145439\"; li_theme=light; li_theme_set=app; dfpfpt=cf8487fa18cb411780b78606724f8498; timezone=America/Toronto; lang=v=2&lang=en-us; sdsc=1%3A1SZM1shxDNbLt36wZwCgPgvN58iw%3D; li_at=AQEDATQCCjwE4si6AAABkK5z3kQAAAGT1b0GEVYAWmJ4QjLj--wwAZ-rzb2x5bQUIMzORPE1UQnmJwClLSF0w_FVvGbKT0mnhiMPpdah1G1uuUInPl3T1F0eTm6qNb0DJSvVjswuZWWbscpKHB_t00SI; li_mc=MTs0MjsxNzMzODUzODM1OzE7MDIxV882GMrw5OYzG7WsdtGNFFZTPprj1E3QfoyE6VggC9Q=; lidc=\"b=TGST00:s=T:r=T:a=T:p=T:g=3550:u=1:x=1:i=1733853874:t=1733940274:v=2:sig=AQGbwb2tubku_mf4atrsVbSNnWLXjfNK\""
			},
			referrerPolicy: "strict-origin-when-cross-origin",
			body: null,
			method: "GET"
		});

		const htmlTXT: string = await response.text();

		// Create a querying function
		const $: cheerio.CheerioAPI = cheerio.load(htmlTXT);

		// Jobs are in a list with a specific class
		const jobs = $(JOB_HTML_CLASS);

		if (jobs.length === 0) {
			console.log("getJobOverviews:\n\tNo jobs found!");
			break;
		}

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

	console.log(`getJobOverviews:\n\t Total jobs returned: ${jobs_data.length}`)

	return jobs_data as JobOverview[];
};

async function getJobDetails(id: number): Promise<JobDetails> {

	const DESCRIPTION_HTML_CLASS = ".show-more-less-html__markup";
	const SUMMARY_HTML_CLASS = ".description__job-criteria-list";

	const url = `https://www.linkedin.com/jobs-guest/jobs/api/jobPosting/${id}`;

	// COPY FROM BROWSER NETWORK TAB (except for the url)
	const response = await fetch(url, {
		"headers": {
		  "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
		  "accept-language": "en-US,en;q=0.9",
		  "cache-control": "max-age=0",
		  "priority": "u=0, i",
		  "sec-ch-ua": "\"Google Chrome\";v=\"131\", \"Chromium\";v=\"131\", \"Not_A Brand\";v=\"24\"",
		  "sec-ch-ua-mobile": "?0",
		  "sec-ch-ua-platform": "\"macOS\"",
		  "sec-fetch-dest": "document",
		  "sec-fetch-mode": "navigate",
		  "sec-fetch-site": "none",
		  "sec-fetch-user": "?1",
		  "upgrade-insecure-requests": "1",
		  "cookie": "bcookie=\"v=2&e4aa7d6c-d957-43fe-832c-61f03c7d1129\"; bscookie=\"v=1&20240613182256c73da82c-c719-4a1f-837d-db6a88f2ff0cAQGlY-pCFOoSi2k-CCh_9cz6RcMugDv3\"; li_rm=AQHnbxCZpH5yAgAAAZCDBlmcu82BbtoS6SsVP5sPRJWC5OGgj3e77p9yK7iozJD96C6TYNzpg1_prh-pgmKw1OZTOJJeobfTqPB1F1OoXcKJhSpUBdBXZu47; g_state={\"i_p\":1720192475852,\"i_l\":1}; liap=true; JSESSIONID=\"ajax:4975014417716145439\"; li_theme=light; li_theme_set=app; dfpfpt=cf8487fa18cb411780b78606724f8498; timezone=America/Toronto; lang=v=2&lang=en-us; sdsc=1%3A1SZM1shxDNbLt36wZwCgPgvN58iw%3D; li_at=AQEDATQCCjwE4si6AAABkK5z3kQAAAGT1b0GEVYAWmJ4QjLj--wwAZ-rzb2x5bQUIMzORPE1UQnmJwClLSF0w_FVvGbKT0mnhiMPpdah1G1uuUInPl3T1F0eTm6qNb0DJSvVjswuZWWbscpKHB_t00SI; li_mc=MTs0MjsxNzMzODU0NzEwOzE7MDIxYdZ8QfA1oZgzM+VkbC0oIq7shLPuwuG/fnJKv9ggNNM=; __cf_bm=oA_DREIZXVgaaRmQZ_L2Hw6CcfgPPRIA2gPf_A30Adk-1733854711-1.0.1.1-MVspKgEv_WcxWwMU6l50o.VcdxBUDJv9AVHrJU_Le6bszNagHgPuDF6x2Q79.nwjgSulcnf2OjCrIQFkfrfTQg; lidc=\"b=TB24:s=T:r=T:a=T:p=T:g=5434:u=416:x=1:i=1733855151:t=1733856988:v=2:sig=AQF_TZ-B3H3BLp78SUZ_e91lVluDiTc6\""
		},
		"referrerPolicy": "strict-origin-when-cross-origin",
		"body": null,
		"method": "GET"
	});

	const htmlTXT: string = await response.text();
	const $ = cheerio.load(htmlTXT);

	console.log(`getJobDetails:\n\tid: ${id}\n\turl: ${url}\n\t# characters: ${htmlTXT.length}`);

	return {
		id: id,
		descriptionHTML: $(DESCRIPTION_HTML_CLASS).html(),
		summaryHTML: $(SUMMARY_HTML_CLASS).html()
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
		if (items.length === 0) {
			console.log("jobs2csv:\n\tNoting to output!");
			return;
		}
		const PATH = 'data.csv';
		Append2Csv(PATH, items);
	};

/*
    MAIN FUNCTION
*/

/**
 * @param query JobQuery
 * @example {
 * 	keyword: 'software',
 * 	location: 'Hawaii, United States',
 * 	jobType: 'internship',
 * 	sortMethod: 'recent'
 * } */
export async function getJobs(
	query: JobQuery,
	limit: number = 200,
	out2csv: boolean = true
) {

	console.log("getJobs:\n\t started...")

	// get the job overviews
	const jobOverviews = await getJobOverviews(query, limit);

	// Append the description and summary to each job overview
	const job_details = await Promise.all(
		jobOverviews.map(async JO => {
			// Extract the details from the job overview
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

// CALL THE FUNCTION

getJobs({
	keyword: 'software',
	location: 'Canada',
	jobType: 'internship',
	sortMethod: 'recent'
});
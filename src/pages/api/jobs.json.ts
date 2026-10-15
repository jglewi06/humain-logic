import jobs from '../../data/jobs.json';
import { json, meta } from '../../lib/api';
import { SITE } from '../../lib/site';
export const GET = () => json({ note: jobs.note, data: jobs.jobs.map(j => ({ ...j, url: `${SITE.url}/tracker/jobs/${j.slug}` })), events: [], meta: meta({ count: jobs.jobs.length, updated: jobs.updated, methodology: `${SITE.url}/methodology` }) });

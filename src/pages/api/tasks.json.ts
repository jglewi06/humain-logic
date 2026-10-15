import tasks from '../../data/tasks.json';
import { json, meta } from '../../lib/api';
import { SITE } from '../../lib/site';
export const GET = () => json({ data: tasks.map(t => ({ ...t, url: `${SITE.url}/tasks/${t.slug}` })), meta: meta({ count: tasks.length }) });

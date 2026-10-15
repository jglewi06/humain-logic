import tools from '../../data/tools.json';
import { json, meta } from '../../lib/api';
import { SITE } from '../../lib/site';
export const GET = () => json({ data: tools.map(t => ({ ...t, url: `${SITE.url}/tools/${t.slug}` })), meta: meta({ count: tools.length }) });

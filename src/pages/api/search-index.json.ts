// Compact index for the client-side search (src/lib/search-core.mjs). Built at deploy time.
import tools from '../../data/tools.json';
import tasks from '../../data/tasks.json';
import keywords from '../../data/search-keywords.json';
import { json } from '../../lib/api';
import { buildIndex } from '../../lib/search-index.mjs';
export const GET = () => json(buildIndex(tools, tasks, keywords));

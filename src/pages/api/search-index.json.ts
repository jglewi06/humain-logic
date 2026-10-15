// Compact index for the client-side task search (Fuse.js). Built at deploy time.
import tools from '../../data/tools.json';
import tasks from '../../data/tasks.json';
import { json } from '../../lib/api';
export const GET = () => json({
  tasks: tasks.map(t => ({ s: t.slug, n: t.name, c: t.categories, k: t.tools })),
  tools: tools.map(t => ({ s: t.slug, n: t.name, d: t.summary, c: t.category, cl: t.category_label, p: t.pricing.band, pl: t.pricing.label, f: t.pricing.free_tier, sp: t.pricing.starting_paid_price, v: t.pricing.verified, t: t.tasks, w: t.website })),
});

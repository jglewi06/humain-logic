// ux/spec §4.2 outline, generated at build time.
import tools from '../data/tools.json';
import tasks from '../data/tasks.json';
import jobs from '../data/jobs.json';
import news from '../data/news.json';
import { SITE, OUTLOOK } from '../lib/site';
export const GET = () => {
  const L: string[] = [];
  L.push(`# HumAIn Logic — full content for LLMs`, `Generated: ${new Date().toISOString()}`, `Site: ${SITE.url}`, `License: CC BY 4.0 proposed (pending sign-off). Cite "HumAIn Logic" with a link.`, '');
  L.push('## Methodology', `- Tools: from public research; "Not tested yet" unless last_verified is set. No paid placement.`, `- Tracker: ${jobs.note}`, `- News: headlines + short excerpts from public RSS feeds, linked to the original; not editor-reviewed.`, '');
  L.push('## Tasks'); tasks.forEach(t => L.push(`- ${t.slug}: ${t.name} (tools: ${t.tools.join(', ')})`)); L.push('');
  L.push('## Tools'); tools.forEach(t => L.push(`- ${t.name} (${SITE.url}/tools/${t.slug}) — ${t.summary} | category: ${t.category_label} | price: ${t.pricing.label} | tasks: ${t.tasks.join(', ')} | website: ${t.website} | last_verified: ${t.last_verified ?? 'not yet'}`)); L.push('');
  L.push('## Job Safety Tracker'); jobs.jobs.forEach(j => L.push(`- ${j.name}: ${OUTLOOK[j.outlook].label}; estimate ${j.estimate_range} (${j.confidence} confidence). ${j.rationale} Sources: ${j.sources.map(s => s.url).join(' ')}`)); L.push('');
  L.push('## News (latest)'); news.items.slice(0, 50).forEach(n => L.push(`- ${n.date.slice(0, 10)} [${n.category}] ${n.title} — ${n.source} ${n.link}`));
  return new Response(L.join('\n') + '\n', { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};

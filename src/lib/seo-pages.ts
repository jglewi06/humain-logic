// Keyword landing pages (alternatives, comparisons, free tools). Built only from tools.json data.
import tools from '../data/tools.json';
type Tool = (typeof tools)[number];
const byCat = new Map<string, Tool[]>();
for (const t of tools) { if (!byCat.has(t.category)) byCat.set(t.category, []); byCat.get(t.category)!.push(t); }
/** "Major" tools = the first-listed (editor-ordered) tools in each group. */
const leaders = (cat: string, n: number) => (byCat.get(cat) ?? []).slice(0, n);
const altCount = (list: Tool[]) => list[0]?.category === 'productivity' ? 4 : list.length >= 8 ? 2 : list.length >= 4 ? 1 : 0;
export const ALT_TOOLS: Tool[] = [...byCat.values()].flatMap(l => l.slice(0, altCount(l)));
export const alternativesFor = (t: Tool) => (byCat.get(t.category) ?? []).filter(x => x.slug !== t.slug);
const vsCount = (list: Tool[]) => list[0]?.category === 'productivity' ? 5 : list.length >= 8 ? 3 : 0;
export const VS_PAIRS: [Tool, Tool][] = [...byCat.values()].flatMap(l => { const top = l.slice(0, vsCount(l)); const out: [Tool, Tool][] = []; top.forEach((a, i) => top.slice(i + 1).forEach(b => out.push([a, b]))); return out; });
export const vsSlug = (a: Tool, b: Tool) => `${a.slug}-vs-${b.slug}`;
export const pairsFor = (t: Tool) => VS_PAIRS.filter(([a, b]) => a.slug === t.slug || b.slug === t.slug);
export const hasAlternatives = (t: Tool) => ALT_TOOLS.some(x => x.slug === t.slug);
export const FREE_TOOLS = tools.filter(t => t.pricing.free_tier === true);
/** Related free guide per tool group. */
const GUIDE_BY_CAT: Record<string, string> = {
  productivity: 'getting-started-with-ai-chat-assistants', research: 'getting-started-with-ai-chat-assistants', writing: 'getting-started-with-ai-chat-assistants', education: 'getting-started-with-ai-chat-assistants', email: 'getting-started-with-ai-chat-assistants',
  'jobs-and-careers': 'ai-and-your-job', coding: 'ai-and-your-job',
  marketing: 'ai-for-small-business', 'customer-service': 'ai-for-small-business', seo: 'ai-for-small-business', finance: 'ai-for-small-business', sales: 'ai-for-small-business', 'website-builders': 'ai-for-small-business', 'small-business': 'ai-for-small-business', design: 'ai-for-small-business', data: 'ai-for-small-business',
  legal: 'staying-safe-with-ai', health: 'staying-safe-with-ai', relationships: 'staying-safe-with-ai', shopping: 'staying-safe-with-ai', image: 'staying-safe-with-ai', video: 'staying-safe-with-ai', audio: 'staying-safe-with-ai', voice: 'staying-safe-with-ai',
};
export const guideFor = (cat: string) => GUIDE_BY_CAT[cat] ?? 'what-is-ai';

/** "Best AI for X" topics: tools match by group or by the tasks they're listed for in tools.json. */
const tre = (re: RegExp, cats: string[] = []) => (t: Tool) => cats.includes(t.category) || t.tasks.some(s => re.test(s));
export const BEST_FOR = [
  { slug: 'coding', label: 'coding', h1: 'Best AI for coding', match: tre(/^$/, ['coding']), guide: 'ai-and-your-job' },
  { slug: 'writing', label: 'writing', h1: 'Best AI for writing', match: tre(/^$/, ['writing']), guide: 'getting-started-with-ai-chat-assistants' },
  { slug: 'image-generation', label: 'image generation', h1: 'Best AI image generator', match: tre(/^(generate-an-image|create-an-image|create-an-image-from-text|generate-images-in-real-time)$/), guide: 'staying-safe-with-ai' },
  { slug: 'resume', label: 'resumes', h1: 'Best AI resume builder', match: tre(/resume|(^|-)cv($|-)/), guide: 'ai-and-your-job' },
  { slug: 'interior-design', label: 'interior design', h1: 'Best AI for interior design', match: tre(/interior|room|3d-home|staging/, ['home-and-real-estate']), guide: 'what-is-ai' },
  { slug: 'research', label: 'research', h1: 'Best AI for research', match: tre(/^$/, ['research']), guide: 'getting-started-with-ai-chat-assistants' },
  { slug: 'video', label: 'video', h1: 'Best AI video generator', match: tre(/^$/, ['video']), guide: 'staying-safe-with-ai' },
  { slug: 'powerpoint', label: 'PowerPoint & slides', h1: 'Best AI for PowerPoint presentations', match: tre(/^make-a-presentation$|slides?($|-)|slide-deck|powerpoint/), guide: 'ai-for-small-business' },
].map(x => ({ ...x, tools: tools.filter(x.match) }));
export const BEST_FOR_LIVE = BEST_FOR.filter(x => x.tools.length >= 3);
/** Three-way comparisons; only built when every tool exists in tools.json. */
export const THREE_WAY = [['chatgpt', 'gemini', 'claude'], ['claude-code', 'github-copilot', 'cursor']]
  .map(s => ({ slugs: s, tools: s.map(x => tools.find(t => t.slug === x)), missing: s.filter(x => !tools.some(t => t.slug === x)) }));

/** Job tracker FAQ (FAQPage JSON-LD), built only from jobs.json fields. */
export const JOB_SEARCH_NAME: Record<string, string> = { lawyer: 'lawyers', 'accountant-auditor': 'accountants', 'registered-nurse': 'nurses' };
export const PRIORITY_JOBS = ['lawyer', 'accountant-auditor', 'registered-nurse'];
export const jobFaq = (j: any, OUTLOOK: any, HIRING: any) => {
  const who = JOB_SEARCH_NAME[j.slug] ?? `${j.name.toLowerCase()} jobs`;
  return [
    { q: `Will AI replace ${who}?`, a: `Our outlook for ${j.name.toLowerCase()}: ${OUTLOOK[j.outlook].label}. ${j.rationale}` },
    { q: `When could AI do most of a ${j.name.toLowerCase()}'s tasks?`, a: `Our editorial estimate is ${j.estimate_range} (${j.confidence} confidence). This is a range for when technology could do most of the job's tasks, not a prediction that the job will disappear.` },
    ...(j.employment_pressure_by_2030 ? [{ q: `Will there be fewer ${j.name.toLowerCase()} jobs by 2030?`, a: `${HIRING[j.employment_pressure_by_2030]?.label ?? ''}. ${j.employment_pressure_summary ?? ''}`.trim() }] : []),
    ...(j.help?.summary ? [{ q: `How can a ${j.name.toLowerCase()} prepare for AI?`, a: j.help.summary }] : []),
  ];
};
export const faqLd = (items: { q: string; a: string }[]) => ({ '@type': 'FAQPage', mainEntity: items.map(x => ({ '@type': 'Question', name: x.q, acceptedAnswer: { '@type': 'Answer', text: x.a } })) });

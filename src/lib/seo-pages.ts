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

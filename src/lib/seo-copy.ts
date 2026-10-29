// Approved SEO copy (src/data/seo-copy/*.md), looked up by its frontmatter slug.
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';
const files = import.meta.glob('../data/seo-copy/*.md', { query: '?raw', import: 'default', eager: true }) as Record<string, string>;
const md = (s: string) => String(unified().use(remarkParse).use(remarkGfm).use(remarkRehype).use(rehypeStringify).processSync(s));
const plain = (s: string) => s.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').replace(/\*\*?|_/g, '').replace(/\s+/g, ' ').trim();
export type Copy = { slug: string; title: string; description: string; h1: string; intro: string; body: string; faq: { q: string; a: string; html: string }[]; related: { label: string; href: string }[]; checked?: string };
const parse = (raw: string): Copy => {
  const m = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/)!;
  const fm: Record<string, string> = {};
  for (const l of m[1].split('\n')) { const k = l.match(/^(\w+):\s*(.*)$/); if (k) fm[k[1]] = k[2].replace(/^"(.*)"$/, '$1'); }
  const text = m[2].replace(/^# .*\n/m, '');
  const parts = text.split(/^## /m);
  const intro = parts.shift()!.trim();
  let body = '', faq: Copy['faq'] = [], related: Copy['related'] = [];
  for (const p of parts) {
    const head = p.split('\n')[0].trim(), rest = p.slice(p.indexOf('\n') + 1);
    if (/^FAQ/i.test(head)) {
      for (const x of rest.matchAll(/\*\*(.+?)\*\*\s*([\s\S]*?)(?=\n\s*\*\*|$)/g)) faq.push({ q: plain(x[1]), a: plain(x[2]), html: md(x[2].trim()) });
    } else if (/^Suggested internal links/i.test(head)) {
      for (const x of rest.matchAll(/\[([^\]]+)\]\(([^)]+)\)/g)) related.push({ label: x[1], href: x[2] });
    } else body += `## ${p}\n`;
  }
  return { slug: fm.slug, title: fm.seo_title, description: fm.meta_description, h1: fm.h1, intro: md(intro), body: md(body), faq, related, checked: fm.facts_checked };
};
export const COPY: Copy[] = Object.values(files).map(parse);
export const copyFor = (slug: string) => COPY.find(c => c.slug === slug);
export const LEARN = COPY.filter(c => c.slug.startsWith('/learn/'));
export const copyFaqLd = (c: Copy) => ({ '@type': 'FAQPage', mainEntity: c.faq.map(x => ({ '@type': 'Question', name: x.q, acceptedAnswer: { '@type': 'Answer', text: x.a } })) });

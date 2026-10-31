// Per-URL <lastmod> for the sitemap: content dates first, then git last-modified of the source file.
import { execSync } from 'node:child_process';
import { readFileSync, existsSync, readdirSync } from 'node:fs';
const git = (f) => { try { return execSync(`git log -1 --format=%cI -- "${f}"`, { encoding: 'utf8' }).trim() || null; } catch { return null; } };
const json = (f) => JSON.parse(readFileSync(new URL(`../${f}`, import.meta.url), 'utf8'));
const day = (d) => d ? new Date(d).toISOString() : null;
const news = json('src/data/news.json'), jobs = json('src/data/jobs.json'), tools = json('src/data/tools.json');
const toolDate = new Map(tools.map(t => [t.slug, t.pricing?.verified_on]));
const guideDate = new Map();
const gdir = new URL('../src/content/guides/', import.meta.url);
for (const f of readdirSync(gdir)) { const m = readFileSync(new URL(f, gdir), 'utf8').match(/^updated:\s*(\S+)/m); if (m) guideDate.set(f.replace(/\.md$/, ''), m[1]); }
const fallback = git('.') ?? new Date().toISOString();
const cache = new Map();
const gitPage = (p) => { if (!cache.has(p)) cache.set(p, existsSync(p) ? git(p) : null); return cache.get(p); };
export function lastmodFor(url) {
  const path = new URL(url).pathname.replace(/\/$/, '');
  const seg = path.split('/').filter(Boolean);
  if (!seg.length || seg[0] === 'news') return day(news.updated);
  if (seg[0] === 'guides' && seg[1] && guideDate.has(seg[1])) return day(guideDate.get(seg[1]));
  if (seg[0] === 'tools' && seg[1] && toolDate.get(seg[1])) return day(toolDate.get(seg[1]));
  if (seg[0] === 'tracker' || path === '/will-ai-take-my-job') return day(jobs.updated);
  const base = `src/pages/${seg.join('/')}`;
  const dir = `src/pages/${seg.slice(0, -1).join('/')}`;
  const cands = [`${base}.astro`, `${base}/index.astro`, ...(existsSync(dir) ? readdirSync(dir).filter(f => f.startsWith('[')).map(f => `${dir}/${f}`) : [])];
  for (const c of cands) { const d = gitPage(c); if (d) return day(d); }
  return day(fallback);
}

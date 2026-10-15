// RSS/Atom -> src/data/news.json. No secrets. Feed list: src/data/feeds.json (from research/news-sources.md).
// Trust rules (ux/spec.md §1.2): keep source + link + time; only headline + short excerpt (legal brief: no full text).
import Parser from 'rss-parser';
import fs from 'node:fs';

const FEEDS = JSON.parse(fs.readFileSync('src/data/feeds.json', 'utf8'));
const OUT = 'src/data/news.json';
const MAX_ITEMS = 80, MAX_AGE_DAYS = 21;
const AI_RE = /\b(ai|a\.i\.|artificial intelligence|machine learning|chatbot|llm|generative|neural|deep learning|gpt|gemini|copilot)\b/i;
const CATS = [
  ['jobs-work', /\b(jobs?|work(ers?|force|place)?|employ(ment|ees?|ers?)?|hiring|layoffs?|careers?|labou?r|wages?|skills?)\b/i],
  ['rules-safety', /\b(law|laws|regulat\w*|rules?|polic(y|ies)|safety|privacy|ban|court|lawsuit|copyright|government|congress|senate|eu ai act|deepfakes?|scams?)\b/i],
  ['tools-launches', /\b(launch(es|ed)?|releases?d?|rolls? out|new (app|feature|model|tool)|now available|update[sd]?|introduc(es|ing|ed))\b/i],
  ['business', /\b(business(es)?|compan(y|ies)|startups?|funding|revenue|enterprise|customers?|retail|bank(s|ing)?|small business)\b/i],
];
const GROUP_DEFAULT = { research: 'research', business: 'business', 'rules-safety': 'rules-safety', 'good-news': 'good-news' };
const ENT = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', hellip: '…', mdash: '—', ndash: '–', lsquo: '‘', rsquo: '’', ldquo: '“', rdquo: '”' };
const decode = s => s.replace(/&#(x?)([0-9a-f]+);/gi, (_, x, n) => String.fromCodePoint(parseInt(n, x ? 16 : 10))).replace(/&([a-z]+);/gi, (m, n) => ENT[n.toLowerCase()] ?? m);
const strip = s => decode((s || '').replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();
const clip = (s, n) => s.length > n ? s.slice(0, n).replace(/\s+\S*$/, '') + '…' : s;
const slug = s => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 70);

const parser = new Parser({ timeout: 15000, headers: { 'User-Agent': 'HumAInLogicBot/1.0 (+https://humainlogic.com/about)' } });
const cutoff = Date.now() - MAX_AGE_DAYS * 864e5;
const items = []; const failed = [];
for (const f of FEEDS) {
  try {
    const feed = await parser.parseURL(f.url);
    let n = 0;
    for (const i of feed.items) {
      if (n >= (f.max || 8)) break;
      const date = new Date(i.isoDate || i.pubDate || 0);
      if (isNaN(date) || date.getTime() < cutoff) continue;
      const title = strip(i.title); const summary = clip(strip(i.contentSnippet || i.summary || i.content), 240);
      if (!title || !i.link) continue;
      if (!f.ai_only && !AI_RE.test(title + ' ' + summary)) continue;
      const text = title + ' ' + summary;
      const category = f.group === 'good-news' ? 'good-news' : (CATS.find(([, re]) => re.test(text))?.[0] ?? GROUP_DEFAULT[f.group] ?? 'research');
      items.push({ id: slug(title), title, link: i.link, source: f.name, date: date.toISOString(), summary, category,
        ai_summary: false, editor_reviewed: false });
      n++;
    }
  } catch (e) { failed.push(f.name); console.warn('feed failed:', f.name, '-', e.message); }
}
if (!items.length) { console.log('No items fetched; keeping existing news.json'); process.exit(0); }
// De-duplicate by link and near-identical titles; cluster count = "Reported by N sources"
const byKey = new Map();
for (const it of items.sort((a, b) => b.date.localeCompare(a.date))) {
  const key = it.id.split('-').slice(0, 8).join('-');
  if (byKey.has(key)) { const k = byKey.get(key); if (!k.also.some(a => a.link === it.link) && k.link !== it.link) k.also.push({ source: it.source, link: it.link }); }
  else byKey.set(key, { ...it, also: [] });
}
const out = [...byKey.values()].slice(0, MAX_ITEMS);
fs.writeFileSync(OUT, JSON.stringify({ updated: new Date().toISOString(), failed_feeds: failed, items: out }, null, 1) + '\n');
console.log(`wrote ${out.length} items from ${FEEDS.length - failed.length}/${FEEDS.length} feeds`);
// rss-parser can leave sockets open (a feed that hangs mid-stream); don't let that stall CI.
process.exit(0);

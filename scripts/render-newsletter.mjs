// render-newsletter.mjs: turn a Sunday Brief Markdown file (site/scripts/build-newsletter.mjs output) into email HTML.
//   node scripts/render-newsletter.mjs newsletter/2026-10-15.md /tmp/sample.html [--keep-merge-tags]
// Exports parseBrief(md, isoDate) -> fields, and fillTemplate(tpl, fields) -> html, so build-newsletter.mjs can import them.
// Placeholders are [[field]]. Buttondown merge tags ({{ ... }}) are left alone; values are escaped so content cannot inject them.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));

export const OUTLOOK = {
  'Mostly steady':   { key: 'steady', icon: '✓\uFE0E', fg: '#2D6A4F', bg: '#E3F1E8' },
  'Changing':        { key: 'watch',  icon: '◐\uFE0E', fg: '#8A5A0B', bg: '#FBF0D9' },
  'Big shift ahead': { key: 'shift',  icon: '↻\uFE0E', fg: '#A23B2A', bg: '#F9E3DE' },
};

// HTML-escape, then neutralise Buttondown/Jinja delimiters so feed text can never become a template tag.
export const esc = (s = '') => String(s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
  .replace(/\{/g, '&#123;').replace(/\}/g, '&#125;');

// Minimal inline Markdown → HTML (bold, italic, links) for text fields. Escapes first.
export const inline = (s = '') => esc(s)
  .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, t, u) => `<a href="${u}" style="color:inherit;text-decoration:underline;">${t}</a>`)
  .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
  .replace(/(^|[\s(])_([^_]+)_(?=$|[\s).,;:!?])/g, '$1<em>$2</em>');

const must = (m, what) => { if (!m) throw new Error(`Sunday Brief: could not find ${what}`); return m; };

export function parseBrief(md, isoDate) {
  const [head, foot = ''] = md.split(/\n---\n/);
  const sec = {};
  const parts = head.split(/^## /m);
  const intro = parts.shift().trim().split(/\n\s*\n/);
  for (const p of parts) { const nl = p.indexOf('\n'); sec[p.slice(0, nl).trim()] = p.slice(nl + 1).trim(); }
  const newsKey = must(Object.keys(sec).find(k => /^Three AI changes/i.test(k)), 'news section');
  const toolKey = must(Object.keys(sec).find(k => /^One tool to try:/i.test(k)), 'tool section');
  const jobKey  = must(Object.keys(sec).find(k => /^Job tracker:/i.test(k)), 'job section');

  const f = {
    greeting: inline(intro[0]),
    intro: inline(intro[1] ?? ''),
    news_heading: inline(newsKey),
  };

  // News items: **[title](url)**\nsource — summary\n\n> **Why it matters to you:** text
  const itemRe = /\*\*\[([^\]]+)\]\(([^)]+)\)\*\*\n([^\n]+)\n\n> \*\*Why it matters to you:\*\*\s*([^\n]+)/g;
  const items = [...sec[newsKey].matchAll(itemRe)];
  if (items.length !== 3) throw new Error(`Sunday Brief: expected 3 news items, found ${items.length}`);
  items.forEach(([, title, url, meta, why], i) => {
    const n = i + 1;
    const [source, ...rest] = meta.split(' — ');           // builder joins "source — summary" with an em dash
    f[`news_${n}_title`] = esc(title);
    f[`news_${n}_url`] = esc(url);
    f[`news_${n}_source`] = esc(source.trim());
    f[`news_${n}_publisher`] = esc(source.replace(/\s+[–—-]\s+.*$/, '').trim()); // "The Verge – AI" -> "The Verge"
    f[`news_${n}_summary`] = inline(rest.join(' — ').trim());
    f[`news_${n}_why`] = inline(why.trim());
  });
  f.news_more_url = esc(must(sec[newsKey].match(/\[More calm AI news →\]\(([^)]+)\)/), 'more-news link')[1]);

  // Tool: "Summary. (Pricing label.)\n\n[See what X does with your data →](url)"
  const tool = sec[toolKey];
  const tm = must(tool.match(/^([\s\S]*?)\s*\(([^()]+?)\.?\)\s*\n\n\[([^\]]+?)\s*→\]\(([^)]+)\)/), 'tool body');
  Object.assign(f, {
    tool_name: esc(toolKey.replace(/^One tool to try:\s*/i, '')),
    tool_summary: inline(tm[1]), tool_pricing: esc(tm[2]), tool_cta_label: esc(tm[3]), tool_url: esc(tm[4]),
  });

  // Job: "Our outlook: **Label**. Rationale\n\n[Check your own job →](url)"
  const jm = must(sec[jobKey].match(/^Our outlook:\s*\*\*([^*]+)\*\*\.\s*([\s\S]*?)\n\n\[([^\]]+?)\s*→\]\(([^)]+)\)/), 'job body');
  const o = must(OUTLOOK[jm[1].trim()], `outlook "${jm[1]}"`);
  Object.assign(f, {
    job_name: esc(jobKey.replace(/^Job tracker:\s*/i, '')),
    job_outlook_label: esc(jm[1].trim()), job_outlook_key: o.key, job_outlook_icon: o.icon,
    job_outlook_fg: o.fg, job_outlook_bg: o.bg,
    job_rationale: inline(jm[2].trim()), job_cta_label: esc(jm[3]), job_url: esc(jm[4]),
  });

  // Footer
  const link = (label) => (foot.match(new RegExp(`\\[${label}\\]\\(([^)]+)\\)`)) || [])[1];
  f.site_url = esc(link('humainlogic\\.com') || 'https://humainlogic.com');
  f.privacy_url = esc(link('Privacy notice') || 'https://humainlogic.com/privacy');
  f.read_online_url = esc(link('Read online') || 'https://humainlogic.com/newsletter');
  f.contact_email = esc((foot.match(/mailto:([^)\s]+)/) || [, 'hello@humainlogic.com'])[1]);
  f.postal_address = esc(must(foot.match(/HumAIn Logic · (.+)\s*$/m), 'postal address')[1].trim());

  // Issue date + preheader (inbox preview, ~90–110 chars)
  const d = new Date(`${isoDate}T12:00:00Z`);
  f.issue_date = d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
  const strip = (s) => s.replace(/&[^;]+;/g, (e) => ({ '&amp;': '&', '&#123;': '{', '&#125;': '}' }[e] ?? e));
  f.preheader = esc(`Three AI changes, one tool to try (${strip(f.tool_name)}) and a job outlook (${strip(f.job_name)}). Five calm minutes.`);
  return f;
}

export function fillTemplate(tpl, fields) {
  const out = tpl.replace(/\[\[([a-z0-9_]+)\]\]/g, (m, k) => {
    if (!(k in fields)) throw new Error(`Missing field: ${k}`);
    return fields[k];
  });
  const left = out.match(/\[\[[a-z0-9_]+\]\]/g);
  if (left) throw new Error(`Unfilled placeholders: ${left.join(', ')}`);
  if (!out.includes('{{ unsubscribe_url }}')) throw new Error('Template lost {{ unsubscribe_url }}');
  return out;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const [mdPath, outPath = 'sample.html', flag] = process.argv.slice(2);
  const md = fs.readFileSync(mdPath, 'utf8');
  const iso = path.basename(mdPath, '.md');
  const fields = parseBrief(md, iso);
  let html = fillTemplate(fs.readFileSync(path.join(HERE, 'newsletter-template.html'), 'utf8'), fields);
  if (flag !== '--keep-merge-tags') {
    // Local preview only: point the merge tag at a harmless URL so the file opens cleanly in a browser.
    html = html.replaceAll('{{ unsubscribe_url }}', 'https://humainlogic.com/newsletter#unsubscribe-preview');
    // and load images from the local assets folder instead of the (not yet deployed) CDN path
    html = html.replaceAll('https://humainlogic.com/email/', 'assets/');
  }
  fs.writeFileSync(outPath, html);
  console.log(`wrote ${outPath} (${Buffer.byteLength(html)} bytes); preheader: ${fields.preheader}`);
}

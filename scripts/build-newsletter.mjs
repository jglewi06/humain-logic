// Builds "The Sunday Brief" from news, tools and tracker data:
//   newsletter/YYYY-MM-DD.md   plain-text / archive copy
//   newsletter/YYYY-MM-DD.html email HTML (design/newsletter template, see scripts/render-newsletter.mjs)
// YYYY-MM-DD is the SEND date: the coming Sunday (today if run on a Sunday, America/New_York).
// Editor input: newsletter/YYYY-MM-DD.why.json = ["sentence for story 1", "…2", "…3"]. Until it exists the
// issue carries "[Editor: …]" placeholders and the upload is refused.
// Uploads to Buttondown as a DRAFT only if BUTTONDOWN_API_KEY is set; sends only if NEWSLETTER_AUTOSEND=true.
// CAN-SPAM (legal/brief.md §3): sender, postal address, one-click unsubscribe ({{ unsubscribe_url }} is left for Buttondown).
import fs from 'node:fs';
import { fillTemplate, esc, inline, OUTLOOK } from './render-newsletter.mjs';
const SITE = 'https://humainlogic.com';
const EMAIL = 'hello@humainlogic.com';
const POSTAL = process.env.NEWSLETTER_POSTAL_ADDRESS || '[POSTAL ADDRESS REQUIRED — set NEWSLETTER_POSTAL_ADDRESS (PO box is fine)]';
const news = JSON.parse(fs.readFileSync('src/data/news.json', 'utf8'));
const tools = JSON.parse(fs.readFileSync('src/data/tools.json', 'utf8'));
const jobs = JSON.parse(fs.readFileSync('src/data/jobs.json', 'utf8'));

// ---- Send date: coming Sunday in New York ----
export function sendDate(now = new Date()) {
  const ny = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }));
  ny.setDate(ny.getDate() + ((7 - ny.getDay()) % 7));
  return `${ny.getFullYear()}-${String(ny.getMonth() + 1).padStart(2, '0')}-${String(ny.getDate()).padStart(2, '0')}`;
}
const d = process.env.NEWSLETTER_DATE || sendDate();
const sendMs = Date.parse(`${d}T12:00:00Z`);
const week = Math.floor(sendMs / 6048e5);

// ---- Feed summary tidy-up ----
const FIRST_PERSON = /(^|[^\w’'])(I|I'm|I’m|I've|I’ve|I'd|I’d|I'll|I’ll|me|my|mine|myself)(?=$|[^\w’'])/i;
export function tidySummary(raw, max = 220) {
  let s = String(raw ?? '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  s = s.replace(/\s*(\[(…|\.\.\.)\]|…|\.\.\.)\s*$/, '').replace(/\s*(Read more|Continue reading).*$/i, '').trim();
  if (!s) return null;
  if (FIRST_PERSON.test(s)) return null;               // first-person blog/feed voice reads oddly in our brief
  if (s.length <= max && /[.!?]["”’)]?$/.test(s)) return s;
  const cut = s.slice(0, max + 1);
  const sentences = [...cut.matchAll(/[.!?]["”’)]?(?=\s)/g)].map(m => m.index + m[0].length);
  const lastSentence = sentences.filter(i => i >= 60 && i <= max).pop();
  if (lastSentence) return s.slice(0, lastSentence);
  const word = cut.slice(0, max).replace(/\s+\S*$/, '').replace(/[\s,;:–—-]+$/, '');
  return `${word}…`;
}

const weekAgo = sendMs - 8 * 864e5;
const pool = (items) => items.map(n => ({ ...n, summary: tidySummary(n.summary) })).filter(n => n.summary);
let top = pool(news.items.filter(n => Date.parse(n.date) > weekAgo && n.category !== 'research')).slice(0, 3);
if (top.length < 3) top = [...top, ...pool(news.items).filter(n => !top.some(t => t.link === n.link))].slice(0, 3);
if (top.length < 3) throw new Error(`Only ${top.length} usable news items; need 3.`);
const tool = tools[week % tools.length];
const job = jobs.jobs[week % jobs.jobs.length];
const outlook = { steady: 'Mostly steady', watch: 'Changing', shift: 'Big shift ahead' }[job.outlook];
const utm = (u) => `${u}${u.includes('?') ? '&' : '?'}utm_source=newsletter&utm_medium=email&utm_campaign=sunday-brief-${d}`;
// Reader-facing source names: drop feed-format notes like "(Atom)" and "news search"
const sourceName = (s) => s.replace(/\s*\((Atom|RSS|feed)\)\s*/gi, ' ').replace(/\s+news search\b/i, '').trim();
const publisher = (s) => sourceName(s).replace(/\s+[–—-]\s+.*$/, '');

const whyFile = `newsletter/${d}.why.json`;
const whyIn = fs.existsSync(whyFile) ? JSON.parse(fs.readFileSync(whyFile, 'utf8')) : [];
const PH = '[Editor: one plain sentence before sending.]';
const why = [0, 1, 2].map(i => (typeof whyIn[i] === 'string' && whyIn[i].trim()) ? whyIn[i].trim() : PH);

// ---- Markdown (archive / plain text) ----
const md = `Hi there,

Here's your calm, five-minute look at AI this week.

## Three AI changes worth knowing about
${top.map((n, i) => `**[${n.title}](${n.link})**\n${sourceName(n.source)} — ${n.summary}\n\n> **Why it matters to you:** ${why[i] === PH ? `_${PH}_` : why[i]}`).join('\n\n')}

[More calm AI news →](${utm(`${SITE}/news`)})

## One tool to try: ${tool.name}
${tool.summary} (${tool.pricing.label}.)

[See price and features for ${tool.name} →](${utm(`${SITE}/tools/${tool.slug}`)})

## Job tracker: ${job.name}
Our outlook: **${outlook}**. ${job.rationale}

[Check your own job →](${utm(`${SITE}/tracker/jobs/${job.slug}`)})

---

You're getting this because you signed up at [humainlogic.com](${SITE}) and confirmed your email.
[Unsubscribe in one click]({{ unsubscribe_url }}) · [Privacy notice](${SITE}/privacy) · [Read online](${SITE}/newsletter)
Questions or corrections? Reply to this email or write to [${EMAIL}](mailto:${EMAIL}).

HumAIn Logic · ${POSTAL}
`;

// ---- HTML (design template) ----
const o = OUTLOOK[outlook];
const fields = {
  preheader: esc(`Three AI changes, one tool to try (${tool.name}) and a job outlook (${job.name}). Five calm minutes.`),
  issue_date: new Date(sendMs).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' }),
  greeting: 'Hi there,', intro: esc('Here’s your calm, five-minute look at AI this week.'),
  news_heading: 'Three AI changes worth knowing about', news_more_url: esc(utm(`${SITE}/news`)),
  ...Object.fromEntries(top.flatMap((n, i) => [
    [`news_${i + 1}_title`, esc(n.title)], [`news_${i + 1}_url`, esc(n.link)],
    [`news_${i + 1}_source`, esc(sourceName(n.source))], [`news_${i + 1}_publisher`, esc(publisher(n.source))],
    [`news_${i + 1}_summary`, esc(n.summary)], [`news_${i + 1}_why`, why[i] === PH ? esc(PH) : inline(why[i])],
  ])),
  tool_name: esc(tool.name), tool_summary: inline(tool.summary), tool_pricing: esc(tool.pricing.label),
  tool_cta_label: esc(`See price and features for ${tool.name}`), tool_url: esc(utm(`${SITE}/tools/${tool.slug}`)),
  job_name: esc(job.name), job_outlook_label: esc(outlook), job_outlook_key: o.key, job_outlook_icon: o.icon,
  job_outlook_fg: o.fg, job_outlook_bg: o.bg, job_rationale: inline(job.rationale),
  job_cta_label: 'Check your own job', job_url: esc(utm(`${SITE}/tracker/jobs/${job.slug}`)),
  site_url: SITE, privacy_url: `${SITE}/privacy`, read_online_url: `${SITE}/newsletter`,
  contact_email: EMAIL, postal_address: esc(POSTAL),
};
const html = fillTemplate(fs.readFileSync(new URL('./newsletter-template.html', import.meta.url), 'utf8'), fields);

fs.mkdirSync('newsletter', { recursive: true });
fs.writeFileSync(`newsletter/${d}.md`, md);
fs.writeFileSync(`newsletter/${d}.html`, html);
console.log(`built newsletter/${d}.md and newsletter/${d}.html (${Buffer.byteLength(html)} bytes) for Sunday ${d}`);

// ---- Upload guards ----
const key = process.env.BUTTONDOWN_API_KEY;
if (!key) { console.log('No BUTTONDOWN_API_KEY; skipping upload.'); process.exit(0); }
if (POSTAL.startsWith('[')) { console.error('NEWSLETTER_POSTAL_ADDRESS not set; refusing to upload (CAN-SPAM).'); process.exit(1); }
if (/\[Editor:/.test(html) || /\[Editor:/.test(md)) { console.error(`"[Editor:" placeholders remain. Write ${whyFile} (3 sentences) first; refusing to upload.`); process.exit(1); }
if (Buffer.byteLength(html) > 95_000) { console.error('HTML over ~95 KB (Gmail clips at ~102 KB); refusing to upload.'); process.exit(1); }

// ---- Upload (draft unless NEWSLETTER_AUTOSEND=true). Naked = our HTML is the whole email (paid Buttondown feature). ----
const status = process.env.NEWSLETTER_AUTOSEND === 'true' ? 'about_to_send' : 'draft';
const subject = `The Sunday Brief: ${top[0].title.slice(0, 60)}`;
const post = (extra) => fetch('https://api.buttondown.com/v1/emails', { method: 'POST',
  headers: { Authorization: `Token ${key}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({ subject, status, ...extra }) });
let r = await post({ body: `<!-- buttondown-editor-mode: fancy -->\n${html}`, template: 'naked' });
console.log('buttondown (naked template)', r.status, status);
if (!r.ok && r.status >= 400 && r.status < 500) {
  console.warn('Naked template rejected:', (await r.text()).slice(0, 300));
  console.warn('Falling back to the default Buttondown template with the Markdown body.');
  r = await post({ body: md });
  console.log('buttondown (default template)', r.status, status);
}
if (!r.ok) process.exit(1);

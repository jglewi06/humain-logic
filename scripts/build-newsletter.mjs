// Builds newsletter/YYYY-MM-DD.md ("The Sunday Brief") from news, tools and tracker data.
// Uploads to Buttondown as a DRAFT only if BUTTONDOWN_API_KEY is set; sends only if NEWSLETTER_AUTOSEND=true.
// Format follows design/ux-answers.md Q15 and legal/brief.md §3 (CAN-SPAM: sender, postal address, one-click unsubscribe).
import fs from 'node:fs';
const SITE = 'https://humainlogic.com';
const POSTAL = process.env.NEWSLETTER_POSTAL_ADDRESS || '[POSTAL ADDRESS REQUIRED — set NEWSLETTER_POSTAL_ADDRESS (PO box is fine)]';
const news = JSON.parse(fs.readFileSync('src/data/news.json', 'utf8'));
const tools = JSON.parse(fs.readFileSync('src/data/tools.json', 'utf8'));
const jobs = JSON.parse(fs.readFileSync('src/data/jobs.json', 'utf8'));
const d = new Date().toISOString().slice(0, 10);
const week = Math.floor(Date.now() / 6048e5);
const weekAgo = Date.now() - 7 * 864e5;
const recent = news.items.filter(n => new Date(n.date) > weekAgo && n.category !== 'research');
const top = (recent.length >= 3 ? recent : news.items).slice(0, 3);
const tool = tools[week % tools.length];
const job = jobs.jobs[week % jobs.jobs.length];
const outlook = { steady: 'Mostly steady', watch: 'Changing', shift: 'Big shift ahead' }[job.outlook];
const utm = (u) => `${u}${u.includes('?') ? '&' : '?'}utm_source=newsletter&utm_medium=email&utm_campaign=sunday-brief-${d}`;

const body = `Hi there,

Here's your calm, five-minute look at AI this week.

## Three AI changes worth knowing about
${top.map(n => `**[${n.title}](${n.link})**\n${n.source}${n.summary ? ` — ${n.summary}` : ''}\n\n> **Why it matters to you:** _[Editor: one plain sentence before sending.]_`).join('\n\n')}

[More calm AI news →](${utm(`${SITE}/news`)})

## One tool to try: ${tool.name}
${tool.summary} (${tool.pricing.label}.)

[See what ${tool.name} does with your data →](${utm(`${SITE}/tools/${tool.slug}`)})

## Job tracker: ${job.name}
Our outlook: **${outlook}**. ${job.rationale}

[Check your own job →](${utm(`${SITE}/tracker/jobs/${job.slug}`)})

---

You're getting this because you signed up at [humainlogic.com](${SITE}) and confirmed your email.
[Unsubscribe in one click]({{ unsubscribe_url }}) · [Privacy notice](${SITE}/privacy) · [Read online](${SITE}/newsletter)

HumAIn Logic · ${POSTAL}
`;
fs.mkdirSync('newsletter', { recursive: true });
fs.writeFileSync(`newsletter/${d}.md`, body);
console.log(`built newsletter/${d}.md`);

const key = process.env.BUTTONDOWN_API_KEY;
if (!key) { console.log('No BUTTONDOWN_API_KEY; skipping upload.'); process.exit(0); }
if (POSTAL.startsWith('[')) { console.error('NEWSLETTER_POSTAL_ADDRESS not set; refusing to upload (CAN-SPAM).'); process.exit(1); }
const status = process.env.NEWSLETTER_AUTOSEND === 'true' ? 'about_to_send' : 'draft';
const r = await fetch('https://api.buttondown.com/v1/emails', { method: 'POST', headers: { Authorization: `Token ${key}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({ subject: `The Sunday Brief: ${top[0]?.title?.slice(0, 60) ?? 'your calm AI week'}`, body, status }) });
console.log('buttondown', r.status, status);
if (!r.ok) process.exit(1);

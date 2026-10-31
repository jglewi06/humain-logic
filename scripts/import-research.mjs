// Imports ../research/*.json into src/data/*.json (the site's canonical data).
// Re-run after research updates:  npm run import-research
// Safe to run offline. Never invents facts: unknown fields stay null and render as "Not checked yet".
import fs from 'node:fs';
import path from 'node:path';

const R = path.resolve('../research');
const D = path.resolve('src/data');
const slug = s => s.toLowerCase().replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const write = (f, v) => { fs.writeFileSync(path.join(D, f), JSON.stringify(v, null, 1) + '\n'); console.log('wrote', f, Array.isArray(v) ? v.length : ''); };

// ---- Categories (plain-language labels + brand tint per category) ----
const CATEGORY_LABELS = {
  'productivity': 'Everyday helpers', 'writing': 'Writing', 'image': 'Images and photos', 'video': 'Video',
  'marketing': 'Marketing', 'design': 'Design', 'coding': 'Coding', 'research': 'Research and answers',
  'audio': 'Audio and voice', 'customer service': 'Customer service', 'finance': 'Admin and finance', 'education': 'Learning',
  'legal': 'Legal help', 'jobs & careers': 'Jobs and careers', 'website builders': 'Website builders', 'email': 'Email',
  'seo': 'SEO and search visibility', 'sales': 'Sales', 'data': 'Data and spreadsheets', 'voice': 'Voice and speech',
  'health': 'Health and fitness', 'travel': 'Travel', 'shopping': 'Shopping', 'home & real estate': 'Home and real estate',
  'accessibility': 'Accessibility', 'small business': 'Small business', 'translation': 'Translation', 'relationships': 'Relationships',
};
const PRICE = { free: { band: 'free', label: 'Free' }, freemium: { band: 'free-plan', label: 'Free plan available' }, paid: { band: 'paid', label: 'Paid' } };

// ---- Verified content (research/content/, 2026-10-15) ----
const C = path.join(R, 'content');
const readC = f => fs.existsSync(path.join(C, f)) ? JSON.parse(fs.readFileSync(path.join(C, f), 'utf8')) : null;
const DETAILS = readC('tool-details.json') ?? {};
// Some tools' detail keys are cleaner than the generated slug (e.g. "Microsoft Clipchamp" -> clipchamp); use the key, matched by name.
const normName = n => String(n ?? '').replace(/[\u2018\u2019\u02BC]/g, "'").trim();
const DETAIL_SLUG_BY_NAME = Object.fromEntries(Object.entries(DETAILS).map(([k, v]) => [normName(v?.name), k]));
const JOBHELP = readC('job-help.json');
const mismatch = [];
// free_tier from tool-details wins over the older pricing_tier; null = unknown (never guessed)
function pricingFor(s, t) {
  const p = DETAILS[s]?.pricing;
  if (!p) { mismatch.push(`tool without details: ${s}`); return { ...(PRICE[t.pricing_tier] ?? { band: 'unknown', label: 'Not checked yet' }), free_tier: null, verified: false }; }
  const band = p.free_tier === true ? (t.pricing_tier === 'free' && !p.starting_paid_price ? 'free' : 'free-plan') : p.free_tier === false ? 'paid' : 'unknown';
  const label = { free: 'Free', 'free-plan': 'Free plan available', paid: 'Paid only', unknown: 'Free plan unclear' }[band];
  return { band, label, free_tier: p.free_tier, summary: p.summary, starting_paid_price: p.starting_paid_price, pricing_url: p.pricing_url,
    verified: p.verified, verified_on: p.verified_on, verification_note: p.verification_note, currency: p.currency ?? null };
}

// ---- Tools ----
if (fs.existsSync(path.join(R, 'tools.json'))) {
  const raw = JSON.parse(fs.readFileSync(path.join(R, 'tools.json'), 'utf8'));
  const seen = new Set();
  const tools = raw.map(t => {
    let s = DETAIL_SLUG_BY_NAME[normName(t.name)] ?? slug(t.name); while (seen.has(s)) s += '-2'; seen.add(s);
    const rawCat = t.category;
    return {
      slug: s, name: t.name, website: t.url, developer: t.developer ?? null,
      category: slug(rawCat), category_label: CATEGORY_LABELS[rawCat] ?? rawCat,
      disclaimer: DETAILS[s]?.disclaimer ?? null,
      companion: (t.tasks || []).some(x => /ai companion/i.test(x)),
      summary: t.description,
      tasks: (t.tasks || []).map(x => slug(x)),
      pricing: pricingFor(s, t),
      details: DETAILS[s] ? { what_it_does: DETAILS[s].what_it_does, who_its_for: DETAILS[s].who_its_for, pros: DETAILS[s].pros, cons: DETAILS[s].cons.filter(c => !/trademark/i.test(c)) /* owner: no trademark items for now */ } : null,
      // Fields the UX spec wants but research does not provide yet (left null on purpose):
      skill_level: DETAILS[s]?.skill_level ?? null, platforms: DETAILS[s]?.platforms ?? null, privacy: null, last_verified: null, affiliate: false,
    };
  });
  // Tasks taxonomy from the tools' task phrases
  const tasks = {};
  raw.forEach((t, i) => (t.tasks || []).forEach(name => {
    const s = slug(name);
    tasks[s] ??= { slug: s, name: name.charAt(0).toUpperCase() + name.slice(1), tools: [], categories: new Set() };
    tasks[s].tools.push(tools[i].slug); tasks[s].categories.add(tools[i].category);
  }));
  const taskList = Object.values(tasks).map(t => ({ ...t, categories: [...t.categories] })).sort((a, b) => b.tools.length - a.tools.length || a.name.localeCompare(b.name));
  for (const t of raw) if (!(t.category in CATEGORY_LABELS)) mismatch.push(`unlabelled category: ${t.category}`);
  const cats = Object.entries(CATEGORY_LABELS).map(([k, label]) => ({ slug: slug(k), label, count: tools.filter(t => t.category === slug(k)).length })).filter(c => c.count);
  for (const t of tools) if (['legal', 'health', 'jobs-and-careers', 'relationships'].includes(t.category) && !t.disclaimer) mismatch.push(`no disclaimer: ${t.slug}`);
  for (const k of Object.keys(DETAILS)) if (!tools.some(t => t.slug === k)) mismatch.push(`details without tool: ${k}`);
  write('tools.json', tools); write('tasks.json', taskList); write('categories.json', cats);
}

// ---- Jobs (per-profession outlook) ----
if (fs.existsSync(path.join(R, 'jobs.json'))) {
  const raw = JSON.parse(fs.readFileSync(path.join(R, 'jobs.json'), 'utf8'));
  // Map the editorial year range onto the brand's 3 calm outlook levels (design: never show % on the homepage)
  const outlook = start => start <= 2035 ? 'shift' : start <= 2045 ? 'watch' : 'steady';
  const jobs = raw.jobs.map(j => {
    const start = parseInt(j.automation_year_range, 10);
    const job = { slug: slug(j.profession), name: j.profession, outlook: outlook(start),
      estimate_range: j.automation_year_range, confidence: j.confidence, rationale: j.rationale, sources: j.sources,
      // Second, separate estimate: hiring pressure by ~2030 (not the automation timeline)
      employment_pressure_by_2030: j.employment_pressure_by_2030 ?? null, employment_pressure_summary: j.employment_pressure_summary ?? null, employment_pressure_sources: j.employment_pressure_sources ?? [] };
      if (j.employment_pressure_by_2030 && !['high', 'medium', 'low', 'growth'].includes(j.employment_pressure_by_2030)) mismatch.push(`unknown employment_pressure_by_2030 for ${j.profession}: ${j.employment_pressure_by_2030}`);
    return job;
  });
  for (const j of jobs) { j.help = JOBHELP?.jobs?.[j.slug] ? { summary: JOBHELP.jobs[j.slug].summary, actions: JOBHELP.jobs[j.slug].actions } : null; if (JOBHELP && !j.help) mismatch.push(`job without help: ${j.slug}`); }
  for (const k of Object.keys(JOBHELP?.jobs ?? {})) if (!jobs.some(j => j.slug === k)) mismatch.push(`help without job: ${k}`);
  write('jobs.json', { note: raw.note, updated: new Date().toISOString().slice(0, 10), help_note: JOBHELP?.note ?? null, help_updated: JOBHELP?.updated ?? null, general_resources: JOBHELP?.general_resources ?? [], employment_pressure_note: raw.employment_pressure_note ?? null, jobs });
}

// ---- Guides: copy Markdown into the site (the repo only contains site/) ----
const G = readC('guides.json');
const GUIDE_AUTHOR = 'Jordan Lewis M.S.';
if (G) {
  const dir = path.resolve('src/content/guides');
  // Guide photos are site-only edits (front-matter `hero:` + <figure class="... guide-photo"> blocks).
  // Capture them before the wipe and re-apply them if the research copy doesn't already carry them.
  const photos = {};
  if (fs.existsSync(dir)) for (const f of fs.readdirSync(dir).filter(f => f.endsWith('.md'))) {
    const old = fs.readFileSync(path.join(dir, f), 'utf8');
    const hero = old.match(/^---\n[\s\S]*?^(hero:\n(?:  .*\n)+)/m)?.[1];
    const figs = [...old.matchAll(/((?:^|\n\n)([^\n][\s\S]*?))\n\n(<figure class="[^"]*guide-photo[^"]*">[\s\S]*?<\/figure>)\n/g)]
      .map(m => ({ anchor: m[2].split('\n\n').pop(), html: m[3] }));
    photos[f] = { hero, figs };
  }
  const keepPhotos = (f, md) => {
    const p = photos[f]; if (!p) return md;
    if (p.hero && !/^hero:/m.test(md.match(/^---\n([\s\S]*?)\n---/)?.[1] ?? '')) md = md.replace(/^(---\n[\s\S]*?\n)---/, `$1${p.hero}---`);
    for (const { anchor, html } of p.figs) {
      if (md.includes(html.match(/src="([^"]+)"/)[1])) continue;
      const i = md.indexOf(anchor + '\n\n');
      if (i < 0) { mismatch.push(`guide photo anchor not found in ${f}; photo dropped`); continue; }
      const at = i + anchor.length + 2; md = md.slice(0, at) + html + '\n\n' + md.slice(at);
    }
    return md;
  };
  fs.rmSync(dir, { recursive: true, force: true }); fs.mkdirSync(dir, { recursive: true });
  for (const g of G.guides) {
    const src = path.join(C, g.file);
    if (!fs.existsSync(src)) { mismatch.push(`guide file missing: ${g.file}`); continue; }
    // Guides are authored by the founder (Person, /about#founder); never let an older research copy revert the byline.
    let md = fs.readFileSync(src, 'utf8');
    if (/^author:/m.test(md.match(/^---\n([\s\S]*?)\n---/)?.[1] ?? '')) md = md.replace(/^(---\n[\s\S]*?)^author:.*$/m, `$1author: ${GUIDE_AUTHOR}`);
    else md = md.replace(/^(---\n[\s\S]*?\n)---/, `$1author: ${GUIDE_AUTHOR}\n---`);
    const fm = md.match(/^---\n([\s\S]*?)\n---/)?.[1] ?? '';
    const fmSlug = fm.match(/^slug:\s*(.+)$/m)?.[1].trim();
    if (fmSlug !== g.slug) mismatch.push(`guide slug mismatch: guides.json ${g.slug} vs front matter ${fmSlug}`);
    // The page renders the title as its H1, so drop the body's duplicate leading H1
    fs.writeFileSync(path.join(dir, `${g.slug}.md`), keepPhotos(`${g.slug}.md`, md.replace(/^(---\n[\s\S]*?\n---\n\s*)# [^\n]*\n/, '$1')));
  }
  write('guides.json', G.guides.map(({ file, ...g }) => g));
}
console.log(mismatch.length ? 'MISMATCHES:\n- ' + mismatch.join('\n- ') : 'No slug mismatches.');

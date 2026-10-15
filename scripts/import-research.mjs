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
};
const PRICE = { free: { band: 'free', label: 'Free' }, freemium: { band: 'free-plan', label: 'Free plan available' }, paid: { band: 'paid', label: 'Paid' } };

// ---- Tools ----
if (fs.existsSync(path.join(R, 'tools.json'))) {
  const raw = JSON.parse(fs.readFileSync(path.join(R, 'tools.json'), 'utf8'));
  const seen = new Set();
  const tools = raw.map(t => {
    let s = slug(t.name); while (seen.has(s)) s += '-2'; seen.add(s);
    return {
      slug: s, name: t.name, website: t.url, developer: t.developer ?? null,
      category: slug(t.category), category_label: CATEGORY_LABELS[t.category] ?? t.category,
      summary: t.description,
      tasks: (t.tasks || []).map(x => slug(x)),
      pricing: PRICE[t.pricing_tier] ?? { band: 'unknown', label: 'Not checked yet' },
      // Fields the UX spec wants but research does not provide yet (left null on purpose):
      skill_level: null, platforms: null, privacy: null, last_verified: null, affiliate: false,
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
  const cats = Object.entries(CATEGORY_LABELS).map(([k, label]) => ({ slug: slug(k), label, count: tools.filter(t => t.category === slug(k)).length })).filter(c => c.count);
  write('tools.json', tools); write('tasks.json', taskList); write('categories.json', cats);
}

// ---- Jobs (per-profession outlook) ----
if (fs.existsSync(path.join(R, 'jobs.json'))) {
  const raw = JSON.parse(fs.readFileSync(path.join(R, 'jobs.json'), 'utf8'));
  // Map the editorial year range onto the brand's 3 calm outlook levels (design: never show % on the homepage)
  const outlook = start => start <= 2035 ? 'shift' : start <= 2045 ? 'watch' : 'steady';
  const jobs = raw.jobs.map(j => {
    const start = parseInt(j.automation_year_range, 10);
    return { slug: slug(j.profession), name: j.profession, outlook: outlook(start),
      estimate_range: j.automation_year_range, confidence: j.confidence, rationale: j.rationale, sources: j.sources };
  });
  write('jobs.json', { note: raw.note, updated: new Date().toISOString().slice(0, 10), jobs });
}

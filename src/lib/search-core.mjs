// Search relevance core, shared by /search (browser) and scripts/search-eval.mjs (Node).
// Static and in-browser: a small scored hybrid of exact keyword matching over every tool's text
// (name, keywords, tasks, category, summary, what it does, who it's for, pros), synonym expansion,
// light stemming and spelling correction, plus a word-coverage match against task names for the "We think you want to" banner.
// (Fuse.js is used only by the legacy baseline below.)
import Fuse from 'fuse.js';

export const STOP = new Set('a an the and or of for to in on at by with from my me i im we our you your it is be can could would should do does how what which who want need help please some any ai tool tools app apps thing things using use make get good best free online'.split(' '));
// "free" and "make/get" are stripped from scoring; free is handled by the price filter.

// research "studies" (papers) must not merge with "study" (school)
const KEEP = new Set(['studies', 'news', 'series', 'canvas', 'analytics', 'slides']);
// -ing/-ed forms whose base ends in "e" (writing -> write, not "writ")
const E_BASE = { writing: 'write', written: 'write', wrote: 'write', making: 'make', made: 'make', taking: 'take', coding: 'code', coded: 'code',
  sharing: 'share', saving: 'save', saved: 'save', creating: 'create', created: 'create', scheduling: 'schedule', scheduled: 'schedule',
  managing: 'manage', using: 'use', used: 'use', translating: 'translate', translated: 'translate', organizing: 'organize', practicing: 'practice',
  summarizing: 'summarize', summarized: 'summarize', automating: 'automate', automated: 'automate', generating: 'generate', generated: 'generate',
  improving: 'improve', removing: 'remove', designing: 'design', writer: 'write', writers: 'write' };
export function stem(w) {
  if (E_BASE[w]) return E_BASE[w];
  if (w.length <= 3 || KEEP.has(w)) return w;
  if (w.endsWith('ies') && w.length > 4) return w.slice(0, -3) + 'y';
  if (w.endsWith('ing') && w.length > 5) { w = w.slice(0, -3); if (/(.)\1$/.test(w)) w = w.slice(0, -1); return w; }
  if (w.endsWith('ed') && w.length > 4) { w = w.slice(0, -2); if (/(.)\1$/.test(w)) w = w.slice(0, -1); return w; }
  if (/(ss|us|is)$/.test(w)) return w;
  if (/(ches|shes|xes|ses)$/.test(w)) return w.slice(0, -2);
  if (w.endsWith('s')) return w.slice(0, -1);
  return w;
}
export const tokens = (s) => String(s ?? '').toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
  .replace(/[’']/g, '').replace(/[^a-z0-9]+/g, ' ').trim().split(' ').filter(Boolean);
export const terms = (s) => tokens(s).filter(t => !STOP.has(t)).map(stem);

// Everyday words -> words that appear in tool data. Keys and values are run through terms()/stem.
export const SYNONYMS = {
  school: ['study', 'homework', 'students', 'flashcards', 'teachers', 'learning', 'tutor', 'exam'],
  homework: ['study', 'students', 'tutor', 'school', 'questions'],
  study: ['students', 'flashcards', 'exam', 'learning', 'notes'],
  exam: ['test', 'study', 'flashcards', 'students'],
  test: ['exam', 'study', 'quiz'],
  student: ['study', 'school', 'learning'],
  kid: ['children', 'students', 'learning', 'school', 'tutor'],
  child: ['kids', 'students', 'learning'],
  teacher: ['teachers', 'lesson', 'classroom', 'students', 'educators'],
  class: ['school', 'students', 'lesson'],
  learn: ['learning', 'study', 'tutor', 'course'],
  tutor: ['learning', 'homework', 'students'],
  math: ['tutor', 'homework'],
  job: ['resume', 'cover letter', 'interview', 'career', 'hiring'],
  career: ['resume', 'job', 'interview'],
  resume: ['cv', 'job', 'cover letter', 'career', 'jobs and careers'],
  cv: ['resume', 'jobs and careers'],
  interview: ['job', 'practice interview', 'mock interview', 'jobs and careers'],
  essay: ['writing', 'grammar', 'paraphrase', 'students'],
  write: ['draft', 'rewrite', 'grammar'],
  book: ['novel', 'story', 'fiction', 'author'],
  story: ['fiction', 'novel', 'stories'],
  email: ['inbox', 'emails', 'mail', 'gmail'],
  reply: ['answer', 'respond'],
  respond: ['answer', 'reply'],
  mail: ['email'],
  letter: ['email', 'writing'],
  logo: ['brand', 'branding'],
  brand: ['logo'],
  video: ['videos', 'clips', 'film'],
  movie: ['video', 'film'],
  youtube: ['video', 'clips', 'shorts'],
  tiktok: ['video', 'short video', 'social media'],
  music: ['song', 'songs', 'lyrics', 'audio'],
  song: ['music'],
  tax: ['taxes', 'bookkeeping', 'accounting', 'finance', 'small business'],
  money: ['budget', 'spending', 'finance', 'bills'],
  budget: ['money', 'spending', 'finance'],
  bill: ['bills', 'subscriptions', 'money'],
  saving: ['save money', 'budget'],
  accounting: ['bookkeeping', 'finance'],
  recipe: ['cooking', 'meal plan'],
  cook: ['recipe', 'meal plan'],
  meal: ['recipe', 'cooking'],
  language: ['translate', 'translation', 'spanish', 'french'],
  spanish: ['language', 'translate'],
  french: ['language', 'translate'],
  translate: ['translation', 'language'],
  presentation: ['slides', 'slideshow', 'deck', 'powerpoint', 'design'],
  slideshow: ['presentation', 'slides'],
  slide: ['presentation', 'slides', 'slide deck', 'design'],
  powerpoint: ['presentation', 'slides'],
  business: ['small business', 'marketing', 'customers', 'sales'],
  marketing: ['ads', 'social media', 'copywriting', 'seo'],
  ad: ['ads', 'advertising', 'marketing'],
  social: ['social media', 'posts', 'instagram'],
  instagram: ['social media', 'posts'],
  photo: ['photos', 'image', 'images', 'picture', 'photo editing'],
  picture: ['images', 'photo', 'art'],
  image: ['images', 'pictures', 'photo'],
  art: ['images', 'illustration', 'artists'],
  drawing: ['art', 'illustration', 'images'],
  coding: ['code', 'programming', 'developers'],
  code: ['coding', 'programming'],
  program: ['coding', 'code'],
  programming: ['code', 'coding'],
  website: ['web site', 'web app', 'landing page', 'site', 'website builder', 'build a website'],
  site: ['website'],
  app: ['web app', 'website'],
  meeting: ['meetings', 'calls', 'transcribe', 'notes', 'zoom'],
  zoom: ['meeting', 'calls'],
  call: ['meeting', 'calls'],
  note: ['notes', 'note taking', 'notebook'],
  calendar: ['schedule', 'scheduling', 'meetings'],
  schedule: ['calendar', 'planner'],
  podcast: ['audio', 'recording', 'voice'],
  voice: ['voices', 'speech', 'audio', 'voiceover'],
  audio: ['voice', 'sound', 'recording'],
  research: ['papers', 'sources', 'studies', 'evidence', 'scientific'],
  customer: ['customers', 'support', 'customer service'],
  support: ['customer service', 'help desk'],
  read: ['read aloud', 'text to speech', 'listen'],
  pdf: ['documents', 'read aloud'],
  grammar: ['spelling', 'proofread', 'writing'],
  spelling: ['grammar'],
  background: ['remove background', 'cutout'],
  edit: ['editing', 'editor'],
  translate_video: ['dubbing'],
  // 2026-10-15 directory expansion
  slides: ['presentation', 'slide deck', 'powerpoint', 'design'],
  lawyer: ['legal', 'legal advice', 'contract', 'attorney'],
  attorney: ['lawyer', 'legal'],
  legal: ['lawyer', 'contract', 'legal documents'],
  contract: ['legal', 'agreement', 'review a contract', 'draft a contract'],
  will: ['make a will', 'estate planning', 'trust', 'legal'],
  lease: ['rental agreement', 'write a lease', 'understand a lease', 'legal', 'landlord'],
  rent: ['lease', 'rental agreement'],
  nda: ['non disclosure', 'make an nda', 'legal', 'contract'],
  jobhunt: ['find a job', 'job search', 'track job applications', 'resume'],
  jobsearch: ['find a job', 'track job applications', 'resume'],
  sitebuilder: ['website builder', 'build a website', 'website'],
  websitebuilder: ['build a website', 'make a website'],
  taxes: ['tax', 'bookkeeping', 'accounting', 'finance', 'small business', 'invoice'],
  invoice: ['invoices', 'invoicing', 'bookkeeping', 'get paid', 'finance', 'small business'],
  bookkeeping: ['accounting', 'finance', 'invoice', 'small business'],
  blind: ['low vision', 'accessibility', 'describe', 'read aloud', 'visual assistance'],
  lowvision: ['blind', 'accessibility', 'visual assistance'],
  adhd: ['neurodivergent', 'accessibility', 'break a task into steps', 'focus'],
  symptom: ['symptoms', 'health', 'doctor'],
  workout: ['fitness', 'gym', 'exercise', 'workout plan'],
  trip: ['travel', 'itinerary', 'vacation', 'plan a trip'],
  vacation: ['trip', 'travel', 'itinerary'],
  itinerary: ['trip', 'travel'],
  seo: ['search engine', 'google ranking', 'keywords', 'rank'],
  rank: ['seo', 'google ranking'],
  room: ['interior design', 'redesign my room', 'home'],
  staging: ['virtual staging', 'real estate listing'],
  spreadsheet: ['excel', 'data', 'chart', 'analyze'],
  excel: ['spreadsheet', 'data'],
  chart: ['data', 'spreadsheet', 'visualize'],
  inbox: ['email', 'mail'],
  sale: ['sales', 'leads', 'prospects', 'crm'],
  lead: ['leads', 'sales', 'prospects'],
  deal: ['compare prices', 'cheaper price', 'shopping'],
  price: ['compare prices', 'cheaper'],
};

const editDist = (a, b, max) => {
  if (Math.abs(a.length - b.length) > max) return max + 1;
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i]; let best = i;
    for (let j = 1; j <= b.length; j++) {
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) cur[j] = Math.min(cur[j], prev[j - 2 + 0] !== undefined ? prev[j - 1] : cur[j]); // cheap transposition
      best = Math.min(best, cur[j]);
    }
    if (best > max) return max + 1;
    prev = cur;
  }
  return prev[b.length];
};

const FIELDS = [['n', 5], ['kw', 4], ['tn', 3], ['cl', 2.5], ['d', 2], ['x1', 1.5], ['x2', 1.2], ['x3', 0.6]];

/** Prepare an index once: { tools, tasks } from /api/search-index.json */
export function prepare(index) {
  const docs = index.tools.map(t => {
    const f = {};
    for (const [k] of FIELDS) {
      const raw = Array.isArray(t[k]) ? t[k].join(' | ') : (t[k] ?? '');
      const toks = terms(raw);
      // single terms + adjacent pairs, so "social media" or "flash cards" can match as a phrase
      f[k] = new Set([...toks, ...toks.slice(1).map((w, i) => `${toks[i]} ${w}`), ...toks.slice(1).map((w, i) => `${toks[i]}${w}`)]);
    }
    return { t, f };
  });
  const df = new Map();
  for (const d of docs) { const all = new Set(); for (const [k] of FIELDS) d.f[k].forEach(w => all.add(w)); all.forEach(w => df.set(w, (df.get(w) ?? 0) + 1)); }
  const syn = new Map();
  for (const [k, vs] of Object.entries(SYNONYMS)) syn.set(stem(k), vs.map(v => terms(v).join(' ')).filter(Boolean));
  const vocab = [...new Set([...df.keys(), ...syn.keys()])].filter(w => !w.includes(' ') && w.length >= 3);
  const taskTerms = new Map(index.tasks.map(t => [t.s, [...new Set(terms(t.n))]]));
  // real single words only (not the joined pair forms), used to decide whether "flash cards" -> "flashcard"
  const words = new Set(docs.flatMap(d => FIELDS.flatMap(([k]) => terms(Array.isArray(d.t[k]) ? d.t[k].join(' ') : d.t[k] ?? ''))));
  return { index, docs, df, syn, vocab, words, N: docs.length, taskTerms };
}

function correct(P, w) {
  if (P.df.has(w) || P.syn.has(w) || w.length < 4 || /\d/.test(w)) return w;
  const max = w.length >= 7 ? 2 : 1;
  let best = null, bd = max + 1, bf = 0;
  for (const v of P.vocab) {
    if (Math.abs(v.length - w.length) > max || v[0] !== w[0] && max === 1) continue;
    const d = editDist(w, v, max);
    const f = (P.df.get(v) ?? 0) + (P.syn.has(v) ? 5 : 0);
    if (d < bd || (d === bd && f > bf)) { best = v; bd = d; bf = f; }
  }
  return bd <= max ? best : w;
}

/** Turn a query into groups of [term, weight]; each group must be matched by one of its terms. */
export function expand(P, q) {
  let ws = terms(q).map(w => correct(P, w));
  // join split words ("flash cards" -> "flashcard") when the joined form is known
  const out = [];
  for (let i = 0; i < ws.length; i++) {
    const j = i + 1 < ws.length ? stem(ws[i] + ws[i + 1]) : null;
    if (j && (P.words.has(j) || P.syn.has(j))) { out.push(j); i++; } else out.push(ws[i]);
  }
  ws = out;
  return ws.map((w, i) => {
    const g = new Map([[w, 1]]);
    if (i + 1 < ws.length) g.set(`${w} ${ws[i + 1]}`, 1.3);
    for (const s of P.syn.get(w) ?? []) if (!g.has(s)) g.set(s, 0.6);
    return { w, g };
  });
}

function scoreDoc(P, doc, groups) {
  let total = 0, matched = 0; const hits = [];
  for (const { w, g } of groups) {
    let best = 0, why = '';
    for (const [term, tw] of g) {
      const idf = Math.log(1 + P.N / (P.df.get(term) ?? P.N));
      for (const [k, fw] of FIELDS) if (doc.f[k].has(term)) { const s = fw * tw * idf; if (s > best) { best = s; why = term; } break; }
    }
    if (best > 0) { matched++; hits.push(why); }
    total += best;
  }
  if (!groups.length) return { score: 0, hits };
  const coverage = matched / groups.length;
  return { score: total * (0.5 + coverage) * (coverage === 1 ? 1.25 : 1), hits };
}

const CAT_WORDS = {
  education: 'school study homework learning students kids teacher tutor exam flashcards language',
  productivity: 'questions advice email recipe trip resume job letter everyday notes meeting calendar',
  writing: 'write writing essay grammar book story novel rewrite paraphrase',
  image: 'photo picture image art drawing',
  video: 'video videos movie youtube tiktok film clip',
  audio: 'music song voice podcast audio speech',
  design: 'logo design presentation slides flyer poster website',
  marketing: 'marketing ads social seo business sales',
  coding: 'code coding programming app website developer',
  research: 'research papers science sources facts',
  'customer-service': 'customer support service chat',
  finance: 'money budget tax taxes bills bookkeeping accounting invoice invoices',
  legal: 'lawyer attorney legal contract will lease nda rental agreement trust estate',
  'jobs-and-careers': 'resume cv interview job hunt career cover letter linkedin application',
  'website-builders': 'website site builder landing page domain',
  email: 'email inbox mail gmail outlook',
  seo: 'seo rank google ranking keywords search engine',
  sales: 'sales leads prospects crm outreach',
  data: 'data spreadsheet excel chart statistics',
  voice: 'voice voiceover narration read aloud text to speech',
  health: 'health symptom doctor workout fitness calories stress anxiety',
  travel: 'travel trip vacation itinerary hotel holiday',
  shopping: 'shopping deal price compare buy',
  'home-and-real-estate': 'home house room interior real estate listing floor plan staging',
  accessibility: 'blind low vision adhd accessibility dyslexia neurodivergent',
  'small-business': 'small business invoice invoices taxes bookkeeping clients booking appointments quotes',
  translation: 'translate translation language dub subtitles',
};
const CATS = Object.fromEntries(Object.entries(CAT_WORDS).map(([c, s]) => [c, new Set(terms(s))]));

/**
 * Run a search. Returns { task, taskHits, ambiguous, results: [{ tool, score, why }], closest: bool, closestLabel }.
 * Filtering by price/category happens in the page so counts of hidden items can be shown.
 */
export function search(P, q, { chosenTask = null } = {}) {
  const clean = tokens(q).filter(t => !STOP.has(t)).join(' ');
  const groups = expand(P, q);
  // Task banner: Fuse over task names using the corrected words
  // Task guess for the banner: a task qualifies when the query's own words hit its name and (with synonyms)
  // cover all of it, or cover most of it with 2+ words. "photo" must not become "Animate a photo";
  // "make a logo for my business" may become "Make a logo"; "school" alone suggests no single task.
  const orig = new Set(groups.flatMap(g => [g.w, ...[...g.g.keys()].filter(k => k.startsWith(g.w + ' ') || k === g.w)]).flatMap(t => t.split(' ')));
  const qset = new Set(groups.flatMap(g => [...g.g.keys()]).flatMap(t => t.split(' ')));
  const cand = [];
  for (const t of P.index.tasks) {
    const tt = P.taskTerms.get(t.s); if (!tt.length) continue;
    const hitO = tt.filter(w => orig.has(w)).length; if (!hitO) continue;
    const cov = tt.filter(w => qset.has(w)).length / tt.length;
    const hitS = tt.filter(w => !orig.has(w) && qset.has(w)).length;
    if (cov === 1 || (cov >= 0.66 && hitO >= 2)) cand.push({ item: t, hitO, cov, rank: hitO + 0.5 * hitS, score: 1 - (hitO + cov) / 10 });
  }
  cand.sort((x, y) => y.rank - x.rank || y.hitO - x.hitO || y.cov - x.cov || P.taskTerms.get(x.item.s).length - P.taskTerms.get(y.item.s).length || y.item.k.length - x.item.k.length);
  const task = chosenTask ? P.index.tasks.find(t => t.s === chosenTask) : cand[0]?.item;
  const ambiguous = !chosenTask && cand.length > 1 && cand[1].rank === cand[0].rank && cand[1].cov === cand[0].cov && cand[0].hitO === 1 && groups.length === 1;
  const taskOptions = cand.slice(0, 4);
  const taskHits = taskOptions;
  const taskTools = new Set(task ? task.k : []);
  // Tools whose own category matches the query's plain words get a modest boost ("video" -> Video tools first)
  const qcats = new Set(Object.entries(CATS).filter(([, set]) => groups.some(g => set.has(g.w))).map(([c]) => c));
  const results = [];
  let top = 0;
  const scored = P.docs.map(doc => ({ doc, ...scoreDoc(P, doc, groups) }));
  for (const s of scored) top = Math.max(top, s.score);
  for (const s of scored) {
    let score = s.score * (qcats.has(s.doc.t.c) ? 1.3 : 1), why = s.hits.length ? `matches “${[...new Set(s.hits)].slice(0, 3).join('”, “')}”` : '';
    const tagged = taskTools.has(s.doc.t.s);
    // task bonus scales with how well the tool matched the words themselves, so a loosely tagged tool can't jump ahead
    if (tagged) { score += Math.max(top * 0.3, 2) * Math.min(1, s.score / (0.5 * top || 1)); why = `listed for “${task.n.toLowerCase()}”`; }
    if (score > 0) results.push({ tool: s.doc.t, score, base: s.score, tagged, why });
  }
  results.sort((a, b) => b.score - a.score || a.tool.n.localeCompare(b.tool.n));
  // Drop the long weak tail (single synonym hits far below the best match)
  const best = Math.max(0, ...results.map(r => r.base));
  let out = results.filter(r => r.tagged || r.base >= best * 0.12).slice(0, 24);
  let closest = false, closestLabel = '';
  if (!out.length && clean) {
    // Fallback: best category by word overlap (with spelling-corrected words + synonyms)
    const qs = new Set(groups.flatMap(g => [...g.g.keys()]).flatMap(t => t.split(' ')));
    let bc = null, bn = 0;
    for (const [c, set] of Object.entries(CATS)) { let n = 0; qs.forEach(w => set.has(w) && n++); if (n > bn) { bn = n; bc = c; } }
    if (bc) {
      closest = true;
      const tools = P.index.tools.filter(t => t.c === bc);
      closestLabel = tools[0]?.cl ?? bc;
      out = tools.map((t, i) => ({ tool: t, score: 0.01 - i * 1e-4, why: `closest match: ${closestLabel}` }));
    }
  }
  return { task, taskHits: taskOptions, ambiguous, results: out, closest, closestLabel };
}

// ---- Baseline (the pre-2026-10-15 logic), kept only for the evaluation script ----
const OLDSTOP = /\b(help me|i want to|i need to|how (do|can) i|can you|please|ai|tool|tools|app|for me|with ai|some|a|an|the|my|to|me)\b/gi;
export function legacySearch(index, q) {
  const clean = q.replace(OLDSTOP, ' ').replace(/\s+/g, ' ').trim();
  const taskFuse = new Fuse(index.tasks, { keys: ['n'], includeScore: true, threshold: 0.45, ignoreLocation: true });
  const toolFuse = new Fuse(index.tools, { keys: [{ name: 'n', weight: 2 }, { name: 'd', weight: 1 }, { name: 'cl', weight: 1 }, { name: 't', weight: 1.5 }], includeScore: true, threshold: 0.4, ignoreLocation: true });
  const taskHits = clean.length >= 2 ? taskFuse.search(clean.replace(/\bfree\b/i, '').trim() || clean).slice(0, 5) : [];
  const task = taskHits[0]?.item;
  const scored = new Map();
  if (task) for (const s of task.k) scored.set(s, { tool: index.tools.find(x => x.s === s), score: 0 });
  for (const h of taskHits.slice(1)) for (const s of h.item.k) if (!scored.has(s)) scored.set(s, { tool: index.tools.find(x => x.s === s), score: 0.2 + h.score });
  if (clean) for (const h of toolFuse.search(clean).slice(0, 12)) if (!scored.has(h.item.s)) scored.set(h.item.s, { tool: h.item, score: 0.4 + h.score });
  if (task) for (const t of index.tools) if (!scored.has(t.s) && task.c.includes(t.c)) scored.set(t.s, { tool: t, score: 0.9 });
  return { task, results: [...scored.values()].sort((a, b) => a.score - b.score) };
}

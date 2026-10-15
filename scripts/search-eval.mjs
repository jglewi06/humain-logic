// npm run search:eval — runs the real search logic (src/lib/search-core.mjs) over scripts/search-eval.json.
// Reports precision@3 and the "no results" rate for the current search and the old (baseline) search.
import fs from 'node:fs';
import { prepare, search, legacySearch } from '../src/lib/search-core.mjs';
import { buildIndex } from '../src/lib/search-index.mjs';
const rd = (p) => JSON.parse(fs.readFileSync(new URL(p, import.meta.url), 'utf8'));
const index = buildIndex(rd('../src/data/tools.json'), rd('../src/data/tasks.json'), rd('../src/data/search-keywords.json'));
const { queries } = rd('./search-eval.json');
const P = prepare(index);
const verbose = process.argv.includes('--verbose');
const run = (name, fn) => {
  let p3 = 0, empty = 0, closest = 0; const weak = [];
  for (const { q, expect } of queries) {
    const r = fn(q); const top = r.results.slice(0, 3).map(x => x.tool.s);
    const hit = top.filter(s => expect.includes(s)).length / Math.min(3, expect.length);
    p3 += hit; if (!r.results.length) empty++; if (r.closest) closest++;
    if (hit < 0.67) weak.push(`${q} → ${top.join(', ') || '(no results)'}`);
    if (verbose) console.log(`${hit.toFixed(2)}  ${q.padEnd(30)} ${r.closest ? '[closest] ' : ''}${top.join(', ') || '(no results)'}`);
  }
  console.log(`\n${name}: precision@3 ${(p3 / queries.length * 100).toFixed(1)}% · no results ${empty}/${queries.length} (${(empty / queries.length * 100).toFixed(1)}%)${closest ? ` · closest-match fallback ${closest}` : ''}`);
  console.log(`  weak (p@3 < 0.67): ${weak.length}${weak.length ? '\n   ' + weak.join('\n   ') : ''}`);
};
if (!process.argv.includes('--new-only')) run('Baseline (old search)', q => legacySearch(index, q));
run('Current search', q => search(P, q));

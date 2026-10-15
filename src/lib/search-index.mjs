// Builds the compact search index (shared by /api/search-index.json and the eval script).
export function buildIndex(tools, tasks, keywords) {
  const taskName = Object.fromEntries(tasks.map(t => [t.slug, t.name]));
  return {
    tasks: tasks.map(t => ({ s: t.slug, n: t.name, c: t.categories, k: t.tools })),
    tools: tools.map(t => ({
      s: t.slug, n: t.name, d: t.summary, c: t.category, cl: t.category_label,
      p: t.pricing.band, pl: t.pricing.label, f: t.pricing.free_tier, sp: t.pricing.starting_paid_price, v: t.pricing.verified,
      t: t.tasks, tn: t.tasks.map(s => taskName[s]).filter(Boolean),
      kw: keywords[t.slug] ?? [],
      x1: t.details?.what_it_does ?? '', x2: t.details?.who_its_for ?? '', x3: t.details?.pros ?? [],
    })),
  };
}

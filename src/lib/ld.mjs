// JSON-LD builders. Only data that exists in src/data is used: no ratings, reviews or guessed facts.
import { imageFor } from './news-images.mjs';
export const SITE_URL = 'https://humainlogic.com';
export const ORG = { '@id': `${SITE_URL}/#org` };
const clean = (o) => JSON.parse(JSON.stringify(o)); // drops undefined

// Returns [amount, ISO currency] from a price string like "$12/month" or "€11/month + VAT".
const priceNum = (s, fallback = 'USD') => { const str = String(s ?? '');
  const m = str.match(/(US\$|USD\s?|\$|€|EUR\s?|£|GBP\s?)\s?(\d+(?:\.\d+)?)/); if (!m) return [undefined, fallback];
  const cur = /€|EUR/.test(m[1]) ? 'EUR' : /£|GBP/.test(m[1]) ? 'GBP' : 'USD'; return [m[2], cur]; };

export function toolLd(tool) {
  const p = tool.pricing, url = `${SITE_URL}/tools/${tool.slug}`;
  const offers = [];
  const [paid, cur] = priceNum(p.starting_paid_price, p.currency ?? 'USD');
  if (p.free_tier === true) offers.push({ '@type': 'Offer', name: 'Free plan', price: '0', priceCurrency: p.currency ?? cur, url: p.pricing_url ?? tool.website, availability: 'https://schema.org/InStock' });
  if (paid) offers.push({ '@type': 'Offer', name: `Paid plans from ${p.starting_paid_price}`, price: paid, priceCurrency: cur, url: p.pricing_url ?? tool.website, ...(p.verified ? { priceValidUntil: undefined } : {}) });
  return clean({
    '@type': 'SoftwareApplication', '@id': `${url}#app`, name: tool.name, url: tool.website, mainEntityOfPage: url,
    applicationCategory: tool.category === 'coding' ? 'DeveloperApplication' : tool.category === 'education' ? 'EducationalApplication' : tool.category === 'image' || tool.category === 'video' || tool.category === 'audio' || tool.category === 'design' ? 'MultimediaApplication' : tool.category === 'finance' ? 'FinanceApplication' : tool.category === 'health' ? 'HealthApplication' : tool.category === 'travel' ? 'TravelApplication' : tool.category === 'shopping' ? 'ShoppingApplication' : 'BusinessApplication',
    applicationSubCategory: tool.category_label,
    ...(tool.platforms?.length ? { operatingSystem: tool.platforms.join(', ') } : {}),
    description: tool.details?.what_it_does ?? tool.summary,
    ...(offers.length ? { offers: offers.length === 1 ? offers[0] : offers } : {}),
    ...(p.free_tier !== null ? { isAccessibleForFree: p.free_tier } : {}),
    ...(tool.developer ? { author: { '@type': 'Organization', name: tool.developer }, creator: { '@type': 'Organization', name: tool.developer } } : {}),
    publisher: ORG, // HumAIn Logic publishes this listing (the tool's maker is author/creator)
    sameAs: tool.website,
    ...(p.verified_on ? { dateModified: p.verified_on } : {}),
  });
}

export function newsArticleLd(n, { withImage = true } = {}) {
  const im = imageFor(n);
  return clean({
    '@type': 'NewsArticle', headline: n.title.slice(0, 110), url: n.link, mainEntityOfPage: n.link, datePublished: n.date,
    ...(n.summary ? { description: n.summary } : {}),
    publisher: { '@type': 'Organization', name: n.source }, sourceOrganization: { '@type': 'Organization', name: n.source },
    ...(withImage && im.kind === 'tile' ? { image: `${SITE_URL}${im.src}` } : {}),
  });
}
export const newsListLd = (items, name, noImage = []) => ({ '@type': 'ItemList', name, numberOfItems: items.length,
  itemListElement: items.map((n, i) => ({ '@type': 'ListItem', position: i + 1, item: newsArticleLd(n, { withImage: !noImage.includes(n) }) })) });

export const itemList = (name, rows) => ({ '@type': 'ItemList', name, numberOfItems: rows.length,
  itemListElement: rows.map((r, i) => ({ '@type': 'ListItem', position: i + 1, url: r.url, name: r.name })) });

export const citation = (s) => clean({ '@type': 'CreativeWork', name: s.title, url: s.url, ...(s.publisher ? { publisher: { '@type': 'Organization', name: s.publisher } } : {}), ...(s.year ? { datePublished: String(s.year) } : {}) });

export const jobsDatasetLd = (jobsData) => ({
  '@type': 'Dataset', '@id': `${SITE_URL}/tracker#dataset`, name: 'HumAIn Logic AI Job Safety Tracker',
  description: `HumAIn Logic estimates for ${jobsData.jobs.length} jobs: when technology could do most of each job's current tasks (a year range with an outlook level and confidence), and a separate estimate of hiring impact by about 2030. Each job lists its sources.`,
  url: `${SITE_URL}/tracker`, creator: ORG, publisher: ORG, dateModified: jobsData.updated, inLanguage: 'en-US',
  isAccessibleForFree: true, license: 'https://creativecommons.org/licenses/by/4.0/',
  measurementTechnique: `${SITE_URL}/methodology`,
  variableMeasured: ['Automation year range (HumAIn Logic estimate)', 'Outlook level', 'Confidence', 'Hiring impact by 2030'],
  distribution: [{ '@type': 'DataDownload', encodingFormat: 'application/json', contentUrl: `${SITE_URL}/api/jobs.json` }],
  citation: [...new Map(jobsData.jobs.flatMap(j => [...j.sources, ...(j.employment_pressure_sources ?? [])]).map(s => [s.url, citation(s)])).values()],
});

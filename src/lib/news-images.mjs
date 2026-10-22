// News images (design/news-images-notes.md, homepage-spec §5.1).
// Phase 1: topic tiles only. Publisher images are NOT shown until a source is cleared (copyright; legal brief).
export const IMAGE_ALLOWLIST = []; // feed names whose image terms are cleared, e.g. ['NIST News'] — empty on purpose

const SAFETY_RE = /\b(privacy|scams?|deepfakes?|security|fraud|phishing|safety)\b/i;
export const topicFor = (it) => ({ 'tools-launches': 'tools', business: 'tools', 'jobs-work': 'jobs', research: 'research', 'good-news': 'research',
  'rules-safety': SAFETY_RE.test(`${it.title} ${it.summary ?? ''}`) ? 'safety' : 'policy' })[it.category] ?? 'research';

export const TILE_ALT = {
  tools: 'Illustration of a wrench', policy: 'Illustration of a page of rules with a seal', jobs: 'Illustration of a briefcase',
  research: 'Illustration of a bar chart under a magnifying glass', safety: 'Illustration of a shield with a check mark',
};

/** What to render for a news item. Always a tile today; a cleared source could later return a photo here. */
export function imageFor(it) {
  const topic = it.topic ?? topicFor(it);
  // if (it.image_url_source && IMAGE_ALLOWLIST.includes(it.source)) { ...phase 2: downloaded, resized copy... }
  return { kind: 'tile', topic, src: `/img/news/tile-${topic}.svg`, alt: TILE_ALT[topic] };
}

/** Best image URL the feed itself offers (media:content > media:thumbnail > image enclosure). Stored, not displayed. */
export function feedImageUrl(i) {
  const pick = (arr) => (arr ?? []).map(x => x?.$ ?? x).filter(x => x?.url && /^https:/.test(x.url) && (!x.medium || x.medium === 'image') && (!x.type || /^image\//.test(x.type)))
    .sort((a, b) => (+b.width || 0) - (+a.width || 0))[0]?.url;
  return pick(i.mediaContent) ?? pick(i.mediaThumbnail) ?? (i.enclosure?.url && /^image\//.test(i.enclosure.type ?? '') && /^https:/.test(i.enclosure.url) ? i.enclosure.url : null);
}

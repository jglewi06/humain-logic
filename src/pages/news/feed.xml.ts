import news from '../../data/news.json';
import { SITE } from '../../lib/site';
const x = (s: string) => s.replace(/[<>&'"]/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' }[c]!));
export const GET = () => new Response(`<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"><channel><title>HumAIn Logic: AI news</title><link>${SITE.url}/news</link><description>Calm, sourced AI news.</description><lastBuildDate>${new Date(news.updated).toUTCString()}</lastBuildDate>
${news.items.slice(0, 40).map(i => `<item><title>${x(i.title)}</title><link>${x(i.link)}</link><guid isPermaLink="false">${x(i.link)}</guid><pubDate>${new Date(i.date).toUTCString()}</pubDate><source url="${x(i.link)}">${x(i.source)}</source><description>${x(i.summary || '')}</description></item>`).join('\n')}
</channel></rss>`, { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' } });

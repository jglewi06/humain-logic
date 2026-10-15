import news from '../../data/news.json';
import { json, meta } from '../../lib/api';
export const GET = () => json({ data: news.items, meta: meta({ updated: news.updated, count: news.items.length }) });

// IndexNow ping: POSTs URLs to https://api.indexnow.org/indexnow (Bing, Yandex, Seznam, Naver...).
// Usage: node scripts/indexnow.mjs [url...]   (no args = news + home pages, which change every fetch)
//        node scripts/indexnow.mjs --changed <git-range>   (URLs for files changed in the range)
import { execSync } from 'node:child_process';
const KEY = '80ca6f1145408b38ae65bc4ec3704749'; // key file: public/<KEY>.txt
const HOST = 'humainlogic.com', SITE = `https://${HOST}`;
const args = process.argv.slice(2);
let urls = [];
if (args[0] === '--changed') {
  const files = execSync(`git diff --name-only ${args[1] ?? 'HEAD~1..HEAD'}`, { encoding: 'utf8' }).split('\n').filter(Boolean);
  for (const f of files) {
    if (f === 'src/data/news.json') urls.push('/', '/news');
    else if (f.startsWith('src/content/guides/')) urls.push(`/guides/${f.split('/').pop().replace(/\.md$/, '')}`, '/guides');
    else if (f === 'src/data/jobs.json') urls.push('/tracker', '/will-ai-take-my-job');
    else if (f === 'src/data/tools.json') urls.push('/tools');
    else if (f === 'public/llms.txt') urls.push('/llms.txt');
    else { const m = f.match(/^src\/pages\/(.+)\.astro$/); if (m && !m[1].includes('[')) urls.push('/' + m[1].replace(/(^|\/)index$/, '')); }
  }
  urls.push('/sitemap-0.xml');
} else urls = args.length ? args : ['/', '/news'];
urls = [...new Set(urls.map(u => u.startsWith('http') ? u : SITE + (u === '/' ? '/' : u.replace(/\/$/, ''))))];
const res = await fetch('https://api.indexnow.org/indexnow', { method: 'POST', headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify({ host: HOST, key: KEY, keyLocation: `${SITE}/${KEY}.txt`, urlList: urls }) });
console.log(`IndexNow ${res.status} for ${urls.length} URL(s): ${urls.join(' ')}`);
if (res.status >= 400 && res.status !== 429) process.exitCode = 0; // never fail the publish job over a ping

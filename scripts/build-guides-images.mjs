// Generates responsive WebP (640/1024) + JPG fallback (1024) for /guides photos.
import sharp from 'sharp';
import { mkdirSync } from 'node:fs';
const src = new URL('../../design/guides-images/', import.meta.url).pathname;
const out = new URL('../public/img/guides/', import.meta.url).pathname;
mkdirSync(out, { recursive: true });
// [name, srcDir, outDir]: source design/guides-images/<srcDir>, output public/img/guides/<outDir> (guide slug)
const guide = (srcDir, slug, names) => names.map(n => [n, srcDir, slug]);
const jobs = [['guides-hero', '', ''], ['guides-small-business', '', ''],
  ...guide('what-is-ai/', 'what-is-ai/', ['what-is-ai-hero', 'what-is-ai-everyday', 'what-is-ai-getting-started']),
  ...guide('staying-safe/', 'staying-safe-with-ai/', ['safe-hero', 'safe-scams']),
  ...guide('small-business/', 'ai-for-small-business/', ['smb-hero', 'smb-plan']),
  ...guide('getting-started/', 'getting-started-with-ai-chat-assistants/', ['start-hero', 'start-practice'])];
for (const [name, srcDir, dir] of jobs) {
  mkdirSync(`${out}${dir}`, { recursive: true });
  for (const w of [640, 1024]) {
    const img = sharp(`${src}${srcDir}${name}.jpg`).resize(w, Math.round(w * 9 / 16), { fit: 'cover' });
    await img.clone().webp({ quality: 78 }).toFile(`${out}${dir}${name}-${w}.webp`);
    if (w === 1024) await img.clone().jpeg({ quality: 80, progressive: true, mozjpeg: true }).toFile(`${out}${dir}${name}-${w}.jpg`);
  }
}

// /tracker photo (same treatment): WebP 640/1024 + 1024 JPG fallback -> public/img/tracker/
{
  const tsrc = new URL('../../../humainlogic-assets/tracker-job-loss.jpg', import.meta.url).pathname;
  const tout = new URL('../public/img/tracker/', import.meta.url).pathname;
  mkdirSync(tout, { recursive: true });
  for (const w of [640, 1024]) {
    const img = sharp(tsrc).resize(w, Math.round(w * 9 / 16), { fit: 'cover' });
    await img.clone().webp({ quality: 78 }).toFile(`${tout}tracker-job-loss-${w}.webp`);
    if (w === 1024) await img.clone().jpeg({ quality: 80, progressive: true, mozjpeg: true }).toFile(`${tout}tracker-job-loss-${w}.jpg`);
  }
}

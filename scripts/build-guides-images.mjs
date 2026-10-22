// Generates responsive WebP (640/1024) + JPG fallback (1024) for /guides photos.
import sharp from 'sharp';
import { mkdirSync } from 'node:fs';
const src = new URL('../../design/guides-images/', import.meta.url).pathname;
const out = new URL('../public/img/guides/', import.meta.url).pathname;
mkdirSync(out, { recursive: true });
// [name, subdir]: subdir is shared by source (design/guides-images/<subdir>) and output (public/img/guides/<subdir>)
const jobs = [['guides-hero', ''], ['guides-small-business', ''],
  ...['hero', 'everyday', 'getting-started'].map(n => [`what-is-ai-${n}`, 'what-is-ai/'])];
for (const [name, dir] of jobs) {
  mkdirSync(`${out}${dir}`, { recursive: true });
  for (const w of [640, 1024]) {
    const img = sharp(`${src}${dir}${name}.jpg`).resize(w, Math.round(w * 9 / 16), { fit: 'cover' });
    await img.clone().webp({ quality: 78 }).toFile(`${out}${dir}${name}-${w}.webp`);
    if (w === 1024) await img.clone().jpeg({ quality: 80, progressive: true, mozjpeg: true }).toFile(`${out}${dir}${name}-${w}.jpg`);
  }
}

// Generates responsive WebP (640/1024) + JPG fallback (1024) for /guides photos.
import sharp from 'sharp';
import { mkdirSync } from 'node:fs';
const src = new URL('../../design/guides-images/', import.meta.url).pathname;
const out = new URL('../public/img/guides/', import.meta.url).pathname;
mkdirSync(out, { recursive: true });
for (const name of ['guides-hero', 'guides-small-business']) {
  for (const w of [640, 1024]) {
    const img = sharp(`${src}${name}.jpg`).resize(w, Math.round(w * 9 / 16), { fit: 'cover' });
    await img.clone().webp({ quality: 78 }).toFile(`${out}${name}-${w}.webp`);
    if (w === 1024) await img.clone().jpeg({ quality: 80, progressive: true, mozjpeg: true }).toFile(`${out}${name}-${w}.jpg`);
  }
}

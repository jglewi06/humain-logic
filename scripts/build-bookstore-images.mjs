// Builds 3:4 bookstore covers: WebP 640/1024 + JPG fallback.
import sharp from 'sharp';
import { mkdirSync } from 'node:fs';
const SRC = process.env.SRC || '/workspace/humainlogic-assets/bookstore';
const OUT = 'public/img/bookstore';
const names = ['what-is-ai','getting-started-with-ai-chat-assistants','staying-safe-with-ai','ai-for-small-business','ai-and-your-job'];
mkdirSync(OUT, { recursive: true });
for (const n of names) {
  for (const w of [640, 1024]) {
    const h = Math.round(w * 4 / 3);
    await sharp(`${SRC}/${n}.jpg`).resize(w, h, { fit: 'cover' }).webp({ quality: 78 }).toFile(`${OUT}/${n}-${w}.webp`);
  }
  await sharp(`${SRC}/${n}.jpg`).resize(1024, 1365, { fit: 'cover' }).jpeg({ quality: 80, mozjpeg: true }).toFile(`${OUT}/${n}.jpg`);
}
console.log('done');

import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
// Guides: copied from research/content/guides by `npm run import-research`
const guides = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/guides' }),
  schema: z.object({ slug: z.string(), title: z.string(), summary: z.string(), updated: z.coerce.date() }),
});
export const collections = { guides };

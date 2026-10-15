import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Canonical domain (CEO decision 2026-10-15). Cloudflare Pages serves /tools.html at /tools.
export default defineConfig({
  site: 'https://humainlogic.com',
  trailingSlash: 'never',
  build: { format: 'file' },
  integrations: [sitemap({
    // ux/spec §4.5: exclude search, newsletter confirm/unsubscribe, API
    filter: (page) => !/\/(search|newsletter\/confirmed|newsletter\/confirm|newsletter\/unsubscribe)(\/|$)/.test(page) && !page.includes('/api/'),
    serialize: (item) => ({ ...item, url: item.url.replace(/\/$/, '') || 'https://humainlogic.com/' }),
  })],
});

import { SITE } from './site';
export const json = (data: unknown) => new Response(JSON.stringify(data, null, 1), { headers: { 'Content-Type': 'application/json; charset=utf-8' } });
export const meta = (extra = {}) => ({ generated_at: new Date().toISOString(), license: 'CC BY 4.0 (proposed, pending owner sign-off); tool logos and third-party text excluded', site: SITE.url, ...extra });

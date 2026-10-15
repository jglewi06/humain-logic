export const SITE = {
  name: 'HumAIn Logic',
  url: 'https://humainlogic.com',
  tagline: 'AI, explained calmly.',
  description: 'Find the right AI tool for your task in plain English, read calm AI news, and see how AI is changing your job.',
  newsletterName: 'The Sunday Brief',
  newsletterDay: 'Sunday',
  buttondownUser: import.meta.env.PUBLIC_BUTTONDOWN_USER || 'jglewi06',
};
export const NAV = [
  { href: '/tools', label: 'Find a tool', match: ['/tools', '/search', '/tasks'] },
  { href: '/news', label: 'AI news', match: ['/news'] },
  { href: '/tracker', label: 'Job tracker', match: ['/tracker'] },
  { href: '/guides', label: 'Guides', match: ['/guides'] },
  { href: '/learn', label: 'Learn about AI', match: ['/learn'] },
];
export const abs = (p: string) => new URL(p, SITE.url).href.replace(/\/$/, p === '/' ? '/' : '');
export const OUTLOOK = {
  steady: { label: 'Mostly steady', icon: '✓', cls: 'safe' },
  watch: { label: 'Changing', icon: '◐', cls: 'watch' },
  shift: { label: 'Big shift ahead', icon: '↻', cls: 'shift' },
} as const;
export const NEWS_CATS: Record<string, string> = {
  'tools-launches': 'Tools & launches', 'jobs-work': 'Jobs & work', 'rules-safety': 'Rules & safety',
  'business': 'Business', 'research': 'Research explained', 'good-news': 'Good news',
};
const TINTS = [['var(--color-sage)', 'var(--color-teal-deep)'], ['var(--color-apricot-tint)', 'var(--color-clay)'], ['var(--color-lavender)', 'var(--color-ink)']];
export const tint = (s: string) => TINTS[[...s].reduce((a, c) => a + c.charCodeAt(0), 0) % 3];
export const initials = (n: string) => n.replace(/[^A-Za-z0-9 ]/g, '').split(' ').filter(Boolean).map(w => w[0]).join('').slice(0, 2).padEnd(2, n[1] || '').replace(/^(.)(.)$/, (m, a, b) => a.toUpperCase() + b.toLowerCase());
export const fmtDate = (d: string) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'America/New_York' });

export const fmtMonthDay = (d: string) => new Date(d + 'T12:00:00Z').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
/** Pricing status line: "Last verified Oct 15, 2026" or "Pricing unconfirmed" */
export const priceStatus = (p: any) => p?.verified ? `Last verified ${fmtMonthDay(p.verified_on)}` : p?.verification_note !== undefined ? 'Pricing unconfirmed' : 'Pricing unconfirmed';
export const freeText = (p: any) => p?.free_tier === true ? 'Free plan: yes' : p?.free_tier === false ? 'Free plan: no' : 'Free plan: unclear';

// Hiring impact by 2030: a second, separate HumAIn Logic estimate (not the automation timeline)
export const HIRING = {
  high:   { label: 'Fewer openings likely',  icon: '↓', cls: 'hi-high' },
  medium: { label: 'Some pressure',          icon: '↘', cls: 'hi-medium' },
  low:    { label: 'Little change expected', icon: '→', cls: 'hi-low' },
  growth: { label: 'More openings likely',   icon: '↑', cls: 'hi-growth' },
} as Record<string, { label: string; icon: string; cls: string }>;
export const HIRING_ORDER = ['high', 'medium', 'low', 'growth'];
export const HIRING_INTRO = 'Hiring impact by 2030 is a separate HumAIn Logic estimate of whether employers are likely to hire fewer or more people for a job by about 2030, based on employer surveys and early labor-market data. It is not the automation timeline: the year ranges estimate when technology could do most of a job’s tasks, which is a different question.';

// Bookstore products: enhanced, quick-read PDF editions of the free guides.
// PRICES ARE PLACEHOLDERS: need Francisco's approval before launch.
// checkoutUrl: paste the payment link (Gumroad / Lemon Squeezy / Stripe Payment Link).
// Empty string = button shows "Coming soon" and is disabled.
export interface BookProduct {
  slug: string; title: string; description: string; pages: number; readTime: string;
  price: string; basedOn?: string; checkoutUrl: string; badge?: string; cover: string;
}
export const BOOKS: BookProduct[] = [
  { slug: 'what-is-ai-pdf', cover: 'what-is-ai', title: 'What is AI? The pocket guide',
    description: 'The free intro, expanded: a one-page cheat sheet of AI terms, simple diagrams of how chat tools work, and a "good at / bad at" quick-reference card.',
    pages: 14, readTime: '15 min read', price: '$2.99', basedOn: '/guides/what-is-ai', checkoutUrl: 'https://humainlogic.gumroad.com/l/eijzb', badge: 'Start here' },
  { slug: 'chat-assistants-pdf', cover: 'getting-started-with-ai-chat-assistants', title: 'AI chat assistants: the prompt workbook',
    description: 'Prompting basics made hands-on: 30 copy-and-paste prompts for everyday tasks, before-and-after examples, and a fill-in-the-blanks prompt template.',
    pages: 20, readTime: '20 min read', price: '$2.99', basedOn: '/guides/getting-started-with-ai-chat-assistants', checkoutUrl: 'https://humainlogic.gumroad.com/l/ajtxo' },
  { slug: 'staying-safe-pdf', cover: 'staying-safe-with-ai', title: 'Staying safe with AI: the family checklist',
    description: 'Printable checklists for privacy settings, spotting AI scams and deepfakes, and fact-checking answers. Easy to share with parents and kids.',
    pages: 16, readTime: '15 min read', price: '$2.99', basedOn: '/guides/staying-safe-with-ai', checkoutUrl: 'https://humainlogic.gumroad.com/l/hguts' },
  { slug: 'small-business-pdf', cover: 'ai-for-small-business', title: 'AI for small business: the 30-day starter plan',
    description: 'A simple week-by-week plan to try AI in your business, with a tool shortlist by budget, ready-made prompts for customer emails and marketing, and a one-page AI use policy.',
    pages: 24, readTime: '25 min read', price: '$2.99', basedOn: '/guides/ai-for-small-business', checkoutUrl: 'https://humainlogic.gumroad.com/l/fsmwbf' },
  { slug: 'ai-and-your-job-pdf', cover: 'ai-and-your-job', title: 'AI and your job: the career action plan',
    description: 'Turn worry into a plan: a self-check of which tasks in your job are changing, a skills worksheet, and resume and interview tips for an AI-shaped job market.',
    pages: 20, readTime: '20 min read', price: '$2.99', basedOn: '/guides/ai-and-your-job', checkoutUrl: 'https://humainlogic.gumroad.com/l/ladje' },
  { slug: 'complete-bundle-pdf', cover: 'complete-bundle', title: 'The complete HumAIn Logic bundle',
    description: 'All five guides in one download, at a lower price than buying them separately.',
    pages: 94, readTime: 'About 1.5 hours total', price: '$12.99', checkoutUrl: 'https://humainlogic.gumroad.com/l/blrext', badge: 'Best value' },
];

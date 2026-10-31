// Bookstore products: enhanced, quick-read PDF editions of the free guides.
// PRICES ARE PLACEHOLDERS: need Francisco's approval before launch.
// checkoutUrl: paste the payment link (Gumroad / Lemon Squeezy / Stripe Payment Link).
// Empty string = button shows "Coming soon" and is disabled.
export interface BookProduct {
  slug: string; title: string; description: string; pages: number; readTime: string;
  price: string; basedOn?: string; checkoutUrl: string; badge?: string; cover: string; coverAlt?: string;
}
export const BOOKS: BookProduct[] = [
  { slug: 'what-is-ai-pdf', cover: 'photos/what-is-ai', coverAlt: 'Hands holding an open pocket guide beside a teal mug of tea and reading glasses on a sunlit table', title: 'What is AI? The pocket guide',
    description: 'The free intro, expanded: a one-page cheat sheet of AI terms, simple diagrams of how chat tools work, and a "good at / bad at" quick-reference card.',
    pages: 14, readTime: '15 min read', price: '$2.99', basedOn: '/guides/what-is-ai', checkoutUrl: 'https://humainlogic.gumroad.com/l/eijzb', badge: 'Start here' },
  { slug: 'chat-assistants-pdf', cover: 'photos/prompt-workbook', coverAlt: 'A hand on an open lined workbook next to a closed laptop, pencil and blank sticky note', title: 'AI chat assistants: the prompt workbook',
    description: 'Prompting basics made hands-on: 30 copy-and-paste prompts for everyday tasks, before-and-after examples, and a fill-in-the-blanks prompt template.',
    pages: 20, readTime: '20 min read', price: '$2.99', basedOn: '/guides/getting-started-with-ai-chat-assistants', checkoutUrl: 'https://humainlogic.gumroad.com/l/ajtxo' },
  { slug: 'staying-safe-pdf', cover: 'photos/family-safety', coverAlt: 'A parent and child on a sofa looking at a tablet together, with a checklist on a clipboard in the foreground', title: 'Staying safe with AI: the family checklist',
    description: 'Printable checklists for privacy settings, spotting AI scams and deepfakes, and fact-checking answers. Easy to share with parents and kids.',
    pages: 16, readTime: '15 min read', price: '$2.99', basedOn: '/guides/staying-safe-with-ai', checkoutUrl: 'https://humainlogic.gumroad.com/l/hguts' },
  { slug: 'small-business-pdf', cover: 'photos/small-business', coverAlt: 'A small plant shop owner working on a laptop at the counter, with an open planner in the foreground', title: 'AI for small business: the 30-day starter plan',
    description: 'A simple week-by-week plan to try AI in your business, with a tool shortlist by budget, ready-made prompts for customer emails and marketing, and a one-page AI use policy.',
    pages: 24, readTime: '25 min read', price: '$2.99', basedOn: '/guides/ai-for-small-business', checkoutUrl: 'https://humainlogic.gumroad.com/l/fsmwbf' },
  { slug: 'ai-and-your-job-pdf', cover: 'photos/career-plan', coverAlt: 'A job-seeker at a home desk writing in a notebook beside a laptop and coffee', title: 'AI and your job: the career action plan',
    description: 'Turn worry into a plan: a self-check of which tasks in your job are changing, a skills worksheet, and resume and interview tips for an AI-shaped job market.',
    pages: 20, readTime: '20 min read', price: '$2.99', basedOn: '/guides/ai-and-your-job', checkoutUrl: 'https://humainlogic.gumroad.com/l/ladje' },
  { slug: 'complete-bundle-pdf', cover: 'photos/complete-bundle', coverAlt: 'Five printed guides in teal, sage and apricot laid out on linen with a pencil and eucalyptus', title: 'The complete HumAIn Logic bundle',
    description: 'All five guides in one download, at a lower price than buying them separately.',
    pages: 94, readTime: 'About 1.5 hours total', price: '$12.99', checkoutUrl: 'https://humainlogic.gumroad.com/l/blrext', badge: 'Best value' },
  // AI assistant guides ($1.99). Pages from pdfinfo; read time as stated in each PDF. Gumroad checkout.
  { slug: 'chatgpt-guide-pdf', cover: 'photos/guide-chatgpt', coverAlt: "A person writing at a sunny kitchen table beside a laptop and a bowl of apricots", title: "The Practical ChatGPT Guide",
    description: "A plain-English, 30-minute guide to what ChatGPT does well and how to use it for everyday life and small business. It compares the Free, Go, Plus, Pro, Business and Enterprise plans, with prices checked in October 2026. It also includes 70+ copy-ready prompts for writing, marketing, customer service, work, research and home, each in its own box, plus a chapter on privacy and checking answers.",
    pages: 29, readTime: '30 min read', price: '$1.99', checkoutUrl: 'https://humainlogic.gumroad.com/l/ojqycc' },
  { slug: 'claude-guide-pdf', cover: 'photos/guide-claude', coverAlt: "Hands taking notes at a library table beside a stack of books and a laptop", title: "The Practical Claude Guide",
    description: "A clear, 30-minute guide to Claude's strengths: long documents, careful writing and thoughtful analysis. It explains the Free, Pro, Max, Ultra, Team and Enterprise options, with prices checked in October 2026. It also includes 75+ copy-ready prompts for small business, work, documents, customer service and everyday life, plus tips for privacy and checking answers.",
    pages: 27, readTime: '30 min read', price: '$1.99', checkoutUrl: 'https://humainlogic.gumroad.com/l/uihnfa' },
  { slug: 'grok-guide-pdf', cover: 'photos/guide-grok', coverAlt: "A person checking their phone at a sunlit café window with a latte and newspapers", title: "The Practical Grok Guide",
    description: "A practical, 30-minute guide to Grok, the assistant built for real-time research, X conversations, images and voice. It explains how the X Subscription tiers compare, with prices checked in October 2026. It also includes 70+ copy-ready prompts for trend research, marketing, writing, visuals, customer service and everyday life, plus a simple weekly research routine.",
    pages: 29, readTime: '30 min read', price: '$1.99', checkoutUrl: 'https://humainlogic.gumroad.com/l/nfhpd' },
  { slug: 'gemini-guide-pdf', cover: 'photos/guide-gemini', coverAlt: "Hands holding a phone over a planner, with a map and sunglasses, planning a trip", title: "The Practical Gemini Guide: Get More Done with Google's AI Assistant",
    description: "A plain-English, 30-minute guide to Google Gemini by Jordan Lewis M.S. Learn what Gemini does best, how its free and paid Google AI plans compare (prices checked October 2026), and how to use it for everyday life and small-business work in Gmail, Docs, Sheets and Deep Research. Includes 56 copy-ready prompts in clearly marked boxes, a privacy and fact-checking chapter, and a one-page cheat sheet.",
    pages: 26, readTime: '30 min read', price: '$1.99', checkoutUrl: 'https://humainlogic.gumroad.com/l/upaarc' },
  { slug: 'meta-ai-guide-pdf', cover: 'photos/guide-meta-ai', coverAlt: "Hands chopping vegetables at a kitchen counter with a recipe card and a propped-up phone", title: "The Practical Meta AI Guide: The AI Assistant Already in Your Apps",
    description: "A plain-English, 30-minute guide to Meta AI by Jordan Lewis M.S. Learn how to use the AI built into WhatsApp, Instagram, Facebook and Messenger for everyday help, captions, images, customer replies and research, plus what's free and what the paid Meta One plans add (checked October 2026). Includes 62 copy-ready prompts for home and small business, a brand-voice worksheet, safety tips and a one-page cheat sheet.",
    pages: 26, readTime: '30 min read', price: '$1.99', checkoutUrl: 'https://humainlogic.gumroad.com/l/vriacz' },
  { slug: 'perplexity-guide-pdf', cover: 'photos/guide-perplexity', coverAlt: "Hands highlighting a printed article at a desk with index cards, a magnifying glass and a laptop", title: "The Practical Perplexity Guide: Research Answers You Can Actually Check",
    description: "A plain-English, 30-minute guide to Perplexity by Jordan Lewis M.S. Learn how to get cited, current answers for everyday questions and small-business research: competitors, suppliers, licenses, pricing and fact-checking, with Spaces, Deep Research and the free Comet browser explained. Includes plans and prices checked October 2026, 66 copy-ready prompts in clearly marked boxes, a source-checking routine and a one-page cheat sheet.",
    pages: 27, readTime: '30 min read', price: '$1.99', checkoutUrl: 'https://humainlogic.gumroad.com/l/vdycev' },
];

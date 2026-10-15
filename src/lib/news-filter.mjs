// Shared AI-relevance test for news (fetch-news.mjs and the Sunday Brief story picker).
// Feeds marked "ai_only": true in feeds.json are AI-dedicated and skip this; every other feed must mention AI.
export const AI_RE = /\b(ai|a\.i\.|artificial intelligence|machine learning|deep learning|neural (net|network)s?|chat ?bots?|llms?|large language models?|generative|gen ?ai|gpt(-?\d\w*)?|chatgpt|openai|anthropic|claude|gemini|copilot|deepmind|mistral|hugging ?face|ai agents?|agentic|foundation models?|algorithms? (decide|decides|used)|automated decision|facial recognition|deepfakes?)\b/i;
export const isAboutAI = (it) => AI_RE.test(`${it.title ?? ''} ${it.summary ?? ''}`);

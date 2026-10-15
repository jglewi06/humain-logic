# HumAIn Logic: site (https://humainlogic.com)

Static Astro 5 site, working prototype. It is built from the specs in `../design`, `../ux` and `../research`. No server, no database, $0 hosting.

```bash
npm ci
npm run dev                # http://localhost:4321
npm run build              # -> dist/ (≈308 pages)
npm run preview            # serve dist/
npm run import-research    # ../research/{tools,jobs}.json -> src/data/
npm run fetch-news         # RSS (src/data/feeds.json) -> src/data/news.json
npm run build-newsletter   # -> newsletter/YYYY-MM-DD.md (+ Buttondown draft if key set)
```

## Where things come from
| Site file | Source spec |
|---|---|
| `src/styles/global.css` | `design/tokens.css` v1.2 + shared base (`design/learn-about-ai.html`) + components (`design/homepage-mockup.html`) + site additions at the bottom |
| `src/styles/learn.css`, `src/pages/learn.astro` | ported from `design/learn-about-ai.html` (copy: `learn-about-ai.md`) |
| `public/img/*.svg`, `public/favicon.svg` | `design/logo.svg`, `mark.svg`, `hero-illustration.svg` |
| `src/data/tools.json`, `tasks.json`, `categories.json`, `jobs.json` | generated from `research/tools.json` and `research/jobs.json` by `scripts/import-research.mjs` |
| `src/data/tools.json` → `details`, `pricing` | `research/content/tool-details.json` (verified prices; `free_tier: null` = unknown) |
| `src/data/jobs.json` → `help`, `general_resources` | `research/content/job-help.json` |
| `src/content/guides/*.md`, `src/data/guides.json` | `research/content/guides.json` + `guides/*.md` (content collection, `src/content.config.ts`) |
| `src/data/feeds.json` | verified feeds in `research/news-sources.md` (Google News excluded: non-commercial ToS) |
| Routes, robots, llms.txt, JSON endpoints, JSON-LD | `ux/spec.md` §§ IA, 4.1–4.7 |

When a design file changes, re-copy it (see the header comments in `global.css`). After research changes, run `npm run import-research`.

## Routes
`/` · `/search?q=` (noindex) · `/tools` · `/tools/{slug}` · `/tasks` · `/tasks/{slug}` · `/news` · `/news/category/{slug}` · `/news/feed.xml` · `/tracker` · `/tracker/jobs/{slug}` · `/learn` · `/guides` · `/guides/{slug}` · `/newsletter` · `/newsletter/confirmed` · `/about` · `/methodology` · `/glossary` · `/privacy` · `/terms` · `/accessibility` · `/contact` · `/api/{tools,tasks,jobs,news,search-index}.json` · `/llms.txt` · `/llms-full.txt` · `/robots.txt` · `/sitemap-index.xml`

There are no trailing slashes (`build.format: 'file'`). Every page has a canonical `https://humainlogic.com/...` link.

## Config / secrets
- `PUBLIC_BUTTONDOWN_USER` (Cloudflare Pages env var): the signup form target. If it is unset, the form validates and shows the success state but sends nothing.
- `BUTTONDOWN_API_KEY` (GitHub secret), `NEWSLETTER_AUTOSEND` and `NEWSLETTER_POSTAL_ADDRESS` (GitHub variables). The newsletter refuses to upload without a postal address (CAN-SPAM).
- Analytics: turn on Cloudflare Web Analytics in the Pages dashboard (auto-injected, no code or token in the repo).

## Deploy (Francisco)
Cloudflare Pages → connect the GitHub repo → build `npm run build`, output `dist`, env `NODE_VERSION=20` → custom domain `humainlogic.com`. See `../tech/plan.md`.

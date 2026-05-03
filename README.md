# ListingIQ

Paste an Amazon listing URL. Get an AI copy critique, an AEO visibility score across GPT / Claude / Gemini / Perplexity, and one-click rewrites — all in one shot.

---

## What It Does

| Feature | Description |
|---|---|
| **Listing Roast** | Claude audits your title, bullets, and description. Issues ranked by severity (critical / warning / suggestion) with the exact copy flagged. |
| **AEO Diagnostic** | Generates product-specific shopper queries, sends them to 4 AI models, and checks if your brand appears in the answers. |
| **Fix Engine** | Click any flagged issue → Claude rewrites that section. Drop-in replacement, no copy-paste friction. |

---

## Tech Stack

| | |
|---|---|
| Framework | Next.js 15 (App Router) |
| LLMs | OpenRouter — GPT-4o-mini, Claude Sonnet, Claude Haiku, Gemini 2.5 Flash, Perplexity Sonar |
| Scraping | Firecrawl (`onlyMainContent: false` for A+ images) |
| Styling | Tailwind CSS v4 |
| Language | TypeScript |

---

## Dev Setup

**Prerequisites:** [Bun](https://bun.sh) and API keys for OpenRouter + Firecrawl.

```bash
# 1. Clone
git clone https://github.com/R-Mohammed-Hasan/amazon-aeo-analysis.git
cd amazon-aeo-analysis

# 2. Install dependencies
bun install

# 3. Set environment variables
cp .env.example .env.local
# Fill in OPENROUTER_API_KEY and FIRECRAWL_API_KEY

# 4. Run dev server
bun dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Environment Variables

```env
OPENROUTER_API_KEY=
FIRECRAWL_API_KEY=
```

Get keys at [openrouter.ai](https://openrouter.ai) and [firecrawl.dev](https://www.firecrawl.dev).

---

## Project Structure

```
app/
  page.tsx               # URL input
  results/page.tsx       # Report card UI
  api/
    scrape/              # Firecrawl → structured ListingData via Claude Sonnet
    roast/               # Copy critique (Claude Haiku)
    aeo/                 # AEO diagnostic (4 models in parallel)
    fix/                 # Rewrite engine (Claude Haiku)

lib/
  openrouter.ts          # Model constants + chat()
  firecrawl.ts           # Scrape + LLM extraction
  services/              # Business logic (roast.ts, aeo.ts)
  prompts/               # Prompt builders
  utils/score.ts         # Scoring formulas

components/
  analysis/              # RoastReport, AEOReport, FixPanel
  ui/                    # ScoreRing, Badge, Skeleton
```

---

## Scoring

**Listing score** — starts at 10, deducts 2 per critical / 1 per warning / 0.5 per suggestion. Floor: 1.

**AEO score** — per model: `(queriesMatched / totalQueries) × 10`. Overall: average across 4 models.

---

## Model Choices

See [`MODEL_CONFIGS.md`](./MODEL_CONFIGS.md) for the full rationale behind each model selection.

# ListingIQ — Amazon Listing Intelligence Platform

> Paste your Amazon listing URL. Get a brutal AI critique + AEO visibility report + one-click fixes.

---

## What It Does

Two parallel analyses triggered from a single Amazon URL:

1. **Listing Roast** — AI critiques your copy (title, bullets, description) for quality issues
2. **AEO Diagnostic** — Queries GPT, Claude, Gemini to check if your product appears when shoppers ask AI assistants

After both analyses, a **Fix Engine** generates improved copy for each flagged issue.

---

## User Flow

```
[Paste Amazon URL]
        ↓
[Scrape listing via Firecrawl]
  → Title, bullets, description, brand, category, ASIN, images, price, BSR
        ↓
     ┌──────────────────────────┬──────────────────────────┐
     ↓ (parallel)               ↓ (parallel)
[Listing Roast]           [AEO Diagnostic]
 - Score copy 1–10         - Generate 10 shopper queries
 - Flag weak headline      - Send to GPT / Claude / Gemini
 - Flag generic bullets      via OpenRouter
 - Flag missing keywords   - Check if product is mentioned
 - Flag no social proof    - Rank position per model
     ↓                         ↓
     └──────────────────────────┘
                  ↓
         [Combined Report Card]
          - Listing Score: X/10
          - AEO Score: X/10
          - Issues list (copy + visibility)
                  ↓
         [Fix Button per issue]
          - Regenerated headline
          - Improved bullet points
          - Suggested description
          - Keywords to add
```

---

## Analyses in Detail

### 1. Listing Roast

Scores and critiques these sections:

| Section | What to Check |
|---|---|
| **Title** | Keyword stuffing, readability, benefit clarity, character limit |
| **Bullet Points** | Features vs benefits balance, specificity, power words, social proof |
| **Description** | Story, emotional appeal, differentiators, CTA |
| **Overall Copy** | Tone consistency, missing claims, vague language |

Each issue gets a **severity** (critical / warning / suggestion) and a one-line explanation.

### 2. AEO Diagnostic

- Uses scraped product data to auto-generate 10 realistic shopper queries
  - e.g. "best magnesium for leg cramps", "magnesium for seniors with kidney issues"
- Sends each query to 3 models via OpenRouter:
  - `openai/gpt-4o-mini`
  - `anthropic/claude-haiku-3`  
  - `google/gemini-flash-1.5`
- Parses responses: is the brand/product mentioned? At what position?
- Outputs a visibility score per model + overall AEO score

### 3. Fix Engine

On clicking "Fix" for any flagged issue:
- Sends the original copy + issue context to OpenRouter
- Returns a drop-in replacement (new headline / bullet / description)
- User can copy it directly

---

## Tech Stack

| Layer | Tool | Why |
|---|---|---|
| Framework | Next.js 15 (App Router) | Full-stack, no separate backend needed |
| Styling | Tailwind CSS | Fast, utility-first |
| Scraping | Firecrawl (`@mendable/firecrawl-js`) | Handles Amazon's anti-bot, returns clean markdown |
| LLM Queries | OpenRouter via `openai` SDK | Single API for GPT + Claude + Gemini |
| Language | TypeScript | Type safety across API ↔ UI |

---

## Folder Structure

```
listing-intel/
│
├── app/
│   ├── page.tsx                        # Landing page — URL input
│   ├── layout.tsx
│   ├── results/
│   │   └── page.tsx                    # Results page — report card UI
│   └── api/
│       ├── analyze/
│       │   └── route.ts                # Orchestrator — runs scrape + aeo + roast in parallel
│       ├── scrape/
│       │   └── route.ts                # Firecrawl: scrape Amazon listing
│       ├── aeo/
│       │   └── route.ts                # AEO: generate queries + query 3 models
│       ├── roast/
│       │   └── route.ts                # Roast: critique copy
│       └── fix/
│           └── route.ts                # Fix: regenerate specific section
│
├── components/
│   ├── ui/                             # Reusable primitives
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Badge.tsx                   # critical / warning / suggestion labels
│   │   └── ScoreRing.tsx               # Circular score display
│   ├── analysis/
│   │   ├── AEOReport.tsx               # AEO score + model breakdown table
│   │   ├── RoastReport.tsx             # Issue list with severity
│   │   └── FixPanel.tsx                # Sliding panel with fixed copy
│   └── layout/
│       ├── Header.tsx
│       └── AnalysisProgress.tsx        # Step-by-step loading state
│
├── lib/
│   ├── openrouter.ts                   # OpenRouter client + model constants
│   ├── firecrawl.ts                    # Firecrawl client
│   ├── prompts/
│   │   ├── aeo.ts                      # Query generation + model query prompts
│   │   ├── roast.ts                    # Listing critique prompts
│   │   └── fix.ts                      # Fix generation prompts
│   └── utils/
│       ├── parse-listing.ts            # Extract structured data from Firecrawl output
│       └── score.ts                    # Scoring logic for roast + AEO
│
├── types/
│   └── index.ts                        # All shared TypeScript interfaces
│
├── .env.local                          # API keys (never commit)
├── PRODUCT.md                          # This file
└── README.md
```

---

## Environment Variables

```env
OPENROUTER_API_KEY=
FIRECRAWL_API_KEY=
```

---

## API Routes

### `POST /api/analyze`
Orchestrator. Accepts `{ url: string }`, runs scrape → then aeo + roast in parallel.
Returns combined `AnalysisResult`.

### `POST /api/scrape`
Accepts `{ url: string }`. Returns `ListingData` (title, bullets, description, images, etc.)

### `POST /api/aeo`
Accepts `ListingData`. Returns `AEOResult` (scores per model, query-level breakdown).

### `POST /api/roast`
Accepts `ListingData`. Returns `RoastResult` (issues array with severity + explanation).

### `POST /api/fix`
Accepts `{ section: string, content: string, issue: string }`. Returns `{ fixed: string }`.

---

## TypeScript Types

```ts
// ListingData — scraped from Amazon
interface ListingData {
  asin: string
  title: string
  bullets: string[]
  description: string
  brand: string
  category: string
  price: string
  bsr: string
  imageUrls: string[]
  rating: string
  reviewCount: string
}

// RoastIssue — one flagged problem
interface RoastIssue {
  section: 'title' | 'bullets' | 'description'
  severity: 'critical' | 'warning' | 'suggestion'
  issue: string        // e.g. "Headline is feature-focused, not benefit-focused"
  original: string     // the actual copy that's weak
}

// RoastResult
interface RoastResult {
  score: number        // 1–10
  issues: RoastIssue[]
}

// AEOModelResult — per model
interface AEOModelResult {
  model: string
  mentioned: boolean
  position: number | null   // 1st, 2nd... or null if not mentioned
  queriesMatched: number    // out of 10
}

// AEOResult
interface AEOResult {
  score: number
  queries: string[]
  results: AEOModelResult[]
}

// Combined
interface AnalysisResult {
  listing: ListingData
  roast: RoastResult
  aeo: AEOResult
}
```

---

## Scoring Logic

### Listing Score (1–10)
```
Base: 10
-2 per critical issue
-1 per warning
-0.5 per suggestion
Floor: 1
```

### AEO Score (1–10)
```
Per model: (queriesMatched / totalQueries) * 10
Overall: average across all 3 models
```

---

## Futuristic Features (to mention in demo, not build now)

- **Weekly AEO tracking** — run analysis every week, show score trend over time
- **Competitor comparison** — scrape top 5 competitors, compare AEO + roast scores side by side
- **Pixii integration** — "Fix visuals" button that sends issues to Pixii's image generator
- **Reddit presence check** — show how often brand appears in subreddits (influences LLM training data)
- **Before/After export** — PDF report of original vs fixed listing

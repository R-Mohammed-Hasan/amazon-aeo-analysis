# Model Configuration — ListingIQ

How we chose each model, what it does, and why it's the right fit.

---

## Model Map

```
Scraping       →  Firecrawl
Query Gen      →  openai/gpt-4o-mini          (PARSER)
Roast          →  anthropic/claude-3.5-haiku  (WRITER)
Fix Engine     →  anthropic/claude-3.5-haiku  (WRITER)
AEO: GPT sim   →  openai/gpt-4o-mini
AEO: Claude sim→  anthropic/claude-haiku-4.5
AEO: Gemini sim→  google/gemini-2.5-flash-lite
AEO: Web search→  perplexity/sonar
```

---

## 1. Firecrawl — Page Scraping

**Role:** Turns any Amazon listing URL into clean, structured markdown.

**Why Firecrawl over raw scraping:**
- Amazon's listing pages are heavily JavaScript-rendered — a plain `fetch()` returns a skeleton page with no product data
- Firecrawl handles headless rendering, anti-bot measures, and cookie walls automatically
- Returns clean markdown (not raw HTML), which is directly usable in prompts without extra parsing overhead
- Handles both `amazon.in/dp/` and `amazon.in/gp/product/` URL formats

**What we extract:**
| Field | Source in Markdown |
|---|---|
| Title | First H1/H2 that isn't a breadcrumb link |
| Bullets | List items > 25 chars, no `›`, no markdown links |
| Description | Content under "About this item" section |
| Brand | `Brand: X` table row → "Visit the X Store" → capitalized word after "by" |
| Price | First `₹/$/£/€` currency match |
| BSR | "Best Sellers Rank #X" pattern |
| Images | `media-amazon.com/images/I/` URLs only (filters nav sprites) |

---

## 2. `openai/gpt-4o-mini` — PARSER

**Used for:** Structured JSON query generation

**Why GPT-4o-mini:**
- Best-in-class for following strict JSON schemas reliably — rarely hallucinates extra keys or breaks the array format
- Consistently returns parseable output even without `response_format: json_object`, which matters since OpenRouter doesn't always pass that flag through
- Fastest and cheapest OpenAI model — query generation is a simple task that doesn't need frontier-level intelligence
- Temperature: `0.3` — low randomness to ensure consistent JSON structure

**What it does:**
Reads the listing's `title`, `bullets`, `description`, and `category`, then generates 8 product-specific shopper queries that a real person would type into an AI assistant. Prompts include bad/good examples to enforce specificity over generic category queries.

**Why not a larger model here:**
A 120B+ parameter model is wasteful for structured output generation. GPT-4o-mini scores among the highest for instruction-following on JSON tasks. Bigger models add latency and cost with no quality gain on this specific subtask.

---

## 3. `anthropic/claude-3.5-haiku` — WRITER

**Used for:** Listing Roast (copy critique) + Fix Engine (rewrite generation)

**Why Claude 3.5 Haiku:**
- Anthropic's Claude models have consistently outperformed GPT on nuanced language tasks — they're trained with a stronger emphasis on natural language quality and comprehension
- Claude 3.5 Haiku specifically hits near-Sonnet quality at Haiku speed and price — Anthropic's own benchmarks show it matching Sonnet 3.5 on many language tasks
- For copy critique, Claude identifies _specific_ issues rather than generic feedback. GPT-4o-mini tends toward vague statements ("headline is weak") while Claude pinpoints the exact failure ("headline leads with brand name, not primary benefit — Amazon shoppers scan for benefit first")
- For fix generation, Claude's rewrites sound more natural and human — less like AI copy, which matters for Amazon listings where authenticity drives trust
- Temperature: `0.2` for roast (precise, consistent critique), `0.5` for fix (slightly more creative rewriting)

**Why not Claude Sonnet or Opus:**
Haiku 3.5 is sufficient for these tasks. Sonnet/Opus would add 3–5x cost and latency with marginal quality improvement for Amazon copy tasks specifically.

**Why not GPT-4o for writing:**
GPT-4o produces more templated-sounding copy. For Amazon listings, the fix output needs to sound like it was written by a human brand expert, not an AI. Claude consistently produces more varied, specific output on copywriting benchmarks.

---

## 4. AEO Models — Simulating Real AI Shoppers

The AEO diagnostic answers: _"If a shopper asks an AI assistant about this product category right now, does your brand get recommended?"_

Each model simulates a different shopper population.

### `openai/gpt-4o-mini` — ChatGPT simulation
**Why:** ChatGPT (powered by GPT models) is the most widely used AI assistant globally. If you're not being recommended by GPT, you're invisible to the largest pool of AI-assisted shoppers. Using `gpt-4o-mini` gives a close approximation of what GPT-4o would recommend — same training data patterns, similar preference signals.

### `anthropic/claude-haiku-4.5` — Claude simulation
**Why:** Claude is the second most widely used AI assistant. Using Haiku 4.5 (Anthropic's latest fast model) ensures we're simulating current Claude behaviour, not an outdated model that may have different recommendation patterns. Claude Haiku 4.5 matches Sonnet 4's performance on most tasks — it's the most representative Claude model for typical user queries.

### `google/gemini-2.5-flash-lite` — Gemini simulation
**Why:** Gemini is deeply integrated into Google Search, Google Assistant, and Android devices — it reaches a uniquely different user demographic (mobile-first, India-heavy, Google ecosystem users). For Amazon India sellers specifically, Gemini is a high-priority signal. Gemini 2.5 Flash Lite is Google's latest efficient model, representing what Gemini users actually see today.

### `perplexity/sonar` — Real-time web search
**Why this is the most important signal:**
- Perplexity's Sonar model doesn't answer from training data — it browses the web live before responding
- This means it reflects _current_ online sentiment: recent reviews, Reddit discussions, comparison articles, and news
- A brand that appears in Perplexity is appearing in sources that are actively indexed right now — this is the hardest AEO signal to fake and the most reliable indicator of real-world visibility
- All other models answer from training data (potentially months old). Perplexity answers from today's web

**Why not Perplexity Sonar Pro:**
Sonar Pro adds deeper citations and higher per-query cost. For the volume of queries we run (8 queries per analysis), Sonar is sufficient. Sonar Pro is better suited for deep research tasks, not recommendation simulation.

---

## 5. Why Not `openai/gpt-oss-120b`

This model was evaluated and rejected for our use case:

| Benchmark | Score |
|---|---|
| BenchLM overall | #83 / 115 |
| Instruction Following | #90 / 115 |

Instruction following at #90 means it's unreliable for our two most critical tasks:
- **JSON query generation** — we need a strict array format every time. Unreliable instruction following breaks JSON parsing.
- **Roast output** — we need consistent `{ section, severity, issue, original }` schema. A model at #90 for instruction following will hallucinate fields or misformat responses.

It's a strong reasoning/agentic model, not suited for structured output or copywriting tasks.

---

## Cost Estimate per Analysis

| Step | Model | ~Tokens | ~Cost |
|---|---|---|---|
| Query generation | gpt-4o-mini | 800 in / 200 out | $0.0001 |
| Roast | claude-3.5-haiku | 1,200 in / 600 out | $0.002 |
| AEO × 8 queries × 4 models | mixed | ~32,000 in / 16,000 out | $0.008 |
| Fix (per click) | claude-3.5-haiku | 500 in / 300 out | $0.0008 |
| **Total per full analysis** | | | **~$0.01** |

Approximately ₹0.85 per full analysis. Well within the ₹500 total budget for hundreds of demo runs.

---

## Changing a Model

All model IDs live in one place: `lib/openrouter.ts`

```typescript
export const MODELS = {
  PARSER: "openai/gpt-4o-mini",
  WRITER: "anthropic/claude-3.5-haiku",
  AEO_GPT:        "openai/gpt-4o-mini",
  AEO_CLAUDE:     "anthropic/claude-haiku-4.5",
  AEO_GEMINI:     "google/gemini-2.5-flash-lite",
  AEO_PERPLEXITY: "perplexity/sonar",
} as const
```

Swap any model ID here — the rest of the codebase reads from this object. No other files need changing.

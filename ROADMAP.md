# ListingIQ — Product Roadmap

---

## ✅ Shipped (v1)

| Feature | Description |
|---|---|
| Listing Roast | Claude critiques title, bullets, description — severity-ranked issues |
| Fix Engine | One-click AI rewrite for any flagged issue |
| AEO Diagnostic | Brand visibility check across GPT, Claude, Gemini, Perplexity |
| Parallel Analysis | Roast + AEO run simultaneously; panels load as data arrives |
| LLM-based Scraping | Claude Sonnet extracts structured product data from raw Firecrawl markdown |

---

## 🔜 Next Up

### One-Click Listing Updates (no copy-paste)

**Problem:** Sellers see a fix but still have to manually open Seller Central, navigate to the right field, and paste the text. Friction kills adoption.

**Approach — Browser Extension:**
- Extension injects a "Apply Fix" button directly inside Amazon Seller Central's listing editor
- ListingIQ sends the fixed copy to the extension via a local WebSocket or browser storage channel
- Extension auto-fills the correct field (title input, bullet textarea, description editor) without the seller leaving Seller Central
- Seller reviews pre-filled fields → clicks Save in Seller Central as normal

**Why extension, not API:**
Amazon's SP-API Listings API (`PATCH /listings/2021-08-01/items/{sku}`) requires Brand Registry + approved app credentials — a multi-week onboarding process. A browser extension works immediately for any seller, no approval needed.

**Flow:**
```
ListingIQ fix panel
  → "Apply to Seller Central" button
  → Extension receives fix payload
  → Seller Central listing editor fields auto-filled
  → Seller reviews + saves
```

---

## 🔭 Futuristic Features

### Competitor Benchmark
- Enter your ASIN + 3 competitor ASINs
- Side-by-side roast: whose title is stronger, who has better bullet structure, who ranks in more AEO responses
- Score delta: "You're 2.4 points behind the category leader on copy quality"

### Keyword Gap Analysis
- Cross-reference listing bullets against top 50 search terms for the category (via Jungle Scout / Helium 10 API)
- Flag high-volume keywords missing from title and bullets
- Suggest where to insert them without sounding keyword-stuffed

### AEO Time Series
- Re-run AEO diagnostic weekly automatically
- Track brand mention rate over time across each AI model
- Alert when visibility drops (e.g. "You dropped out of Perplexity recommendations this week")

### Review → Listing Intelligence
- Scrape top 50 reviews (positive + negative)
- Extract recurring praise phrases → suggest adding to bullets
- Extract recurring complaints → flag as listing gaps or product issues
- "37% of reviewers mention 'easy to clean' — your bullets don't mention it once"

### Image Score (Powered by Pixii)
- Analyze listing images against Amazon image best practices
- Score: lifestyle shot coverage, infographic quality, white background compliance, image count
- Direct handoff to Pixii AI to regenerate underperforming images

### Bulk Listing Audit
- Upload a CSV of ASINs (or connect Seller Central via SP-API)
- Roast + AEO score for every listing in one run
- Priority-ranked output: fix these 3 listings first for maximum revenue impact

### AI Listing Generator (Zero to Done)
- Input: product name, key specs, target customer, 3 USPs
- Output: complete listing — title, 7 bullets, full description, backend keywords
- Runs through the roast engine before delivery to ensure it scores ≥ 8/10 before you see it

### Category Trend Alerts
- Monitor what queries AI models are answering for your category weekly
- Alert when new query patterns emerge that your listing doesn't address
- "Shoppers are now asking about 'BPA-free' — your water purifier listing doesn't mention it"

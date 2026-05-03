import { ListingData } from '@/types'

/**
 * Query generation — uses GPT-4o-mini (best at structured JSON output).
 *
 * Critical fix: pass bullets + description so queries are product-specific,
 * not generic category queries.
 */
export function buildQueryGenPrompt(listing: ListingData): string {
  // Build a clean feature summary from bullets + description
  const features = [
    ...listing.bullets.filter(b => b.length > 10),
    listing.description ? listing.description.slice(0, 300) : '',
  ]
    .filter(Boolean)
    .join('\n')

  return `You are generating AEO test queries for a specific product. Your job is to write questions a real shopper would type into ChatGPT or Gemini when looking for THIS product.

PRODUCT DETAILS:
Title: ${listing.title || '(see features below)'}
Category: ${listing.category}
Brand: ${listing.brand} (DO NOT mention this brand in any query)
Key Features:
${features || 'No features extracted — use category and title clues only'}

RULES:
1. Queries MUST reference specific features of this product (capacity, wattage, technology, use-case, etc.)
2. Write exactly how a real shopper types — conversational, not keyword-style
3. Mix query types: best-for-use-case, comparison, problem-solving, specific-feature, value-based
4. NEVER include the brand name "${listing.brand}" in any query
5. Each query: 5–15 words

BAD (too generic): "What are the best kitchen appliances?"
GOOD (specific):   "best air fryer under 6000 rupees for Indian cooking"
GOOD (feature):    "7 litre air fryer 80 percent less oil worth it"
GOOD (use-case):   "air fryer that can roast and bake without preheating"

Return a JSON array of 8 strings ONLY. No other text:
["query 1", "query 2", ...]`
}

/**
 * Standard AEO query — for GPT, Claude, Gemini.
 * Prompts them to act as a helpful AI assistant making specific recommendations.
 */
export function buildAEOQueryPrompt(query: string): string {
  return `${query}

Recommend 3–5 specific products with exact brand names. Be direct — name the product, say why it's good.`
}

/**
 * Perplexity-specific — searches the web live.
 * No formatting instructions. Let it browse and respond naturally.
 */
export function buildPerplexityQueryPrompt(query: string): string {
  return `${query}

What are the best options available right now? Include specific brand names.`
}

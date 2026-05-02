import { ListingData } from '@/types'

export function buildQueryGenPrompt(listing: ListingData): string {
  return `Generate 10 realistic shopper queries someone would type into an AI assistant (like ChatGPT or Google Gemini) when looking for a product like this.

Product: ${listing.title}
Brand: ${listing.brand}
Category: ${listing.category}

Rules:
- Write queries as a real shopper would ask, not keyword-style
- Mix: general ("best X for Y"), comparative ("X vs Y"), use-case ("X for seniors"), problem-based ("help with Z")
- Do NOT include the brand name in any query
- Return a JSON array of 10 strings ONLY, no explanation

Example format: ["best magnesium for leg cramps", "which magnesium supplement helps with sleep", ...]`
}

export function buildAEOQueryPrompt(query: string, brand: string, title: string): string {
  return `${query}

Please recommend specific products with brand names. Be detailed about why each product is good.`
}

export function buildMentionCheckPrompt(response: string, brand: string, title: string): string {
  return `Given this AI response about a product query, check if the brand "${brand}" or product "${title}" is mentioned.

RESPONSE:
${response}

Return JSON only:
{
  "mentioned": true | false,
  "position": <1-based position if mentioned, null if not>,
  "excerpt": "<the exact sentence mentioning it, or null>"
}`
}

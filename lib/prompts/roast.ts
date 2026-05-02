import { ListingData } from '@/types'

export function buildRoastPrompt(listing: ListingData): string {
  return `You are a brutally honest Amazon listing expert. Analyze this listing and identify every weakness.

LISTING DATA:
Title: ${listing.title}

Bullet Points:
${listing.bullets.map((b, i) => `${i + 1}. ${b}`).join('\n')}

Description:
${listing.description || '(none provided)'}

Brand: ${listing.brand}
Category: ${listing.category}
Rating: ${listing.rating} (${listing.reviewCount} reviews)

Return a JSON object ONLY (no markdown, no explanation) in this exact format:
{
  "score": <number 1-10>,
  "issues": [
    {
      "section": "title" | "bullets" | "description",
      "severity": "critical" | "warning" | "suggestion",
      "issue": "<one line description of the problem>",
      "original": "<the exact copy that has the problem>"
    }
  ]
}

Rules:
- Be brutal and specific. "Weak headline" is not specific. "Headline leads with brand name instead of primary benefit" is.
- critical = losing sales right now
- warning = missed opportunity
- suggestion = nice to have
- Find at least 5 issues, max 12.
- Focus on: keyword gaps, features-vs-benefits, vague claims, missing social proof, weak CTAs, generic language`
}

import { ListingData } from '@/types'

/**
 * Optimized for Claude — Claude excels at nuanced language critique.
 * Structured output with concrete examples rather than vague feedback.
 */
export function buildRoastPrompt(listing: ListingData): string {
  return `You are a senior Amazon conversion rate specialist with 10 years of A/B testing experience. Your job is to ruthlessly critique this listing's copy.

LISTING:
Title: ${listing.title}

Bullets:
${listing.bullets.map((b, i) => `${i + 1}. ${b}`).join('\n') || '(none)'}

Description:
${listing.description || '(none)'}

Brand: ${listing.brand || 'Unknown'}
Category: ${listing.category || 'Unknown'}
Rating: ${listing.rating} (${listing.reviewCount} reviews)

TASK: Find every copy weakness that is losing this seller conversions. Be surgical — name the exact failure, not a generic comment.

Bad example: "Headline is weak" ← too vague
Good example: "Headline opens with brand name instead of the #1 shopper benefit — Amazon shoppers scan titles for benefits first" ← specific and actionable

Return ONLY valid JSON (no markdown fences):
{
  "issues": [
    {
      "section": "title" | "bullets" | "description",
      "severity": "critical" | "warning" | "suggestion",
      "issue": "<specific one-line diagnosis>",
      "original": "<exact copy that has the problem, max 120 chars>"
    }
  ]
}

Severity guide:
- critical = actively losing sales (weak benefit, keyword miss, trust killer)
- warning = missed opportunity (vague claim, feature without benefit, no differentiation)
- suggestion = polish (tone, flow, missing social proof, weak CTA)

Find 6–10 issues. Focus on: missing primary keyword in title, features-not-benefits, vague superlatives ("best", "premium", "high quality"), absent social proof, no use-case specificity, weak or missing CTAs, and missed keyword variations.`
}

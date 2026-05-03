import { FixRequest } from '@/types'

/**
 * Optimized for Claude — Claude produces more natural, persuasive copy than GPT.
 * Grounded in Amazon-specific conversion principles.
 */
export function buildFixPrompt(req: FixRequest): string {
  return `You are an expert Amazon copywriter. Rewrite the section below to fix the identified problem.

Product: ${req.listingContext.title}
Brand: ${req.listingContext.brand}
Category: ${req.listingContext.category}
Section: ${req.section}
Problem: ${req.issue}

Original:
${req.content}

Rewrite rules:
- Lead with the primary benefit, not the feature or brand name
- Use specific, credible language — no vague superlatives ("best", "premium", "amazing")
- If it's a bullet point, use "Action word + benefit + proof/specificity" structure
- Match the tone of a confident, trusted brand — not salesy
- Keep it Amazon-scannable: punchy, concrete, benefit-forward

Return ONLY the rewritten copy — no explanation, no preamble, no quotes around it.`
}

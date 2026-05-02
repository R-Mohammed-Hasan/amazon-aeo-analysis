import { FixRequest } from '@/types'

export function buildFixPrompt(req: FixRequest): string {
  return `You are an expert Amazon copywriter. Fix the following listing section.

Product: ${req.listingContext.title}
Brand: ${req.listingContext.brand}
Category: ${req.listingContext.category}

Section to fix: ${req.section}
Problem identified: ${req.issue}

Original copy:
${req.content}

Write an improved version that fixes the identified problem. Be specific, benefit-focused, and conversion-optimized.
Return the improved copy ONLY — no explanation, no preamble.`
}

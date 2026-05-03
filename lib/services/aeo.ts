import { chat, MODELS } from '@/lib/openrouter'
import { buildQueryGenPrompt, buildAEOQueryPrompt, buildPerplexityQueryPrompt } from '@/lib/prompts/aeo'
import { calcAEOScore } from '@/lib/utils/score'
import { ListingData, AEOModelResult, AEOResult } from '@/types'

/**
 * Deterministic mention detection — replaces 30 extra LLM calls.
 * Checks if the brand name appears in the response text, estimates position
 * by counting numbered list items before the first mention.
 */
function detectMention(
  response: string,
  brand: string,
): { mentioned: boolean; position: number | null } {
  if (!brand || brand.trim().length < 2) return { mentioned: false, position: null }

  const text       = response.toLowerCase()
  const brandLower = brand.toLowerCase().trim()

  if (!text.includes(brandLower)) return { mentioned: false, position: null }

  const brandIdx    = text.indexOf(brandLower)
  const beforeBrand = text.slice(0, brandIdx)

  // Count numbered list items (1. 2. 3.) before the brand mention
  const numbered = beforeBrand.match(/\b\d+[.)]/g)
  const position = numbered ? numbered.length + 1 : 1

  return { mentioned: true, position }
}

const AEO_MODELS: Array<{ id: string; label: string; isPerplexity?: boolean }> = [
  { id: MODELS.AEO_GPT,        label: 'ChatGPT' },
  { id: MODELS.AEO_CLAUDE,     label: 'Claude' },
  { id: MODELS.AEO_GEMINI,     label: 'Gemini' },
  { id: MODELS.AEO_PERPLEXITY, label: 'Perplexity', isPerplexity: true },
]

export async function runAEO(listing: ListingData): Promise<AEOResult> {
  // Step 1: generate queries — GPT-4o-mini is best at structured JSON output
  const queryRaw  = await chat(MODELS.PARSER, buildQueryGenPrompt(listing))
  const queryJson = queryRaw.replace(/```json|```/g, '').trim()
  const queries: string[] = JSON.parse(queryJson)

  // Step 2: query all 4 models in parallel; each runs all queries in parallel
  const modelResults: AEOModelResult[] = await Promise.all(
    AEO_MODELS.map(async ({ id, label, isPerplexity }) => {
      const queryResults = await Promise.all(
        queries.map(async (query) => {
          const prompt   = isPerplexity
            ? buildPerplexityQueryPrompt(query)
            : buildAEOQueryPrompt(query)

          // Graceful fallback if a model errors
          let response = ''
          try {
            response = await chat(id, prompt, 0.4)
          } catch {
            return { mentioned: false, position: null }
          }

          return detectMention(response, listing.brand)
        }),
      )

      const mentioned   = queryResults.filter(r => r.mentioned)
      const avgPosition = mentioned.length > 0
        ? Math.round(mentioned.reduce((s, r) => s + (r.position ?? 1), 0) / mentioned.length)
        : null

      return {
        model:          id,
        modelLabel:     label,
        mentioned:      mentioned.length > 0,
        position:       avgPosition,
        queriesMatched: mentioned.length,
        totalQueries:   queries.length,
      }
    }),
  )

  return {
    score:   calcAEOScore(modelResults),
    queries,
    results: modelResults,
  }
}

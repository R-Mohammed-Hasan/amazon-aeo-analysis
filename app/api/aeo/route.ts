import { NextRequest, NextResponse } from 'next/server'
import { chat, MODELS } from '@/lib/openrouter'
import { buildQueryGenPrompt, buildAEOQueryPrompt, buildMentionCheckPrompt } from '@/lib/prompts/aeo'
import { calcAEOScore } from '@/lib/utils/score'
import { ListingData, AEOModelResult, AEOResult } from '@/types'

const AEO_MODELS = [
  { id: MODELS.GPT, label: 'ChatGPT' },
  { id: MODELS.CLAUDE, label: 'Claude' },
  { id: MODELS.GEMINI, label: 'Gemini' },
]

export async function POST(req: NextRequest) {
  const listing: ListingData = await req.json()

  try {
    // Step 1: generate queries from listing data
    const queryRaw = await chat(MODELS.ORCHESTRATOR, buildQueryGenPrompt(listing))
    const queryJson = queryRaw.replace(/```json|```/g, '').trim()
    const queries: string[] = JSON.parse(queryJson)

    // Step 2: for each model, run all queries in parallel
    const modelResults: AEOModelResult[] = await Promise.all(
      AEO_MODELS.map(async ({ id, label }) => {
        const queryResults = await Promise.all(
          queries.map(async (query) => {
            const response = await chat(id, buildAEOQueryPrompt(query, listing.brand, listing.title))
            const checkRaw = await chat(
              MODELS.ORCHESTRATOR,
              buildMentionCheckPrompt(response, listing.brand, listing.title)
            )
            const checkJson = checkRaw.replace(/```json|```/g, '').trim()
            return JSON.parse(checkJson) as { mentioned: boolean; position: number | null }
          })
        )

        const mentioned = queryResults.filter(r => r.mentioned)
        const avgPosition = mentioned.length > 0
          ? Math.round(mentioned.reduce((s, r) => s + (r.position ?? 1), 0) / mentioned.length)
          : null

        return {
          model: id,
          modelLabel: label,
          mentioned: mentioned.length > 0,
          position: avgPosition,
          queriesMatched: mentioned.length,
          totalQueries: queries.length,
        }
      })
    )

    const result: AEOResult = {
      score: calcAEOScore(modelResults),
      queries,
      results: modelResults,
    }

    return NextResponse.json(result)
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'AEO analysis failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

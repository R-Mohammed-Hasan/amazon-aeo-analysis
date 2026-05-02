import { NextRequest, NextResponse } from 'next/server'
import { chat, MODELS } from '@/lib/openrouter'
import { buildRoastPrompt } from '@/lib/prompts/roast'
import { calcRoastScore } from '@/lib/utils/score'
import { ListingData, RoastResult } from '@/types'

export async function POST(req: NextRequest) {
  const listing: ListingData = await req.json()

  try {
    const raw = await chat(MODELS.ORCHESTRATOR, buildRoastPrompt(listing))
    const cleaned = raw.replace(/```json|```/g, '').trim()
    const parsed = JSON.parse(cleaned)

    const result: RoastResult = {
      score: calcRoastScore(parsed.issues),
      issues: parsed.issues,
    }

    return NextResponse.json(result)
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Roast failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

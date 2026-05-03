import { chat, MODELS } from '@/lib/openrouter'
import { buildRoastPrompt } from '@/lib/prompts/roast'
import { calcRoastScore } from '@/lib/utils/score'
import { ListingData, RoastResult } from '@/types'

export async function runRoast(listing: ListingData): Promise<RoastResult> {
  // Claude is used here — better nuanced critique than GPT for copy analysis
  const raw     = await chat(MODELS.WRITER, buildRoastPrompt(listing), 0.2)
  const cleaned = raw.replace(/```json|```/g, '').trim()
  const parsed  = JSON.parse(cleaned)

  return {
    score:  calcRoastScore(parsed.issues),
    issues: parsed.issues,
  }
}

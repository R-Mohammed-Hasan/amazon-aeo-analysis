import { NextRequest, NextResponse } from 'next/server'
import { chat, MODELS } from '@/lib/openrouter'
import { buildFixPrompt } from '@/lib/prompts/fix'
import { FixRequest } from '@/types'

export async function POST(req: NextRequest) {
  const body: FixRequest = await req.json()

  try {
    const fixed = await chat(MODELS.ORCHESTRATOR, buildFixPrompt(body))
    return NextResponse.json({ fixed })
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Fix failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

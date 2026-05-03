import { NextRequest, NextResponse } from 'next/server'
import { runRoast } from '@/lib/services/roast'
import { ListingData } from '@/types'

export async function POST(req: NextRequest) {
  const listing: ListingData = await req.json()
  try {
    return NextResponse.json(await runRoast(listing))
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Roast failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

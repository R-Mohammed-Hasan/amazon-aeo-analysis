import { NextRequest, NextResponse } from 'next/server'
import { runAEO } from '@/lib/services/aeo'
import { ListingData } from '@/types'

export async function POST(req: NextRequest) {
  const listing: ListingData = await req.json()
  try {
    return NextResponse.json(await runAEO(listing))
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'AEO analysis failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

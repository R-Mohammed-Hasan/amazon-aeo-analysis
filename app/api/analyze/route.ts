import { NextRequest, NextResponse } from 'next/server'
import { scrapeAmazonListing } from '@/lib/firecrawl'
import { runRoast } from '@/lib/services/roast'
import { runAEO } from '@/lib/services/aeo'
import { AnalysisResult } from '@/types'

// No internal fetch() — services are called directly in-process.
export async function POST(req: NextRequest) {
  const { url } = await req.json()
  if (!url) return NextResponse.json({ error: 'URL required' }, { status: 400 })

  try {
    const listing = await scrapeAmazonListing(url)
    const [roast, aeo] = await Promise.all([runRoast(listing), runAEO(listing)])
    const result: AnalysisResult = { listing, roast, aeo }
    return NextResponse.json(result)
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Analysis failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

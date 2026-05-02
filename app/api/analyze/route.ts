import { NextRequest, NextResponse } from 'next/server'
import { scrapeAmazonListing } from '@/lib/firecrawl'
import { AnalysisResult } from '@/types'

export async function POST(req: NextRequest) {
  const { url } = await req.json()
  if (!url) return NextResponse.json({ error: 'URL required' }, { status: 400 })

  try {
    // Phase 1: scrape
    const listing = await scrapeAmazonListing(url)

    // Phase 2: roast + AEO in parallel
    const base = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

    const [roastRes, aeoRes] = await Promise.all([
      fetch(`${base}/api/roast`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(listing),
      }),
      fetch(`${base}/api/aeo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(listing),
      }),
    ])

    const [roast, aeo] = await Promise.all([roastRes.json(), aeoRes.json()])

    if (roast.error) throw new Error(roast.error)
    if (aeo.error) throw new Error(aeo.error)

    const result: AnalysisResult = { listing, roast, aeo }
    return NextResponse.json(result)
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Analysis failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

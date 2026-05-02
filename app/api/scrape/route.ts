import { NextRequest, NextResponse } from 'next/server'
import { scrapeAmazonListing } from '@/lib/firecrawl'

export async function POST(req: NextRequest) {
  const { url } = await req.json()
  if (!url) return NextResponse.json({ error: 'URL required' }, { status: 400 })

  try {
    const listing = await scrapeAmazonListing(url)
    return NextResponse.json(listing)
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Scrape failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

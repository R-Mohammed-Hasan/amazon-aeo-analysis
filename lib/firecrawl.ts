import FirecrawlApp from '@mendable/firecrawl-js'
import { ListingData } from '@/types'

const firecrawl = new FirecrawlApp({ apiKey: process.env.FIRECRAWL_API_KEY! })

export async function scrapeAmazonListing(url: string): Promise<ListingData> {
  const result = await firecrawl.scrape(url, {
    formats: ['markdown'],
  })

  if (!result.markdown) {
    throw new Error('Failed to scrape listing — no content returned')
  }

  return parseListing(result.markdown, url)
}

function parseListing(markdown: string, url: string): ListingData {
  const asinMatch = url.match(/\/dp\/([A-Z0-9]{10})/)
  const asin = asinMatch?.[1] ?? ''

  const titleMatch = markdown.match(/^#\s+(.+)/m)
  const title = titleMatch?.[1]?.trim() ?? ''

  const bulletMatches = markdown.match(/^[-•]\s+(.+)/gm) ?? []
  const bullets = bulletMatches.slice(0, 7).map(b => b.replace(/^[-•]\s+/, '').trim())

  const priceMatch = markdown.match(/[₹$£€]\s?[\d,]+\.?\d*/)?.[0] ?? ''
  const ratingMatch = markdown.match(/([\d.]+)\s+out of\s+5/)?.[1] ?? ''
  const reviewMatch = markdown.match(/([\d,]+)\s+ratings?/)?.[1] ?? ''
  const bsrMatch = markdown.match(/Best Sellers Rank[^#\n]*#([\d,]+)/)?.[1] ?? ''
  const brandMatch = markdown.match(/(?:Brand|by)\s*[:\s]+([A-Za-z0-9 &]+)/i)?.[1]?.trim() ?? ''
  const categoryMatch = markdown.match(/in\s+([A-Za-z &]+)\s*\(/)?.[1]?.trim() ?? ''

  const imageMatches = markdown.match(/https?:\/\/[^\s"')]+\.(jpg|jpeg|png|webp)[^\s"')']*/gi) ?? []
  const imageUrls = [...new Set(imageMatches)].slice(0, 6)

  const descMatch = markdown.match(/(?:Product Description|About this item)[^\n]*\n+([\s\S]{100,500})/i)?.[1]?.trim() ?? ''

  return {
    asin,
    title,
    bullets,
    description: descMatch,
    brand: brandMatch,
    category: categoryMatch,
    price: priceMatch,
    bsr: bsrMatch,
    imageUrls,
    rating: ratingMatch,
    reviewCount: reviewMatch,
  }
}

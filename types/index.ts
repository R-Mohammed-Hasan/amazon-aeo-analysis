export interface ListingData {
  asin: string
  title: string
  bullets: string[]
  description: string
  brand: string
  category: string
  price: string
  bsr: string
  imageUrls: string[]
  rating: string
  reviewCount: string
}

export interface RoastIssue {
  section: 'title' | 'bullets' | 'description'
  severity: 'critical' | 'warning' | 'suggestion'
  issue: string
  original: string
}

export interface RoastResult {
  score: number
  issues: RoastIssue[]
}

export interface AEOModelResult {
  model: string
  modelLabel: string
  mentioned: boolean
  position: number | null
  queriesMatched: number
  totalQueries: number
}

export interface AEOResult {
  score: number
  queries: string[]
  results: AEOModelResult[]
}

export interface AnalysisResult {
  listing: ListingData
  roast: RoastResult
  aeo: AEOResult
}

export interface FixRequest {
  section: string
  content: string
  issue: string
  listingContext: Pick<ListingData, 'title' | 'brand' | 'category'>
}

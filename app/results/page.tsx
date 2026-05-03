'use client'
import { useEffect, useState, useCallback, useRef, Suspense, memo } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { ListingData, RoastResult, AEOResult, RoastIssue } from '@/types'
import { ScoreRing } from '@/components/ui/ScoreRing'
import { RoastReport } from '@/components/analysis/RoastReport'
import { AEOReport } from '@/components/analysis/AEOReport'
import { FixPanel } from '@/components/analysis/FixPanel'
import { RoastSkeleton, AEOSkeleton } from '@/components/ui/Skeleton'

// ─── Memoised panels — only re-render when their own data changes ────────────
const RoastPanel = memo(function RoastPanel({
  roast, listing, onFix, fixingId,
}: {
  roast: RoastResult | null
  listing: ListingData
  onFix: (issue: RoastIssue, key: string) => void
  fixingId: string | null
}) {
  return (
    <section className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 animate-fade-up"
             style={{ boxShadow: 'inset 0 1px 0 rgba(245,158,11,0.06)' }}>
      {roast
        ? <RoastReport result={roast} listing={listing} onFix={onFix} fixingId={fixingId} />
        : <RoastSkeleton />
      }
    </section>
  )
})

const AEOPanel = memo(function AEOPanel({ aeo }: { aeo: AEOResult | null }) {
  return (
    <section className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 animate-fade-up delay-1"
             style={{ boxShadow: 'inset 0 1px 0 rgba(99,102,241,0.06)' }}>
      {aeo
        ? <AEOReport result={aeo} />
        : <AEOSkeleton />
      }
    </section>
  )
})

// ─── Main content ────────────────────────────────────────────────────────────
function ResultsContent() {
  const params = useSearchParams()
  const router = useRouter()
  const url    = params.get('url') ?? ''

  const [listing,  setListing]  = useState<ListingData | null>(null)
  const [roast,    setRoast]    = useState<RoastResult | null>(null)
  const [aeo,      setAeo]      = useState<AEOResult | null>(null)
  const [error,    setError]    = useState('')
  const [scraping, setScraping] = useState(true)

  const [fixingId,    setFixingId]    = useState<string | null>(null)
  const [fixingIssue, setFixingIssue] = useState<RoastIssue | null>(null)
  const [fixedCopy,   setFixedCopy]   = useState<{ issue: string; fixed: string } | null>(null)
  const isFixingRef = useRef(false)   // ref-based guard: immune to StrictMode double-invoke

  useEffect(() => {
    if (!url) { router.push('/'); return }

    async function run() {
      try {
        // Step 1: Scrape listing
        setScraping(true)
        const scrapeRes  = await fetch('/api/scrape', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url }),
        })
        const listingData: ListingData = await scrapeRes.json()
        if ((listingData as { error?: string }).error) throw new Error((listingData as { error?: string }).error)
        setListing(listingData)
        setScraping(false)

        // Step 2: Roast + AEO in parallel — each panel renders as its data arrives
        // (rerender-functional-setstate: use functional updates for stable closures)
        await Promise.all([
          fetch('/api/roast', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(listingData),
          })
            .then(r => r.json())
            .then(data => {
              if (!data.error) setRoast(data)
            }),
          fetch('/api/aeo', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(listingData),
          })
            .then(r => r.json())
            .then(data => {
              if (!data.error) setAeo(data)
            }),
        ])
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Analysis failed')
        setScraping(false)
      }
    }
    run()
  }, [url, router])

  // key comes from RoastReport (sev-idx) so fixingId === key check actually works
  const handleFix = useCallback(async (issue: RoastIssue, key: string) => {
    if (!listing || isFixingRef.current) return  // guard: one fix at a time
    isFixingRef.current = true
    setFixingId(key)
    setFixingIssue(issue)

    try {
      const res = await fetch('/api/fix', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          section: issue.section,
          content: issue.original,
          issue:   issue.issue,
          listingContext: {
            title:    listing.title,
            brand:    listing.brand,
            category: listing.category,
          },
        }),
      })
      const data = await res.json()
      if (data.fixed) setFixedCopy({ issue: issue.issue, fixed: data.fixed })
    } finally {
      isFixingRef.current = false
      setFixingId(null)
    }
  }, [listing])

  // ── Scraping state ──
  if (scraping) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center gap-8 px-4">
        <div className="relative flex items-center justify-center w-16 h-16">
          <div className="absolute inset-0 rounded-full border border-[var(--accent)]/20 animate-ping"
               style={{ animationDuration: '2s' }} />
          <div className="w-12 h-12 rounded-full border-2 border-[var(--border-lit)] border-t-[var(--accent)] animate-spin"
               style={{ animationDuration: '1s' }} />
          <span className="absolute text-xs font-extrabold text-[var(--accent)]">IQ</span>
        </div>
        <div className="text-center">
          <p className="font-bold text-[var(--fg)] text-lg tracking-tight mb-1">Scraping listing…</p>
          <p className="text-sm text-[var(--muted)] font-normal">Fetching title, bullets &amp; images via Firecrawl</p>
        </div>
        <div className="w-64 h-1 rounded-full bg-[var(--border)] overflow-hidden">
          <div className="h-full w-1/4 rounded-full bg-[var(--accent)]"
               style={{ animation: 'indeterminate 1.5s ease-in-out infinite' }} />
        </div>
      </main>
    )
  }

  // ── Error state ──
  if (error) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center gap-5 px-4">
        <div className="w-10 h-10 rounded-full bg-[var(--critical-bg)] border border-[var(--critical)]/30 flex items-center justify-center text-[var(--critical)] text-xl">✕</div>
        <div className="text-center">
          <p className="font-bold text-[var(--fg)] mb-1">Analysis failed</p>
          <p className="text-sm text-[var(--muted)] max-w-xs font-normal">{error}</p>
        </div>
        <button onClick={() => router.push('/')}
                className="text-sm text-[var(--accent)] hover:text-[var(--fg)] transition-colors">
          ← Try another URL
        </button>
      </main>
    )
  }

  if (!listing) return null

  const doneCount = [roast, aeo].filter(Boolean).length

  return (
    <main className="min-h-screen px-4 pb-20 max-w-5xl mx-auto">

      {/* ── Sticky Header ── */}
      <div className="sticky top-0 z-20 py-4 mb-6"
           style={{ background: 'linear-gradient(to bottom, var(--bg) 80%, transparent)' }}>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <button onClick={() => router.push('/')}
                  className="flex items-center gap-2 text-sm text-[var(--fg)] hover:opacity-80 transition-opacity group">
            <span className="text-[var(--muted)] group-hover:-translate-x-0.5 transition-transform">←</span>
            <span className="font-extrabold tracking-tight text-base">
              Listing<span className="text-[var(--accent)]">IQ</span>
            </span>
          </button>

          <div className="flex items-center gap-4">
            {/* Progress pill while loading */}
            {doneCount < 2 && (
              <span className="hidden sm:flex items-center gap-1.5 text-xs text-[var(--muted)] bg-[var(--card)] border border-[var(--border)] px-3 py-1 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-pulse" />
                {doneCount === 0 ? 'Analysing…' : 'AEO querying 4 models…'}
              </span>
            )}
            <div className="flex gap-5">
              <ScoreRing score={roast?.score ?? 0} label="Listing" color="var(--roast)" />
              <ScoreRing score={aeo?.score   ?? 0} label="AEO"     color="var(--accent)" />
            </div>
          </div>
        </div>
      </div>

      {/* ── Product Info ── */}
      <div className="mb-6 animate-fade-up">
        <h1 className="text-2xl font-extrabold text-[var(--fg)] leading-snug mb-3 max-w-3xl">{listing.title}</h1>
        <div className="flex gap-2 flex-wrap">
          {listing.brand    && <Chip>{listing.brand}</Chip>}
          {listing.category && <Chip>{listing.category}</Chip>}
          {listing.price    && <Chip style={{ fontFamily: 'var(--font-mono)' }}>{listing.price}</Chip>}
          {listing.rating   && <Chip>⭐ {listing.rating} · {listing.reviewCount}</Chip>}
          {listing.bsr      && <Chip>BSR #{listing.bsr}</Chip>}
        </div>
      </div>

      {/* ── Two-column Analysis ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <RoastPanel roast={roast} listing={listing} onFix={handleFix} fixingId={fixingId} />
        <AEOPanel aeo={aeo} />
      </div>

      {/* ── Pixii CTA — visuals are the next step after fixing copy ── */}
      {roast && aeo && (
        <div className="mt-6 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-fade-up delay-2">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl shrink-0 flex items-center justify-center text-base"
                 style={{ background: 'linear-gradient(135deg, #7C6CF8, #F59E0B)', opacity: 0.9 }}>
              ✦
            </div>
            <div>
              <p className="font-bold text-[var(--fg)] text-sm">Copy fixes need matching visuals</p>
              <p className="text-xs text-[var(--muted)] font-normal mt-0.5 max-w-sm">
                Better listing images convert 20–40% more than copy alone. Pixii AI generates studio-quality lifestyle photos &amp; infographics from your product images.
              </p>
            </div>
          </div>
          <a
            href="https://www.pixii.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all active:scale-95 hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #7C6CF8, #9D6CF8)', color: '#fff' }}
          >
            Try Pixii →
          </a>
        </div>
      )}

      {/* Fix panel overlay */}
      {fixedCopy && (
        <FixPanel
          issue={fixedCopy.issue}
          fixed={fixedCopy.fixed}
          onClose={() => { setFixedCopy(null); setFixingIssue(null) }}
        />
      )}

      {/* Generating toast */}
      {fixingIssue && !fixedCopy && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-[var(--card)] border border-[var(--border-lit)] rounded-full px-5 py-2.5 text-sm text-[var(--muted)] flex items-center gap-2.5 shadow-2xl animate-fade-up z-40">
          <span className="w-3.5 h-3.5 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
          Generating improved copy with Claude…
        </div>
      )}
    </main>
  )
}

// ─── Exports ─────────────────────────────────────────────────────────────────
export default function ResultsPage() {
  return (
    <Suspense>
      <ResultsContent />
    </Suspense>
  )
}

function Chip({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <span style={style}
          className="text-xs bg-[var(--faint)] border border-[var(--border)] text-[var(--muted)] px-2.5 py-1 rounded-lg font-normal">
      {children}
    </span>
  )
}

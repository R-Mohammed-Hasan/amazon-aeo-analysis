'use client'
import { useEffect, useState, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { AnalysisResult, RoastIssue } from '@/types'
import { ScoreRing } from '@/components/ui/ScoreRing'
import { RoastReport } from '@/components/analysis/RoastReport'
import { AEOReport } from '@/components/analysis/AEOReport'
import { FixPanel } from '@/components/analysis/FixPanel'

type Step = 'scraping' | 'analyzing' | 'done' | 'error'

const STEPS: Record<Step, string> = {
  scraping:  '🔍 Scraping Amazon listing…',
  analyzing: '⚡ Running roast + AEO analysis in parallel…',
  done:      '',
  error:     '',
}

export default function ResultsPage() {
  const params = useSearchParams()
  const router = useRouter()
  const url = params.get('url') ?? ''

  const [step, setStep] = useState<Step>('scraping')
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [errorMsg, setErrorMsg] = useState('')

  const [fixingIssue, setFixingIssue] = useState<RoastIssue | null>(null)
  const [fixingId, setFixingId] = useState<string | null>(null)
  const [fixedCopy, setFixedCopy] = useState<{ issue: string; fixed: string } | null>(null)

  useEffect(() => {
    if (!url) { router.push('/'); return }

    async function run() {
      try {
        setStep('scraping')
        await new Promise(r => setTimeout(r, 600))
        setStep('analyzing')

        const res = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url }),
        })
        const data = await res.json()
        if (data.error) throw new Error(data.error)

        setResult(data)
        setStep('done')
      } catch (e: unknown) {
        setErrorMsg(e instanceof Error ? e.message : 'Analysis failed')
        setStep('error')
      }
    }

    run()
  }, [url, router])

  const handleFix = useCallback(async (issue: RoastIssue) => {
    if (!result) return
    const id = `${issue.severity}-${issue.issue.slice(0, 20)}`
    setFixingId(id)
    setFixingIssue(issue)

    const res = await fetch('/api/fix', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        section: issue.section,
        content: issue.original,
        issue: issue.issue,
        listingContext: {
          title: result.listing.title,
          brand: result.listing.brand,
          category: result.listing.category,
        },
      }),
    })
    const data = await res.json()
    setFixingId(null)
    if (data.fixed) setFixedCopy({ issue: issue.issue, fixed: data.fixed })
  }, [result])

  if (step !== 'done') {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center gap-6 px-4">
        {step === 'error' ? (
          <div className="text-center flex flex-col gap-4">
            <p className="text-[var(--critical)] font-semibold">Analysis failed</p>
            <p className="text-[var(--muted)] text-sm max-w-sm">{errorMsg}</p>
            <button onClick={() => router.push('/')} className="text-sm text-[var(--accent)] underline">← Try again</button>
          </div>
        ) : (
          <>
            <div className="w-8 h-8 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-[var(--muted)]">{STEPS[step]}</p>
          </>
        )}
      </main>
    )
  }

  if (!result) return null

  const { listing, roast, aeo } = result

  return (
    <main className="min-h-screen px-4 py-10 max-w-5xl mx-auto flex flex-col gap-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex flex-col gap-1">
          <button onClick={() => router.push('/')} className="text-xs text-[var(--muted)] hover:text-[var(--foreground)] transition-colors mb-1">← New analysis</button>
          <h1 className="text-lg font-bold text-[var(--foreground)] leading-snug max-w-xl">{listing.title}</h1>
          <div className="flex gap-3 flex-wrap mt-1">
            {listing.brand && <Chip>{listing.brand}</Chip>}
            {listing.category && <Chip>{listing.category}</Chip>}
            {listing.price && <Chip>{listing.price}</Chip>}
            {listing.rating && <Chip>⭐ {listing.rating} ({listing.reviewCount})</Chip>}
          </div>
        </div>
        <div className="flex gap-6">
          <ScoreRing score={roast.score} label="Listing" />
          <ScoreRing score={aeo.score} label="AEO" />
        </div>
      </div>

      {/* Two-column analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
          <RoastReport
            result={roast}
            listing={listing}
            onFix={handleFix}
            fixingId={fixingId}
          />
        </section>
        <section className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
          <AEOReport result={aeo} />
        </section>
      </div>

      {/* Fix panel overlay */}
      {fixedCopy && (
        <FixPanel
          issue={fixedCopy.issue}
          fixed={fixedCopy.fixed}
          onClose={() => { setFixedCopy(null); setFixingIssue(null) }}
        />
      )}

      {fixingIssue && !fixedCopy && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-[var(--card)] border border-[var(--border)] rounded-full px-5 py-2.5 text-sm text-[var(--muted)] flex items-center gap-2 shadow-xl">
          <span className="w-4 h-4 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
          Generating fix…
        </div>
      )}
    </main>
  )
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-xs bg-[var(--background)] border border-[var(--border)] text-[var(--muted)] px-2.5 py-0.5 rounded-full">
      {children}
    </span>
  )
}

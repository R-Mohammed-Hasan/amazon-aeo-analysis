'use client'
import { useState } from 'react'
import { RoastResult, RoastIssue, ListingData } from '@/types'
import { Badge } from '@/components/ui/Badge'

type Props = {
  result: RoastResult
  listing: ListingData
  onFix: (issue: RoastIssue) => void
  fixingId: string | null
}

export function RoastReport({ result, listing: _listing, onFix, fixingId }: Props) {
  const [expanded, setExpanded] = useState<number | null>(null)

  const grouped = {
    critical:   result.issues.filter(i => i.severity === 'critical'),
    warning:    result.issues.filter(i => i.severity === 'warning'),
    suggestion: result.issues.filter(i => i.severity === 'suggestion'),
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-[var(--foreground)]">Listing Roast</h2>
        <span className="text-sm text-[var(--muted)]">{result.issues.length} issues found</span>
      </div>

      {(['critical', 'warning', 'suggestion'] as const).map(sev =>
        grouped[sev].length > 0 && (
          <div key={sev} className="flex flex-col gap-2">
            <p className="text-xs font-semibold uppercase tracking-widest text-[var(--muted)]">{sev}</p>
            {grouped[sev].map((issue, idx) => {
              const key = `${sev}-${idx}`
              const isOpen = expanded === parseInt(`${sev === 'critical' ? 0 : sev === 'warning' ? 100 : 200}${idx}`)
              return (
                <div
                  key={key}
                  className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 flex flex-col gap-3 hover:border-[var(--accent)]/40 transition-colors cursor-pointer"
                  onClick={() => setExpanded(isOpen ? null : parseInt(`${sev === 'critical' ? 0 : sev === 'warning' ? 100 : 200}${idx}`))}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2 flex-1">
                      <Badge severity={sev} />
                      <p className="text-sm text-[var(--foreground)] leading-snug">{issue.issue}</p>
                    </div>
                    <span className="text-[var(--muted)] text-xs mt-0.5">{isOpen ? '▲' : '▼'}</span>
                  </div>

                  {isOpen && (
                    <div className="flex flex-col gap-3 animate-fade-in">
                      <div className="rounded-lg bg-[var(--background)] border border-[var(--border)] p-3">
                        <p className="text-xs text-[var(--muted)] mb-1">Original copy</p>
                        <p className="text-sm text-[var(--foreground)]/70 italic">"{issue.original}"</p>
                      </div>
                      <button
                        onClick={e => { e.stopPropagation(); onFix(issue) }}
                        disabled={fixingId === key}
                        className="self-start text-sm font-medium px-4 py-1.5 rounded-lg bg-[var(--accent)] hover:bg-[var(--accent-hover)] disabled:opacity-50 transition-colors"
                      >
                        {fixingId === key ? 'Fixing…' : '✦ Fix this'}
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )
      )}
    </div>
  )
}

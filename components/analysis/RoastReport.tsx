'use client'
import { useState } from 'react'
import { RoastResult, RoastIssue, ListingData } from '@/types'
import { Badge } from '@/components/ui/Badge'

type Props = {
  result: RoastResult
  listing: ListingData
  onFix: (issue: RoastIssue, key: string) => void
  fixingId: string | null
}

const SEV_BORDER: Record<string, string> = {
  critical:   '#F87171',
  warning:    '#FBBF24',
  suggestion: '#60A5FA',
}

export function RoastReport({ result, listing: _listing, onFix, fixingId }: Props) {
  const [openKey, setOpenKey] = useState<string | null>(null)

  const grouped = {
    critical:   result.issues.filter(i => i.severity === 'critical'),
    warning:    result.issues.filter(i => i.severity === 'warning'),
    suggestion: result.issues.filter(i => i.severity === 'suggestion'),
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-[var(--roast)] text-base">🔥</span>
          <h2 className="text-base font-bold text-[var(--fg)] tracking-tight">Listing Roast</h2>
        </div>
        <span className="text-xs font-bold text-[var(--muted)] tabular-nums"
              style={{ fontFamily: 'var(--font-mono)' }}>
          {result.issues.length} issues
        </span>
      </div>

      {/* Issue groups */}
      {(['critical', 'warning', 'suggestion'] as const).map(sev =>
        grouped[sev].length > 0 && (
          <div key={sev} className="flex flex-col gap-2">
            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[var(--muted)] pl-1">
              {sev} · {grouped[sev].length}
            </p>

            {grouped[sev].map((issue, idx) => {
              const key = `${sev}-${idx}`
              const isOpen = openKey === key
              const borderColor = SEV_BORDER[sev]

              return (
                <div
                  key={key}
                  onClick={() => setOpenKey(isOpen ? null : key)}
                  className="rounded-xl border border-[var(--border)] bg-[var(--bg)] overflow-hidden cursor-pointer hover:border-[var(--border-lit)] transition-all"
                  style={{ borderLeft: `3px solid ${borderColor}40` }}
                >
                  {/* Summary row */}
                  <div className="flex items-start gap-3 p-3.5">
                    <Badge severity={sev} />
                    <p className="text-sm text-[var(--fg)] leading-snug flex-1 font-normal">{issue.issue}</p>
                    <span className="text-[var(--muted)] text-xs mt-0.5 shrink-0 select-none">
                      {isOpen ? '▲' : '▼'}
                    </span>
                  </div>

                  {/* Expanded */}
                  {isOpen && (
                    <div className="border-t border-[var(--border)] p-3.5 flex flex-col gap-3 animate-fade-in">
                      <div className="rounded-lg bg-[var(--card)] border border-[var(--border)] p-3">
                        <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-widest mb-1.5">Original</p>
                        <p className="text-sm text-[var(--fg)]/60 italic leading-relaxed font-normal">
                          "{issue.original}"
                        </p>
                      </div>
                      <button
                        onClick={e => { e.stopPropagation(); onFix(issue, key) }}
                        disabled={fixingId === key}
                        className="self-start flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-lg transition-all active:scale-95 disabled:opacity-40"
                        style={{
                          background: `${borderColor}18`,
                          color: borderColor,
                          border: `1px solid ${borderColor}30`,
                        }}
                      >
                        {fixingId === key
                          ? <><span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" /> Fixing…</>
                          : <>✦ Fix this</>
                        }
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

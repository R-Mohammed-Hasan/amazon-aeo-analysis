import { AEOResult } from '@/types'

const MODEL_STYLE: Record<string, { color: string; bg: string; icon: string; desc: string }> = {
  ChatGPT:    { color: '#10B981', bg: '#10B98115', icon: 'G',  desc: 'OpenAI GPT' },
  Claude:     { color: '#A78BFA', bg: '#A78BFA15', icon: 'C',  desc: 'Anthropic Claude' },
  Gemini:     { color: '#60A5FA', bg: '#60A5FA15', icon: 'Ge', desc: 'Google Gemini' },
  Perplexity: { color: '#F472B6', bg: '#F472B615', icon: 'P',  desc: 'Real-time web search' },
}

export function AEOReport({ result }: { result: AEOResult }) {
  const overallMentioned = result.results.filter(r => r.mentioned).length
  const totalModels      = result.results.length

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-[var(--accent)] text-base">🤖</span>
          <h2 className="text-base font-bold text-[var(--fg)] tracking-tight">AEO Diagnostic</h2>
        </div>
        <span className="text-xs font-bold text-[var(--muted)] tabular-nums"
              style={{ fontFamily: 'var(--font-mono)' }}>
          {result.queries.length} queries tested
        </span>
      </div>

      {/* Summary banner */}
      <div className="rounded-xl border border-[var(--border)] bg-[var(--bg)] px-4 py-3 flex items-center justify-between gap-3">
        <p className="text-xs text-[var(--muted)] font-normal leading-snug">
          {overallMentioned === 0
            ? 'Your brand is not surfacing in any AI recommendation engine right now.'
            : overallMentioned === totalModels
            ? 'Your brand appears across all AI engines — strong signal.'
            : `Appearing in ${overallMentioned}/${totalModels} AI engines. ${totalModels - overallMentioned} blind spot${totalModels - overallMentioned > 1 ? 's' : ''} to fix.`
          }
        </p>
        <span className="shrink-0 text-lg font-extrabold tabular-nums"
              style={{ color: overallMentioned >= 3 ? 'var(--success)' : overallMentioned >= 1 ? 'var(--warning)' : 'var(--critical)', fontFamily: 'var(--font-mono)' }}>
          {overallMentioned}/{totalModels}
        </span>
      </div>

      {/* Model cards */}
      <div className="flex flex-col gap-3">
        {result.results.map(m => {
          const pct   = Math.round((m.queriesMatched / m.totalQueries) * 100)
          const style = MODEL_STYLE[m.modelLabel] ?? { color: '#6B7280', bg: '#6B728015', icon: '?', desc: '' }

          return (
            <div key={m.model}
                 className="rounded-xl border border-[var(--border)] bg-[var(--bg)] p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-extrabold shrink-0"
                       style={{ background: style.bg, color: style.color, border: `1px solid ${style.color}25` }}>
                    {style.icon}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[var(--fg)] leading-tight">{m.modelLabel}</p>
                    <p className="text-[10px] text-[var(--muted)]">{style.desc}</p>
                  </div>
                </div>

                <div className="flex items-baseline gap-1">
                  <span className="text-lg font-extrabold tabular-nums"
                        style={{ color: style.color, fontFamily: 'var(--font-mono)' }}>
                    {m.queriesMatched}
                  </span>
                  <span className="text-xs text-[var(--muted)]">/ {m.totalQueries}</span>
                </div>
              </div>

              <div className="h-2 rounded-full bg-[var(--border)] overflow-hidden">
                <div className="h-full rounded-full transition-all duration-1000 ease-out"
                     style={{ width: `${pct}%`, background: style.color }} />
              </div>

              <div className="flex justify-between items-center">
                <span className="text-xs text-[var(--muted)] font-normal">
                  {m.mentioned
                    ? `Avg. position #${m.position} in responses`
                    : <span style={{ color: 'var(--critical)' }}>Not mentioned in any response</span>
                  }
                </span>
                <span className="text-xs font-bold tabular-nums"
                      style={{ color: style.color, fontFamily: 'var(--font-mono)' }}>
                  {pct}% visible
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Queries accordion */}
      <details className="rounded-xl border border-[var(--border)] bg-[var(--bg)] overflow-hidden group">
        <summary className="p-4 text-xs font-bold text-[var(--muted)] cursor-pointer hover:text-[var(--fg)] transition-colors list-none flex items-center justify-between">
          <span>View tested queries</span>
          <span className="group-open:rotate-180 transition-transform text-xs select-none">▾</span>
        </summary>
        <div className="border-t border-[var(--border)] p-4">
          <ol className="flex flex-col gap-2">
            {result.queries.map((q, i) => (
              <li key={i} className="text-sm text-[var(--fg)]/70 flex gap-3 font-normal leading-snug">
                <span className="text-[var(--muted)] tabular-nums shrink-0 w-4 text-right"
                      style={{ fontFamily: 'var(--font-mono)', fontSize: '11px' }}>
                  {i + 1}
                </span>
                {q}
              </li>
            ))}
          </ol>
        </div>
      </details>
    </div>
  )
}

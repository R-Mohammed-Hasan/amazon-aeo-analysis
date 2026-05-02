import { AEOResult } from '@/types'

export function AEOReport({ result }: { result: AEOResult }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-[var(--foreground)]">AEO Diagnostic</h2>
        <span className="text-sm text-[var(--muted)]">{result.queries.length} queries tested</span>
      </div>

      {/* Model breakdown */}
      <div className="flex flex-col gap-3">
        {result.results.map(m => {
          const pct = Math.round((m.queriesMatched / m.totalQueries) * 100)
          return (
            <div key={m.model} className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ModelIcon label={m.modelLabel} />
                  <span className="font-medium text-sm text-[var(--foreground)]">{m.modelLabel}</span>
                </div>
                <div className="text-right">
                  <span className={`text-sm font-bold ${pct >= 50 ? 'text-[var(--success)]' : pct >= 20 ? 'text-[var(--warning)]' : 'text-[var(--critical)]'}`}>
                    {m.queriesMatched}/{m.totalQueries}
                  </span>
                  <span className="text-[var(--muted)] text-xs ml-1">queries</span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="h-1.5 rounded-full bg-[var(--border)] overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${pct}%`,
                    background: pct >= 50 ? 'var(--success)' : pct >= 20 ? 'var(--warning)' : 'var(--critical)',
                  }}
                />
              </div>

              <div className="flex justify-between text-xs text-[var(--muted)]">
                <span>{m.mentioned ? `Avg position #${m.position}` : 'Not mentioned'}</span>
                <span>{pct}% visibility</span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Queries used */}
      <details className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4">
        <summary className="text-sm font-medium text-[var(--muted)] cursor-pointer hover:text-[var(--foreground)] transition-colors">
          View tested queries ({result.queries.length})
        </summary>
        <ul className="mt-3 flex flex-col gap-1.5">
          {result.queries.map((q, i) => (
            <li key={i} className="text-sm text-[var(--foreground)]/70 flex gap-2">
              <span className="text-[var(--muted)] w-5 shrink-0">{i + 1}.</span>
              {q}
            </li>
          ))}
        </ul>
      </details>
    </div>
  )
}

function ModelIcon({ label }: { label: string }) {
  const map: Record<string, string> = {
    ChatGPT: '🟢',
    Claude: '🟣',
    Gemini: '🔵',
  }
  return <span>{map[label] ?? '⚪'}</span>
}

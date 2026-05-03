export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div
      className={`rounded-lg bg-[var(--faint)] animate-pulse ${className}`}
      style={{ animationDuration: '1.5s' }}
    />
  )
}

export function RoastSkeleton() {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-base">🔥</span>
          <Skeleton className="h-5 w-28" />
        </div>
        <Skeleton className="h-4 w-16" />
      </div>
      {[1, 2, 3].map(i => (
        <div key={i} className="rounded-xl border border-[var(--border)] bg-[var(--bg)] p-3.5 flex flex-col gap-2"
             style={{ opacity: 1 - i * 0.15 }}>
          <div className="flex gap-2">
            <Skeleton className="h-5 w-16 shrink-0" />
            <Skeleton className="h-5 flex-1" />
          </div>
        </div>
      ))}
      <div className="text-center py-4">
        <p className="text-xs text-[var(--muted)] animate-pulse">Analysing copy with Claude…</p>
      </div>
    </div>
  )
}

export function AEOSkeleton() {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-base">🤖</span>
          <Skeleton className="h-5 w-32" />
        </div>
        <Skeleton className="h-4 w-16" />
      </div>
      {['ChatGPT', 'Claude', 'Gemini', 'Perplexity'].map((label, i) => (
        <div key={label} className="rounded-xl border border-[var(--border)] bg-[var(--bg)] p-4 flex flex-col gap-3"
             style={{ opacity: 1 - i * 0.1 }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Skeleton className="w-7 h-7 rounded-lg" />
              <Skeleton className="h-4 w-20" />
            </div>
            <Skeleton className="h-6 w-10" />
          </div>
          <Skeleton className="h-2 w-full rounded-full" />
        </div>
      ))}
      <div className="text-center py-2">
        <p className="text-xs text-[var(--muted)] animate-pulse">Querying GPT, Claude, Gemini &amp; Perplexity…</p>
      </div>
    </div>
  )
}

'use client'

type Props = {
  issue: string
  fixed: string
  onClose: () => void
}

export function FixPanel({ issue, fixed, onClose }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 flex flex-col gap-4 shadow-2xl">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs text-[var(--muted)] uppercase tracking-widest mb-1">Fix suggestion</p>
            <p className="text-sm text-[var(--foreground)]/70">{issue}</p>
          </div>
          <button onClick={onClose} className="text-[var(--muted)] hover:text-[var(--foreground)] text-xl leading-none">×</button>
        </div>

        <div className="rounded-xl bg-[var(--background)] border border-[var(--accent)]/30 p-4">
          <p className="text-xs text-[var(--accent)] mb-2 font-medium">✦ Improved copy</p>
          <p className="text-sm text-[var(--foreground)] leading-relaxed whitespace-pre-wrap">{fixed}</p>
        </div>

        <button
          onClick={() => { navigator.clipboard.writeText(fixed); onClose() }}
          className="w-full py-2.5 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-sm font-semibold transition-colors"
        >
          Copy & Close
        </button>
      </div>
    </div>
  )
}

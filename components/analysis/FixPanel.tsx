'use client'
import { useState } from 'react'

type Props = { issue: string; fixed: string; onClose: () => void }

export function FixPanel({ issue, fixed, onClose }: Props) {
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    navigator.clipboard.writeText(fixed)
    setCopied(true)
    setTimeout(() => { setCopied(false); onClose() }, 1200)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 animate-fade-in"
      style={{ background: 'rgba(10,10,16,0.85)', backdropFilter: 'blur(12px)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl border border-[var(--border-lit)] bg-[var(--card)] flex flex-col gap-0 overflow-hidden shadow-2xl animate-slide-up"
        onClick={e => e.stopPropagation()}
      >
        {/* Top bar */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)]">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[var(--accent)] mb-0.5">
              ✦ Fix suggestion
            </p>
            <p className="text-xs text-[var(--muted)] font-normal leading-snug max-w-sm">{issue}</p>
          </div>
          <button onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-[var(--muted)] hover:text-[var(--fg)] hover:bg-[var(--faint)] transition-all text-base">
            ×
          </button>
        </div>

        {/* Improved copy */}
        <div className="p-5">
          <div className="rounded-xl bg-[var(--bg)] border border-[var(--accent)]/20 p-4"
               style={{ boxShadow: 'inset 0 0 40px rgba(99,102,241,0.03)' }}>
            <p className="text-sm text-[var(--fg)] leading-relaxed whitespace-pre-wrap font-normal">{fixed}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="px-5 pb-5 flex gap-2">
          <button
            onClick={handleCopy}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all active:scale-95"
            style={{
              background: copied ? 'var(--success)' : 'var(--accent)',
              color: '#fff',
            }}
          >
            {copied ? '✓ Copied!' : 'Copy to clipboard'}
          </button>
          <button onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-sm font-bold text-[var(--muted)] border border-[var(--border)] hover:border-[var(--border-lit)] hover:text-[var(--fg)] transition-all">
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

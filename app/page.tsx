'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const [url, setUrl]     = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!url.includes('amazon')) {
      setError('Enter a valid Amazon product URL.')
      return
    }
    router.push(`/results?url=${encodeURIComponent(url)}`)
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-5 gap-12 relative overflow-hidden">

      {/* Ambient glow blob */}
      <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full blur-[120px] opacity-[0.07]"
           style={{ background: 'radial-gradient(ellipse, #6366F1 0%, #F59E0B 100%)' }} />

      {/* Hero */}
      <div className="flex flex-col items-center gap-4 text-center animate-fade-up">
        <div className="mb-1 flex items-center gap-1.5 px-3 py-1 rounded-full border border-[var(--border-lit)] bg-[var(--card)] text-xs text-[var(--muted)] tracking-widest uppercase">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--success)] animate-pulse inline-block" />
          Amazon · Listing Intelligence
        </div>

        <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight leading-[1.05]">
          <span className="text-[var(--fg)]">Listing</span>
          <span className="text-[var(--accent)]">IQ</span>
        </h1>

        <p className="text-[var(--muted)] text-base max-w-sm leading-relaxed font-normal">
          Paste your Amazon URL. Get a brutal roast of your copy
          <br className="hidden sm:block" />
          + your AEO score across GPT, Claude &amp; Gemini.
        </p>
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="w-full max-w-lg flex flex-col gap-2.5 animate-fade-up delay-1">
        <div className="flex gap-2">
          <div className="relative flex-1 group">
            <div className="absolute -inset-px rounded-xl bg-gradient-to-r from-[var(--accent)] to-[var(--roast)] opacity-0 group-focus-within:opacity-30 transition-opacity duration-300 pointer-events-none" />
            <input
              type="url"
              value={url}
              onChange={e => setUrl(e.target.value)}
              placeholder="https://www.amazon.in/dp/B09G9FPHY6"
              className="relative w-full bg-[var(--card)] border border-[var(--border)] rounded-xl px-4 py-3.5 text-sm text-[var(--fg)] placeholder-[var(--muted)] outline-none focus:border-[var(--accent)] transition-colors font-normal"
              style={{ fontFamily: 'var(--font-mono)' }}
            />
          </div>
          <button
            type="submit"
            className="px-6 py-3.5 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-sm font-bold transition-all whitespace-nowrap cursor-pointer active:scale-95 tracking-wide"
          >
            Analyze →
          </button>
        </div>
        {error && <p className="text-[var(--critical)] text-xs pl-1">{error}</p>}
      </form>

      {/* Feature grid */}
      <div className="grid grid-cols-2 gap-2.5 w-full max-w-lg animate-fade-up delay-2">
        {[
          {
            label: 'Listing Roast',
            desc: 'Title, bullets & description — critiqued without mercy',
            accent: 'var(--roast)',
            icon: (
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/>
                <path d="M12 8v4M12 16h.01" strokeLinecap="round"/>
              </svg>
            ),
          },
          {
            label: 'AEO Diagnostic',
            desc: 'Visibility across GPT, Claude & Gemini queries',
            accent: 'var(--accent)',
            icon: (
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35" strokeLinecap="round"/>
              </svg>
            ),
          },
          {
            label: 'Fix Engine',
            desc: 'One-click improved copy generated per issue',
            accent: 'var(--success)',
            icon: (
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" strokeLinecap="round"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
            ),
          },
          {
            label: 'Score Card',
            desc: 'Listing quality + AI visibility — two numbers, clear action',
            accent: 'var(--warning)',
            icon: (
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                <path d="M18 20V10M12 20V4M6 20v-6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            ),
          },
        ].map((f, i) => (
          <div
            key={f.label}
            className={`rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 flex flex-col gap-2.5 hover:border-[var(--border-lit)] hover:bg-[var(--card-hover)] transition-all group animate-fade-up delay-${i + 2 as 2 | 3 | 4}`}
          >
            <span className="transition-transform group-hover:scale-110 w-fit"
                  style={{ color: f.accent }}>
              {f.icon}
            </span>
            <div>
              <p className="text-sm font-bold text-[var(--fg)] tracking-tight">{f.label}</p>
              <p className="text-xs text-[var(--muted)] mt-0.5 leading-relaxed font-normal">{f.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Footer hint */}
      <p className="text-xs text-[var(--faint)] animate-fade-up delay-4">
        Works with amazon.com · amazon.in · amazon.co.uk
      </p>
    </main>
  )
}

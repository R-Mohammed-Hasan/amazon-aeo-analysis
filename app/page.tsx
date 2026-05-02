'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const [url, setUrl] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!url.includes('amazon')) {
      setError('Please enter a valid Amazon product URL.')
      return
    }
    router.push(`/results?url=${encodeURIComponent(url)}`)
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 gap-10">
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="flex items-center gap-2">
          <span className="text-3xl font-bold tracking-tight text-[var(--foreground)]">Listing</span>
          <span className="text-3xl font-bold tracking-tight text-[var(--accent)]">IQ</span>
        </div>
        <p className="text-[var(--muted)] text-sm max-w-xs leading-relaxed">
          Paste your Amazon listing URL. Get a brutal AI critique + AEO visibility report across GPT, Claude &amp; Gemini.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="w-full max-w-xl flex flex-col gap-3">
        <div className="flex gap-2">
          <input
            type="url"
            value={url}
            onChange={e => setUrl(e.target.value)}
            placeholder="https://www.amazon.in/dp/B09G9FPHY6"
            className="flex-1 bg-[var(--card)] border border-[var(--border)] rounded-xl px-4 py-3 text-sm text-[var(--foreground)] placeholder-[var(--muted)] outline-none focus:border-[var(--accent)] transition-colors"
          />
          <button
            type="submit"
            className="px-6 py-3 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-sm font-semibold transition-colors whitespace-nowrap cursor-pointer"
          >
            Analyze →
          </button>
        </div>
        {error && <p className="text-[var(--critical)] text-xs px-1">{error}</p>}
      </form>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-xl">
        {[
          { icon: '🔥', title: 'Listing Roast',  desc: 'AI tears apart your title, bullets & description' },
          { icon: '🤖', title: 'AEO Diagnostic', desc: 'See if GPT, Claude & Gemini recommend you' },
          { icon: '✦',  title: 'Fix Engine',     desc: 'One-click improved copy for every issue' },
          { icon: '📊', title: 'Score Card',     desc: 'Listing score + AEO score in one view' },
        ].map(f => (
          <div key={f.title} className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 flex gap-3">
            <span className="text-xl">{f.icon}</span>
            <div>
              <p className="text-sm font-semibold text-[var(--foreground)]">{f.title}</p>
              <p className="text-xs text-[var(--muted)] mt-0.5">{f.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}

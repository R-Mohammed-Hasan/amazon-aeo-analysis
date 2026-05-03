type Severity = 'critical' | 'warning' | 'suggestion'

const cfg: Record<Severity, { label: string; dot: string; text: string }> = {
  critical:   { label: 'Critical',   dot: '#F87171', text: '#F87171' },
  warning:    { label: 'Warning',    dot: '#FBBF24', text: '#FBBF24' },
  suggestion: { label: 'Suggestion', dot: '#60A5FA', text: '#60A5FA' },
}

export function Badge({ severity }: { severity: Severity }) {
  const { label, dot, text } = cfg[severity]
  return (
    <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider shrink-0 px-2 py-0.5 rounded-md border"
      style={{
        color: text,
        borderColor: `${dot}30`,
        background: `${dot}10`,
      }}>
      <span className="w-1 h-1 rounded-full inline-block" style={{ background: dot }} />
      {label}
    </span>
  )
}

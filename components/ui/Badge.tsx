type Severity = 'critical' | 'warning' | 'suggestion'

const styles: Record<Severity, string> = {
  critical:   'bg-red-950/60 text-red-400 border border-red-800/50',
  warning:    'bg-amber-950/60 text-amber-400 border border-amber-800/50',
  suggestion: 'bg-blue-950/60 text-blue-400 border border-blue-800/50',
}

export function Badge({ severity }: { severity: Severity }) {
  return (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full uppercase tracking-wide ${styles[severity]}`}>
      {severity}
    </span>
  )
}

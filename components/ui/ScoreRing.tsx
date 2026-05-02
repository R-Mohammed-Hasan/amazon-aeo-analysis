type Props = { score: number; label: string; size?: number }

function scoreColor(score: number) {
  if (score >= 7) return '#4DDE94'
  if (score >= 4) return '#FFAB40'
  return '#FF4D4D'
}

export function ScoreRing({ score, label, size = 100 }: Props) {
  const r = (size - 12) / 2
  const circ = 2 * Math.PI * r
  const fill = (score / 10) * circ
  const color = scoreColor(score)

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={size} height={size}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#1E1E2E" strokeWidth={8} />
        <circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none" stroke={color} strokeWidth={8}
          strokeDasharray={`${fill} ${circ}`}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: 'stroke-dasharray 0.8s ease' }}
        />
        <text
          x="50%" y="50%" textAnchor="middle" dominantBaseline="central"
          fill={color} fontSize={size * 0.22} fontWeight="700"
        >
          {score.toFixed(1)}
        </text>
      </svg>
      <span className="text-xs text-[var(--muted)] font-medium uppercase tracking-widest">{label}</span>
    </div>
  )
}

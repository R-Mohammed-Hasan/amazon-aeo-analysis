type Props = { score: number; label: string; size?: number; color?: string }

export function ScoreRing({ score, label, size = 88, color }: Props) {
  const r     = (size - 14) / 2
  const circ  = 2 * Math.PI * r
  const fill  = Math.min(score / 10, 1) * circ
  const c     = color ?? (score >= 7 ? '#34D399' : score >= 4 ? '#FBBF24' : '#F87171')

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative" style={{ width: size, height: size }}>
        {/* Glow */}
        <div
          className="absolute inset-0 rounded-full blur-md opacity-25"
          style={{ background: c }}
        />
        <svg width={size} height={size} className="relative">
          {/* Track */}
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#1C1C2E" strokeWidth={7} />
          {/* Fill */}
          <circle
            cx={size/2} cy={size/2} r={r}
            fill="none" stroke={c} strokeWidth={7}
            strokeDasharray={`${fill} ${circ}`}
            strokeLinecap="round"
            transform={`rotate(-90 ${size/2} ${size/2})`}
            style={{ transition: 'stroke-dasharray 1s cubic-bezier(.22,1,.36,1)' }}
          />
          {/* Score */}
          <text x="50%" y="46%" textAnchor="middle" dominantBaseline="middle"
            fill={c} fontSize={size * 0.23} fontWeight="800"
            fontFamily="var(--font-mono)">
            {score.toFixed(1)}
          </text>
          {/* Label inside ring */}
          <text x="50%" y="70%" textAnchor="middle" dominantBaseline="middle"
            fill="#5A5A72" fontSize={size * 0.1} fontWeight="600"
            fontFamily="var(--font-syne)" letterSpacing="1">
            /10
          </text>
        </svg>
      </div>
      <span className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-widest">{label}</span>
    </div>
  )
}

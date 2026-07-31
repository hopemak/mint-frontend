import React, { useId } from 'react'

/**
 * Semi-circle gauge.
 *
 * variant="gradient" -> single gradient progress arc over a light track (Idea Quality Score style)
 * variant="solid"    -> single solid-color progress arc over a light track (Funding Probability style)
 * variant="segmented"-> full arc pre-painted in colored bands with a needle pointing at the value
 *                       plus an optional legend (Investment Readiness style)
 */
export default function Gauge({
  value = 0,
  max = 100,
  size = 200,
  strokeWidth = 14,
  variant = 'gradient',
  color = '#1D4241',
  gradientStops = ['#22D3EE', '#6366F1', '#A855F7'],
  segments = [
    { to: 40, color: '#EF4444' },
    { to: 70, color: '#F59E0B' },
    { to: 100, color: '#10B981' },
  ],
  centerLabel,
  centerSub,
  legend,
  className = '',
}) {
  const uid = useId()
  const pct = Math.max(0, Math.min(100, (value / max) * 100))
  const cx = size / 2
  const cy = size / 2
  const r = size / 2 - strokeWidth
  const height = size / 2 + strokeWidth + 8

  const toPoint = (v, radius = r) => {
    const angle = 180 - (v / 100) * 180
    const rad = (angle * Math.PI) / 180
    return { x: cx + radius * Math.cos(rad), y: cy - radius * Math.sin(rad) }
  }

  const describeArc = (v0, v1, radius = r) => {
    const start = toPoint(v0, radius)
    const end = toPoint(v1, radius)
    const largeArc = v1 - v0 > 50 ? 1 : 0
    return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArc} 1 ${end.x} ${end.y}`
  }

  const needleTip = toPoint(pct, r + strokeWidth * 0.55)

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <svg width={size} height={height} viewBox={`0 0 ${size} ${height}`}>
        <defs>
          <linearGradient id={`gauge-grad-${uid}`} x1="0%" y1="0%" x2="100%" y2="0%">
            {gradientStops.map((c, i) => (
              <stop key={i} offset={`${(i / (gradientStops.length - 1)) * 100}%`} stopColor={c} />
            ))}
          </linearGradient>
        </defs>

        {variant === 'segmented' ? (
          <>
            {segments.map((s, i) => {
              const from = i === 0 ? 0 : segments[i - 1].to
              return (
                <path
                  key={i}
                  d={describeArc(from, s.to)}
                  fill="none"
                  stroke={s.color}
                  strokeWidth={strokeWidth}
                  strokeLinecap="round"
                />
              )
            })}
            {/* needle */}
            <line x1={cx} y1={cy} x2={needleTip.x} y2={needleTip.y} stroke="#1A202C" strokeWidth={3} strokeLinecap="round" />
            <circle cx={cx} cy={cy} r={6} fill="#1A202C" />
          </>
        ) : (
          <>
            <path d={describeArc(0, 100)} fill="none" stroke="#E2E8F0" strokeWidth={strokeWidth} strokeLinecap="round" />
            <path
              d={describeArc(0, pct)}
              fill="none"
              stroke={variant === 'gradient' ? `url(#gauge-grad-${uid})` : color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
            />
          </>
        )}
      </svg>

      <div className="-mt-4 text-center">
        <p className="font-heading text-3xl font-bold text-ink dark:text-white leading-none">
          {centerLabel ?? Math.round(pct)}
        </p>
        {centerSub && <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">{centerSub}</p>}
      </div>

      {legend && (
        <div className="flex items-center gap-3 mt-2 text-xs text-slate-500 dark:text-slate-400">
          {legend.map((l) => (
            <span key={l.label} className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: l.color }} />
              {l.label}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

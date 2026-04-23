import { useState, useEffect } from 'react'

export default function BarChart({ breakdown }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 100)
    return () => clearTimeout(timer)
  }, [])

  if (!breakdown || breakdown.length === 0) return null

  const maxCost = Math.max(...breakdown.map(b => parseFloat(b.total_cost)))
  const maxBarHeight = 200

  return (
    <div style={{
      background: 'var(--white)',
      borderRadius: '18px',
      border: '1px solid var(--border)',
      padding: '48px',
      marginBottom: '80px',
    }}>
      <div className="bar-chart-container" style={{
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        gap: '32px',
        height: `${maxBarHeight + 60}px`,
        overflowX: 'auto',
        scrollbarWidth: 'none',
      }}>
        {breakdown.map((item, idx) => {
          const cost = parseFloat(item.total_cost)
          const pct = maxCost > 0 ? (cost / maxCost) : 0
          const barHeight = Math.max(pct * maxBarHeight, 8)
          const isHighWaste = pct > 0.6

          return (
            <div key={idx} style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '8px',
              flexShrink: 0,
            }}>
              {/* Value label */}
              <span style={{
                fontSize: '13px',
                fontWeight: 600,
                color: 'var(--text-primary)',
              }}>
                ₹{cost.toFixed(0)}
              </span>

              {/* Bar */}
              <div style={{
                width: '48px',
                height: mounted ? `${barHeight}px` : '0px',
                background: isHighWaste ? 'var(--red)' : 'var(--accent)',
                borderRadius: '8px 8px 4px 4px',
                transition: `height 0.6s ease-out ${idx * 0.1}s`,
              }} />

              {/* Label */}
              <span style={{
                fontSize: '13px',
                fontWeight: 400,
                color: 'var(--text-secondary)',
                textAlign: 'center',
                maxWidth: '80px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}>
                {item.item_name}
              </span>
            </div>
          )
        })}
      </div>

      <style>{`
        @media (max-width: 768px) {
          .bar-chart-container {
            justify-content: flex-start !important;
            overflow-x: auto !important;
            padding-bottom: 8px;
          }
        }
      `}</style>
    </div>
  )
}

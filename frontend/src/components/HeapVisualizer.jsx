import { useState, useEffect, useCallback } from 'react'

const API = '/api'

export default function HeapVisualizer() {
  const [heapData, setHeapData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)

  const fetchHeap = useCallback(async () => {
    try {
      const res = await fetch(`${API}/heap`)
      setHeapData(await res.json())
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchHeap()
    const interval = setInterval(fetchHeap, 10000)
    return () => clearInterval(interval)
  }, [fetchHeap])

  useEffect(() => {
    if (heapData) {
      const timer = setTimeout(() => setMounted(true), 100)
      return () => clearTimeout(timer)
    }
  }, [heapData])

  if (loading) {
    return (
      <div style={{ paddingTop: '80px' }}>
        <div className="loading-shimmer" style={{ height: '60px', marginBottom: '24px' }} />
        <div className="loading-shimmer" style={{ height: '400px' }} />
      </div>
    )
  }

  if (!heapData || heapData.heap.length === 0) {
    return (
      <div className="tab-content-enter" style={{ textAlign: 'center', padding: '120px 0' }}>
        <p className="type-section" style={{ marginBottom: '8px' }}>Heap is empty</p>
        <p style={{ fontSize: '17px', color: 'var(--text-secondary)' }}>
          Add items to your fridge to visualize the min-heap.
        </p>
      </div>
    )
  }

  const heap = heapData.heap
  const totalLevels = Math.floor(Math.log2(heap.length)) + 1
  const svgWidth = 900
  const svgHeight = Math.max(400, totalLevels * 120 + 100)
  const nodeRadius = 36

  // Calculate positions
  const positions = []
  for (let i = 0; i < heap.length; i++) {
    const level = Math.floor(Math.log2(i + 1))
    const posInLevel = i - (Math.pow(2, level) - 1)
    const nodesInLevel = Math.pow(2, level)
    const levelWidth = svgWidth - 120
    const spacing = levelWidth / nodesInLevel
    const x = 60 + spacing * posInLevel + spacing / 2
    const y = 80 + level * 110
    positions.push({ x, y, level })
  }

  // Calculate edges
  const edges = []
  for (let i = 1; i < heap.length; i++) {
    const parentIdx = Math.floor((i - 1) / 2)
    edges.push({
      x1: positions[parentIdx].x, y1: positions[parentIdx].y,
      x2: positions[i].x, y2: positions[i].y,
    })
  }

  return (
    <div className="tab-content-enter">
      {/* Hero */}
      <div style={{ paddingTop: '100px', textAlign: 'center', marginBottom: '80px' }}>
        <p className="type-caption" style={{ marginBottom: '12px' }}>UNDER THE HOOD</p>
        <h1 className="type-hero" style={{ marginBottom: '16px' }}>
          How FridgeLife thinks.
        </h1>
        <p style={{
          fontSize: '21px',
          fontWeight: 400,
          color: 'var(--text-secondary)',
          lineHeight: 1.5,
          maxWidth: '680px',
          margin: '0 auto',
        }}>
          A min-heap keeps your most urgent items always at the top. O(1) peek, O(log n) insert.
        </p>
      </div>

      {/* SVG Heap Tree */}
      <div style={{
        background: 'var(--white)',
        borderRadius: '18px',
        border: '1px solid var(--border)',
        padding: '48px',
        overflowX: 'auto',
        scrollbarWidth: 'none',
        marginBottom: '32px',
      }}>
        <svg
          width={svgWidth}
          height={svgHeight}
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          style={{ display: 'block', margin: '0 auto', minWidth: '600px' }}
        >
          {/* Edges */}
          {edges.map((e, idx) => (
            <line
              key={`edge-${idx}`}
              x1={e.x1} y1={e.y1}
              x2={e.x2} y2={e.y2}
              stroke="var(--border)"
              strokeWidth="1"
            />
          ))}

          {/* Nodes */}
          {heap.map((node, idx) => {
            const pos = positions[idx]
            const isRoot = idx === 0
            const displayName = node.name.length > 8
              ? node.name.substring(0, 7) + '…'
              : node.name
            const days = node.days_remaining

            return (
              <g
                key={node.id}
                style={{
                  opacity: mounted ? 1 : 0,
                  transition: `opacity 0.4s ease ${pos.level * 0.1}s`,
                }}
              >
                {/* Node circle */}
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={nodeRadius}
                  fill={isRoot ? 'var(--black)' : 'var(--white)'}
                  stroke="var(--border)"
                  strokeWidth={isRoot ? 0 : 1}
                />

                {/* Name */}
                <text
                  x={pos.x}
                  y={pos.y - 4}
                  textAnchor="middle"
                  fill={isRoot ? 'white' : 'var(--text-primary)'}
                  fontFamily="Inter, sans-serif"
                  fontWeight="600"
                  fontSize="12"
                >
                  {displayName}
                </text>

                {/* Days remaining */}
                <text
                  x={pos.x}
                  y={pos.y + 12}
                  textAnchor="middle"
                  fill={isRoot ? 'rgba(255,255,255,0.7)' : 'var(--text-secondary)'}
                  fontFamily="Inter, sans-serif"
                  fontWeight="400"
                  fontSize="10"
                >
                  {days <= 0 ? 'expired' : `${days}d left`}
                </text>
              </g>
            )
          })}
        </svg>
      </div>

      {/* Stat pills */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '16px',
        flexWrap: 'wrap',
      }}>
        <span style={{
          background: 'var(--surface)',
          borderRadius: '980px',
          padding: '8px 20px',
          fontSize: '13px',
          fontWeight: 500,
          color: 'var(--text-secondary)',
        }}>
          Heap size: {heap.length}
        </span>
        {heapData.peek && (
          <span style={{
            background: 'var(--surface)',
            borderRadius: '980px',
            padding: '8px 20px',
            fontSize: '13px',
            fontWeight: 500,
            color: 'var(--text-secondary)',
          }}>
            Root expires in {heapData.peek.days_remaining <= 0 ? '0' : heapData.peek.days_remaining} day{heapData.peek.days_remaining !== 1 ? 's' : ''}
          </span>
        )}
      </div>
    </div>
  )
}

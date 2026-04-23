import { useState, useEffect } from 'react'
import BarChart from './BarChart'

const API = '/api'

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short',
  })
}

function getMonthName() {
  return new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
}

export default function WasteTab({ householdId }) {
  const [report, setReport] = useState(null)
  const [shopping, setShopping] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const headers = { 'x-household-id': String(householdId) }
        const [r, s] = await Promise.all([
          fetch(`${API}/waste/report`, { headers }),
          fetch(`${API}/waste/shopping`, { headers }),
        ])
        setReport(await r.json())
        setShopping(await s.json())
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) {
    return (
      <div style={{ paddingTop: '80px' }}>
        <div className="loading-shimmer" style={{ height: '180px', marginBottom: '24px' }} />
        <div className="loading-shimmer" style={{ height: '220px' }} />
      </div>
    )
  }

  if (!report) {
    return (
      <div style={{ textAlign: 'center', padding: '120px 0' }}>
        <p style={{ fontSize: '17px', color: 'var(--text-secondary)' }}>Could not load waste report.</p>
      </div>
    )
  }

  return (
    <div className="tab-content-enter">
      {/* Hero */}
      <div style={{ paddingTop: '100px', textAlign: 'center', marginBottom: '80px' }}>
        <p className="type-caption" style={{ marginBottom: '12px' }}>MONTHLY REPORT</p>
        <h1 className="type-hero" style={{
          color: report.total_cost > 0 ? 'var(--red)' : 'var(--text-primary)',
          marginBottom: '16px',
        }}>
          ₹{report.total_cost.toFixed(0)} wasted
        </h1>
        <p style={{
          fontSize: '21px',
          fontWeight: 400,
          color: 'var(--text-secondary)',
          lineHeight: 1.5,
        }}>
          in {getMonthName()} — here's what happened
        </p>
      </div>

      {/* Bar Chart */}
      <BarChart breakdown={report.breakdown} />

      {/* Shopping Advice */}
      {shopping && shopping.items && shopping.items.length > 0 && (
        <div style={{ marginBottom: '80px' }}>
          <h2 className="type-section" style={{ marginBottom: '48px' }}>
            Buy less of these.
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            {shopping.items.map((item, idx) => (
              <div key={idx} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '24px',
              }}>
                <span style={{
                  fontSize: '48px',
                  fontWeight: 700,
                  color: 'var(--border)',
                  lineHeight: 1,
                  minWidth: '60px',
                }}>
                  {idx + 1}
                </span>
                <div>
                  <span style={{
                    fontSize: '17px',
                    fontWeight: 500,
                    color: 'var(--text-primary)',
                  }}>
                    {item.item_name}
                  </span>
                  <span style={{
                    fontSize: '17px',
                    fontWeight: 400,
                    color: 'var(--text-secondary)',
                    marginLeft: '8px',
                  }}>
                    — wasted {item.times_wasted} time{item.times_wasted > 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Waste Log Table */}
      {report.log.length > 0 && (
        <div>
          <p className="type-caption" style={{ marginBottom: '24px' }}>WASTE LOG</p>
          <div style={{ overflowX: 'auto' }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
            }}>
              <thead>
                <tr>
                  {['Item', 'Quantity', 'Cost', 'Date'].map(h => (
                    <th key={h} style={{
                      padding: '12px 16px',
                      textAlign: 'left',
                      fontSize: '13px',
                      fontWeight: 500,
                      letterSpacing: '0.02em',
                      textTransform: 'uppercase',
                      color: 'var(--text-secondary)',
                      borderBottom: '1px solid var(--border)',
                    }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {report.log.map((entry, idx) => (
                  <tr key={entry.id} style={{
                    background: idx % 2 === 0 ? 'var(--white)' : 'var(--surface)',
                  }}>
                    <td style={{
                      padding: '14px 16px',
                      fontSize: '17px',
                      fontWeight: 500,
                      color: 'var(--text-primary)',
                      borderBottom: '1px solid var(--border)',
                    }}>
                      {entry.item_name}
                    </td>
                    <td style={{
                      padding: '14px 16px',
                      fontSize: '17px',
                      fontWeight: 400,
                      color: 'var(--text-primary)',
                      borderBottom: '1px solid var(--border)',
                    }}>
                      {entry.quantity} {entry.unit}
                    </td>
                    <td style={{
                      padding: '14px 16px',
                      fontSize: '17px',
                      fontWeight: 400,
                      color: 'var(--text-primary)',
                      borderBottom: '1px solid var(--border)',
                    }}>
                      ₹{parseFloat(entry.estimated_cost).toFixed(0)}
                    </td>
                    <td style={{
                      padding: '14px 16px',
                      fontSize: '17px',
                      fontWeight: 400,
                      color: 'var(--text-primary)',
                      borderBottom: '1px solid var(--border)',
                    }}>
                      {formatDate(entry.wasted_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {report.log.length === 0 && report.breakdown.length === 0 && (
        <div style={{ textAlign: 'center', padding: '80px 0' }}>
          <p style={{
            fontSize: '48px',
            fontWeight: 700,
            letterSpacing: '-0.03em',
            color: 'var(--text-primary)',
            marginBottom: '8px',
          }}>
            Zero waste
          </p>
          <p style={{ fontSize: '17px', color: 'var(--text-secondary)' }}>
            You haven't wasted anything yet. Keep it up.
          </p>
        </div>
      )}
    </div>
  )
}

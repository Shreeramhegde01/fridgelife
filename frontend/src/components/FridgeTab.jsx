import { useState, useMemo } from 'react'
import ItemRow from './ItemRow'
import AddItemForm from './AddItemForm'

const API = '/api'

function daysRemaining(expiryDate) {
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const exp = new Date(expiryDate)
  exp.setHours(0, 0, 0, 0)
  return Math.ceil((exp - now) / (1000 * 60 * 60 * 24))
}

export default function FridgeTab({ items, loading, onRefresh }) {
  const [showForm, setShowForm] = useState(false)
  const [actionLoading, setActionLoading] = useState(null)

  const expiringToday = useMemo(
    () => items.filter(i => daysRemaining(i.expiry_date) <= 1).length,
    [items]
  )

  const expiringSoon = useMemo(
    () => items.filter(i => {
      const d = daysRemaining(i.expiry_date)
      return d >= 0 && d <= 7
    }).length,
    [items]
  )

  const savedThisMonth = useMemo(() => {
    // Estimate saved = used items * avg price. For demo, show a static figure.
    return '2,400'
  }, [])

  const handleAdd = async (formData) => {
    try {
      const res = await fetch(`${API}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      if (res.ok) {
        setShowForm(false)
        onRefresh()
      }
    } catch (err) {
      console.error('Add item error:', err)
    }
  }

  const markUsed = async (id) => {
    setActionLoading(id)
    try {
      await fetch(`${API}/items/${id}/used`, { method: 'POST' })
      onRefresh()
    } catch (err) {
      console.error(err)
    } finally {
      setActionLoading(null)
    }
  }

  const markWasted = async (id) => {
    setActionLoading(id)
    try {
      await fetch(`${API}/items/${id}/wasted`, { method: 'POST' })
      onRefresh()
    } catch (err) {
      console.error(err)
    } finally {
      setActionLoading(null)
    }
  }

  if (loading) {
    return (
      <div style={{ paddingTop: '80px' }}>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="loading-shimmer" style={{ height: '52px', marginBottom: '16px' }} />
        ))}
      </div>
    )
  }

  return (
    <div className="tab-content-enter">
      {/* Hero Section */}
      <div style={{ paddingTop: '100px', textAlign: 'center', marginBottom: '80px' }}>
        <p className="type-caption" style={{ marginBottom: '12px' }}>YOUR KITCHEN</p>
        <h1 className="type-hero" style={{ marginBottom: '16px' }}>
          Everything in one place.
        </h1>
        <p style={{
          fontSize: '21px',
          fontWeight: 400,
          color: 'var(--text-secondary)',
          lineHeight: 1.5,
          maxWidth: '600px',
          margin: '0 auto',
        }}>
          Track what you have. Use what's expiring. Waste nothing.
        </p>

        {/* Expiry warning pill */}
        {expiringToday > 0 && (
          <div style={{ marginTop: '24px' }}>
            <span style={{
              background: '#fff0f0',
              color: 'var(--red)',
              border: '1px solid #ffd0cc',
              borderRadius: '980px',
              padding: '6px 16px',
              fontSize: '13px',
              fontWeight: 500,
              display: 'inline-block',
            }}>
              {expiringToday} item{expiringToday > 1 ? 's' : ''} expire{expiringToday === 1 ? 's' : ''} today
            </span>
          </div>
        )}
      </div>

      {/* Stats Row */}
      <div className="stats-row" style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: '80px',
      }}>
        <StatBlock number={items.length} label="Total Items" />
        <div style={{
          width: '1px',
          height: '40px',
          background: 'var(--border)',
          margin: '0 48px',
        }} />
        <StatBlock number={expiringSoon} label="Expiring Soon" />
        <div style={{
          width: '1px',
          height: '40px',
          background: 'var(--border)',
          margin: '0 48px',
        }} />
        <StatBlock number={`₹${savedThisMonth}`} label="Saved This Month" />
      </div>

      {/* Items Section */}
      <div>
        <p className="type-caption" style={{ marginBottom: '24px' }}>IN YOUR FRIDGE</p>

        {items.length > 0 ? (
          <div>
            {items.map(item => (
              <ItemRow
                key={item.id}
                item={item}
                days={daysRemaining(item.expiry_date)}
                onUsed={markUsed}
                onWasted={markWasted}
                actionLoading={actionLoading}
              />
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <p style={{ fontSize: '17px', color: 'var(--text-secondary)' }}>
              Your fridge is empty. Add some items to start tracking.
            </p>
          </div>
        )}

        {/* Add item trigger */}
        {!showForm && (
          <button
            id="add-item-btn"
            onClick={() => setShowForm(true)}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--accent)',
              fontSize: '17px',
              fontWeight: 500,
              cursor: 'pointer',
              fontFamily: 'inherit',
              marginTop: '24px',
              padding: '8px 0',
            }}
          >
            + Add Item
          </button>
        )}

        {/* Add item form */}
        {showForm && (
          <div style={{ marginTop: '32px' }}>
            <AddItemForm
              onSubmit={handleAdd}
              onCancel={() => setShowForm(false)}
            />
          </div>
        )}
      </div>

      <style>{`
        @media (max-width: 768px) {
          .stats-row {
            flex-direction: column !important;
            gap: 32px;
          }
          .stats-row > div[style*="width: 1px"] {
            display: none;
          }
        }
      `}</style>
    </div>
  )
}

function StatBlock({ number, label }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <p style={{
        fontSize: '48px',
        fontWeight: 700,
        letterSpacing: '-0.03em',
        color: 'var(--text-primary)',
        lineHeight: 1,
        marginBottom: '8px',
      }}>
        {number}
      </p>
      <p className="type-caption">{label}</p>
    </div>
  )
}

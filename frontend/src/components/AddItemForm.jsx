import { useState } from 'react'

const CATEGORY_OPTIONS = ['vegetable', 'dairy', 'fruit', 'grain', 'leftover']
const UNIT_OPTIONS = ['kg', 'pcs', 'litres', 'grams', 'ml']

export default function AddItemForm({ onSubmit, onCancel }) {
  const [form, setForm] = useState({
    name: '', quantity: '', unit: 'kg', category: 'vegetable', expiry_date: '',
  })
  const [focused, setFocused] = useState({})

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit({ ...form, quantity: parseFloat(form.quantity) })
    setForm({ name: '', quantity: '', unit: 'kg', category: 'vegetable', expiry_date: '' })
  }

  const isActive = (key) => focused[key] || form[key]

  const fieldStyle = {
    width: '100%',
    padding: '12px 0 8px',
    border: 'none',
    borderBottom: '1px solid var(--border)',
    fontSize: '17px',
    fontWeight: 400,
    color: 'var(--text-primary)',
    background: 'transparent',
    outline: 'none',
    fontFamily: 'inherit',
    transition: 'border-color 0.2s ease',
  }

  const fieldFocusedBorder = '1px solid var(--text-primary)'

  const labelStyle = (key) => ({
    position: 'absolute',
    left: 0,
    top: isActive(key) ? '0' : '14px',
    fontSize: isActive(key) ? '11px' : '17px',
    fontWeight: 500,
    color: focused[key] ? 'var(--text-primary)' : 'var(--text-secondary)',
    transition: 'all 0.2s ease',
    pointerEvents: 'none',
    letterSpacing: isActive(key) ? '0.02em' : '0',
    textTransform: isActive(key) ? 'uppercase' : 'none',
  })

  return (
    <div style={{
      overflow: 'hidden',
      animation: 'slideDown 0.3s ease forwards',
      marginBottom: '32px',
    }}>
      <form onSubmit={handleSubmit}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '32px',
          marginBottom: '32px',
        }}>
          {/* Name */}
          <div style={{ position: 'relative', paddingTop: '16px' }}>
            <label style={labelStyle('name')}>Item Name</label>
            <input
              id="input-name"
              required
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              onFocus={() => setFocused(p => ({ ...p, name: true }))}
              onBlur={() => setFocused(p => ({ ...p, name: false }))}
              style={{
                ...fieldStyle,
                borderBottom: focused.name ? fieldFocusedBorder : fieldStyle.borderBottom,
              }}
            />
          </div>

          {/* Quantity */}
          <div style={{ position: 'relative', paddingTop: '16px' }}>
            <label style={labelStyle('quantity')}>Quantity</label>
            <input
              id="input-quantity"
              required
              type="number"
              step="0.1"
              min="0"
              value={form.quantity}
              onChange={(e) => setForm({ ...form, quantity: e.target.value })}
              onFocus={() => setFocused(p => ({ ...p, quantity: true }))}
              onBlur={() => setFocused(p => ({ ...p, quantity: false }))}
              style={{
                ...fieldStyle,
                borderBottom: focused.quantity ? fieldFocusedBorder : fieldStyle.borderBottom,
              }}
            />
          </div>

          {/* Unit */}
          <div style={{ position: 'relative', paddingTop: '16px' }}>
            <label style={{
              ...labelStyle('unit'),
              top: '0',
              fontSize: '11px',
              textTransform: 'uppercase',
              letterSpacing: '0.02em',
            }}>Unit</label>
            <select
              id="input-unit"
              value={form.unit}
              onChange={(e) => setForm({ ...form, unit: e.target.value })}
              style={{
                ...fieldStyle,
                cursor: 'pointer',
                appearance: 'none',
              }}
            >
              {UNIT_OPTIONS.map(u => <option key={u} value={u}>{u}</option>)}
            </select>
          </div>

          {/* Category */}
          <div style={{ position: 'relative', paddingTop: '16px' }}>
            <label style={{
              ...labelStyle('category'),
              top: '0',
              fontSize: '11px',
              textTransform: 'uppercase',
              letterSpacing: '0.02em',
            }}>Category</label>
            <select
              id="input-category"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              style={{
                ...fieldStyle,
                cursor: 'pointer',
                appearance: 'none',
              }}
            >
              {CATEGORY_OPTIONS.map(c => (
                <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
              ))}
            </select>
          </div>

          {/* Expiry Date */}
          <div style={{ position: 'relative', paddingTop: '16px' }}>
            <label style={{
              ...labelStyle('expiry_date'),
              top: '0',
              fontSize: '11px',
              textTransform: 'uppercase',
              letterSpacing: '0.02em',
            }}>Expiry Date</label>
            <input
              id="input-expiry"
              required
              type="date"
              value={form.expiry_date}
              onChange={(e) => setForm({ ...form, expiry_date: e.target.value })}
              onFocus={() => setFocused(p => ({ ...p, expiry_date: true }))}
              onBlur={() => setFocused(p => ({ ...p, expiry_date: false }))}
              style={{
                ...fieldStyle,
                borderBottom: focused.expiry_date ? fieldFocusedBorder : fieldStyle.borderBottom,
              }}
            />
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button
            id="submit-item-btn"
            type="submit"
            style={{
              background: 'var(--black)',
              color: 'var(--white)',
              border: 'none',
              borderRadius: '12px',
              padding: '12px 32px',
              fontSize: '17px',
              fontWeight: 500,
              cursor: 'pointer',
              fontFamily: 'inherit',
              transition: 'opacity 0.2s ease',
            }}
            onMouseEnter={e => e.target.style.opacity = '0.85'}
            onMouseLeave={e => e.target.style.opacity = '1'}
          >
            Add to Fridge
          </button>
          <button
            type="button"
            onClick={onCancel}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-secondary)',
              fontSize: '17px',
              fontWeight: 400,
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}

export default function ItemRow({ item, days, onUsed, onWasted, actionLoading }) {
  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })

  const expiryColor = days <= 1 ? 'var(--red)' : days <= 7 ? 'var(--yellow)' : 'var(--text-secondary)'

  const expiryLabel = days <= 0
    ? 'Expired'
    : days === 1
      ? 'Tomorrow'
      : `${days} days left`

  return (
    <div
      className="item-row"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 0',
        borderBottom: '1px solid var(--border)',
        transition: 'background 0.15s ease',
        borderRadius: '0',
        cursor: 'default',
      }}
      onMouseEnter={e => e.currentTarget.style.background = 'var(--surface)'}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
    >
      {/* Left side: name + category */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{
              fontSize: '17px',
              fontWeight: 500,
              color: 'var(--text-primary)',
              whiteSpace: 'nowrap',
            }}>
              {item.name}
            </span>
            <span style={{
              background: 'var(--surface)',
              color: 'var(--text-secondary)',
              borderRadius: '980px',
              padding: '2px 10px',
              fontSize: '11px',
              fontWeight: 500,
              whiteSpace: 'nowrap',
            }}>
              {item.category}
            </span>
          </div>
          <span style={{
            fontSize: '13px',
            color: 'var(--text-secondary)',
            fontWeight: 400,
          }}>
            {item.quantity} {item.unit}
          </span>
        </div>
      </div>

      {/* Right side: expiry + actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexShrink: 0 }}>
        <div style={{ textAlign: 'right' }}>
          <span style={{
            fontSize: '13px',
            fontWeight: 500,
            color: expiryColor,
            display: 'block',
          }}>
            {expiryLabel}
          </span>
          <span style={{
            fontSize: '13px',
            color: 'var(--text-secondary)',
            fontWeight: 400,
          }}>
            {formatDate(item.expiry_date)}
          </span>
        </div>

        {/* Action buttons — revealed on hover via CSS */}
        <div className="item-row-actions" style={{
          display: 'flex',
          gap: '12px',
          opacity: 0,
          transition: 'opacity 0.15s ease',
        }}>
          <button
            id={`used-${item.id}`}
            onClick={() => onUsed(item.id)}
            disabled={actionLoading === item.id}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--accent)',
              fontSize: '13px',
              fontWeight: 500,
              cursor: 'pointer',
              fontFamily: 'inherit',
              padding: '4px 0',
            }}
          >
            {actionLoading === item.id ? '...' : 'Used'}
          </button>
          <button
            id={`wasted-${item.id}`}
            onClick={() => onWasted(item.id)}
            disabled={actionLoading === item.id}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--red)',
              fontSize: '13px',
              fontWeight: 500,
              cursor: 'pointer',
              fontFamily: 'inherit',
              padding: '4px 0',
            }}
          >
            {actionLoading === item.id ? '...' : 'Wasted'}
          </button>
        </div>
      </div>

      <style>{`
        .item-row:hover .item-row-actions {
          opacity: 1 !important;
        }
        @media (max-width: 768px) {
          .item-row-actions {
            opacity: 1 !important;
          }
        }
      `}</style>
    </div>
  )
}

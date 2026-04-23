import { useState } from 'react'

const NAV_ITEMS = [
  { key: 'fridge', label: 'Fridge' },
  { key: 'recipes', label: 'Recipes' },
  { key: 'waste', label: 'Waste' },
  { key: 'heap', label: 'Heap' },
]

export default function Nav({ activeTab, onTabChange, onNewKitchen }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [showMenu, setShowMenu] = useState(false)

  const handleNewKitchen = () => {
    setShowMenu(false)
    if (confirm('Start a fresh kitchen? Your current data will remain saved.')) {
      onNewKitchen()
    }
  }

  return (
    <nav style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      background: 'var(--black)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      height: '48px',
      width: '100%',
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 48px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '100%',
      }}>
        {/* Logo */}
        <span style={{
          color: 'white',
          fontSize: '17px',
          fontWeight: 600,
          letterSpacing: '-0.01em',
          cursor: 'default',
        }}>
          🥦 FridgeLife
        </span>

        {/* Desktop nav items */}
        <div className="nav-desktop" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '32px',
        }}>
          {NAV_ITEMS.map(item => (
            <button
              key={item.key}
              id={`nav-${item.key}`}
              onClick={() => onTabChange(item.key)}
              style={{
                background: 'none',
                border: 'none',
                color: activeTab === item.key ? 'white' : 'rgba(255,255,255,0.6)',
                fontSize: '13px',
                fontWeight: activeTab === item.key ? 600 : 400,
                cursor: 'pointer',
                padding: '4px 0',
                transition: 'color 0.2s ease',
                fontFamily: 'inherit',
                letterSpacing: '0',
              }}
            >
              {item.label}
            </button>
          ))}

          {/* User / New Kitchen */}
          <div style={{ position: 'relative', marginLeft: '8px' }}>
            <button
              id="user-menu-btn"
              onClick={() => setShowMenu(!showMenu)}
              style={{
                background: 'none',
                border: '1px solid rgba(255,255,255,0.25)',
                borderRadius: '980px',
                color: 'rgba(255,255,255,0.8)',
                fontSize: '12px',
                fontWeight: 500,
                cursor: 'pointer',
                padding: '4px 14px',
                fontFamily: 'inherit',
                transition: 'border-color 0.2s ease, color 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.5)'
                e.currentTarget.style.color = 'white'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)'
                e.currentTarget.style.color = 'rgba(255,255,255,0.8)'
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
              My Kitchen
            </button>

            {/* Dropdown */}
            {showMenu && (
              <div style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                right: 0,
                background: 'var(--white)',
                borderRadius: '12px',
                boxShadow: '0 4px 24px rgba(0,0,0,0.12)',
                border: '1px solid var(--border)',
                minWidth: '180px',
                overflow: 'hidden',
                animation: 'fadeIn 0.15s ease',
              }}>
                <button
                  onClick={handleNewKitchen}
                  style={{
                    width: '100%',
                    background: 'none',
                    border: 'none',
                    padding: '12px 16px',
                    fontSize: '13px',
                    fontWeight: 500,
                    color: 'var(--text-primary)',
                    cursor: 'pointer',
                    textAlign: 'left',
                    fontFamily: 'inherit',
                    transition: 'background 0.15s ease',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'var(--surface)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                >
                  + New Kitchen
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile hamburger */}
        <button
          className="nav-hamburger"
          onClick={() => setMenuOpen(!menuOpen)}
          style={{
            display: 'none',
            background: 'none',
            border: 'none',
            color: 'white',
            fontSize: '20px',
            cursor: 'pointer',
            padding: '4px',
          }}
          aria-label="Menu"
        >
          {menuOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="nav-mobile-menu" style={{
          background: 'var(--black)',
          padding: '16px 48px 24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}>
          {NAV_ITEMS.map(item => (
            <button
              key={item.key}
              onClick={() => { onTabChange(item.key); setMenuOpen(false) }}
              style={{
                background: 'none',
                border: 'none',
                color: activeTab === item.key ? 'white' : 'rgba(255,255,255,0.6)',
                fontSize: '17px',
                fontWeight: activeTab === item.key ? 600 : 400,
                cursor: 'pointer',
                textAlign: 'left',
                fontFamily: 'inherit',
                padding: '4px 0',
              }}
            >
              {item.label}
            </button>
          ))}
          <button
            onClick={() => { setMenuOpen(false); handleNewKitchen() }}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--accent)',
              fontSize: '17px',
              fontWeight: 500,
              cursor: 'pointer',
              textAlign: 'left',
              fontFamily: 'inherit',
              padding: '4px 0',
              marginTop: '8px',
              borderTop: '1px solid rgba(255,255,255,0.15)',
              paddingTop: '16px',
            }}
          >
            + New Kitchen
          </button>
        </div>
      )}

      {/* Click outside to close dropdown */}
      {showMenu && (
        <div
          onClick={() => setShowMenu(false)}
          style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            zIndex: -1,
          }}
        />
      )}

      <style>{`
        @media (max-width: 768px) {
          .nav-desktop { display: none !important; }
          .nav-hamburger { display: block !important; }
        }
        @media (min-width: 769px) {
          .nav-mobile-menu { display: none !important; }
        }
      `}</style>
    </nav>
  )
}

import { useState } from 'react'

const NAV_ITEMS = [
  { key: 'fridge', label: 'Fridge' },
  { key: 'recipes', label: 'Recipes' },
  { key: 'waste', label: 'Waste' },
  { key: 'heap', label: 'Heap' },
]

export default function Nav({ activeTab, onTabChange }) {
  const [menuOpen, setMenuOpen] = useState(false)

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
        </div>
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

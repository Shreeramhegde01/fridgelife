import { useState, useEffect, useCallback } from 'react'
import './index.css'
import Nav from './components/Nav'
import FridgeTab from './components/FridgeTab'
import RecipeTab from './components/RecipeTab'
import WasteTab from './components/WasteTab'
import HeapVisualizer from './components/HeapVisualizer'

const API = '/api'

// ─── Household management ─────────────────────────────
async function getOrCreateHouseholdId() {
  const stored = localStorage.getItem('fridgelife_household_id')
  if (stored) return parseInt(stored)

  // First visit — create a new household
  const res = await fetch(`${API}/households`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'My Home' }),
  })
  const data = await res.json()
  localStorage.setItem('fridgelife_household_id', data.id)
  return data.id
}

// Helper to add household header to all API calls
function apiFetch(url, householdId, options = {}) {
  return fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'Content-Type': 'application/json',
      'x-household-id': String(householdId),
    },
  })
}

function App() {
  const [activeTab, setActiveTab] = useState('fridge')
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [transitioning, setTransitioning] = useState(false)
  const [householdId, setHouseholdId] = useState(null)
  const [initializing, setInitializing] = useState(true)

  // Initialize household
  useEffect(() => {
    getOrCreateHouseholdId().then((id) => {
      setHouseholdId(id)
      setInitializing(false)
    }).catch((err) => {
      console.error('Failed to initialize household:', err)
      setInitializing(false)
    })
  }, [])

  const fetchItems = useCallback(async () => {
    if (!householdId) return
    setLoading(true)
    try {
      const res = await apiFetch(`${API}/items`, householdId)
      const data = await res.json()
      setItems(data)
    } catch (err) {
      console.error('Failed to fetch items:', err)
    } finally {
      setLoading(false)
    }
  }, [householdId])

  useEffect(() => {
    if (householdId) fetchItems()
  }, [householdId, fetchItems])

  const handleTabChange = (tab) => {
    if (tab === activeTab) return
    setTransitioning(true)
    setTimeout(() => {
      setActiveTab(tab)
      setTransitioning(false)
    }, 150)
  }

  if (initializing) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ fontSize: '17px', color: 'var(--text-secondary)' }}>Setting up your kitchen…</p>
      </div>
    )
  }

  const renderTab = () => {
    switch (activeTab) {
      case 'fridge':
        return <FridgeTab items={items} loading={loading} onRefresh={fetchItems} householdId={householdId} />
      case 'recipes':
        return <RecipeTab householdId={householdId} />
      case 'waste':
        return <WasteTab householdId={householdId} />
      case 'heap':
        return <HeapVisualizer householdId={householdId} />
      default:
        return null
    }
  }

  return (
    <div style={{ minHeight: '100vh' }}>
      <Nav activeTab={activeTab} onTabChange={handleTabChange} />

      <main className="page-container" style={{ paddingBottom: '120px' }}>
        <div
          key={activeTab}
          style={{
            opacity: transitioning ? 0 : 1,
            transform: transitioning ? 'translateY(20px)' : 'translateY(0)',
            transition: 'opacity 0.25s ease, transform 0.25s ease',
          }}
        >
          {renderTab()}
        </div>
      </main>

      {/* Minimal footer */}
      <footer style={{
        textAlign: 'center',
        padding: '24px 0 48px',
        fontSize: '13px',
        fontWeight: 400,
        color: 'var(--text-secondary)',
      }}>
        FridgeLife
      </footer>
    </div>
  )
}

export default App

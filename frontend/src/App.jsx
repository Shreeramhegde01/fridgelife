import { useState, useEffect, useCallback } from 'react'
import './index.css'
import Nav from './components/Nav'
import FridgeTab from './components/FridgeTab'
import RecipeTab from './components/RecipeTab'
import WasteTab from './components/WasteTab'
import HeapVisualizer from './components/HeapVisualizer'

const API = '/api'

function App() {
  const [activeTab, setActiveTab] = useState('fridge')
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [transitioning, setTransitioning] = useState(false)

  const fetchItems = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API}/items`)
      const data = await res.json()
      setItems(data)
    } catch (err) {
      console.error('Failed to fetch items:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchItems()
  }, [fetchItems])

  const handleTabChange = (tab) => {
    if (tab === activeTab) return
    setTransitioning(true)
    setTimeout(() => {
      setActiveTab(tab)
      setTransitioning(false)
    }, 150)
  }

  const renderTab = () => {
    switch (activeTab) {
      case 'fridge':
        return <FridgeTab items={items} loading={loading} onRefresh={fetchItems} />
      case 'recipes':
        return <RecipeTab />
      case 'waste':
        return <WasteTab />
      case 'heap':
        return <HeapVisualizer />
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

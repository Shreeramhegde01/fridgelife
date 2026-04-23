import { useState, useEffect } from 'react'
import RecipeCard from './RecipeCard'

const API = '/api'

function daysRemaining(expiryDate) {
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const exp = new Date(expiryDate)
  exp.setHours(0, 0, 0, 0)
  return Math.ceil((exp - now) / (1000 * 60 * 60 * 24))
}

export default function RecipeTab({ householdId }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSuggestions = async () => {
      setLoading(true)
      try {
        const res = await fetch(`${API}/suggestions`, {
          headers: { 'x-household-id': String(householdId) },
        })
        setData(await res.json())
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchSuggestions()
  }, [])

  if (loading) {
    return (
      <div style={{ paddingTop: '80px' }}>
        {[...Array(3)].map((_, i) => (
          <div key={i} className="loading-shimmer" style={{ height: '180px', marginBottom: '24px' }} />
        ))}
      </div>
    )
  }

  if (!data) {
    return (
      <div style={{ textAlign: 'center', padding: '120px 0' }}>
        <p style={{ fontSize: '17px', color: 'var(--text-secondary)' }}>Could not load suggestions.</p>
      </div>
    )
  }

  const { nearExpiryItems, suggestions } = data

  return (
    <div className="tab-content-enter">
      {/* Hero */}
      <div style={{ paddingTop: '100px', textAlign: 'center', marginBottom: '80px' }}>
        <p className="type-caption" style={{ marginBottom: '12px' }}>SUGGESTED FOR YOU</p>
        <h1 className="type-hero" style={{ marginBottom: '16px' }}>
          Use before it's too late.
        </h1>
        <p style={{
          fontSize: '21px',
          fontWeight: 400,
          color: 'var(--text-secondary)',
          lineHeight: 1.5,
          maxWidth: '600px',
          margin: '0 auto',
        }}>
          Recipes matched to what's expiring in your fridge.
        </p>
      </div>

      {/* Expiring Strip */}
      {nearExpiryItems.length > 0 && (
        <div style={{ marginBottom: '80px' }}>
          <div style={{
            display: 'flex',
            gap: '12px',
            overflowX: 'auto',
            scrollbarWidth: 'none',
            paddingBottom: '4px',
          }}>
            {nearExpiryItems.map((item, idx) => {
              const days = daysRemaining(item.expiry_date)
              return (
                <div key={idx} style={{
                  flexShrink: 0,
                  background: 'var(--white)',
                  border: '1px solid var(--border)',
                  borderRadius: '980px',
                  padding: '8px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  whiteSpace: 'nowrap',
                }}>
                  <span style={{
                    fontSize: '13px',
                    fontWeight: 500,
                    color: 'var(--text-primary)',
                  }}>
                    {item.name}
                  </span>
                  <span style={{
                    fontSize: '13px',
                    fontWeight: 500,
                    color: days <= 1 ? 'var(--red)' : 'var(--yellow)',
                  }}>
                    {days <= 0 ? 'expired' : `${days}d`}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Recipe Cards */}
      {suggestions.length > 0 ? (
        <div className="recipe-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '24px',
        }}>
          {suggestions.map(sug => (
            <RecipeCard
              key={sug.recipe.id}
              recipe={sug.recipe}
              matched={sug.matchedIngredients}
              unmatched={sug.unmatchedIngredients}
              matchCount={sug.matchCount}
              totalIngredients={sug.matchedIngredients.length + sug.unmatchedIngredients.length}
            />
          ))}
        </div>
      ) : nearExpiryItems.length > 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 0' }}>
          <p style={{ fontSize: '17px', color: 'var(--text-secondary)' }}>
            No matching recipes found for your expiring items.
          </p>
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '80px 0' }}>
          <p style={{ fontSize: '17px', color: 'var(--text-secondary)' }}>
            Nothing expiring soon. Your fridge is in great shape.
          </p>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .recipe-grid {
            grid-template-columns: 1fr !important;
          }
        }
        @media (min-width: 769px) and (max-width: 1024px) {
          .recipe-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
      `}</style>
    </div>
  )
}

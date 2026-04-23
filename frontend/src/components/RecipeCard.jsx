export default function RecipeCard({ recipe, matched, unmatched, matchCount, totalIngredients }) {
  return (
    <div
      className="recipe-card"
      style={{
        background: 'var(--white)',
        borderRadius: '18px',
        border: '1px solid var(--border)',
        padding: '32px',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        cursor: 'default',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-4px)'
        e.currentTarget.style.boxShadow = '0 8px 40px rgba(0,0,0,0.1)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = 'none'
      }}
    >
      {/* Recipe name */}
      <h3 className="type-card-title" style={{ marginBottom: '8px' }}>
        {recipe.name}
      </h3>

      {/* Description */}
      <p style={{
        fontSize: '15px',
        color: 'var(--text-secondary)',
        fontWeight: 400,
        lineHeight: 1.5,
        marginBottom: '20px',
      }}>
        {recipe.description}
      </p>

      {/* Matched ingredients */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
        {matched.map((ing, i) => (
          <span key={i} style={{
            background: '#e8faf2',
            color: 'var(--accent)',
            borderRadius: '980px',
            padding: '4px 12px',
            fontSize: '13px',
            fontWeight: 500,
          }}>
            {ing}
          </span>
        ))}
      </div>

      {/* Unmatched ingredients */}
      {unmatched.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' }}>
          {unmatched.map((ing, i) => (
            <span key={i} style={{
              background: 'var(--surface)',
              color: 'var(--text-secondary)',
              borderRadius: '980px',
              padding: '4px 12px',
              fontSize: '13px',
              fontWeight: 400,
              textDecoration: 'line-through',
            }}>
              {ing}
            </span>
          ))}
        </div>
      )}

      {/* Match count */}
      <p className="type-caption" style={{ marginTop: '8px' }}>
        {matchCount} of {totalIngredients} ingredients matched
      </p>
    </div>
  )
}

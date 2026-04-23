// matcher.js — Recipe matching via Set Intersection
// Written from scratch — no external libraries.

/**
 * matchRecipes(nearExpiryItems, allRecipes)
 *
 * Algorithm:
 * 1. Build a Set S from the names of near-expiry items (items expiring ≤ 3 days).
 * 2. For each recipe R with ingredient set I_R:
 *      - Compute intersection  M = S ∩ I_R
 *      - Record |M| as the match score.
 * 3. Sort recipes by match score descending.
 * 4. Return top 3 recipes, each annotated with matched & unmatched ingredients.
 *
 * Time complexity:
 *   Let n = |nearExpiryItems|, r = |allRecipes|, k = avg ingredients per recipe.
 *   Building the set:           O(n)
 *   Intersection per recipe:    O(k)   (hash set lookup is O(1) amortized)
 *   Total:                      O(n + r·k)
 *   Sorting:                    O(r log r)
 *   Overall:                    O(n + r·k + r log r)
 *
 * @param {Array<string>} nearExpiryItems — list of item names expiring within 3 days
 * @param {Array<{id, name, description, ingredients: string[]}>} allRecipes
 * @returns {Array<{recipe, matchedIngredients, unmatchedIngredients, matchCount, reason}>}
 */
function matchRecipes(nearExpiryItems, allRecipes) {
  // Step 1: Build a Set of near-expiry item names (normalised to lowercase)
  const expirySet = new Set(
    nearExpiryItems.map((name) => name.toLowerCase().trim())
  );

  if (expirySet.size === 0) {
    return [];
  }

  // Step 2: Score each recipe by set intersection size
  const scored = allRecipes.map((recipe) => {
    const matched = [];
    const unmatched = [];

    for (const ing of recipe.ingredients) {
      if (expirySet.has(ing.toLowerCase().trim())) {
        matched.push(ing);
      } else {
        unmatched.push(ing);
      }
    }

    return {
      recipe: {
        id: recipe.id,
        name: recipe.name,
        description: recipe.description,
      },
      matchedIngredients: matched,
      unmatchedIngredients: unmatched,
      matchCount: matched.length,
      reason: `${matched.length} of ${recipe.ingredients.length} ingredients are expiring soon — use them in this dish!`,
    };
  });

  // Step 3: Sort by matchCount descending, break ties alphabetically
  scored.sort((a, b) => {
    if (b.matchCount !== a.matchCount) return b.matchCount - a.matchCount;
    return a.recipe.name.localeCompare(b.recipe.name);
  });

  // Step 4: Return top 3 with at least 1 match
  return scored.filter((s) => s.matchCount > 0).slice(0, 3);
}

module.exports = matchRecipes;

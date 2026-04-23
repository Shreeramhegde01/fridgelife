// routes/suggestions.js — Recipe suggestions based on near-expiry items
const express = require('express');
const router = express.Router();
const pool = require('../db');
const matchRecipes = require('../matcher');

let heap;
function setHeap(h) {
  heap = h;
}

// ─── GET /api/suggestions — top 3 recipe suggestions ─────────────
router.get('/', async (req, res) => {
  try {
    // 1. Get near-expiry item names from heap (within 3 days)
    const nearExpiry = heap.getExpiringWithin(3);
    const nearExpiryNames = nearExpiry.map((item) => item.name);

    // 2. Load all recipes with their ingredients
    const recipesResult = await pool.query(`SELECT * FROM recipes ORDER BY id`);
    const ingredientsResult = await pool.query(`SELECT * FROM recipe_ingredients ORDER BY recipe_id`);

    // Group ingredients by recipe_id
    const ingredientsByRecipe = {};
    for (const row of ingredientsResult.rows) {
      if (!ingredientsByRecipe[row.recipe_id]) {
        ingredientsByRecipe[row.recipe_id] = [];
      }
      ingredientsByRecipe[row.recipe_id].push(row.ingredient_name);
    }

    const allRecipes = recipesResult.rows.map((r) => ({
      id: r.id,
      name: r.name,
      description: r.description,
      ingredients: ingredientsByRecipe[r.id] || [],
    }));

    // 3. Run set intersection matching
    const suggestions = matchRecipes(nearExpiryNames, allRecipes);

    res.json({
      nearExpiryItems: nearExpiry,
      suggestions,
    });
  } catch (err) {
    console.error('GET /api/suggestions error:', err.message);
    res.status(500).json({ error: 'Failed to generate suggestions' });
  }
});

module.exports = { router, setHeap };

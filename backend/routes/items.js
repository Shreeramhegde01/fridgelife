// routes/items.js — CRUD + status transitions for fridge items
const express = require('express');
const router = express.Router();
const pool = require('../db');

// The heap store is injected from index.js
let heapStore;
function setHeapStore(store) {
  heapStore = store;
}

// ─── GET /api/items — all active items, sorted by expiry ASC ──────
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM items
       WHERE household_id = $1 AND status = 'active'
       ORDER BY expiry_date ASC`,
      [req.householdId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('GET /api/items error:', err.message);
    res.status(500).json({ error: 'Failed to fetch items' });
  }
});

// ─── GET /api/items/expiring — items expiring within 3 days ───────
router.get('/expiring', async (req, res) => {
  try {
    const heap = heapStore.getHeap(req.householdId);
    const expiring = heap.getExpiringWithin(3);
    res.json(expiring);
  } catch (err) {
    console.error('GET /api/items/expiring error:', err.message);
    res.status(500).json({ error: 'Failed to fetch expiring items' });
  }
});

// ─── POST /api/items — add new item ──────────────────────────────
router.post('/', async (req, res) => {
  const { name, quantity, unit, category, expiry_date } = req.body;

  if (!name || !quantity || !unit || !category || !expiry_date) {
    return res.status(400).json({ error: 'All fields are required: name, quantity, unit, category, expiry_date' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO items (household_id, name, quantity, unit, category, expiry_date)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [req.householdId, name, quantity, unit, category, expiry_date]
    );

    const item = result.rows[0];

    // Insert into in-memory heap
    const heap = heapStore.getHeap(req.householdId);
    heap.insert({
      id: item.id,
      name: item.name,
      expiry_date: item.expiry_date,
      days_remaining: Math.ceil((new Date(item.expiry_date) - new Date()) / (1000 * 60 * 60 * 24)),
    });

    res.status(201).json(item);
  } catch (err) {
    console.error('POST /api/items error:', err.message);
    res.status(500).json({ error: 'Failed to add item' });
  }
});

// ─── PUT /api/items/:id — edit item ──────────────────────────────
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { name, quantity, unit, category, expiry_date } = req.body;

  try {
    const result = await pool.query(
      `UPDATE items SET
         name = COALESCE($1, name),
         quantity = COALESCE($2, quantity),
         unit = COALESCE($3, unit),
         category = COALESCE($4, category),
         expiry_date = COALESCE($5, expiry_date)
       WHERE id = $6 AND household_id = $7 AND status = 'active'
       RETURNING *`,
      [name, quantity, unit, category, expiry_date, id, req.householdId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Item not found or not active' });
    }

    // Update heap: remove old, insert updated
    const heap = heapStore.getHeap(req.householdId);
    heap.removeById(parseInt(id));
    const item = result.rows[0];
    heap.insert({
      id: item.id,
      name: item.name,
      expiry_date: item.expiry_date,
      days_remaining: Math.ceil(
        (new Date(item.expiry_date) - new Date()) / (1000 * 60 * 60 * 24)
      ),
    });

    res.json(item);
  } catch (err) {
    console.error('PUT /api/items/:id error:', err.message);
    res.status(500).json({ error: 'Failed to update item' });
  }
});

// ─── POST /api/items/:id/used — mark as used ────────────────────
router.post('/:id/used', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `UPDATE items SET status = 'used' WHERE id = $1 AND household_id = $2 AND status = 'active' RETURNING *`,
      [id, req.householdId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Item not found or already processed' });
    }

    heapStore.getHeap(req.householdId).removeById(parseInt(id));
    res.json({ message: 'Item marked as used', item: result.rows[0] });
  } catch (err) {
    console.error('POST /api/items/:id/used error:', err.message);
    res.status(500).json({ error: 'Failed to mark item as used' });
  }
});

// ─── POST /api/items/:id/wasted — mark as wasted + log cost ────
router.post('/:id/wasted', async (req, res) => {
  const { id } = req.params;

  try {
    // 1. Get the item
    const itemResult = await pool.query(
      `UPDATE items SET status = 'wasted' WHERE id = $1 AND household_id = $2 AND status = 'active' RETURNING *`,
      [id, req.householdId]
    );

    if (itemResult.rows.length === 0) {
      return res.status(404).json({ error: 'Item not found or already processed' });
    }

    const item = itemResult.rows[0];

    // 2. Look up market price
    const priceResult = await pool.query(
      `SELECT price_per_unit FROM market_prices WHERE LOWER(item_name) = LOWER($1)`,
      [item.name]
    );

    const pricePerUnit = priceResult.rows.length > 0 ? priceResult.rows[0].price_per_unit : 0;
    const estimatedCost = item.quantity * pricePerUnit;

    // 3. Insert into waste_log
    await pool.query(
      `INSERT INTO waste_log (household_id, item_name, quantity, unit, estimated_cost)
       VALUES ($1, $2, $3, $4, $5)`,
      [req.householdId, item.name, item.quantity, item.unit, estimatedCost]
    );

    // 4. Remove from heap
    heapStore.getHeap(req.householdId).removeById(parseInt(id));

    res.json({
      message: 'Item marked as wasted',
      item,
      estimated_cost: estimatedCost,
    });
  } catch (err) {
    console.error('POST /api/items/:id/wasted error:', err.message);
    res.status(500).json({ error: 'Failed to mark item as wasted' });
  }
});

// ─── DELETE /api/items/:id — delete item entirely ───────────────
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `DELETE FROM items WHERE id = $1 AND household_id = $2 RETURNING *`,
      [id, req.householdId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }

    heapStore.getHeap(req.householdId).removeById(parseInt(id));
    res.json({ message: 'Item deleted', item: result.rows[0] });
  } catch (err) {
    console.error('DELETE /api/items/:id error:', err.message);
    res.status(500).json({ error: 'Failed to delete item' });
  }
});

module.exports = { router, setHeapStore };

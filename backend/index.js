// index.js — Express server entry point for FridgeLife
const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const pool = require('./db');
const MinHeap = require('./heap');
const { router: itemsRouter, setHeapStore: setItemsHeapStore } = require('./routes/items');
const { router: suggestionsRouter, setHeapStore: setSuggestionsHeapStore } = require('./routes/suggestions');
const wasteRouter = require('./routes/waste');

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Middleware ────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ─── Per-household heap store ─────────────────────────
// Map<householdId, MinHeap>
const heapStore = new Map();

function getHeap(householdId) {
  if (!heapStore.has(householdId)) {
    heapStore.set(householdId, new MinHeap());
  }
  return heapStore.get(householdId);
}

// Inject heap store into route modules
setItemsHeapStore({ getHeap });
setSuggestionsHeapStore({ getHeap });

// ─── Household middleware ─────────────────────────────
// Extracts household_id from x-household-id header
function requireHousehold(req, res, next) {
  const hid = parseInt(req.headers['x-household-id']);
  if (!hid || isNaN(hid)) {
    return res.status(400).json({ error: 'Missing x-household-id header' });
  }
  req.householdId = hid;
  next();
}

// ─── API Routes ───────────────────────────────────────
app.use('/api/items', requireHousehold, itemsRouter);
app.use('/api/suggestions', requireHousehold, suggestionsRouter);
app.use('/api/waste', requireHousehold, wasteRouter);

// POST /api/households — create a new household with seed items
app.post('/api/households', async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Create household
    const hResult = await client.query(
      `INSERT INTO households (name) VALUES ($1) RETURNING id`,
      [req.body.name || 'My Home']
    );
    const householdId = hResult.rows[0].id;

    // Seed with default grocery items (relative expiry dates)
    await client.query(`
      INSERT INTO items (household_id, name, quantity, unit, category, expiry_date, status) VALUES
      ($1, 'Tomatoes',           1.5,  'kg',     'vegetable', CURRENT_DATE + INTERVAL '1 day',   'active'),
      ($1, 'Spinach (Palak)',    0.5,  'kg',     'vegetable', CURRENT_DATE + INTERVAL '2 days',  'active'),
      ($1, 'Milk (Amul Taza)',   1.0,  'litres', 'dairy',     CURRENT_DATE + INTERVAL '2 days',  'active'),
      ($1, 'Curd (Dahi)',        0.5,  'kg',     'dairy',     CURRENT_DATE + INTERVAL '3 days',  'active'),
      ($1, 'Paneer',             0.25, 'kg',     'dairy',     CURRENT_DATE + INTERVAL '3 days',  'active'),
      ($1, 'Green Chillies',     0.1,  'kg',     'vegetable', CURRENT_DATE + INTERVAL '4 days',  'active'),
      ($1, 'Bananas',            6,    'pcs',    'fruit',     CURRENT_DATE + INTERVAL '4 days',  'active'),
      ($1, 'Onions',             2.0,  'kg',     'vegetable', CURRENT_DATE + INTERVAL '7 days',  'active'),
      ($1, 'Potatoes',           3.0,  'kg',     'vegetable', CURRENT_DATE + INTERVAL '10 days', 'active'),
      ($1, 'Apples',             1.0,  'kg',     'fruit',     CURRENT_DATE + INTERVAL '7 days',  'active'),
      ($1, 'Rice (Basmati)',     5.0,  'kg',     'grain',     CURRENT_DATE + INTERVAL '60 days', 'active'),
      ($1, 'Wheat Flour (Atta)', 2.0,  'kg',     'grain',     CURRENT_DATE + INTERVAL '45 days', 'active'),
      ($1, 'Toor Dal',           1.0,  'kg',     'grain',     CURRENT_DATE + INTERVAL '30 days', 'active'),
      ($1, 'Leftover Dal',       0.3,  'litres', 'leftover',  CURRENT_DATE + INTERVAL '1 day',   'active'),
      ($1, 'Leftover Rice',      0.5,  'kg',     'leftover',  CURRENT_DATE + INTERVAL '1 day',   'active')
    `, [householdId]);

    await client.query('COMMIT');

    // Build heap for this household
    const itemsResult = await pool.query(
      `SELECT id, name, expiry_date FROM items WHERE household_id = $1 AND status = 'active' ORDER BY expiry_date ASC`,
      [householdId]
    );
    const heap = getHeap(householdId);
    heap.buildHeap(itemsResult.rows);

    res.status(201).json({ id: householdId });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('POST /api/households error:', err.message);
    res.status(500).json({ error: 'Failed to create household' });
  } finally {
    client.release();
  }
});

// GET /api/heap — current heap state (requires household)
app.get('/api/heap', requireHousehold, (req, res) => {
  const heap = getHeap(req.householdId);
  res.json({
    size: heap.size,
    peek: heap.peek(),
    heap: heap.toArray(),
  });
});

// ─── Health check ─────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

// ─── Serve built frontend in production ───────────────
const frontendDist = path.join(__dirname, '..', 'frontend', 'dist');
app.use(express.static(frontendDist));

// Catch-all: serve index.html for any non-API route
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendDist, 'index.html'));
});

// ─── Build heaps from DB and start server ─────────────
async function start() {
  try {
    // Load all households and build a heap for each
    const households = await pool.query(`SELECT id FROM households`);

    for (const h of households.rows) {
      const result = await pool.query(
        `SELECT id, name, expiry_date FROM items WHERE household_id = $1 AND status = 'active' ORDER BY expiry_date ASC`,
        [h.id]
      );
      const heap = getHeap(h.id);
      heap.buildHeap(result.rows);
      console.log(`🧠 Heap built for household ${h.id} with ${heap.size} items`);
    }

    app.listen(PORT, () => {
      console.log(`🚀 FridgeLife backend running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('❌ Failed to start server:', err.message);
    process.exit(1);
  }
}

start();

// index.js — Express server entry point for FridgeLife
const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const pool = require('./db');
const MinHeap = require('./heap');
const { router: itemsRouter, setHeap: setItemsHeap } = require('./routes/items');
const { router: suggestionsRouter, setHeap: setSuggestionsHeap } = require('./routes/suggestions');
const wasteRouter = require('./routes/waste');

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Middleware ────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ─── Global heap instance ─────────────────────────────
const heap = new MinHeap();

// Inject heap into route modules
setItemsHeap(heap);
setSuggestionsHeap(heap);

// ─── API Routes ───────────────────────────────────────
app.use('/api/items', itemsRouter);
app.use('/api/suggestions', suggestionsRouter);
app.use('/api/waste', wasteRouter);

// GET /api/heap — current heap state (for teacher demo)
app.get('/api/heap', (req, res) => {
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

// ─── Build heap from DB and start server ──────────────
async function start() {
  try {
    // Load all active items from the database
    const result = await pool.query(
      `SELECT id, name, expiry_date FROM items WHERE status = 'active' ORDER BY expiry_date ASC`
    );

    // Build heap in O(n)
    heap.buildHeap(result.rows);
    console.log(`🧠 Heap built with ${heap.size} items. Peek: ${heap.peek()?.name || 'empty'}`);

    app.listen(PORT, () => {
      console.log(`🚀 FridgeLife backend running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('❌ Failed to start server:', err.message);
    process.exit(1);
  }
}

start();

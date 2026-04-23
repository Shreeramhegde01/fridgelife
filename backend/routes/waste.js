// routes/waste.js — Waste report and shopping advice
const express = require('express');
const router = express.Router();
const pool = require('../db');

// ─── GET /api/waste/report — monthly waste report ─────────────────
router.get('/report', async (req, res) => {
  try {
    // Total cost this month
    const totalResult = await pool.query(
      `SELECT COALESCE(SUM(estimated_cost), 0) AS total_cost
       FROM waste_log
       WHERE household_id = 1
         AND wasted_at >= date_trunc('month', CURRENT_DATE)`
    );

    // Item breakdown this month
    const breakdownResult = await pool.query(
      `SELECT item_name, SUM(quantity) AS total_quantity, unit,
              SUM(estimated_cost) AS total_cost, COUNT(*) AS times_wasted
       FROM waste_log
       WHERE household_id = 1
         AND wasted_at >= date_trunc('month', CURRENT_DATE)
       GROUP BY item_name, unit
       ORDER BY total_cost DESC`
    );

    // Full waste log (recent first)
    const logResult = await pool.query(
      `SELECT * FROM waste_log
       WHERE household_id = 1
       ORDER BY wasted_at DESC
       LIMIT 50`
    );

    res.json({
      total_cost: parseFloat(totalResult.rows[0].total_cost),
      breakdown: breakdownResult.rows,
      log: logResult.rows,
    });
  } catch (err) {
    console.error('GET /api/waste/report error:', err.message);
    res.status(500).json({ error: 'Failed to generate waste report' });
  }
});

// ─── GET /api/waste/shopping — top 5 most wasted items ────────────
router.get('/shopping', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT item_name, SUM(quantity) AS total_quantity, unit,
              SUM(estimated_cost) AS total_cost, COUNT(*) AS times_wasted
       FROM waste_log
       WHERE household_id = 1
       GROUP BY item_name, unit
       ORDER BY times_wasted DESC, total_cost DESC
       LIMIT 5`
    );

    res.json({
      advice: 'Buy less of these items — they get wasted the most!',
      items: result.rows,
    });
  } catch (err) {
    console.error('GET /api/waste/shopping error:', err.message);
    res.status(500).json({ error: 'Failed to generate shopping advice' });
  }
});

module.exports = router;

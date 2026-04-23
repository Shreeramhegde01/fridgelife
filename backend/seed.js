// seed.js — Run the db.sql file against the database
const fs = require('fs');
const path = require('path');
const pool = require('./db');

async function seed() {
  const sqlPath = path.join(__dirname, 'db.sql');
  const sql = fs.readFileSync(sqlPath, 'utf-8');

  try {
    await pool.query(sql);
    console.log('✅ Database seeded successfully!');
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
  } finally {
    await pool.end();
  }
}

seed();

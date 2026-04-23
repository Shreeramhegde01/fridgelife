# 🧊 FridgeLife — Household Food Expiry Tracker

> **Reduce waste. Save money. Eat smart.**

FridgeLife is a full-stack web application that helps households track grocery expiry dates, get recipe suggestions for soon-to-expire items, and understand their food waste patterns. It's designed to tackle the massive problem of domestic food waste — one fridge at a time.

---

## 🍽️ Problem It Solves

Every year, Indian households waste a staggering amount of food — not because they don't care, but because they forget what's in the fridge. FridgeLife gives you a clear, visual dashboard of everything in your kitchen, alerts you before things expire, and suggests recipes to use up what's about to go bad.

---

## 🛠️ Tech Stack

| Layer     | Technology              |
|-----------|------------------------|
| Frontend  | React + Tailwind CSS (Vite) |
| Backend   | Node.js + Express      |
| Database  | PostgreSQL (pg library) |
| Styling   | Tailwind CSS v4        |
| Font      | Nunito (Google Fonts)  |

---

## 🚀 Setup Instructions

### Prerequisites
- **Node.js** v18+
- **PostgreSQL** running locally
- **npm** or **yarn**

### 1. Clone and install

```bash
cd fridgelife

# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Database setup

Create the database and run the seed script:

```bash
# Create the database (from psql)
psql -U postgres -c "CREATE DATABASE fridgelife;"

# Seed the database
cd backend
node seed.js
```

Or run the SQL file directly:

```bash
psql -U postgres -d fridgelife -f backend/db.sql
```

### 3. Configure environment variables

Edit `backend/.env`:

```env
DB_USER=postgres
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5432
DB_NAME=fridgelife
PORT=5000
```

### 4. Run the app

```bash
# Terminal 1 — Backend (port 5000)
cd backend
npm start

# Terminal 2 — Frontend (port 3000)
cd frontend
npm run dev
```

Open **http://localhost:3000** in your browser.

---

## 🧠 Algorithms

### MinHeap (Priority Queue)

The core data structure is a **Min-Heap** sorted by `expiry_date` (soonest first).

**Implementation:** Written from scratch in `backend/heap.js` — no external libraries.

| Operation    | Time Complexity |
|-------------|----------------|
| `insert()`    | O(log n)        |
| `extractMin()` | O(log n)        |
| `peek()`      | O(1)            |
| `buildHeap()` | O(n)            |
| `removeById()` | O(n)           |

**How it works:**
- On server start, all active items are loaded from PostgreSQL and the heap is built using Floyd's bottom-up algorithm in O(n).
- When items are added, they're inserted into the heap with `heapifyUp`.
- When items are used/wasted/deleted, they're removed from the heap.
- The heap root always contains the item expiring soonest — accessible in O(1).

### Set Intersection (Recipe Matching)

The recipe suggestion engine uses **set intersection** to find the best recipes for near-expiry items.

**Implementation:** Written from scratch in `backend/matcher.js`.

**Algorithm:**
1. Build a Set `S` from names of items expiring within 3 days.
2. For each recipe `R` with ingredient set `I_R`, compute `M = S ∩ I_R`.
3. Score each recipe by `|M|` (number of matching ingredients).
4. Sort by score descending, return top 3.

| Step                    | Time Complexity        |
|------------------------|----------------------|
| Build expiry set        | O(n)                  |
| Intersection per recipe | O(k) per recipe        |
| Total                   | O(n + r·k + r·log r)  |

Where `n` = near-expiry items, `r` = recipes, `k` = avg ingredients per recipe.

---

## 📸 Screenshots

*Coming soon — run the app locally to see the beautiful UI!*

---

## 🌍 Why FridgeLife?

Food waste is one of the most solvable problems in sustainability — and it starts at home.

- 🇮🇳 **India wastes 68.8 million tonnes of food annually** — the highest in the world (UNEP Food Waste Index 2024). Much of this comes from households.
- 💰 **The average Indian family wastes ₹6,000–₹12,000 worth of food per year** due to forgotten expiry dates and over-purchasing.
- 🌱 **If Indian households reduced food waste by just 20%**, it would save enough food to feed 190 million people — and significantly reduce methane emissions from landfills.

FridgeLife is a small step toward making every household more mindful of what they buy, what they eat, and what they waste.

---

## 📁 Folder Structure

```
fridgelife/
├── backend/
│   ├── index.js           — Express server entry
│   ├── db.js              — PostgreSQL connection
│   ├── db.sql             — Schema + seed SQL
│   ├── seed.js            — DB seed script
│   ├── heap.js            — MinHeap class (from scratch)
│   ├── matcher.js         — Recipe matching algorithm (from scratch)
│   ├── .env               — Environment variables
│   └── routes/
│       ├── items.js       — CRUD + status transitions
│       ├── suggestions.js — Recipe matching endpoint
│       └── waste.js       — Waste reports & shopping advice
├── frontend/
│   ├── index.html
│   ├── vite.config.js
│   └── src/
│       ├── App.jsx
│       ├── index.css
│       └── components/
│           ├── FridgeTab.jsx
│           ├── RecipeTab.jsx
│           ├── WasteTab.jsx
│           └── HeapVisualizer.jsx
└── README.md
```

---

## 📡 API Endpoints

| Method | Endpoint              | Description                              |
|--------|----------------------|------------------------------------------|
| GET    | /api/items            | All active items (sorted by expiry)      |
| GET    | /api/items/expiring   | Items expiring within 3 days             |
| POST   | /api/items            | Add new item                             |
| PUT    | /api/items/:id        | Edit item                                |
| POST   | /api/items/:id/used   | Mark as used                             |
| POST   | /api/items/:id/wasted | Mark as wasted (logs cost)               |
| DELETE | /api/items/:id        | Delete item                              |
| GET    | /api/suggestions      | Recipe suggestions for near-expiry items |
| GET    | /api/waste/report     | Monthly waste report                     |
| GET    | /api/waste/shopping   | Top 5 most wasted items                  |
| GET    | /api/heap             | Current heap state (debug/demo)          |
| GET    | /api/health           | Server health check                      |

---

## 📜 License

MIT — built with ❤️ to fight food waste.

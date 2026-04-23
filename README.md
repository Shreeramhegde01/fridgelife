# FridgeLife — Household Food Expiry Tracker

> **Reduce waste. Save money. Eat smart.**

FridgeLife is a full-stack web application that helps households track grocery expiry dates, get recipe suggestions for soon-to-expire items, and understand food waste patterns — one fridge at a time.

**Live demo:** _coming soon (Render deployment)_

---

## The Problem

Every year, Indian households waste a staggering amount of food — not because they don't care, but because they forget what's in the fridge. FridgeLife gives you a clear, visual dashboard of everything in your kitchen, alerts you before things expire, and suggests recipes to use up what's about to go bad.

- **India wastes 68.8 million tonnes of food annually** — the highest in the world (UNEP 2024)
- **The average Indian family wastes ₹6,000–₹12,000/year** from forgotten expiry dates
- **Reducing household waste by 20%** could save enough food to feed 190 million people

---

## Tech Stack

| Layer     | Technology              |
|-----------|------------------------|
| Frontend  | React + Custom CSS (Vite) |
| Backend   | Node.js + Express      |
| Database  | PostgreSQL (Neon cloud) |
| Design    | Apple Design Language   |
| Font      | Inter (Google Fonts)    |
| Hosting   | Render                 |

---

## Features

- **Fridge Dashboard** — See all items sorted by expiry, with color-coded urgency
- **Recipe Suggestions** — Recipes matched to expiring items using set intersection
- **Waste Reports** — Monthly cost tracking with bar charts and shopping advice
- **Heap Visualizer** — Interactive SVG visualization of the min-heap data structure
- **Multi-User** — Each visitor gets an isolated household with their own data

---

## Algorithms

### MinHeap (Priority Queue)

The core data structure is a **Min-Heap** sorted by `expiry_date` (soonest first).

**Implementation:** Written from scratch in `backend/heap.js` — no external libraries.

| Operation     | Time Complexity |
|--------------|----------------|
| `insert()`     | O(log n)        |
| `extractMin()` | O(log n)        |
| `peek()`       | O(1)            |
| `buildHeap()`  | O(n)            |
| `removeById()` | O(n)           |

**How it works:**
- On server start, all active items are loaded from PostgreSQL and a heap is built per household using Floyd's bottom-up algorithm in O(n).
- When items are added, they're inserted into the heap with `heapifyUp`.
- When items are used/wasted/deleted, they're removed from the heap.
- The heap root always contains the item expiring soonest — accessible in O(1).

### Set Intersection (Recipe Matching)

**Implementation:** Written from scratch in `backend/matcher.js`.

1. Build a Set `S` from names of items expiring within 3 days.
2. For each recipe `R` with ingredient set `I_R`, compute `M = S ∩ I_R`.
3. Score each recipe by `|M|` (number of matching ingredients).
4. Sort by score descending, return top 3.

| Step                    | Time Complexity        |
|------------------------|----------------------|
| Build expiry set        | O(n)                  |
| Intersection per recipe | O(k) per recipe        |
| Total                   | O(n + r·k + r·log r)  |

---

## Run Locally

### Prerequisites

- **Node.js** v18+
- **PostgreSQL** running locally (or a Neon cloud database)
- **npm**

### 1. Clone and install

```bash
git clone https://github.com/YOUR_USERNAME/fridgelife.git
cd fridgelife

# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Database setup

**Option A — Local PostgreSQL:**

```bash
# Create the database
psql -U postgres -c "CREATE DATABASE fridgelife;"

# Seed the database with tables and sample data
cd backend
node seed.js
```

**Option B — Neon Cloud Database:**

1. Go to [console.neon.tech](https://console.neon.tech/) and create a new project
2. Copy the connection string
3. Add it to `backend/.env` as `DATABASE_URL`
4. Run `cd backend && node seed.js`

### 3. Configure environment variables

Create `backend/.env`:

```env
# For Neon cloud database
DATABASE_URL=postgresql://user:pass@host/dbname?sslmode=require

# OR for local PostgreSQL (used when DATABASE_URL is not set)
DB_USER=postgres
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5432
DB_NAME=fridgelife

# Server port
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

## Deploy to Production

### Database — Neon

1. Create a project at [console.neon.tech](https://console.neon.tech/)
2. Copy the connection string
3. Run `DATABASE_URL=<your_url> node seed.js` from the `backend/` directory

### Hosting — Render

1. Push this repo to GitHub
2. Go to [render.com](https://render.com/) → **New Web Service**
3. Connect your GitHub repo
4. Set:
   - **Root Directory:** `backend`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `node index.js`
5. Add environment variable: `DATABASE_URL` = your Neon connection string
6. Deploy

---

## Multi-User Architecture

Each visitor is automatically assigned an isolated **household**:

1. On first visit, the frontend calls `POST /api/households` to create a new household
2. The backend seeds it with 15 sample grocery items (relative expiry dates)
3. The household ID is stored in `localStorage`
4. All API calls include an `x-household-id` header
5. Data is fully isolated — users only see their own items, recipes, and waste reports
6. Clicking **"My Kitchen" → "+ New Kitchen"** in the nav deletes the current household's data and creates a fresh one

---

## API Endpoints

| Method | Endpoint              | Description                              |
|--------|----------------------|------------------------------------------|
| POST   | /api/households       | Create a new household (auto-seeded)     |
| DELETE | /api/households/:id   | Delete household and all its data        |
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

All endpoints except `/api/households` and `/api/health` require the `x-household-id` header.

---

## Folder Structure

```
fridgelife/
├── backend/
│   ├── index.js           — Express server entry
│   ├── db.js              — PostgreSQL connection (Neon + local)
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
│       ├── App.jsx         — Root with household management
│       ├── index.css       — Apple design system
│       └── components/
│           ├── Nav.jsx
│           ├── FridgeTab.jsx
│           ├── AddItemForm.jsx
│           ├── ItemRow.jsx
│           ├── RecipeTab.jsx
│           ├── RecipeCard.jsx
│           ├── WasteTab.jsx
│           ├── BarChart.jsx
│           └── HeapVisualizer.jsx
├── render.yaml             — Render deployment config
├── .gitignore
└── README.md
```

---

## License

MIT — built with care to fight food waste.

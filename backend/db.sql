-- FridgeLife Database Schema and Seed Data
-- Run: psql -U postgres -d fridgelife -f db.sql

-- Drop tables if they exist (for clean re-seeding)
DROP TABLE IF EXISTS waste_log CASCADE;
DROP TABLE IF EXISTS recipe_ingredients CASCADE;
DROP TABLE IF EXISTS recipes CASCADE;
DROP TABLE IF EXISTS market_prices CASCADE;
DROP TABLE IF EXISTS items CASCADE;
DROP TABLE IF EXISTS households CASCADE;

-- =====================
-- TABLE: households
-- =====================
CREATE TABLE households (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- =====================
-- TABLE: items
-- =====================
CREATE TABLE items (
    id SERIAL PRIMARY KEY,
    household_id INTEGER NOT NULL REFERENCES households(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    quantity FLOAT NOT NULL,
    unit VARCHAR(50) NOT NULL,
    category VARCHAR(100) NOT NULL,
    expiry_date DATE NOT NULL,
    added_at TIMESTAMP DEFAULT NOW(),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'used', 'wasted'))
);

-- =====================
-- TABLE: recipes
-- =====================
CREATE TABLE recipes (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT
);

-- =====================
-- TABLE: recipe_ingredients
-- =====================
CREATE TABLE recipe_ingredients (
    id SERIAL PRIMARY KEY,
    recipe_id INTEGER NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
    ingredient_name VARCHAR(255) NOT NULL
);

-- =====================
-- TABLE: market_prices
-- =====================
CREATE TABLE market_prices (
    id SERIAL PRIMARY KEY,
    item_name VARCHAR(255) NOT NULL,
    price_per_unit FLOAT NOT NULL,
    unit VARCHAR(50) NOT NULL
);

-- =====================
-- TABLE: waste_log
-- =====================
CREATE TABLE waste_log (
    id SERIAL PRIMARY KEY,
    household_id INTEGER NOT NULL REFERENCES households(id) ON DELETE CASCADE,
    item_name VARCHAR(255) NOT NULL,
    quantity FLOAT NOT NULL,
    unit VARCHAR(50) NOT NULL,
    estimated_cost FLOAT NOT NULL DEFAULT 0,
    wasted_at TIMESTAMP DEFAULT NOW()
);

-- =====================
-- SEED DATA
-- =====================

-- 1 household
INSERT INTO households (name) VALUES ('My Home');

-- 15 common Indian grocery items with varied expiry dates
-- Some expiring in 1-2 days, some in a week, some in a month
INSERT INTO items (household_id, name, quantity, unit, category, expiry_date, status) VALUES
(1, 'Tomatoes',           1.5,  'kg',     'vegetable', CURRENT_DATE + INTERVAL '1 day',   'active'),
(1, 'Spinach (Palak)',    0.5,  'kg',     'vegetable', CURRENT_DATE + INTERVAL '2 days',  'active'),
(1, 'Milk (Amul Taza)',   1.0,  'litres', 'dairy',     CURRENT_DATE + INTERVAL '2 days',  'active'),
(1, 'Curd (Dahi)',        0.5,  'kg',     'dairy',     CURRENT_DATE + INTERVAL '3 days',  'active'),
(1, 'Paneer',             0.25, 'kg',     'dairy',     CURRENT_DATE + INTERVAL '3 days',  'active'),
(1, 'Green Chillies',     0.1,  'kg',     'vegetable', CURRENT_DATE + INTERVAL '4 days',  'active'),
(1, 'Bananas',            6,    'pcs',    'fruit',     CURRENT_DATE + INTERVAL '4 days',  'active'),
(1, 'Onions',             2.0,  'kg',     'vegetable', CURRENT_DATE + INTERVAL '7 days',  'active'),
(1, 'Potatoes',           3.0,  'kg',     'vegetable', CURRENT_DATE + INTERVAL '10 days', 'active'),
(1, 'Apples',             1.0,  'kg',     'fruit',     CURRENT_DATE + INTERVAL '7 days',  'active'),
(1, 'Rice (Basmati)',     5.0,  'kg',     'grain',     CURRENT_DATE + INTERVAL '60 days', 'active'),
(1, 'Wheat Flour (Atta)', 2.0,  'kg',     'grain',     CURRENT_DATE + INTERVAL '45 days', 'active'),
(1, 'Toor Dal',           1.0,  'kg',     'grain',     CURRENT_DATE + INTERVAL '30 days', 'active'),
(1, 'Leftover Dal',       0.3,  'litres', 'leftover',  CURRENT_DATE + INTERVAL '1 day',   'active'),
(1, 'Leftover Rice',      0.5,  'kg',     'leftover',  CURRENT_DATE + INTERVAL '1 day',   'active');

-- 10 common Indian recipes with ingredients
INSERT INTO recipes (name, description) VALUES
('Dal Tadka',         'Comfort food classic — yellow toor dal tempered with cumin, garlic, and ghee. Pairs perfectly with hot rice.'),
('Palak Paneer',      'Creamy spinach gravy with soft paneer cubes, spiced with garam masala and a hint of cream.'),
('Aloo Gobi',         'Dry-fried cauliflower and potatoes with turmeric, cumin, and green chillies. A north Indian staple.'),
('Tomato Chutney',    'Tangy South Indian condiment made from roasted tomatoes, red chillies, and a tempering of mustard seeds.'),
('Jeera Rice',        'Fragrant basmati rice tossed with cumin seeds and ghee. The perfect side dish for any dal or curry.'),
('Egg Fried Rice',    'Quick Indo-Chinese fried rice with leftover rice, eggs, veggies, and soy sauce.'),
('Banana Sheera',     'Sweet semolina pudding with ripe bananas, cardamom, and ghee — a Maharashtrian favourite.'),
('Curd Rice',         'Cool, creamy rice mixed with fresh curd, tempered with mustard seeds, curry leaves, and ginger.'),
('Paneer Bhurji',     'Scrambled paneer cooked with onions, tomatoes, and green chillies — like Indian scrambled eggs.'),
('Onion Paratha',     'Stuffed whole wheat flatbread with spiced onion filling — perfect for breakfast or lunch.');

-- Recipe ingredients
-- 1. Dal Tadka
INSERT INTO recipe_ingredients (recipe_id, ingredient_name) VALUES
(1, 'Toor Dal'), (1, 'Tomatoes'), (1, 'Onions'), (1, 'Green Chillies'), (1, 'Ghee');

-- 2. Palak Paneer
INSERT INTO recipe_ingredients (recipe_id, ingredient_name) VALUES
(2, 'Spinach (Palak)'), (2, 'Paneer'), (2, 'Onions'), (2, 'Tomatoes'), (2, 'Cream');

-- 3. Aloo Gobi
INSERT INTO recipe_ingredients (recipe_id, ingredient_name) VALUES
(3, 'Potatoes'), (3, 'Cauliflower'), (3, 'Onions'), (3, 'Green Chillies'), (3, 'Tomatoes');

-- 4. Tomato Chutney
INSERT INTO recipe_ingredients (recipe_id, ingredient_name) VALUES
(4, 'Tomatoes'), (4, 'Red Chillies'), (4, 'Onions'), (4, 'Mustard Seeds');

-- 5. Jeera Rice
INSERT INTO recipe_ingredients (recipe_id, ingredient_name) VALUES
(5, 'Rice (Basmati)'), (5, 'Cumin Seeds'), (5, 'Ghee');

-- 6. Egg Fried Rice
INSERT INTO recipe_ingredients (recipe_id, ingredient_name) VALUES
(6, 'Leftover Rice'), (6, 'Eggs'), (6, 'Onions'), (6, 'Green Chillies'), (6, 'Soy Sauce');

-- 7. Banana Sheera
INSERT INTO recipe_ingredients (recipe_id, ingredient_name) VALUES
(7, 'Bananas'), (7, 'Semolina'), (7, 'Ghee'), (7, 'Sugar');

-- 8. Curd Rice
INSERT INTO recipe_ingredients (recipe_id, ingredient_name) VALUES
(8, 'Leftover Rice'), (8, 'Curd (Dahi)'), (8, 'Mustard Seeds'), (8, 'Curry Leaves');

-- 9. Paneer Bhurji
INSERT INTO recipe_ingredients (recipe_id, ingredient_name) VALUES
(9, 'Paneer'), (9, 'Onions'), (9, 'Tomatoes'), (9, 'Green Chillies');

-- 10. Onion Paratha
INSERT INTO recipe_ingredients (recipe_id, ingredient_name) VALUES
(10, 'Wheat Flour (Atta)'), (10, 'Onions'), (10, 'Green Chillies'), (10, 'Ghee');

-- 20 common items in market_prices with realistic INR prices
INSERT INTO market_prices (item_name, price_per_unit, unit) VALUES
('Tomatoes',             40,   'kg'),
('Spinach (Palak)',      30,   'kg'),
('Milk (Amul Taza)',     56,   'litres'),
('Curd (Dahi)',          60,   'kg'),
('Paneer',              380,   'kg'),
('Green Chillies',      120,   'kg'),
('Bananas',               6,   'pcs'),
('Onions',               35,   'kg'),
('Potatoes',             30,   'kg'),
('Apples',              180,   'kg'),
('Rice (Basmati)',       90,   'kg'),
('Wheat Flour (Atta)',   45,   'kg'),
('Toor Dal',            140,   'kg'),
('Cauliflower',          40,   'kg'),
('Carrots',              50,   'kg'),
('Capsicum',             80,   'kg'),
('Eggs',                  7,   'pcs'),
('Bread',                45,   'pcs'),
('Butter',              530,   'kg'),
('Ghee',                650,   'kg');

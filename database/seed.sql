-- ============================================================
-- SplitTab Seed Data
-- ============================================================

BEGIN;

-- ============================================================
-- USERS
-- ============================================================

INSERT INTO users (id, email, username, password_hash, display_name) VALUES
(
    'a1000000-0000-0000-0000-000000000001',
    'arjun.mehta@example.com',
    'arjunmehta',
    '$2b$12$KIXsM9R1pFqL2vN3oT5uAeWzYdCbHjGmPxQrVsUwXyZaBlDkEnFo',
    'Arjun Mehta'
),
(
    'a1000000-0000-0000-0000-000000000002',
    'priya.sharma@example.com',
    'priyasharma',
    '$2b$12$NLYtO0S2qGrM3wP4pU6vBfXaZeCcIkHnQyRsWtVxYbAmCjElFoGp',
    'Priya Sharma'
),
(
    'a1000000-0000-0000-0000-000000000003',
    'rohan.verma@example.com',
    'rohanverma',
    '$2b$12$PLZuP1T3rHsN4xQ5qV7wCgYbAfDdJlIoRzStXuWyZcBnDkFmGpHq',
    'Rohan Verma'
);


-- ============================================================
-- GROUP
-- ============================================================

INSERT INTO groups (id, name, description, created_by) VALUES
(
    'b2000000-0000-0000-0000-000000000001',
    'Goa Trip 2024',
    'Five days in Goa — flights, stays, food, and everything in between.',
    'a1000000-0000-0000-0000-000000000001'
);


-- ============================================================
-- GROUP MEMBERS
-- ============================================================

INSERT INTO group_members (id, group_id, user_id, role) VALUES
(
    'c3000000-0000-0000-0000-000000000001',
    'b2000000-0000-0000-0000-000000000001',
    'a1000000-0000-0000-0000-000000000001',
    'admin'
),
(
    'c3000000-0000-0000-0000-000000000002',
    'b2000000-0000-0000-0000-000000000001',
    'a1000000-0000-0000-0000-000000000002',
    'member'
),
(
    'c3000000-0000-0000-0000-000000000003',
    'b2000000-0000-0000-0000-000000000001',
    'a1000000-0000-0000-0000-000000000003',
    'member'
);


-- ============================================================
-- EXPENSES
-- ============================================================

-- Expense 1: Arjun paid for hotel (split equally: 3600 / 3 = 1200 each)
INSERT INTO expenses (id, group_id, paid_by, description, total_amount, currency, expense_date) VALUES
(
    'd4000000-0000-0000-0000-000000000001',
    'b2000000-0000-0000-0000-000000000001',
    'a1000000-0000-0000-0000-000000000001',
    'Hotel stay — 3 nights at Baga Beach Resort',
    3600.00,
    'INR',
    '2024-11-10'
);

-- Expense 2: Priya paid for flights (split equally: 15000 / 3 = 5000 each)
INSERT INTO expenses (id, group_id, paid_by, description, total_amount, currency, expense_date) VALUES
(
    'd4000000-0000-0000-0000-000000000002',
    'b2000000-0000-0000-0000-000000000001',
    'a1000000-0000-0000-0000-000000000002',
    'Return flights Mumbai–Goa (all 3 tickets)',
    15000.00,
    'INR',
    '2024-11-08'
);

-- Expense 3: Rohan paid for group dinner (split equally: 2400 / 3 = 800 each)
INSERT INTO expenses (id, group_id, paid_by, description, total_amount, currency, expense_date) VALUES
(
    'd4000000-0000-0000-0000-000000000003',
    'b2000000-0000-0000-0000-000000000001',
    'a1000000-0000-0000-0000-000000000003',
    'Group dinner at Thalassa Restaurant',
    2400.00,
    'INR',
    '2024-11-12'
);


-- ============================================================
-- EXPENSE SPLITS
-- ============================================================

-- Splits for Expense 1: Hotel (Arjun paid 3600, each owes 1200)
INSERT INTO expense_splits (id, expense_id, user_id, amount_owed) VALUES
(
    'e5000000-0000-0000-0000-000000000001',
    'd4000000-0000-0000-0000-000000000001',
    'a1000000-0000-0000-0000-000000000001',
    1200.00
),
(
    'e5000000-0000-0000-0000-000000000002',
    'd4000000-0000-0000-0000-000000000001',
    'a1000000-0000-0000-0000-000000000002',
    1200.00
),
(
    'e5000000-0000-0000-0000-000000000003',
    'd4000000-0000-0000-0000-000000000001',
    'a1000000-0000-0000-0000-000000000003',
    1200.00
);

-- Splits for Expense 2: Flights (Priya paid 15000, each owes 5000)
INSERT INTO expense_splits (id, expense_id, user_id, amount_owed) VALUES
(
    'e5000000-0000-0000-0000-000000000004',
    'd4000000-0000-0000-0000-000000000002',
    'a1000000-0000-0000-0000-000000000001',
    5000.00
),
(
    'e5000000-0000-0000-0000-000000000005',
    'd4000000-0000-0000-0000-000000000002',
    'a1000000-0000-0000-0000-000000000002',
    5000.00
),
(
    'e5000000-0000-0000-0000-000000000006',
    'd4000000-0000-0000-0000-000000000002',
    'a1000000-0000-0000-0000-000000000003',
    5000.00
);

-- Splits for Expense 3: Dinner (Rohan paid 2400, each owes 800)
INSERT INTO expense_splits (id, expense_id, user_id, amount_owed) VALUES
(
    'e5000000-0000-0000-0000-000000000007',
    'd4000000-0000-0000-0000-000000000003',
    'a1000000-0000-0000-0000-000000000001',
    800.00
),
(
    'e5000000-0000-0000-0000-000000000008',
    'd4000000-0000-0000-0000-000000000003',
    'a1000000-0000-0000-0000-000000000002',
    800.00
),
(
    'e5000000-0000-0000-0000-000000000009',
    'd4000000-0000-0000-0000-000000000003',
    'a1000000-0000-0000-0000-000000000003',
    800.00
);

-- ============================================================
-- NET BALANCE SUMMARY (for reference, not inserted)
--
-- From splits each person owes:
--   Arjun owes:  1200 (hotel) + 5000 (flights) + 800 (dinner) = 7000
--   Priya owes:  1200 (hotel) + 5000 (flights) + 800 (dinner) = 7000
--   Rohan owes:  1200 (hotel) + 5000 (flights) + 800 (dinner) = 7000
--
-- Each person paid:
--   Arjun paid:  3600
--   Priya paid:  15000
--   Rohan paid:  2400
--
-- Net position (paid - owed):
--   Arjun:  3600 - 7000 = -3400  (owes net ₹3400)
--   Priya:  15000 - 7000 = +8000  (is owed net ₹8000)
--   Rohan:  2400 - 7000 = -4600  (owes net ₹4600)
--
-- Simplified settlements (algorithm output):
--   Rohan  → Priya: ₹4600
--   Arjun  → Priya: ₹3400
--   (2 transactions, not 6 — this is the algorithm's value)
-- ============================================================


-- ============================================================
-- SETTLEMENTS
-- ============================================================

-- Settlement 1: Arjun pays Priya ₹3400 to fully clear his debt
INSERT INTO settlements (id, group_id, paid_by, paid_to, amount, note) VALUES
(
    'f6000000-0000-0000-0000-000000000001',
    'b2000000-0000-0000-0000-000000000001',
    'a1000000-0000-0000-0000-000000000001',
    'a1000000-0000-0000-0000-000000000002',
    3400.00,
    'UPI transfer — clearing Goa trip balance'
);

-- Settlement 2: Rohan pays Priya ₹4600 to fully clear his debt
INSERT INTO settlements (id, group_id, paid_by, paid_to, amount, note) VALUES
(
    'f6000000-0000-0000-0000-000000000002',
    'b2000000-0000-0000-0000-000000000001',
    'a1000000-0000-0000-0000-000000000003',
    'a1000000-0000-0000-0000-000000000002',
    4600.00,
    'Bank transfer — clearing Goa trip balance'
);

COMMIT;
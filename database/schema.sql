-- ============================================================
-- SplitTab Database Schema
-- Designed from first principles for PostgreSQL
-- ============================================================

-- Enable pgcrypto for UUID generation
CREATE EXTENSION IF NOT EXISTS pgcrypto;


-- ============================================================
-- TABLE: users
-- Represents an authenticated person with an account.
-- ============================================================
CREATE TABLE users (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email       TEXT NOT NULL UNIQUE,
    username    TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    display_name TEXT NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ============================================================
-- TABLE: groups
-- Represents a named expense-sharing context.
-- ============================================================
CREATE TABLE groups (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        TEXT NOT NULL,
    description TEXT,
    created_by  UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ============================================================
-- TABLE: group_members
-- Many-to-many join between users and groups.
-- Carries role and join timestamp as first-class data.
-- ============================================================
CREATE TABLE group_members (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id    UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    role        TEXT NOT NULL DEFAULT 'member'
                    CHECK (role IN ('admin', 'member')),
    joined_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE (group_id, user_id)
);


-- ============================================================
-- TABLE: expenses
-- Represents a single payment event made by one person
-- on behalf of the group.
-- ============================================================
CREATE TABLE expenses (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id        UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    paid_by         UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    description     TEXT NOT NULL,
    total_amount    NUMERIC(12, 2) NOT NULL CHECK (total_amount > 0),
    currency        CHAR(3) NOT NULL DEFAULT 'INR',
    expense_date    DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ============================================================
-- TABLE: expense_splits
-- Represents each member's share of a specific expense.
-- One row per (expense, user) pair.
-- ============================================================
CREATE TABLE expense_splits (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    expense_id  UUID NOT NULL REFERENCES expenses(id) ON DELETE CASCADE,
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    amount_owed NUMERIC(12, 2) NOT NULL CHECK (amount_owed >= 0),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE (expense_id, user_id)
);


-- ============================================================
-- TABLE: settlements
-- Represents a bilateral money transfer between two group
-- members to resolve a debt. Distinct from expenses.
-- ============================================================
CREATE TABLE settlements (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id    UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    paid_by     UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    paid_to     UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    amount      NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
    note        TEXT,
    settled_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CHECK (paid_by <> paid_to)
);


-- ============================================================
-- INDEXES
-- Added for the most common query patterns.
-- ============================================================

-- Look up all members of a group
CREATE INDEX idx_group_members_group_id ON group_members(group_id);

-- Look up all groups a user belongs to
CREATE INDEX idx_group_members_user_id ON group_members(user_id);

-- Look up all expenses in a group (most common read path)
CREATE INDEX idx_expenses_group_id ON expenses(group_id);

-- Look up all expenses paid by a user
CREATE INDEX idx_expenses_paid_by ON expenses(paid_by);

-- Look up all splits for a given expense
CREATE INDEX idx_expense_splits_expense_id ON expense_splits(expense_id);

-- Look up all amounts a user owes across all expenses
CREATE INDEX idx_expense_splits_user_id ON expense_splits(user_id);

-- Look up all settlements in a group
CREATE INDEX idx_settlements_group_id ON settlements(group_id);
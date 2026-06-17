-- ============================================================
-- VastraSilai — DROP empty shell tables & RECREATE with proper columns
-- All tables are empty so no data is lost.
-- Run this in Supabase SQL Editor
-- ============================================================

-- Drop existing empty tables (no data, safe to drop)
DROP TABLE IF EXISTS "Payments"      CASCADE;
DROP TABLE IF EXISTS "Notifications" CASCADE;
DROP TABLE IF EXISTS "Orders"        CASCADE;
DROP TABLE IF EXISTS "Measurements"  CASCADE;
DROP TABLE IF EXISTS "Customers"     CASCADE;
DROP TABLE IF EXISTS "Tailors"       CASCADE;

-- ============================================================
-- 1) TAILORS
-- ============================================================
CREATE TABLE "Tailors" (
    tailor_id     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_user_id  UUID UNIQUE NOT NULL,
    name          TEXT NOT NULL,
    phone         TEXT,
    email         TEXT UNIQUE NOT NULL,
    shop_name     TEXT,
    address       TEXT,
    language      TEXT DEFAULT 'en',
    created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 2) CUSTOMERS
-- ============================================================
CREATE TABLE "Customers" (
    customer_id   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tailor_id     UUID NOT NULL REFERENCES "Tailors"(tailor_id) ON DELETE CASCADE,
    customer_name TEXT NOT NULL,
    phone         TEXT,
    email         TEXT,
    address       TEXT,
    language      TEXT DEFAULT 'en',
    created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 3) MEASUREMENTS
-- ============================================================
CREATE TABLE "Measurements" (
    measurement_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id    UUID NOT NULL REFERENCES "Customers"(customer_id) ON DELETE CASCADE,
    chest          NUMERIC(5,2),
    waist          NUMERIC(5,2),
    hips           NUMERIC(5,2),
    shoulder       NUMERIC(5,2),
    sleeve_length  NUMERIC(5,2),
    neck           NUMERIC(5,2),
    inseam         NUMERIC(5,2),
    notes          TEXT,
    recorded_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 4) ORDERS
-- ============================================================
CREATE TABLE "Orders" (
    order_id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id    UUID NOT NULL REFERENCES "Customers"(customer_id) ON DELETE CASCADE,
    cloth_type     TEXT NOT NULL,
    description    TEXT,
    delivery_date  DATE,
    status         TEXT DEFAULT 'pending'
                        CHECK (status IN ('pending','in_progress','ready','delivered','cancelled')),
    created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 5) PAYMENTS
-- ============================================================
CREATE TABLE "Payments" (
    payment_id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id         UUID NOT NULL REFERENCES "Orders"(order_id) ON DELETE CASCADE,
    total_amount     NUMERIC(10,2) NOT NULL DEFAULT 0,
    advance_amount   NUMERIC(10,2) NOT NULL DEFAULT 0,
    remaining_amount NUMERIC(10,2) GENERATED ALWAYS AS (total_amount - advance_amount) STORED,
    payment_status   TEXT DEFAULT 'pending'
                          CHECK (payment_status IN ('pending','partial','paid')),
    paid_at          TIMESTAMPTZ,
    created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 6) NOTIFICATIONS
-- ============================================================
CREATE TABLE "Notifications" (
    notification_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id        UUID NOT NULL REFERENCES "Orders"(order_id) ON DELETE CASCADE,
    message         TEXT NOT NULL,
    type            TEXT DEFAULT 'whatsapp'
                         CHECK (type IN ('whatsapp','sms','email','push')),
    sent_status     BOOLEAN DEFAULT FALSE,
    sent_at         TIMESTAMPTZ,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- Enable RLS on all tables
-- ============================================================
ALTER TABLE "Tailors"       ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Customers"     ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Measurements"  ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Orders"        ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Payments"      ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Notifications" ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- RLS Policies
-- ============================================================

-- Tailors: only own row
CREATE POLICY "tailor_own" ON "Tailors"
    FOR ALL USING (auth.uid() = auth_user_id);

-- Customers: tailor sees only their customers
CREATE POLICY "customer_own" ON "Customers"
    FOR ALL USING (
        tailor_id = (SELECT tailor_id FROM "Tailors" WHERE auth_user_id = auth.uid())
    );

-- Measurements: via customer ownership
CREATE POLICY "measurement_own" ON "Measurements"
    FOR ALL USING (
        customer_id IN (
            SELECT customer_id FROM "Customers"
            WHERE tailor_id = (SELECT tailor_id FROM "Tailors" WHERE auth_user_id = auth.uid())
        )
    );

-- Orders: via customer ownership
CREATE POLICY "order_own" ON "Orders"
    FOR ALL USING (
        customer_id IN (
            SELECT customer_id FROM "Customers"
            WHERE tailor_id = (SELECT tailor_id FROM "Tailors" WHERE auth_user_id = auth.uid())
        )
    );

-- Payments: via order → customer → tailor
CREATE POLICY "payment_own" ON "Payments"
    FOR ALL USING (
        order_id IN (
            SELECT order_id FROM "Orders" WHERE customer_id IN (
                SELECT customer_id FROM "Customers"
                WHERE tailor_id = (SELECT tailor_id FROM "Tailors" WHERE auth_user_id = auth.uid())
            )
        )
    );

-- Notifications: via order chain
CREATE POLICY "notification_own" ON "Notifications"
    FOR ALL USING (
        order_id IN (
            SELECT order_id FROM "Orders" WHERE customer_id IN (
                SELECT customer_id FROM "Customers"
                WHERE tailor_id = (SELECT tailor_id FROM "Tailors" WHERE auth_user_id = auth.uid())
            )
        )
    );

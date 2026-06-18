-- ============================================================
-- VastraSilai — Create MISSING tables only
-- Run this in Supabase SQL Editor
-- ============================================================

-- 1) MEASUREMENTS table
CREATE TABLE IF NOT EXISTS "Measurements" (
    measurement_id  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id     UUID NOT NULL REFERENCES "Customers"(customer_id) ON DELETE CASCADE,
    chest           NUMERIC(5,2),
    waist           NUMERIC(5,2),
    hips            NUMERIC(5,2),
    shoulder        NUMERIC(5,2),
    sleeve_length   NUMERIC(5,2),
    neck            NUMERIC(5,2),
    inseam          NUMERIC(5,2),
    notes           TEXT,
    recorded_at     TIMESTAMPTZ DEFAULT NOW()
);

-- 2) NOTIFICATIONS table
CREATE TABLE IF NOT EXISTS "Notifications" (
    notification_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id        UUID NOT NULL REFERENCES "Orders"(order_id) ON DELETE CASCADE,
    message         TEXT NOT NULL,
    type            TEXT DEFAULT 'whatsapp'
                         CHECK (type IN ('whatsapp','sms','email','push')),
    sent_status     BOOLEAN DEFAULT FALSE,
    sent_at         TIMESTAMPTZ,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE "Measurements"  ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Notifications" ENABLE ROW LEVEL SECURITY;

-- Allow all operations for authenticated users (simple policy)
CREATE POLICY "measurements_all" ON "Measurements"
    FOR ALL USING (true);

CREATE POLICY "notifications_all" ON "Notifications"
    FOR ALL USING (true);

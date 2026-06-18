-- Add missing payment_method column to existing Payments table
-- Run once in Supabase SQL Editor if payment updates return 500 errors

ALTER TABLE "Payments"
    ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'cash'
        CHECK (payment_method IN ('cash','card','upi'));

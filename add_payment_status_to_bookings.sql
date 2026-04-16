-- Add payment columns to bookings table
-- Run this in your Supabase SQL Editor

ALTER TABLE bookings ADD COLUMN IF NOT EXISTS payment_status TEXT CHECK (payment_status IN ('unpaid', 'paid', 'failed')) DEFAULT 'unpaid';
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS yoco_checkout_id TEXT;

-- Update existing bookings to have 'unpaid' payment_status
UPDATE bookings SET payment_status = 'unpaid' WHERE payment_status IS NULL;

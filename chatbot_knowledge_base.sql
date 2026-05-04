-- ============================================================
-- Run this in Supabase SQL Editor BEFORE using the chatbot
-- ============================================================

-- 1. Enable pgvector
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Knowledge base table (768 dims = Gemini text-embedding-004)
CREATE TABLE IF NOT EXISTS kb_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT,
  embedding vector(768),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Vector similarity index
CREATE INDEX IF NOT EXISTS kb_documents_embedding_idx
  ON kb_documents USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- 4. Match function used by the chat edge function
CREATE OR REPLACE FUNCTION match_kb_documents(
  query_embedding vector(768),
  match_count INT DEFAULT 5
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  content TEXT,
  category TEXT,
  similarity FLOAT
)
LANGUAGE SQL STABLE
AS $$
  SELECT id, title, content, category,
         1 - (embedding <=> query_embedding) AS similarity
  FROM kb_documents
  WHERE embedding IS NOT NULL
  ORDER BY embedding <=> query_embedding
  LIMIT match_count;
$$;

-- 5. RLS — public read, service role writes
ALTER TABLE kb_documents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "kb public read" ON kb_documents;
CREATE POLICY "kb public read" ON kb_documents FOR SELECT USING (true);

-- 6. Seed the knowledge base content (re-run safe)
TRUNCATE kb_documents;

INSERT INTO kb_documents (title, category, content) VALUES
('How to book a shuttle', 'booking',
'To book a shuttle on Cape Town Shuttle Services: 1) Click "Book Now" in the navigation or visit /book. 2) Choose a service tab — Shuttle Service for general trips, or Staff Service for Employee Transportation and Staff Shuttle Service. 3) Select a Trip Type from the dropdown (Airport Transfers, Chauffeur Services, Point-to-Point, Custom Trip, etc.). 4) Pick a vehicle from the fleet. 5) Fill in pickup location, drop-off, date, time, and number of passengers. 6) Add extra details — required if you chose Custom Trip. 7) Submit to create the booking.'),

('Custom Trip bookings', 'booking',
'If your travel needs do not fit a standard category, choose the "Custom Trip" option in the Trip Type dropdown on the booking form. When Custom Trip is selected, you must describe your requirements in the Extra Details textarea so the team can plan and quote your ride accurately.'),

('Booking lifecycle and statuses', 'booking',
'Bookings move through these statuses: pending (just created, awaiting admin review), confirmed (admin approved and a driver/vehicle is being assigned), assigned (driver assigned and visible to the driver), in_progress (trip currently happening), completed (trip finished — you can rate the driver), cancelled (booking was cancelled). You can track status in real time on your Dashboard.'),

('Driver assignment', 'driver',
'After you submit a booking, an admin reviews it and assigns a vehicle and a driver from the available fleet. Once assigned, the driver receives the trip in their Driver Dashboard and you will see the assigned driver and vehicle details on your booking. Driver assignment happens server-side by admins — passengers do not pick the driver directly.'),

('Yoco payments', 'payments',
'Cape Town Shuttle Services uses Yoco for secure card payments. After a booking is confirmed you can pay from your Dashboard: click Pay, you will be redirected to Yoco''s hosted checkout page, complete payment with your card, and you''ll be returned to a Payment Success or Payment Cancelled page. Payment status on the booking updates automatically via a Yoco webhook to "paid", "unpaid", or "failed". Your card details never touch our servers — Yoco handles all card data.'),

('Payment status meanings', 'payments',
'unpaid = booking exists but not yet paid. paid = Yoco confirmed the payment via webhook. failed = the payment attempt failed, you can retry from the Dashboard. If a payment seems stuck, refresh your Dashboard — payment status updates in real time.'),

('Rating drivers', 'ratings',
'After a trip is marked completed you can rate your driver 1–5 stars from your Dashboard. Each rating is linked to the specific booking and driver. Ratings help maintain service quality and are visible to admins.'),

('User accounts and profile', 'account',
'Sign up or log in at /auth using email + password or Google. Your profile (full name, phone, avatar) lives at /profile and can be edited any time. After login you are redirected based on your role: regular users go to the Dashboard, drivers to the Driver Dashboard, and admins to the Admin panel.'),

('Fleet and vehicles', 'fleet',
'Browse the available fleet at /fleet. Each vehicle shows its name, capacity, description, image, and price per kilometre. Admins manage the fleet through the Admin Fleet page including image uploads.'),

('Services offered', 'services',
'Cape Town Shuttle Services offers: Airport Transfers, Chauffeur Services, Point-to-Point transfers, Employee Transportation, Staff Shuttle Service, and Custom Trips. The Staff Service tab on the booking form is dedicated to Employee Transportation and Staff Shuttle Service bookings.'),

('Real-time updates', 'system',
'The user Dashboard and Admin Dashboard use Supabase Realtime, so booking status changes, driver assignments, and payment confirmations appear instantly without refreshing the page.'),

('Contact and support', 'support',
'For questions not answered here, visit the Contact page (/contact) to reach the Cape Town Shuttle Services team.');

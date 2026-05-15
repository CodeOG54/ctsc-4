-- ============================================================
-- FULL SUPABASE CHATBOT KB SCHEMA (OPENAI 1536 DIMENSIONS)
-- ============================================================

-- Enable pgvector
CREATE EXTENSION IF NOT EXISTS vector;

-- ============================================================
-- KNOWLEDGE BASE TABLE
-- ============================================================

DROP TABLE IF EXISTS kb_documents CASCADE;

CREATE TABLE kb_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT,
  embedding vector(1536),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- VECTOR SEARCH INDEX
-- ============================================================

CREATE INDEX kb_documents_embedding_idx
ON kb_documents
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- ============================================================
-- MATCH FUNCTION FOR RAG SEARCH
-- ============================================================

CREATE OR REPLACE FUNCTION match_kb_documents(
  query_embedding vector(1536),
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
  SELECT
    id,
    title,
    content,
    category,
    1 - (embedding <=> query_embedding) AS similarity
  FROM kb_documents
  WHERE embedding IS NOT NULL
  ORDER BY embedding <=> query_embedding
  LIMIT match_count;
$$;

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE kb_documents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "kb public read" ON kb_documents;

CREATE POLICY "kb public read"
ON kb_documents
FOR SELECT
USING (true);

-- ============================================================
-- CLEAR OLD DATA
-- ============================================================

TRUNCATE kb_documents;

-- ============================================================
-- SEED KNOWLEDGE BASE CONTENT
-- ============================================================

INSERT INTO kb_documents (title, category, content) VALUES

(
'How to book a shuttle',
'booking',
'To book a shuttle on Cape Town Shuttle Services:
1) Click "Book Now" in the navigation or visit /book.
2) Choose a service tab — Shuttle Service for general trips, or Staff Service for Employee Transportation and Staff Shuttle Service.
3) Select a Trip Type from the dropdown (Airport Transfers, Chauffeur Services, Point-to-Point, Custom Trip, etc.).
4) Pick a vehicle from the fleet.
5) Fill in pickup location, drop-off, date, time, and number of passengers.
6) Add extra details — required if you chose Custom Trip.
7) Submit to create the booking.'
),

(
'Custom Trip bookings',
'booking',
'If your travel needs do not fit a standard category, choose the "Custom Trip" option in the Trip Type dropdown on the booking form. When Custom Trip is selected, you must describe your requirements in the Extra Details textarea so the team can plan and quote your ride accurately.'
),

(
'Booking lifecycle and statuses',
'booking',
'Bookings move through these statuses:
pending = just created and awaiting admin review.
confirmed = admin approved and a driver/vehicle is being assigned.
assigned = driver assigned and visible to the driver.
in_progress = trip currently happening.
completed = trip finished and you can rate the driver.
cancelled = booking was cancelled.

Users can track booking status in real time from the Dashboard.'
),

(
'Driver assignment',
'driver',
'After a booking is submitted, an admin reviews it and assigns a vehicle and driver from the available fleet. Once assigned, the driver receives the trip in their Driver Dashboard and the user sees the assigned driver and vehicle details on their booking.'
),

(
'Yoco payments',
'payments',
'Cape Town Shuttle Services uses Yoco for secure card payments. After a booking is confirmed, users can pay from their Dashboard by clicking Pay. They are redirected to Yoco hosted checkout to complete payment securely.

Payment status updates automatically through a Yoco webhook and can become:
paid,
unpaid,
or failed.

Card details never touch the platform servers because Yoco handles all payment processing securely.'
),

(
'Payment status meanings',
'payments',
'unpaid means the booking exists but payment has not been completed.
paid means Yoco confirmed the payment successfully.
failed means the payment attempt failed and can be retried from the Dashboard.'
),

(
'Rating drivers',
'ratings',
'After a trip is marked completed, users can rate their driver from 1 to 5 stars directly from the Dashboard. Ratings are linked to the booking and help maintain service quality.'
),

(
'User accounts and profiles',
'account',
'Users can sign up or log in using email/password or Google authentication. Profiles include full name, phone number, and avatar image.

After login:
regular users go to the Dashboard,
drivers go to the Driver Dashboard,
admins go to the Admin Panel.'
),

(
'Fleet and vehicles',
'fleet',
'The fleet page displays available vehicles with name, passenger capacity, description, image, and price per kilometre. Admins can manage fleet information and upload images from the Admin Fleet page.'
),

(
'Services offered',
'services',
'Cape Town Shuttle Services provides:
Airport Transfers,
Chauffeur Services,
Point-to-Point Transfers,
Employee Transportation,
Staff Shuttle Services,
and Custom Trips.'
),

(
'Realtime updates',
'system',
'The system uses Supabase Realtime so booking status changes, payment confirmations, and driver assignments appear instantly without requiring page refreshes.'
),

(
'Contact and support',
'support',
'Users can visit the Contact page at /contact to reach the Cape Town Shuttle Services support team for additional assistance.'
);

-- ============================================================
-- DONE
-- ============================================================
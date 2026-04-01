-- Trip Types & Sample Bookings

-- Create trip_types table for managing booking types
CREATE TABLE trip_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  service_type TEXT NOT NULL CHECK (service_type IN ('airport_transfer','chauffeur','point_to_point')),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert Trip Types
INSERT INTO trip_types (name, description, service_type, is_active, created_at)
VALUES
  ('Airport Transfers', 'Door-to-door service to/from the airport with flight tracking', 'airport_transfer', true, NOW()),
  ('Shuttle Service', 'Point-to-point transportation for individuals or small groups', 'point_to_point', true, NOW()),
  ('Cape Town Tour', 'Guided or self-drive tours around Cape Town''s iconic locations', 'point_to_point', true, NOW()),
  ('Chauffeur Service', 'Premium chauffeur-driven transportation for executives and VIPs', 'chauffeur', true, NOW()),
  ('Custom Booking', 'Customized transportation solutions for specific needs', 'point_to_point', true, NOW());

-- Enable RLS on trip_types
ALTER TABLE trip_types ENABLE ROW LEVEL SECURITY;

-- RLS Policies for trip_types
CREATE POLICY "Anyone can view active trip types" ON trip_types FOR SELECT USING (is_active = true);
CREATE POLICY "Admins manage trip types" ON trip_types FOR ALL USING ((SELECT EXISTS(SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')));

-- Sample Test Bookings
-- Note: Replace the UUIDs with actual user_id, vehicle_id, and driver_id from your database

-- Get IDs for sample data (you'll need to run this separately to get actual IDs)
-- SELECT id FROM vehicles LIMIT 1; -- Get a vehicle ID
-- SELECT id FROM drivers LIMIT 1; -- Get a driver ID
-- You'll also need a user_id from auth.users

-- To insert test bookings, uncomment and replace the UUIDs below:
/*
-- Sample Booking 1: Airport Transfer
INSERT INTO bookings (
  user_id,
  vehicle_id,
  driver_id,
  service_type,
  booking_type,
  pickup_location,
  dropoff_location,
  pickup_date,
  pickup_time,
  status,
  price_estimate,
  is_favourite,
  notes,
  created_at,
  updated_at
)
VALUES (
  '550e8400-e29b-41d4-a716-446655440000'::UUID, -- Replace with actual user_id
  (SELECT id FROM vehicles WHERE name = 'BMW 530D' LIMIT 1),
  (SELECT id FROM drivers WHERE full_name = 'Thabo Mthembu' LIMIT 1),
  'airport_transfer',
  'transfer',
  'Cape Town International Airport',
  'The Westin Hotel, Cape Town',
  '2026-04-15'::DATE,
  '14:30'::TIME,
  'pending',
  250.00,
  false,
  jsonport(
    fullName => 'John Smith',
    email => 'john.smith@example.com',
    phone => '+27 21 555 1234',
    numPassengers => 2,
    flightNumber => 'SA123',
    extraDetails => 'Please arrive 15 minutes early. Client will be wearing a blue jacket.',
    returnTrip => jsonport(
      pickupAddress => 'The Westin Hotel, Cape Town',
      dropoffAddress => 'Cape Town International Airport',
      date => '2026-04-22',
      time => '16:00'
    )
  )::TEXT,
  NOW(),
  NOW()
);

-- Sample Booking 2: Cape Town Tour
INSERT INTO bookings (
  user_id,
  vehicle_id,
  driver_id,
  service_type,
  booking_type,
  pickup_location,
  dropoff_location,
  pickup_date,
  pickup_time,
  status,
  price_estimate,
  is_favourite,
  notes,
  created_at,
  updated_at
)
VALUES (
  '550e8400-e29b-41d4-a716-446655440000'::UUID, -- Replace with actual user_id
  (SELECT id FROM vehicles WHERE name = 'Suzuki Ertiga 7 Seater' LIMIT 1),
  (SELECT id FROM drivers WHERE full_name = 'Naledi Khoza' LIMIT 1),
  'point_to_point',
  'transfer',
  'V&A Waterfront',
  'Twelve Apostles Mountain',
  '2026-04-18'::DATE,
  '09:00'::TIME,
  'pending',
  120.00,
  false,
  jsonport(
    fullName => 'Sarah Johnson',
    email => 'sarah.j@example.com',
    phone => '+27 21 555 5678',
    numPassengers => 4,
    flightNumber => null,
    extraDetails => 'Family tour with kids aged 8 and 12. Please include photo stops at scenic spots.',
    returnTrip => null
  )::TEXT,
  NOW(),
  NOW()
);

-- Sample Booking 3: Shuttle Service with Return Trip
INSERT INTO bookings (
  user_id,
  vehicle_id,
  driver_id,
  service_type,
  booking_type,
  pickup_location,
  dropoff_location,
  pickup_date,
  pickup_time,
  status,
  price_estimate,
  is_favourite,
  notes,
  created_at,
  updated_at
)
VALUES (
  '550e8400-e29b-41d4-a716-446655440000'::UUID, -- Replace with actual user_id
  (SELECT id FROM vehicles WHERE name = 'Mercedes Viano 9 Seater' LIMIT 1),
  (SELECT id FROM drivers WHERE full_name = 'Sipho Dlamini' LIMIT 1),
  'point_to_point',
  'transfer',
  'Century City Conference Center',
  'Constantia Wine Estate',
  '2026-04-20'::DATE,
  '10:00'::TIME,
  'confirmed',
  180.00,
  true,
  jsonport(
    fullName => 'Michael Chen',
    email => 'm.chen@business.co.za',
    phone => '+27 21 555 9999',
    numPassengers => 6,
    flightNumber => null,
    extraDetails => 'Corporate team outing. Please have cold drinks available. VIP treatment requested.',
    returnTrip => jsonport(
      pickupAddress => 'Constantia Wine Estate',
      dropoffAddress => 'Century City Conference Center',
      date => '2026-04-20',
      time => '17:30'
    )
  )::TEXT,
  NOW(),
  NOW()
);
*/

-- To use the template above:
-- 1. Get a real user_id: SELECT id FROM auth.users LIMIT 1;
-- 2. Replace '550e8400-e29b-41d4-a716-446655440000' with the actual user_id
-- 3. Uncomment the INSERT statements
-- 4. Run in Supabase SQL Editor

-- Simpler alternative - insert sample booking with explicit IDs
-- First get the IDs you need by running these queries separately:
-- SELECT id FROM auth.users LIMIT 1;
-- SELECT id FROM vehicles LIMIT 1;
-- SELECT id FROM drivers LIMIT 1;

-- Then use the IDs in this format:
/*
INSERT INTO bookings (
  user_id,
  vehicle_id,
  driver_id,
  service_type,
  booking_type,
  pickup_location,
  dropoff_location,
  pickup_date,
  pickup_time,
  status,
  price_estimate,
  is_favourite,
  notes,
  created_at,
  updated_at
) VALUES (
  'USER_ID_HERE'::UUID,
  'VEHICLE_ID_HERE'::UUID,
  'DRIVER_ID_HERE'::UUID,
  'airport_transfer',
  'transfer',
  'Cape Town International Airport',
  'Hotel or Destination Address',
  '2026-04-25'::DATE,
  '14:00'::TIME,
  'pending',
  250.00,
  false,
  '{"fullName":"Test User","email":"test@example.com","phone":"+27 21 555 0000","numPassengers":2,"flightNumber":"SA123","extraDetails":"Test booking","returnTrip":null}'::TEXT,
  NOW(),
  NOW()
);
*/

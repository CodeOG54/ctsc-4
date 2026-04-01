-- Insert Vehicles (ALL COLUMNS EXPLICITLY FILLED)
-- Columns: id, name, description, capacity, image_url, price_per_km, price_per_hour, is_active, created_at
INSERT INTO vehicles (id, name, description, capacity, image_url, price_per_km, price_per_hour, is_active, created_at)
VALUES 
  (gen_random_uuid(), 'BMW 530D', 'Luxury executive sedan for discerning travelers.', 3, 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800', 15.00, 250.00, true, NOW()),
  (gen_random_uuid(), 'Suzuki Ertiga 7 Seater', 'Spacious 7-seater van for small groups and families.', 7, 'https://images.unsplash.com/photo-1533473359331-35b3816f3133?w=800', 8.00, 180.00, true, NOW()),
  (gen_random_uuid(), 'Mercedes Viano 9 Seater', 'Premium luxury van with exceptional comfort and style.', 9, 'https://images.unsplash.com/photo-1464207687429-7505649dae38?w=800', 18.50, 320.00, true, NOW()),
  (gen_random_uuid(), 'Toyota Quantum 14 Seater', 'Spacious multi-seater coach for larger groups and tours.', 14, 'https://images.unsplash.com/photo-1527630413749-11d5c141db09?w=800', 15.00, 280.00, true, NOW()),
  (gen_random_uuid(), 'Toyota Coaster 23 Seater', 'Large capacity coach perfect for corporate events and tours.', 23, 'https://images.unsplash.com/photo-1464207687429-7505649dae38?w=800', 30.00, 450.00, true, NOW());

-- Insert Drivers (ALL COLUMNS EXPLICITLY FILLED)
-- Columns: id, full_name, email, phone, license_number, avatar_url, is_active, created_at
INSERT INTO drivers (id, full_name, email, phone, license_number, avatar_url, is_active, created_at)
VALUES 
  (gen_random_uuid(), 'Thabo Mthembu', 'thabo.mthembu@capetownrides.co.za', '+27 21 555 0001', 'SA-DL-2024-001', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400', true, NOW()),
  (gen_random_uuid(), 'Naledi Khoza', 'naledi.khoza@capetownrides.co.za', '+27 21 555 0002', 'SA-DL-2024-002', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400', true, NOW()),
  (gen_random_uuid(), 'Sipho Dlamini', 'sipho.dlamini@capetownrides.co.za', '+27 21 555 0003', 'SA-DL-2024-003', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400', true, NOW()),
  (gen_random_uuid(), 'Amahle Nkosi', 'amahle.nkosi@capetownrides.co.za', '+27 21 555 0004', 'SA-DL-2024-004', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400', true, NOW()),
  (gen_random_uuid(), 'Jabu Moletsane', 'jabu.moletsane@capetownrides.co.za', '+27 21 555 0005', 'SA-DL-2024-005', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400', true, NOW());

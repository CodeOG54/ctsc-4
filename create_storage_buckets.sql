-- Create storage buckets for vehicle images and driver photos
-- Run this in Supabase SQL Editor

-- Create vehicle-images bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('vehicle-images', 'vehicle-images', true);

-- Create driver-photos bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('driver-photos', 'driver-photos', true);

-- Create RLS Policies for vehicle-images bucket
CREATE POLICY "Public Read Access to vehicle-images" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'vehicle-images');

CREATE POLICY "Admin Upload to vehicle-images" ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'vehicle-images' AND (SELECT EXISTS(SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')));

CREATE POLICY "Admin Delete from vehicle-images" ON storage.objects
  FOR DELETE
  USING (bucket_id = 'vehicle-images' AND (SELECT EXISTS(SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')));

-- Create RLS Policies for driver-photos bucket
CREATE POLICY "Admin Read Access to driver-photos" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'driver-photos' AND (SELECT EXISTS(SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')));

CREATE POLICY "Admin Upload to driver-photos" ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'driver-photos' AND (SELECT EXISTS(SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')));

CREATE POLICY "Admin Delete from driver-photos" ON storage.objects
  FOR DELETE
  USING (bucket_id = 'driver-photos' AND (SELECT EXISTS(SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')));

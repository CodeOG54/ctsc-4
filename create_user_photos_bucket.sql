-- Create user-photos bucket for profile avatars
INSERT INTO storage.buckets (id, name, public)
VALUES ('user-photos', 'user-photos', true);

-- Anyone can view user photos (public avatars build trust)
CREATE POLICY "Public Read Access to user-photos" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'user-photos');

-- Authenticated users can upload their own avatar (path must start with their user ID)
CREATE POLICY "Users upload own avatar" ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'user-photos' 
    AND auth.uid() IS NOT NULL 
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Users can update/replace their own avatar
CREATE POLICY "Users update own avatar" ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'user-photos' 
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Users can delete their own avatar
CREATE POLICY "Users delete own avatar" ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'user-photos' 
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Admins can manage all user photos
CREATE POLICY "Admin manage user-photos" ON storage.objects
  FOR ALL
  USING (
    bucket_id = 'user-photos' 
    AND (SELECT EXISTS(SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'))
  );

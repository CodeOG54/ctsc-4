-- Add driver_id column to booking_ratings for direct driver-rating lookup
ALTER TABLE booking_ratings ADD COLUMN IF NOT EXISTS driver_id UUID REFERENCES drivers(id);

-- Backfill existing ratings with driver_id from their booking
UPDATE booking_ratings br
SET driver_id = b.driver_id
FROM bookings b
WHERE br.booking_id = b.id AND br.driver_id IS NULL;

-- Allow drivers to read ratings about them
CREATE POLICY "Drivers read own ratings" ON booking_ratings
  FOR SELECT USING (
    driver_id = public.get_current_driver_id()
  );

-- Allow drivers to update their own driver record (for profile edits)
CREATE POLICY "Drivers update own record" ON drivers
  FOR UPDATE USING (id = public.get_current_driver_id())
  WITH CHECK (id = public.get_current_driver_id());

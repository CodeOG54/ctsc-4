BEGIN;

CREATE OR REPLACE FUNCTION public.get_current_driver_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id
  FROM public.drivers
  WHERE lower(email) = lower(COALESCE(auth.jwt() ->> 'email', ''))
    AND is_active = true
  LIMIT 1
$$;

CREATE OR REPLACE FUNCTION public.can_user_view_driver(_driver_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.bookings
    WHERE bookings.driver_id = _driver_id
      AND bookings.user_id = auth.uid()
  )
$$;

DROP POLICY IF EXISTS "Users can view assigned drivers" ON public.drivers;
CREATE POLICY "Users can view assigned drivers"
ON public.drivers
FOR SELECT
USING (public.can_user_view_driver(id));

DROP POLICY IF EXISTS "Drivers read own record" ON public.drivers;
CREATE POLICY "Drivers read own record"
ON public.drivers
FOR SELECT
USING (id = public.get_current_driver_id());

DROP POLICY IF EXISTS "Drivers view assigned bookings" ON public.bookings;
CREATE POLICY "Drivers view assigned bookings"
ON public.bookings
FOR SELECT
USING (driver_id = public.get_current_driver_id());

DROP POLICY IF EXISTS "Drivers update assigned bookings" ON public.bookings;
CREATE POLICY "Drivers update assigned bookings"
ON public.bookings
FOR UPDATE
USING (driver_id = public.get_current_driver_id())
WITH CHECK (driver_id = public.get_current_driver_id());

DROP POLICY IF EXISTS "Drivers read customer profiles for assigned bookings" ON public.profiles;
CREATE POLICY "Drivers read customer profiles for assigned bookings"
ON public.profiles
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.bookings
    WHERE bookings.user_id = profiles.id
      AND bookings.driver_id = public.get_current_driver_id()
  )
);

COMMIT;

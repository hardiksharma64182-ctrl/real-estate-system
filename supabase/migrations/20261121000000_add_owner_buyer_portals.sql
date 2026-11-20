-- ============================================================
-- LUXE ESTATE: OWNER & BUYER PORTALS
-- Buyer keeps the existing customer role.
-- Owner accounts must be provisioned by Admin.
-- ============================================================

BEGIN;

-- 1. Link an authenticated profile to an existing owner record.
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS owner_id TEXT;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'profiles_owner_id_fkey'
      AND conrelid = 'public.profiles'::regclass
  ) THEN
    ALTER TABLE public.profiles
    ADD CONSTRAINT profiles_owner_id_fkey
    FOREIGN KEY (owner_id)
    REFERENCES public.owners(id)
    ON DELETE SET NULL;
  END IF;
END $$;

-- 2. Allow the new owner role without changing existing user roles.
DO $$
DECLARE
  c RECORD;
BEGIN
  FOR c IN
    SELECT conname
    FROM pg_constraint
    WHERE conrelid = 'public.profiles'::regclass
      AND contype = 'c'
      AND pg_get_constraintdef(oid) ILIKE '%role%'
  LOOP
    EXECUTE format(
      'ALTER TABLE public.profiles DROP CONSTRAINT %I',
      c.conname
    );
  END LOOP;
END $$;

ALTER TABLE public.profiles
ADD CONSTRAINT profiles_role_check
CHECK (role IN ('admin', 'agent', 'customer', 'owner'));

-- 3. Secure helper: return only the signed-in owner's linked ID.
CREATE OR REPLACE FUNCTION public.get_current_owner_id()
RETURNS TEXT
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT owner_id
  FROM public.profiles
  WHERE id = auth.uid()
    AND role = 'owner'
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.is_owner()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT public.get_current_owner_id() IS NOT NULL;
$$;

REVOKE ALL ON FUNCTION public.get_current_owner_id() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.is_owner() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_current_owner_id() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_owner() TO authenticated;

-- 4. Prevent users from changing their own owner account link.
CREATE OR REPLACE FUNCTION public.protect_profile_owner_link()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF NOT public.is_admin_or_trusted()
     AND NEW.owner_id IS DISTINCT FROM OLD.owner_id THEN
    RAISE EXCEPTION 'Only Admin can change an owner account link.';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_protect_profile_owner_link
ON public.profiles;

CREATE TRIGGER trg_protect_profile_owner_link
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.protect_profile_owner_link();

-- 5. Owners can add properties only under their own owner record.
CREATE POLICY "Owners insert own properties"
ON public.properties
FOR INSERT
TO authenticated
WITH CHECK (
  public.is_owner()
  AND owner_id = public.get_current_owner_id()
  AND agent_id IS NULL
);

-- 6. Owners can edit only their own properties.
CREATE POLICY "Owners update own properties"
ON public.properties
FOR UPDATE
TO authenticated
USING (
  public.is_owner()
  AND owner_id = public.get_current_owner_id()
)
WITH CHECK (
  public.is_owner()
  AND owner_id = public.get_current_owner_id()
);

-- 7. Owners can physically delete only properties with no bookings.
-- Existing booking history is protected.
CREATE POLICY "Owners delete own unbooked properties"
ON public.properties
FOR DELETE
TO authenticated
USING (
  public.is_owner()
  AND owner_id = public.get_current_owner_id()
  AND NOT EXISTS (
    SELECT 1
    FROM public.bookings b
    WHERE b.property_id = properties.id
  )
);

-- 8. Owners can view bookings belonging to their own properties.
CREATE POLICY "Owners view own property bookings"
ON public.bookings
FOR SELECT
TO authenticated
USING (
  public.is_owner()
  AND EXISTS (
    SELECT 1
    FROM public.properties p
    WHERE p.id = bookings.property_id
      AND p.owner_id = public.get_current_owner_id()
  )
);

-- 9. Owners can update bookings belonging to their own properties.
CREATE POLICY "Owners update own property bookings"
ON public.bookings
FOR UPDATE
TO authenticated
USING (
  public.is_owner()
  AND EXISTS (
    SELECT 1
    FROM public.properties p
    WHERE p.id = bookings.property_id
      AND p.owner_id = public.get_current_owner_id()
  )
)
WITH CHECK (
  public.is_owner()
  AND EXISTS (
    SELECT 1
    FROM public.properties p
    WHERE p.id = bookings.property_id
      AND p.owner_id = public.get_current_owner_id()
  )
);

-- 10. Preserve Admin and Agent booking controls.
-- Owners may change ONLY the status of their own property bookings.
CREATE OR REPLACE FUNCTION public.protect_booking_sensitive_fields()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  owner_controls_booking BOOLEAN := FALSE;
  agent_controls_booking BOOLEAN := FALSE;
BEGIN
  IF public.is_admin_or_trusted() THEN
    RETURN NEW;
  END IF;

  IF NEW.user_id IS DISTINCT FROM OLD.user_id
     OR NEW.customer_email IS DISTINCT FROM OLD.customer_email
     OR NEW.agent_id IS DISTINCT FROM OLD.agent_id THEN
    RAISE EXCEPTION 'Only Admin can change protected booking fields.';
  END IF;

  owner_controls_booking :=
    public.is_owner()
    AND EXISTS (
      SELECT 1
      FROM public.properties p
      WHERE p.id = OLD.property_id
        AND p.owner_id = public.get_current_owner_id()
    );

  agent_controls_booking :=
    public.is_agent()
    AND (
      OLD.agent_id = public.get_current_agent_id()
      OR OLD.property_id IN (
        SELECT p.id
        FROM public.properties p
        WHERE p.agent_id = public.get_current_agent_id()
      )
    );

  IF owner_controls_booking
     AND (to_jsonb(NEW) - 'status')
         IS DISTINCT FROM (to_jsonb(OLD) - 'status') THEN
    RAISE EXCEPTION 'Owners can only change booking status.';
  END IF;

  IF NEW.status IS DISTINCT FROM OLD.status
     AND NOT (owner_controls_booking OR agent_controls_booking) THEN
    RAISE EXCEPTION 'You are not authorized to update this booking status.';
  END IF;

  RETURN NEW;
END;
$$;

COMMIT;

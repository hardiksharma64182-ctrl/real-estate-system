-- ==============================================================================
-- LUXE ESTATE - REAL ESTATE MANAGEMENT SYSTEM
-- FINAL PRODUCTION-READY HARDENED DATABASE SCHEMA
-- ==============================================================================
-- 100% Idempotent, Safe for Existing Databases, Zero Recursion, Production Audited
-- 
-- Key Protections:
-- 1. Trusted Context & Admin Setup: Allows secure admin promotion via SQL Editor.
-- 2. Demo Seed Integrity: Preserves customer notes, booking statuses & agent assignments during seed.
-- 3. Profiles Role Defense: Users can NEVER insert or update an admin or agent role from client SDK.
-- 4. Agent Contact Privacy: phone and email removed from public_agents; base agents table protected.
-- 5. Verified Production Ledger: verified_production_payments restricted strictly to admins & service_role.
-- 6. Customer Notes Hardened: Client users cannot set or modify internal administrative notes.
-- 7. Booking Agent Permissions: Auto-assigned from property; agent reassignment restricted strictly to admins.
-- 8. Storage Security: SVGs strictly forbidden; admin and agent upload permissions only.
-- 9. Zero RLS Recursion: SECURITY DEFINER helper functions with fixed search_path.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 0. EXTENSIONS SETUP
-- ------------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ------------------------------------------------------------------------------
-- 1. PROFILES TABLE (Linked to Supabase auth.users)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('admin', 'agent', 'customer')),
  avatar TEXT DEFAULT 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80',
  title TEXT,
  phone TEXT,
  address TEXT,
  budget_range TEXT DEFAULT '$1M - $3M',
  agent_id TEXT,
  customer_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 2. OWNERS TABLE (Property Owners - Confidential Records)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.owners (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 3. AGENTS TABLE (Licensed Luxury Realtors - Full Confidential Record)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.agents (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT NOT NULL,
  photo TEXT DEFAULT 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=600&q=80',
  experience TEXT DEFAULT '5 Years',
  specialty TEXT DEFAULT 'Luxury Real Estate',
  rating NUMERIC(3,1) DEFAULT 4.9,
  deals_closed INTEGER DEFAULT 10,
  bio TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Idempotent Foreign Key: profiles.agent_id -> agents.id
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_profiles_agent'
  ) THEN
    ALTER TABLE public.profiles 
    ADD CONSTRAINT fk_profiles_agent 
    FOREIGN KEY (agent_id) REFERENCES public.agents(id) ON DELETE SET NULL;
  END IF;
END $$;

-- ------------------------------------------------------------------------------
-- 4. PROPERTIES TABLE (Real Estate Listings)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.properties (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  address TEXT NOT NULL,
  price NUMERIC(14,2) NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('House', 'Apartment', 'Villa', 'Commercial')),
  bedrooms INTEGER NOT NULL DEFAULT 0,
  bathrooms NUMERIC(3,1) NOT NULL DEFAULT 1.0,
  area_sqft INTEGER NOT NULL DEFAULT 1000,
  availability TEXT NOT NULL DEFAULT 'Available' CHECK (availability IN ('Available', 'Under Offer', 'Sold', 'Rented')),
  featured BOOLEAN NOT NULL DEFAULT false,
  owner_id TEXT REFERENCES public.owners(id) ON DELETE SET NULL,
  agent_id TEXT REFERENCES public.agents(id) ON DELETE SET NULL,
  image TEXT NOT NULL,
  description TEXT,
  amenities TEXT[] DEFAULT '{}',
  year_built INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 5. CUSTOMERS TABLE (Client Accounts & Inquiries)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.customers (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT NOT NULL,
  address TEXT,
  interested_property_id TEXT REFERENCES public.properties(id) ON DELETE SET NULL,
  registration_date DATE DEFAULT CURRENT_DATE,
  budget_range TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure user_id column exists idempotently and has default auth.uid()
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'customers' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE public.customers ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
  END IF;
  ALTER TABLE public.customers ALTER COLUMN user_id SET DEFAULT auth.uid();
EXCEPTION
  WHEN others THEN NULL;
END $$;

-- ------------------------------------------------------------------------------
-- 6. BOOKINGS TABLE (Tour Requests & Appointments)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.bookings (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  property_id TEXT NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  visit_date DATE NOT NULL,
  visit_time TEXT DEFAULT '14:00',
  time_slot TEXT DEFAULT 'Afternoon (2:00 PM)',
  status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Approved', 'Rejected', 'Completed')),
  agent_id TEXT REFERENCES public.agents(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure user_id column exists idempotently and has default auth.uid()
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'bookings' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE public.bookings ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
  END IF;
  ALTER TABLE public.bookings ALTER COLUMN user_id SET DEFAULT auth.uid();
EXCEPTION
  WHEN others THEN NULL;
END $$;

-- ------------------------------------------------------------------------------
-- 7. CUSTOMER FAVORITES TABLE (Property Wishlist)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.customer_favorites (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  customer_id TEXT NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  property_id TEXT NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(customer_id, property_id)
);

-- Ensure foreign key constraint exists idempotently
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_customer_favorites_customer'
  ) THEN
    ALTER TABLE public.customer_favorites 
    ADD CONSTRAINT fk_customer_favorites_customer 
    FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON DELETE CASCADE;
  END IF;
EXCEPTION
  WHEN others THEN NULL;
END $$;

-- ------------------------------------------------------------------------------
-- 8. PAYMENTS TABLE (Confidential Ledger - Server Verification Only)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.payments (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL DEFAULT auth.uid(),
  property_id TEXT REFERENCES public.properties(id) ON DELETE SET NULL,
  property_name TEXT,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  amount NUMERIC(12,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  payment_method TEXT DEFAULT 'Google Pay (GPay)',
  gpay_upi_id TEXT,
  transaction_id TEXT UNIQUE,
  status TEXT NOT NULL DEFAULT 'Completed' CHECK (status IN ('Pending', 'Completed', 'Failed', 'Refunded', 'Demo_Completed')),
  purpose TEXT DEFAULT 'Property Holding Token',
  is_demo BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure user_id and is_demo columns exist idempotently
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'payments' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE public.payments ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'payments' AND column_name = 'is_demo'
  ) THEN
    ALTER TABLE public.payments ADD COLUMN is_demo BOOLEAN NOT NULL DEFAULT false;
  END IF;
  ALTER TABLE public.payments ALTER COLUMN user_id SET DEFAULT auth.uid();
EXCEPTION
  WHEN others THEN NULL;
END $$;

-- ------------------------------------------------------------------------------
-- 9. PERFORMANCE INDEXES
-- ------------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_properties_owner_id ON public.properties(owner_id);
CREATE INDEX IF NOT EXISTS idx_properties_agent_id ON public.properties(agent_id);
CREATE INDEX IF NOT EXISTS idx_properties_type ON public.properties(type);
CREATE INDEX IF NOT EXISTS idx_properties_availability ON public.properties(availability);
CREATE INDEX IF NOT EXISTS idx_properties_featured ON public.properties(featured);
CREATE INDEX IF NOT EXISTS idx_properties_created_at ON public.properties(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON public.bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_property_id ON public.bookings(property_id);
CREATE INDEX IF NOT EXISTS idx_bookings_agent_id ON public.bookings(agent_id);
CREATE INDEX IF NOT EXISTS idx_bookings_customer_email ON public.bookings(customer_email);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_visit_date ON public.bookings(visit_date);

CREATE INDEX IF NOT EXISTS idx_customers_user_id ON public.customers(user_id);
CREATE INDEX IF NOT EXISTS idx_customers_email ON public.customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_interested_prop ON public.customers(interested_property_id);
CREATE INDEX IF NOT EXISTS idx_customer_favorites_cust ON public.customer_favorites(customer_id);

CREATE INDEX IF NOT EXISTS idx_payments_user_id ON public.payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_property_id ON public.payments(property_id);
CREATE INDEX IF NOT EXISTS idx_payments_customer_email ON public.payments(customer_email);
CREATE INDEX IF NOT EXISTS idx_payments_is_demo ON public.payments(is_demo);

-- ------------------------------------------------------------------------------
-- 10. HARDENED SECURITY DEFINER HELPER FUNCTIONS (Zero Recursion)
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT COALESCE(
    (SELECT role = 'admin' FROM public.profiles WHERE id = auth.uid()),
    false
  );
$$;

CREATE OR REPLACE FUNCTION public.is_agent()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT COALESCE(
    (SELECT role = 'agent' FROM public.profiles WHERE id = auth.uid()),
    false
  );
$$;

CREATE OR REPLACE FUNCTION public.get_current_agent_id()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT agent_id FROM public.profiles WHERE id = auth.uid();
$$;

-- Trusted context check: Identifies direct SQL Editor execution, superusers, migrations, and backend service_role
CREATE OR REPLACE FUNCTION public.is_admin_or_trusted()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT 
    -- Direct Database Superuser / SQL Editor / Dashboard migrations
    current_user IN ('postgres', 'supabase_admin')
    OR session_user IN ('postgres', 'supabase_admin')
    -- Direct SQL execution outside PostgREST (no client JWT claims)
    OR (auth.role() IS NULL AND auth.uid() IS NULL)
    -- Backend service role
    OR auth.role() = 'service_role'
    -- Authenticated administrator
    OR public.is_admin();
$$;

-- Restrict function execution permissions appropriately
REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.is_agent() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_current_agent_id() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.is_admin_or_trusted() FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_agent() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_current_agent_id() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin_or_trusted() TO authenticated, service_role;

-- ------------------------------------------------------------------------------
-- 11. PROFILE CREATION, ROLE ESCALATION GUARDS & DATA TAMPERING TRIGGERS
-- ------------------------------------------------------------------------------

-- Trigger 1: Auto profile creation on auth.users signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Strict security: Never trust raw_user_meta_data for 'role'.
  -- All public signups are strictly forced to 'customer'.
  INSERT INTO public.profiles (
    id,
    email,
    name,
    role,
    avatar,
    phone,
    address,
    budget_range,
    agent_id
  )
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    'customer',
    COALESCE(new.raw_user_meta_data->>'avatar', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80'),
    COALESCE(new.raw_user_meta_data->>'phone', ''),
    COALESCE(new.raw_user_meta_data->>'address', ''),
    COALESCE(new.raw_user_meta_data->>'budget_range', '$1M - $3M'),
    NULL
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = COALESCE(EXCLUDED.name, profiles.name),
    avatar = COALESCE(EXCLUDED.avatar, profiles.avatar),
    phone = COALESCE(EXCLUDED.phone, profiles.phone),
    updated_at = NOW();
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Trigger 2: Enforce customer role on direct profiles INSERT (Blocks role tampering from client SDK)
CREATE OR REPLACE FUNCTION public.enforce_profile_insert_role()
RETURNS trigger AS $$
BEGIN
  -- Non-admins/untrusted callers can NEVER create a profile with a role other than 'customer'
  IF NOT public.is_admin_or_trusted() THEN
    NEW.role := 'customer';
    NEW.agent_id := NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

DROP TRIGGER IF EXISTS trg_enforce_profile_insert_role ON public.profiles;
CREATE TRIGGER trg_enforce_profile_insert_role
  BEFORE INSERT ON public.profiles
  FOR EACH ROW EXECUTE PROCEDURE public.enforce_profile_insert_role();

-- Trigger 3: Protect sensitive profile fields on UPDATE (Allows SQL Editor admin promotion while blocking client manipulation)
CREATE OR REPLACE FUNCTION public.protect_profile_sensitive_fields()
RETURNS trigger AS $$
BEGIN
  -- Allows admin setup via Supabase SQL Editor / migrations or authenticated admin
  IF NOT public.is_admin_or_trusted() THEN
    IF NEW.role IS DISTINCT FROM OLD.role THEN
      RAISE EXCEPTION 'Unauthorized: You cannot alter account roles.';
    END IF;
    IF NEW.email IS DISTINCT FROM OLD.email THEN
      RAISE EXCEPTION 'Unauthorized: You cannot modify primary account email directly.';
    END IF;
    IF NEW.id IS DISTINCT FROM OLD.id THEN
      RAISE EXCEPTION 'Unauthorized: You cannot alter primary user ID.';
    END IF;
    IF NEW.agent_id IS DISTINCT FROM OLD.agent_id THEN
      RAISE EXCEPTION 'Unauthorized: You cannot modify agent assignment.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

DROP TRIGGER IF EXISTS trg_protect_profile_fields ON public.profiles;
CREATE TRIGGER trg_protect_profile_fields
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE PROCEDURE public.protect_profile_sensitive_fields();

-- Trigger 4: Set customer defaults on INSERT (Preserves notes during SQL Editor seed insertion, strips client notes)
CREATE OR REPLACE FUNCTION public.set_customer_defaults()
RETURNS trigger AS $$
BEGIN
  IF NEW.user_id IS NULL AND auth.uid() IS NOT NULL THEN
    NEW.user_id := auth.uid();
  END IF;
  -- Preserves notes for seed/trusted context; strips notes from client requests
  IF NOT public.is_admin_or_trusted() THEN
    NEW.notes := NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

DROP TRIGGER IF EXISTS trg_set_customer_defaults ON public.customers;
CREATE TRIGGER trg_set_customer_defaults
  BEFORE INSERT ON public.customers
  FOR EACH ROW EXECUTE PROCEDURE public.set_customer_defaults();

-- Trigger 5: Protect sensitive customer fields on UPDATE (Blocks customer notes and user_id alteration)
CREATE OR REPLACE FUNCTION public.protect_customer_sensitive_fields()
RETURNS trigger AS $$
BEGIN
  IF NOT public.is_admin_or_trusted() THEN
    IF NEW.user_id IS DISTINCT FROM OLD.user_id THEN
      RAISE EXCEPTION 'Unauthorized: You cannot reassign customer user_id.';
    END IF;
    IF NEW.email IS DISTINCT FROM OLD.email THEN
      RAISE EXCEPTION 'Unauthorized: You cannot alter customer email directly.';
    END IF;
    IF NEW.notes IS DISTINCT FROM OLD.notes THEN
      RAISE EXCEPTION 'Unauthorized: You cannot modify internal administrative notes.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

DROP TRIGGER IF EXISTS trg_protect_customer_fields ON public.customers;
CREATE TRIGGER trg_protect_customer_fields
  BEFORE UPDATE ON public.customers
  FOR EACH ROW EXECUTE PROCEDURE public.protect_customer_sensitive_fields();

-- Trigger 6: Set booking defaults on INSERT (Preserves seeded booking status & agents, auto-links property agent for clients)
CREATE OR REPLACE FUNCTION public.set_booking_defaults()
RETURNS trigger AS $$
DECLARE
  prop_agent_id TEXT;
BEGIN
  IF NEW.user_id IS NULL AND auth.uid() IS NOT NULL THEN
    NEW.user_id := auth.uid();
  END IF;

  -- Look up the listing agent of the chosen property
  IF NEW.property_id IS NOT NULL THEN
    SELECT agent_id INTO prop_agent_id FROM public.properties WHERE id = NEW.property_id;
  END IF;

  -- Client requests: Force initial 'Pending' status and auto-link listing agent
  IF NOT public.is_admin_or_trusted() THEN
    NEW.agent_id := prop_agent_id;
    NEW.status := 'Pending';
  ELSE
    -- Trusted / Seed / Admin context: Preserve specified status and agent_id
    NEW.agent_id := COALESCE(NEW.agent_id, prop_agent_id);
    NEW.status := COALESCE(NEW.status, 'Pending');
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

DROP TRIGGER IF EXISTS trg_set_booking_defaults ON public.bookings;
CREATE TRIGGER trg_set_booking_defaults
  BEFORE INSERT ON public.bookings
  FOR EACH ROW EXECUTE PROCEDURE public.set_booking_defaults();

-- Trigger 7: Protect booking fields on UPDATE (Agent re-assignment strictly restricted to admins)
CREATE OR REPLACE FUNCTION public.protect_booking_sensitive_fields()
RETURNS trigger AS $$
BEGIN
  IF NOT public.is_admin_or_trusted() THEN
    IF NEW.user_id IS DISTINCT FROM OLD.user_id THEN
      RAISE EXCEPTION 'Unauthorized: You cannot reassign booking user_id.';
    END IF;
    IF NEW.customer_email IS DISTINCT FROM OLD.customer_email THEN
      RAISE EXCEPTION 'Unauthorized: You cannot modify customer email on an active booking.';
    END IF;
    -- STRICT: Only admin can change agent_id on a booking
    IF NEW.agent_id IS DISTINCT FROM OLD.agent_id THEN
      RAISE EXCEPTION 'Unauthorized: Only admins can reassign agents on bookings.';
    END IF;
    -- Only admin or the assigned agent can update status
    IF NEW.status IS DISTINCT FROM OLD.status AND NOT (
      public.is_agent() AND (
        OLD.agent_id = public.get_current_agent_id() 
        OR OLD.property_id IN (SELECT p.id FROM public.properties p WHERE p.agent_id = public.get_current_agent_id())
      )
    ) THEN
      RAISE EXCEPTION 'Unauthorized: Only assigned agents or admins can update booking status.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

DROP TRIGGER IF EXISTS trg_protect_booking_fields ON public.bookings;
CREATE TRIGGER trg_protect_booking_fields
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW EXECUTE PROCEDURE public.protect_booking_sensitive_fields();

-- Trigger 8: Protect property owner_id and agent_id from unauthorized agent tampering
CREATE OR REPLACE FUNCTION public.protect_property_sensitive_fields()
RETURNS trigger AS $$
BEGIN
  IF NOT public.is_admin_or_trusted() THEN
    IF NEW.owner_id IS DISTINCT FROM OLD.owner_id THEN
      RAISE EXCEPTION 'Unauthorized: Only admins can reassign property owner.';
    END IF;
    IF NEW.agent_id IS DISTINCT FROM OLD.agent_id THEN
      RAISE EXCEPTION 'Unauthorized: Only admins can reassign property agent.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

DROP TRIGGER IF EXISTS trg_protect_property_fields ON public.properties;
CREATE TRIGGER trg_protect_property_fields
  BEFORE UPDATE ON public.properties
  FOR EACH ROW EXECUTE PROCEDURE public.protect_property_sensitive_fields();

-- ------------------------------------------------------------------------------
-- 12. SAFE PUBLIC VIEWS (Mask Sensitive Owner, Agent & Payment Records)
-- ------------------------------------------------------------------------------

-- Safe view for public owner lookup: masks private phone numbers, home addresses, and notes
CREATE OR REPLACE VIEW public.public_owners
WITH (security_invoker = false) AS
SELECT 
  id,
  name,
  created_at
FROM public.owners;

-- Safe view for public agent catalog: REMOVES private phone and email to eliminate exposure
CREATE OR REPLACE VIEW public.public_agents
WITH (security_invoker = false) AS
SELECT 
  id,
  name,
  photo,
  experience,
  specialty,
  rating,
  deals_closed,
  bio,
  created_at
FROM public.agents;

-- Production view: Excludes demo payments AND strictly restricts reading to admins and service_role
CREATE OR REPLACE VIEW public.verified_production_payments
WITH (security_invoker = true) AS
SELECT 
  id,
  user_id,
  property_id,
  property_name,
  customer_name,
  customer_email,
  amount,
  currency,
  payment_method,
  gpay_upi_id,
  transaction_id,
  status,
  purpose,
  created_at
FROM public.payments
WHERE is_demo = false 
  AND status = 'Completed'
  AND public.is_admin_or_trusted();

-- View Permissions
GRANT SELECT ON public.public_owners TO anon, authenticated;
GRANT SELECT ON public.public_agents TO anon, authenticated;

-- Payments view access strictly revoked from anon and regular users
REVOKE ALL ON public.verified_production_payments FROM anon, PUBLIC;
GRANT SELECT ON public.verified_production_payments TO authenticated, service_role;

-- ------------------------------------------------------------------------------
-- 13. STORAGE BUCKET: property-images (SVG Uploads Forbidden)
-- ------------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) 
VALUES (
  'property-images', 
  'property-images', 
  true,
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp'] -- Strictly NO SVG to eliminate XSS
)
ON CONFLICT (id) DO UPDATE SET 
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp'];

-- Drop all existing storage policies idempotently
DROP POLICY IF EXISTS "Public Read Property Images" ON storage.objects;
DROP POLICY IF EXISTS "Public Upload Property Images" ON storage.objects;
DROP POLICY IF EXISTS "Public Update Property Images" ON storage.objects;
DROP POLICY IF EXISTS "Public Delete Property Images" ON storage.objects;
DROP POLICY IF EXISTS "Admin and Agent Upload Property Images" ON storage.objects;
DROP POLICY IF EXISTS "Admin and Agent Update Property Images" ON storage.objects;
DROP POLICY IF EXISTS "Admin Delete Property Images" ON storage.objects;

-- Storage 1: Public Read
CREATE POLICY "Public Read Property Images" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'property-images');

-- Storage 2: Uploads - Authenticated Admins and Agents ONLY, strictly non-SVG
CREATE POLICY "Admin and Agent Upload Property Images" 
ON storage.objects FOR INSERT 
TO authenticated
WITH CHECK (
  bucket_id = 'property-images' 
  AND (public.is_admin() OR public.is_agent())
  AND storage.extension(name) IN ('jpg', 'jpeg', 'png', 'webp')
  AND (metadata->>'mimetype' IN ('image/jpeg', 'image/png', 'image/webp'))
);

-- Storage 3: Updates - Authenticated Admins and Agents ONLY, strictly non-SVG
CREATE POLICY "Admin and Agent Update Property Images" 
ON storage.objects FOR UPDATE 
TO authenticated
USING (
  bucket_id = 'property-images' 
  AND (public.is_admin() OR public.is_agent())
);

-- Storage 4: Deletions - Admins ONLY
CREATE POLICY "Admin Delete Property Images" 
ON storage.objects FOR DELETE 
TO authenticated
USING (
  bucket_id = 'property-images' 
  AND public.is_admin()
);

-- ------------------------------------------------------------------------------
-- 14. ROW LEVEL SECURITY (RLS) POLICIES
-- ------------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.owners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- 14.1 PROFILES POLICIES (Private - No Role Self-Escalation)
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Public read profiles" ON public.profiles;
DROP POLICY IF EXISTS "Profiles read access" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins full management on profiles" ON public.profiles;
DROP POLICY IF EXISTS "Profiles select own or admin" ON public.profiles;
DROP POLICY IF EXISTS "Profiles insert own" ON public.profiles;
DROP POLICY IF EXISTS "Profiles update own" ON public.profiles;
DROP POLICY IF EXISTS "Profiles admin full access" ON public.profiles;

CREATE POLICY "Profiles select own or admin" 
ON public.profiles FOR SELECT 
TO authenticated
USING (
  auth.uid() = id 
  OR public.is_admin()
);

-- Users can only insert their own profile, and role MUST be 'customer' unless admin
CREATE POLICY "Profiles insert own" 
ON public.profiles FOR INSERT 
TO authenticated
WITH CHECK (
  auth.uid() = id 
  AND (
    public.is_admin() 
    OR role = 'customer'
  )
);

CREATE POLICY "Profiles update own" 
ON public.profiles FOR UPDATE 
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

CREATE POLICY "Profiles admin full access" 
ON public.profiles FOR ALL 
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- ------------------------------------------------------------------------------
-- 14.2 OWNERS POLICIES (Confidential - Admin Only)
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Owners public read" ON public.owners;
DROP POLICY IF EXISTS "Owners manage access" ON public.owners;
DROP POLICY IF EXISTS "Admins manage owners" ON public.owners;
DROP POLICY IF EXISTS "Owners admin select" ON public.owners;
DROP POLICY IF EXISTS "Owners admin manage" ON public.owners;

REVOKE ALL ON public.owners FROM anon;

CREATE POLICY "Owners admin select" 
ON public.owners FOR SELECT 
TO authenticated
USING (public.is_admin());

CREATE POLICY "Owners admin manage" 
ON public.owners FOR ALL 
TO authenticated
USING (public.is_admin()) 
WITH CHECK (public.is_admin());

-- ------------------------------------------------------------------------------
-- 14.3 AGENTS POLICIES (Direct Sensitive Access Restricted to Admins & Self)
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Agents public read" ON public.agents;
DROP POLICY IF EXISTS "Agents manage access" ON public.agents;
DROP POLICY IF EXISTS "Admins manage agents" ON public.agents;
DROP POLICY IF EXISTS "Agents admin manage" ON public.agents;
DROP POLICY IF EXISTS "Agents update own or admin" ON public.agents;
DROP POLICY IF EXISTS "Agents admin insert" ON public.agents;
DROP POLICY IF EXISTS "Agents admin delete" ON public.agents;
DROP POLICY IF EXISTS "Agents select authorized" ON public.agents;

REVOKE ALL ON public.agents FROM anon;

-- Direct SELECT on base agents table (with private phone & email) is restricted to Admins and the agent themselves.
-- Public marketing requests use public.public_agents view.
CREATE POLICY "Agents select authorized" 
ON public.agents FOR SELECT 
TO authenticated
USING (
  public.is_admin() 
  OR (public.is_agent() AND id = public.get_current_agent_id())
);

CREATE POLICY "Agents update own or admin" 
ON public.agents FOR UPDATE 
TO authenticated
USING (
  public.is_admin() 
  OR (public.is_agent() AND id = public.get_current_agent_id())
)
WITH CHECK (
  public.is_admin() 
  OR (public.is_agent() AND id = public.get_current_agent_id())
);

CREATE POLICY "Agents admin insert" 
ON public.agents FOR INSERT 
TO authenticated
WITH CHECK (public.is_admin());

CREATE POLICY "Agents admin delete" 
ON public.agents FOR DELETE 
TO authenticated
USING (public.is_admin());

-- ------------------------------------------------------------------------------
-- 14.4 PROPERTIES POLICIES (Public View, Admin Management, Agent Listing Update)
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Properties public read" ON public.properties;
DROP POLICY IF EXISTS "Properties manage access" ON public.properties;
DROP POLICY IF EXISTS "Admins manage properties" ON public.properties;
DROP POLICY IF EXISTS "Properties admin manage" ON public.properties;
DROP POLICY IF EXISTS "Agents update assigned properties" ON public.properties;
DROP POLICY IF EXISTS "Admins insert properties" ON public.properties;
DROP POLICY IF EXISTS "Admins delete properties" ON public.properties;

CREATE POLICY "Properties public read" 
ON public.properties FOR SELECT 
USING (true);

CREATE POLICY "Agents update assigned properties" 
ON public.properties FOR UPDATE 
TO authenticated
USING (
  public.is_admin() 
  OR (public.is_agent() AND agent_id = public.get_current_agent_id())
)
WITH CHECK (
  public.is_admin() 
  OR (public.is_agent() AND agent_id = public.get_current_agent_id())
);

CREATE POLICY "Admins insert properties" 
ON public.properties FOR INSERT 
TO authenticated
WITH CHECK (public.is_admin());

CREATE POLICY "Admins delete properties" 
ON public.properties FOR DELETE 
TO authenticated
USING (public.is_admin());

-- ------------------------------------------------------------------------------
-- 14.5 CUSTOMERS POLICIES (Strictly Authenticated - Self or Admin)
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Customers public read" ON public.customers;
DROP POLICY IF EXISTS "Customers insert and update" ON public.customers;
DROP POLICY IF EXISTS "Customers view policy" ON public.customers;
DROP POLICY IF EXISTS "Customers insert policy" ON public.customers;
DROP POLICY IF EXISTS "Customers update policy" ON public.customers;
DROP POLICY IF EXISTS "Admins delete customers" ON public.customers;
DROP POLICY IF EXISTS "Customers select policy" ON public.customers;
DROP POLICY IF EXISTS "Customers admin delete" ON public.customers;

CREATE POLICY "Customers select policy" 
ON public.customers FOR SELECT 
TO authenticated
USING (
  public.is_admin() 
  OR auth.uid() = user_id 
  OR lower(email) = lower(auth.jwt()->>'email')
);

CREATE POLICY "Customers insert policy" 
ON public.customers FOR INSERT 
TO authenticated
WITH CHECK (
  public.is_admin() 
  OR (
    (user_id IS NULL OR user_id = auth.uid()) 
    AND lower(email) = lower(auth.jwt()->>'email')
  )
);

CREATE POLICY "Customers update policy" 
ON public.customers FOR UPDATE 
TO authenticated
USING (
  public.is_admin() 
  OR auth.uid() = user_id 
  OR lower(email) = lower(auth.jwt()->>'email')
)
WITH CHECK (
  public.is_admin() 
  OR auth.uid() = user_id 
  OR lower(email) = lower(auth.jwt()->>'email')
);

CREATE POLICY "Customers admin delete" 
ON public.customers FOR DELETE 
TO authenticated
USING (public.is_admin());

-- ------------------------------------------------------------------------------
-- 14.6 BOOKINGS POLICIES (Authenticated Customers, Assigned Agents, Admins)
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Bookings public read" ON public.bookings;
DROP POLICY IF EXISTS "Bookings insert and update" ON public.bookings;
DROP POLICY IF EXISTS "Bookings view policy" ON public.bookings;
DROP POLICY IF EXISTS "Bookings insert policy" ON public.bookings;
DROP POLICY IF EXISTS "Admins and agents update bookings" ON public.bookings;
DROP POLICY IF EXISTS "Admins delete bookings" ON public.bookings;
DROP POLICY IF EXISTS "Bookings select policy" ON public.bookings;
DROP POLICY IF EXISTS "Bookings insert authenticated" ON public.bookings;
DROP POLICY IF EXISTS "Bookings update admin and agents" ON public.bookings;
DROP POLICY IF EXISTS "Bookings admin delete" ON public.bookings;

-- Select: Admins see all, Agents see assigned, Customers see only their own
CREATE POLICY "Bookings select policy" 
ON public.bookings FOR SELECT 
TO authenticated
USING (
  public.is_admin() 
  OR (
    public.is_agent() 
    AND (
      agent_id = public.get_current_agent_id()
      OR property_id IN (
        SELECT p.id FROM public.properties p 
        WHERE p.agent_id = public.get_current_agent_id()
      )
    )
  )
  OR auth.uid() = user_id 
  OR lower(customer_email) = lower(auth.jwt()->>'email')
);

-- Insert: Customers book under verified credentials with default 'Pending' status
CREATE POLICY "Bookings insert authenticated" 
ON public.bookings FOR INSERT 
TO authenticated
WITH CHECK (
  public.is_admin() 
  OR (
    (user_id IS NULL OR user_id = auth.uid())
    AND lower(customer_email) = lower(auth.jwt()->>'email')
    AND status = 'Pending'
  )
);

-- Update: Only Admins or the specifically assigned Agent can update
CREATE POLICY "Bookings update admin and agents" 
ON public.bookings FOR UPDATE 
TO authenticated
USING (
  public.is_admin() 
  OR (
    public.is_agent() 
    AND (
      agent_id = public.get_current_agent_id()
      OR property_id IN (
        SELECT p.id FROM public.properties p 
        WHERE p.agent_id = public.get_current_agent_id()
      )
    )
  )
)
WITH CHECK (
  public.is_admin() 
  OR (
    public.is_agent() 
    AND (
      agent_id = public.get_current_agent_id()
      OR property_id IN (
        SELECT p.id FROM public.properties p 
        WHERE p.agent_id = public.get_current_agent_id()
      )
    )
  )
);

-- Delete: Admins ONLY
CREATE POLICY "Bookings admin delete" 
ON public.bookings FOR DELETE 
TO authenticated
USING (public.is_admin());

-- ------------------------------------------------------------------------------
-- 14.7 CUSTOMER FAVORITES POLICIES (Strictly Authenticated)
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Customer favorites manage" ON public.customer_favorites;
DROP POLICY IF EXISTS "Favorites select policy" ON public.customer_favorites;
DROP POLICY IF EXISTS "Favorites insert policy" ON public.customer_favorites;
DROP POLICY IF EXISTS "Favorites delete policy" ON public.customer_favorites;

CREATE POLICY "Favorites select policy" 
ON public.customer_favorites FOR SELECT 
TO authenticated
USING (
  public.is_admin() 
  OR EXISTS (
    SELECT 1 FROM public.customers c 
    WHERE c.id = customer_favorites.customer_id 
    AND (c.user_id = auth.uid() OR lower(c.email) = lower(auth.jwt()->>'email'))
  )
);

CREATE POLICY "Favorites insert policy" 
ON public.customer_favorites FOR INSERT 
TO authenticated
WITH CHECK (
  public.is_admin() 
  OR EXISTS (
    SELECT 1 FROM public.customers c 
    WHERE c.id = customer_favorites.customer_id 
    AND (c.user_id = auth.uid() OR lower(c.email) = lower(auth.jwt()->>'email'))
  )
);

CREATE POLICY "Favorites delete policy" 
ON public.customer_favorites FOR DELETE 
TO authenticated
USING (
  public.is_admin() 
  OR EXISTS (
    SELECT 1 FROM public.customers c 
    WHERE c.id = customer_favorites.customer_id 
    AND (c.user_id = auth.uid() OR lower(c.email) = lower(auth.jwt()->>'email'))
  )
);

-- ------------------------------------------------------------------------------
-- 14.8 PAYMENTS POLICIES (Server-Side Verification Only - Direct Client Insert Blocked)
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Payments public read" ON public.payments;
DROP POLICY IF EXISTS "Payments manage" ON public.payments;
DROP POLICY IF EXISTS "Payments view policy" ON public.payments;
DROP POLICY IF EXISTS "Payments insert policy" ON public.payments;
DROP POLICY IF EXISTS "Admins manage payments" ON public.payments;
DROP POLICY IF EXISTS "Payments select policy" ON public.payments;
DROP POLICY IF EXISTS "Payments insert server only" ON public.payments;
DROP POLICY IF EXISTS "Payments update server only" ON public.payments;
DROP POLICY IF EXISTS "Payments admin delete" ON public.payments;

-- Explicitly revoke anonymous access
REVOKE ALL ON public.payments FROM anon;

-- Select: Payer sees only their own payments; Admins/service_role see all
CREATE POLICY "Payments select policy" 
ON public.payments FOR SELECT 
TO authenticated, service_role
USING (
  public.is_admin() 
  OR auth.role() = 'service_role'
  OR auth.uid() = user_id 
  OR lower(customer_email) = lower(auth.jwt()->>'email')
);

-- Insert: ONLY trusted backend service (Edge Function / webhook) or Admin can create records
CREATE POLICY "Payments insert server only" 
ON public.payments FOR INSERT 
TO authenticated, service_role
WITH CHECK (
  public.is_admin() 
  OR auth.role() = 'service_role'
);

-- Update: ONLY trusted backend service or Admin can update transaction state
CREATE POLICY "Payments update server only" 
ON public.payments FOR UPDATE 
TO authenticated, service_role
USING (
  public.is_admin() 
  OR auth.role() = 'service_role'
)
WITH CHECK (
  public.is_admin() 
  OR auth.role() = 'service_role'
);

-- Delete: Admins ONLY
CREATE POLICY "Payments admin delete" 
ON public.payments FOR DELETE 
TO authenticated
USING (public.is_admin());

-- ------------------------------------------------------------------------------
-- 15. SEED INITIAL APPLICATION DATA (Safe & Idempotent)
-- ------------------------------------------------------------------------------

-- 15.1 Owners Seed
INSERT INTO public.owners (id, name, email, phone, address, notes, created_at)
VALUES 
  ('own-1', 'Victoria Sterling', 'v.sterling@sterlingholdings.com', '+1 (310) 555-0142', '9405 Wilshire Blvd, Beverly Hills, CA 90212', 'Primary investor for premium residential estates in California.', '2026-08-10T10:00:00Z'),
  ('own-2', 'Marcus Thorne', 'marcus.thorne@apexrealms.com', '+1 (212) 555-0189', '767 Fifth Avenue, New York, NY 10153', 'Specializes in high-rise penthouses and luxury Manhattan assets.', '2026-08-14T11:30:00Z'),
  ('own-3', 'Elena Rostova', 'elena.rostova@globalestates.com', '+1 (305) 555-0163', '400 Alton Road, South Beach, Miami, FL 33139', 'Owner of waterfront villas and coastal luxury retreats.', '2026-09-01T09:15:00Z'),
  ('own-4', 'David Chen', 'david.chen@chenproperties.com', '+1 (512) 555-0199', '200 Congress Ave, Austin, TX 78701', 'Focuses on architectural contemporary houses and tech-hub real estate.', '2026-09-18T14:45:00Z')
ON CONFLICT (id) DO NOTHING;

-- 15.2 Agents Seed
INSERT INTO public.agents (id, name, email, phone, photo, experience, specialty, rating, deals_closed, bio, created_at)
VALUES 
  ('agt-1', 'Sophia Lorenza', 'sophia.lorenza@luxeestate.com', '+1 (310) 555-8821', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80', '12 Years', 'Luxury Mansions & Estates', 4.9, 88, 'Recognized as one of Beverly Hills top luxury realtors with over $350M in career volume.', '2026-07-01T08:00:00Z'),
  ('agt-2', 'Alexander Vance', 'alexander.vance@luxeestate.com', '+1 (212) 555-7744', 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=600&q=80', '9 Years', 'Skyline Penthouses & Lofts', 4.8, 64, 'Metropolitan real estate consultant focusing on premier Manhattan developments.', '2026-07-15T09:00:00Z'),
  ('agt-3', 'Isabella Martinez', 'isabella.m@luxeestate.com', '+1 (305) 555-3399', 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=600&q=80', '8 Years', 'Waterfront & Island Properties', 4.9, 52, 'Florida coastal market specialist helping buyers secure private beachfront sanctuaries.', '2026-08-01T10:00:00Z'),
  ('agt-4', 'Liam Gallagher', 'liam.g@luxeestate.com', '+1 (512) 555-4422', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=600&q=80', '6 Years', 'Modern Smart Homes & Commercial', 4.7, 41, 'Tech-forward property specialist matching investors with modern sustainable architecture.', '2026-08-20T11:00:00Z')
ON CONFLICT (id) DO NOTHING;

-- 15.3 Properties Seed
INSERT INTO public.properties (id, name, location, address, price, type, bedrooms, bathrooms, area_sqft, availability, featured, owner_id, agent_id, image, description, amenities, year_built, created_at)
VALUES 
  (
    'prop-1',
    'Villa Bellissima Waterfront Sanctuary',
    'Miami Beach, FL',
    '442 Biscayne Island Drive, Miami Beach, FL 33139',
    4850000,
    'Villa',
    5,
    6.0,
    6400,
    'Available',
    true,
    'own-3',
    'agt-3',
    'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1200&q=80',
    'An immaculate coastal masterpiece featuring 100 feet of private deepwater dockage, floor-to-ceiling glass, custom infinity pool, designer Italian kitchen, and panoramic bay views.',
    ARRAY['Private Pool', 'Deepwater Dock', 'Smart Home System', 'Wine Cellar', 'Private Elevator', 'Spa Jacuzzi'],
    2024,
    '2026-09-01T12:00:00Z'
  ),
  (
    'prop-2',
    'The Crown Tower Penthouse',
    'Manhattan, New York, NY',
    '150 Central Park South, New York, NY 10019',
    3450000,
    'Apartment',
    3,
    3.5,
    3250,
    'Available',
    true,
    'own-2',
    'agt-2',
    'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80',
    'Perched high above Central Park, this duplex penthouse features 360-degree skyline views, private wraparound terrace, 14-foot ceilings, herringbone hardwood floors, and 24/7 concierge.',
    ARRAY['Central Park Views', 'Wraparound Terrace', 'Doorman 24/7', 'Fitness Center', 'Valet Parking', 'Fireplace'],
    2023,
    '2026-09-05T14:30:00Z'
  ),
  (
    'prop-3',
    'Bel-Air Modern Architectural Estate',
    'Beverly Hills, CA',
    '1048 Stradella Road, Los Angeles, CA 90077',
    7850000,
    'Villa',
    6,
    8.0,
    8900,
    'Available',
    true,
    'own-1',
    'agt-1',
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
    'An architectural tour de force overlooking the city and ocean. Features cantilevered living spaces, automated vanishing glass walls, zero-edge pool, wellness spa, and 12-seat screening theater.',
    ARRAY['Home Theater', 'Zero-Edge Pool', 'Wellness Spa', 'Security Compound', 'Wine Tasting Room', 'City Views'],
    2025,
    '2026-09-10T16:00:00Z'
  ),
  (
    'prop-4',
    'The Glass Pavilion Hillside Retreat',
    'Austin, TX',
    '3812 Mount Bonnell Road, Austin, TX 78731',
    1950000,
    'House',
    4,
    4.0,
    4300,
    'Under Offer',
    false,
    'own-4',
    'agt-4',
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
    'Eco-conscious modern luxury nestled in the Austin hill country. Crafted with native limestone, cedar ceilings, commercial-grade solar array, and expansive outdoor entertaining decks.',
    ARRAY['Hill Country Views', 'Solar Battery Backup', 'Chef Kitchen', 'Lap Pool', 'Covered Patio', 'EV Charger'],
    2024,
    '2026-09-15T09:20:00Z'
  ),
  (
    'prop-5',
    'Apex Commercial Plaza & Innovation Hub',
    'Chicago, IL',
    '333 North Michigan Ave, Chicago, IL 60601',
    11500000,
    'Commercial',
    0,
    12.0,
    22000,
    'Available',
    true,
    'own-2',
    'agt-2',
    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
    'A Grade-A commercial landmark comprising three full floors of prime corporate headquarters, LEED Gold certified, high-speed fiber backbone, conference amphitheater, and direct transit access.',
    ARRAY['LEED Gold Certified', 'Conference Center', 'Fiber Optic Ready', 'Underground Parking', '24/7 Access Control', 'Cafeteria'],
    2022,
    '2026-09-20T11:00:00Z'
  ),
  (
    'prop-6',
    'Evergreen Highlands Craftsman Mansion',
    'Seattle, WA',
    '2215 Highland Drive, Seattle, WA 98119',
    2650000,
    'House',
    4,
    4.5,
    4100,
    'Available',
    false,
    'own-1',
    'agt-1',
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
    'Stately Queen Anne residence offering magnificent views of Puget Sound and the Olympic Mountains. Restored woodwork, radiant heated floors, gourmet Wolf kitchen, and landscaped gardens.',
    ARRAY['Puget Sound Views', 'Radiant Heating', 'Landscaped Garden', 'Historic Character', 'Detached Studio', 'Wine Cellar'],
    2021,
    '2026-09-25T13:40:00Z'
  ),
  (
    'prop-7',
    'Desert Horizon Luxury Compound',
    'Scottsdale, AZ',
    '11020 E Pinnacle Peak Rd, Scottsdale, AZ 85262',
    3890000,
    'Villa',
    5,
    5.5,
    5800,
    'Available',
    false,
    'own-4',
    'agt-4',
    'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80',
    'Resort-style desert living surrounded by majestic saguaro cactuses and McDowell Mountain vistas. Features outdoor kitchen cabana, negative-edge pool, fire elements, and guest casita.',
    ARRAY['Guest Casita', 'Negative-Edge Pool', 'Fire Pit Lounges', 'Mountain Views', 'Bocce Court', 'Solar Power'],
    2024,
    '2026-10-01T15:15:00Z'
  ),
  (
    'prop-8',
    'SOHO Artisan Loft Residence',
    'Manhattan, New York, NY',
    '88 Prince Street, New York, NY 10012',
    1850000,
    'Apartment',
    2,
    2.0,
    1900,
    'Sold',
    false,
    'own-2',
    'agt-2',
    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80',
    'Authentic cast-iron SOHO loft with exposed brick walls, timber beams, 13-foot ceilings, key-locked elevator access, and museum-grade gallery lighting.',
    ARRAY['Exposed Brick', 'Keyed Elevator', 'Timber Beams', 'Walk-in Closets', 'Soaking Tub', 'Historic District'],
    2020,
    '2026-10-05T10:00:00Z'
  ),
  (
    'prop-9',
    'Silicon Corridor Tech Park Suites',
    'Austin, TX',
    '11501 Domain Drive, Austin, TX 78758',
    8900000,
    'Commercial',
    0,
    8.0,
    16500,
    'Available',
    false,
    'own-4',
    'agt-4',
    'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80',
    'Next-generation tech campus featuring collaborative open workspaces, private executive boardrooms, soundproof podcast studios, and outdoor team gathering zones.',
    ARRAY['Podcast Studios', 'Executive Boardrooms', 'EV Fleet Charging', 'Fitness Facility', 'Fiber Network', 'Private Terrace'],
    2025,
    '2026-10-10T11:45:00Z'
  )
ON CONFLICT (id) DO NOTHING;

-- 15.4 Customers Seed
INSERT INTO public.customers (id, name, email, phone, address, interested_property_id, registration_date, budget_range, notes, created_at)
VALUES 
  ('cust-1', 'Jonathan Reed', 'j.reed@techcapital.io', '+1 (650) 555-9201', '450 University Ave, Palo Alto, CA 94301', 'prop-1', '2026-09-15', '$4M - $6M', 'Looking for a private waterfront winter residence in Miami with deepwater dockage.', '2026-09-15T09:00:00Z'),
  ('cust-2', 'Dr. Sarah Jenkins', 'sarah.jenkins@healthfirst.org', '+1 (212) 555-4311', '10 Gracie Square, New York, NY 10028', 'prop-2', '2026-10-02', '$3M - $4M', 'Interested in Central Park South duplex or luxury penthouse with panoramic city views.', '2026-10-02T14:20:00Z'),
  ('cust-3', 'Robert & Claire Miller', 'rc.miller@architects.com', '+1 (206) 555-7712', '1414 4th Ave, Seattle, WA 98101', 'prop-6', '2026-10-20', '$2M - $3M', 'Architectural enthusiasts looking for historic Queen Anne properties with gardens.', '2026-10-20T16:10:00Z'),
  ('cust-4', 'Amanda Hayes', 'amanda.hayes@venturepulse.com', '+1 (512) 555-8833', '500 W 2nd St, Austin, TX 78701', 'prop-9', '2026-11-01', '$8M - $10M', 'Corporate scout securing headquarters space for expanding AI hardware startup in Austin.', '2026-11-01T10:30:00Z')
ON CONFLICT (id) DO NOTHING;

-- 15.5 Bookings Seed (Preserves Approved, Completed, and Rejected Demo Statuses)
INSERT INTO public.bookings (id, property_id, customer_name, customer_email, customer_phone, visit_date, visit_time, time_slot, status, agent_id, notes, created_at)
VALUES 
  ('bk-101', 'prop-1', 'Jonathan Reed', 'j.reed@techcapital.io', '+1 (650) 555-9201', '2026-11-20', '14:00', 'Afternoon (2:00 PM)', 'Approved', 'agt-3', 'Client requests private yacht dock inspection during property tour.', '2026-11-10T09:30:00Z'),
  ('bk-102', 'prop-2', 'Dr. Sarah Jenkins', 'sarah.jenkins@healthfirst.org', '+1 (212) 555-4311', '2026-11-18', '11:00', 'Morning (11:00 AM)', 'Pending', 'agt-2', 'Tour requested for penthouse viewing and terrace inspection.', '2026-11-12T15:45:00Z'),
  ('bk-103', 'prop-3', 'Michael Sterling-Young', 'm.sterling@youngcapital.com', '+1 (310) 555-3214', '2026-11-22', '16:00', 'Afternoon (4:00 PM)', 'Pending', 'agt-1', 'Sunset viewing requested to experience city light panoramic effects.', '2026-11-13T08:15:00Z'),
  ('bk-104', 'prop-6', 'Robert & Claire Miller', 'rc.miller@architects.com', '+1 (206) 555-7712', '2026-11-08', '10:00', 'Morning (10:00 AM)', 'Completed', 'agt-1', 'Client attended walkthrough and submitted preliminary letter of interest.', '2026-11-04T13:20:00Z'),
  ('bk-105', 'prop-4', 'Carlos Mendez', 'carlos.m@austintech.dev', '+1 (512) 555-6622', '2026-11-05', '15:00', 'Afternoon (3:00 PM)', 'Rejected', 'agt-4', 'Property went under contract prior to requested tour date.', '2026-11-03T11:00:00Z')
ON CONFLICT (id) DO NOTHING;

-- 15.6 Customer Favorites Seed (Linked to Valid Customers cust-1 & cust-2)
INSERT INTO public.customer_favorites (id, customer_id, property_id, created_at)
VALUES 
  ('fav-1', 'cust-1', 'prop-1', '2026-11-10T10:00:00Z'),
  ('fav-2', 'cust-1', 'prop-2', '2026-11-11T11:00:00Z'),
  ('fav-3', 'cust-2', 'prop-2', '2026-11-12T12:00:00Z'),
  ('fav-4', 'cust-2', 'prop-3', '2026-11-13T13:00:00Z')
ON CONFLICT (id) DO NOTHING;

-- 15.7 Payments Seed (Explicitly Marked as Demo Data)
INSERT INTO public.payments (id, property_id, property_name, customer_name, customer_email, customer_phone, amount, currency, payment_method, gpay_upi_id, transaction_id, status, purpose, is_demo, created_at)
VALUES 
  ('pay-gpay-101', 'prop-1', 'Villa Bellissima Waterfront Sanctuary', 'Jonathan Reed', 'j.reed@techcapital.io', '+1 (650) 555-9201', 5000.00, 'USD', 'Google Pay (GPay)', 'jonathan.reed@okaxis', 'DEMO-GPAY-UPI-2026-9812401', 'Demo_Completed', '[DEMO TEST DATA - NOT A REAL PAYMENT] Property Holding Token', true, '2026-11-10T14:20:00Z'),
  ('pay-gpay-102', 'prop-2', 'The Crown Tower Penthouse', 'Dr. Sarah Jenkins', 'sarah.jenkins@healthfirst.org', '+1 (212) 555-4311', 250.00, 'USD', 'Google Pay (GPay)', 'sarah.jenkins@okhdfcbank', 'DEMO-GPAY-UPI-2026-8819402', 'Demo_Completed', '[DEMO TEST DATA - NOT A REAL PAYMENT] VIP Tour Reservation Fee', true, '2026-11-12T16:00:00Z'),
  ('pay-gpay-103', 'prop-3', 'Bel-Air Modern Architectural Estate', 'Michael Sterling-Young', 'm.sterling@youngcapital.com', '+1 (310) 555-3214', 2500.00, 'USD', 'Google Pay (GPay)', 'm.sterling@okicici', 'DEMO-GPAY-UPI-2026-7731903', 'Demo_Completed', '[DEMO TEST DATA - NOT A REAL PAYMENT] Property Holding Token', true, '2026-11-13T09:45:00Z')
ON CONFLICT (id) DO NOTHING;

-- ==============================================================================
-- SCHEMA & SEED COMPLETE
-- ==============================================================================

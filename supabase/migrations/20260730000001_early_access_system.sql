-- ============================================================
-- Diagnyx AI — Early Access & Admin System
-- ============================================================

-- 1. Early Access Applications Table
CREATE TABLE IF NOT EXISTS public.early_access_applications (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name       TEXT NOT NULL,
  email           TEXT NOT NULL UNIQUE,
  country         TEXT,
  state           TEXT,
  city            TEXT,
  user_role       TEXT NOT NULL,
  application_reason TEXT NOT NULL,
  additional_notes   TEXT,
  referral_source    TEXT,
  status          TEXT NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending', 'approved', 'rejected')),
  email_verified  BOOLEAN NOT NULL DEFAULT false,
  admin_notes     TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Admin Roles Table
CREATE TABLE IF NOT EXISTS public.admin_roles (
  id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Updated-at trigger for early_access_applications
CREATE TRIGGER update_early_access_updated_at
  BEFORE UPDATE ON public.early_access_applications
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 4. Sync email_verified from auth.users on email confirmation
CREATE OR REPLACE FUNCTION public.handle_email_verified()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF NEW.email_confirmed_at IS NOT NULL AND OLD.email_confirmed_at IS NULL THEN
    UPDATE public.early_access_applications
    SET email_verified = true, updated_at = now()
    WHERE user_id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_email_confirmed
  AFTER UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_email_verified();

-- 5. Helper function: is current user an admin?
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_roles WHERE user_id = auth.uid()
  );
$$;

-- 6. Enable RLS
ALTER TABLE public.early_access_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_roles ENABLE ROW LEVEL SECURITY;

-- 7. RLS Policies — early_access_applications
-- Users can view their own application
CREATE POLICY "Users can view own application"
  ON public.early_access_applications
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own application (linked after signup)
CREATE POLICY "Users can insert own application"
  ON public.early_access_applications
  FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Admins can view all applications
CREATE POLICY "Admins can view all applications"
  ON public.early_access_applications
  FOR SELECT
  USING (public.is_admin());

-- Admins can update all applications (approve/reject)
CREATE POLICY "Admins can update all applications"
  ON public.early_access_applications
  FOR UPDATE
  USING (public.is_admin());

-- 8. RLS Policies — admin_roles
CREATE POLICY "Admins can view admin_roles"
  ON public.admin_roles
  FOR SELECT
  USING (public.is_admin() OR auth.uid() = user_id);

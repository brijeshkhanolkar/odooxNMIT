-- ============================================================
-- Dayflow HRMS — Migration 002: Profiles
-- ============================================================

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  employee_id TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  avatar_url TEXT,
  role_id UUID NOT NULL REFERENCES public.roles(id),
  department_id UUID, -- FK added after departments table creation
  status employee_status NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index for lookups
CREATE INDEX idx_profiles_employee_id ON public.profiles(employee_id);
CREATE INDEX idx_profiles_email ON public.profiles(email);
CREATE INDEX idx_profiles_role_id ON public.profiles(role_id);
CREATE INDEX idx_profiles_department_id ON public.profiles(department_id);
CREATE INDEX idx_profiles_status ON public.profiles(status);

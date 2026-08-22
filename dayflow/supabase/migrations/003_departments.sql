-- ============================================================
-- Dayflow HRMS — Migration 003: Departments
-- ============================================================

CREATE TABLE public.departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  manager_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Add FK from profiles to departments
ALTER TABLE public.profiles
  ADD CONSTRAINT fk_profiles_department
  FOREIGN KEY (department_id) REFERENCES public.departments(id) ON DELETE SET NULL;

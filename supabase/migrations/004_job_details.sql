-- ============================================================
-- Dayflow HRMS — Migration 004: Job Details
-- ============================================================

CREATE TABLE public.job_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID UNIQUE NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  designation TEXT,
  joining_date DATE,
  employment_type employment_type NOT NULL DEFAULT 'full_time',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_job_details_profile ON public.job_details(profile_id);

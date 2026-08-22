-- ============================================================
-- Dayflow HRMS — Migration 007: Leave Balances
-- ============================================================

CREATE TABLE public.leave_balances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  year INTEGER NOT NULL DEFAULT EXTRACT(YEAR FROM CURRENT_DATE),
  paid_allocated INTEGER NOT NULL DEFAULT 12,
  paid_used INTEGER NOT NULL DEFAULT 0,
  sick_allocated INTEGER NOT NULL DEFAULT 6,
  sick_used INTEGER NOT NULL DEFAULT 0,
  unpaid_used INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- One balance record per employee per year
CREATE UNIQUE INDEX idx_leave_balances_profile_year ON public.leave_balances(profile_id, year);

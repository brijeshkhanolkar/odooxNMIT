-- ============================================================
-- Dayflow HRMS — Migration 008: Leave Requests
-- ============================================================

CREATE TABLE public.leave_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  leave_type leave_type NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  requested_days INTEGER NOT NULL,
  reason TEXT,
  status leave_status NOT NULL DEFAULT 'pending',
  admin_comments TEXT,
  resolved_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  CONSTRAINT chk_leave_dates CHECK (end_date >= start_date),
  CONSTRAINT chk_requested_days CHECK (requested_days > 0)
);

CREATE INDEX idx_leave_requests_profile ON public.leave_requests(profile_id);
CREATE INDEX idx_leave_requests_status ON public.leave_requests(status);
CREATE INDEX idx_leave_requests_dates ON public.leave_requests(start_date, end_date);

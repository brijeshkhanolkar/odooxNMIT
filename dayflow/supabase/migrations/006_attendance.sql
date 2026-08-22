-- ============================================================
-- Dayflow HRMS — Migration 006: Attendance
-- ============================================================

CREATE TABLE public.attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  check_in TIMESTAMPTZ,
  check_out TIMESTAMPTZ,
  work_hours NUMERIC(5, 2),
  status attendance_status NOT NULL DEFAULT 'present',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Prevent duplicate attendance per employee per day
CREATE UNIQUE INDEX idx_attendance_profile_date ON public.attendance(profile_id, date);
CREATE INDEX idx_attendance_date ON public.attendance(date);
CREATE INDEX idx_attendance_status ON public.attendance(status);

-- ============================================================
-- Dayflow HRMS — Migration 013: Functions and Triggers
-- ============================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_job_details_updated_at
  BEFORE UPDATE ON public.job_details
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_attendance_updated_at
  BEFORE UPDATE ON public.attendance
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_leave_balances_updated_at
  BEFORE UPDATE ON public.leave_balances
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_leave_requests_updated_at
  BEFORE UPDATE ON public.leave_requests
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_salary_structures_updated_at
  BEFORE UPDATE ON public.salary_structures
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================
-- Auto-create leave balances when a new profile is created
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_profile_leave_balances()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.leave_balances (profile_id, year, paid_allocated, sick_allocated)
  VALUES (NEW.id, EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER, 12, 6);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_profile_created_create_leave_balances
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_profile_leave_balances();

-- ============================================================
-- Handle leave approval: deduct from balance + create attendance records
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_leave_approval()
RETURNS TRIGGER AS $$
DECLARE
  leave_day DATE;
  current_year INTEGER;
BEGIN
  -- Only trigger when status changes to 'approved'
  IF NEW.status = 'approved' AND (OLD.status IS NULL OR OLD.status != 'approved') THEN
    current_year := EXTRACT(YEAR FROM NEW.start_date)::INTEGER;
    
    -- Update leave balance based on leave type
    IF NEW.leave_type = 'paid' THEN
      UPDATE public.leave_balances
      SET paid_used = paid_used + NEW.requested_days
      WHERE profile_id = NEW.profile_id AND year = current_year;
    ELSIF NEW.leave_type = 'sick' THEN
      UPDATE public.leave_balances
      SET sick_used = sick_used + NEW.requested_days
      WHERE profile_id = NEW.profile_id AND year = current_year;
    ELSIF NEW.leave_type = 'unpaid' THEN
      UPDATE public.leave_balances
      SET unpaid_used = unpaid_used + NEW.requested_days
      WHERE profile_id = NEW.profile_id AND year = current_year;
    END IF;
    
    -- Create attendance records for each leave day
    FOR leave_day IN SELECT generate_series(NEW.start_date, NEW.end_date, '1 day'::interval)::DATE
    LOOP
      -- Skip weekends (Saturday=6, Sunday=0)
      IF EXTRACT(DOW FROM leave_day) NOT IN (0, 6) THEN
        INSERT INTO public.attendance (profile_id, date, status)
        VALUES (NEW.profile_id, leave_day, 'on_leave')
        ON CONFLICT (profile_id, date) DO UPDATE SET status = 'on_leave';
      END IF;
    END LOOP;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_leave_approved
  AFTER UPDATE ON public.leave_requests
  FOR EACH ROW EXECUTE FUNCTION public.handle_leave_approval();

-- ============================================================
-- Calculate work hours on check-out
-- ============================================================
CREATE OR REPLACE FUNCTION public.calculate_work_hours()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.check_out IS NOT NULL AND NEW.check_in IS NOT NULL THEN
    NEW.work_hours := ROUND(EXTRACT(EPOCH FROM (NEW.check_out - NEW.check_in)) / 3600.0, 2);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_attendance_calculate_hours
  BEFORE UPDATE ON public.attendance
  FOR EACH ROW EXECUTE FUNCTION public.calculate_work_hours();

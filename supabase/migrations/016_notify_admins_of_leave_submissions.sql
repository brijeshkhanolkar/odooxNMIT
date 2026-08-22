-- ============================================================
-- Dayflow HRMS — Migration 016: Leave-submission notifications
-- ============================================================
-- Let the database create admin notifications so employees can submit leave
-- requests without a service_role key in the application environment.

CREATE OR REPLACE FUNCTION public.notify_admins_of_leave_submission()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.notifications (profile_id, type, title, message)
  SELECT
    profile.id,
    'leave_submitted',
    'New Leave Request',
    'A new ' || NEW.leave_type || ' leave request has been submitted.'
  FROM public.profiles AS profile
  JOIN public.roles AS role ON role.id = profile.role_id
  WHERE profile.status = 'active' AND role.name = 'admin';

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_leave_submitted_notify_admins
  AFTER INSERT ON public.leave_requests
  FOR EACH ROW EXECUTE FUNCTION public.notify_admins_of_leave_submission();

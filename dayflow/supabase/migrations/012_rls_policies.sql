-- ============================================================
-- Dayflow HRMS — Migration 012: Row Level Security Policies
-- ============================================================

-- Helper function to get user role
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT AS $$
  SELECT r.name FROM public.profiles p
  JOIN public.roles r ON r.id = p.role_id
  WHERE p.id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ============================
-- ROLES TABLE
-- ============================
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read roles"
  ON public.roles FOR SELECT
  USING (true);

CREATE POLICY "Only admins can manage roles"
  ON public.roles FOR ALL
  USING (public.get_user_role() = 'admin');

-- ============================
-- PROFILES TABLE
-- ============================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (id = auth.uid());

CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (public.get_user_role() = 'admin');

CREATE POLICY "Users can update own limited fields"
  ON public.profiles FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

CREATE POLICY "Admins can insert profiles"
  ON public.profiles FOR INSERT
  WITH CHECK (public.get_user_role() = 'admin');

CREATE POLICY "Admins can update all profiles"
  ON public.profiles FOR UPDATE
  USING (public.get_user_role() = 'admin');

-- ============================
-- DEPARTMENTS TABLE
-- ============================
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view departments"
  ON public.departments FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage departments"
  ON public.departments FOR ALL
  USING (public.get_user_role() = 'admin');

-- ============================
-- JOB DETAILS TABLE
-- ============================
ALTER TABLE public.job_details ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own job details"
  ON public.job_details FOR SELECT
  USING (profile_id = auth.uid());

CREATE POLICY "Admins can view all job details"
  ON public.job_details FOR SELECT
  USING (public.get_user_role() = 'admin');

CREATE POLICY "Admins can manage job details"
  ON public.job_details FOR ALL
  USING (public.get_user_role() = 'admin');

-- ============================
-- DOCUMENTS TABLE
-- ============================
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own documents"
  ON public.documents FOR SELECT
  USING (profile_id = auth.uid());

CREATE POLICY "Users can upload own documents"
  ON public.documents FOR INSERT
  WITH CHECK (profile_id = auth.uid());

CREATE POLICY "Admins can manage all documents"
  ON public.documents FOR ALL
  USING (public.get_user_role() = 'admin');

-- ============================
-- ATTENDANCE TABLE
-- ============================
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own attendance"
  ON public.attendance FOR SELECT
  USING (profile_id = auth.uid());

CREATE POLICY "Users can insert own attendance"
  ON public.attendance FOR INSERT
  WITH CHECK (profile_id = auth.uid());

CREATE POLICY "Users can update own attendance"
  ON public.attendance FOR UPDATE
  USING (profile_id = auth.uid());

CREATE POLICY "Admins can manage all attendance"
  ON public.attendance FOR ALL
  USING (public.get_user_role() = 'admin');

-- ============================
-- LEAVE BALANCES TABLE
-- ============================
ALTER TABLE public.leave_balances ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own leave balances"
  ON public.leave_balances FOR SELECT
  USING (profile_id = auth.uid());

CREATE POLICY "Admins can manage all leave balances"
  ON public.leave_balances FOR ALL
  USING (public.get_user_role() = 'admin');

-- ============================
-- LEAVE REQUESTS TABLE
-- ============================
ALTER TABLE public.leave_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own leave requests"
  ON public.leave_requests FOR SELECT
  USING (profile_id = auth.uid());

CREATE POLICY "Users can create own leave requests"
  ON public.leave_requests FOR INSERT
  WITH CHECK (profile_id = auth.uid());

CREATE POLICY "Admins can view all leave requests"
  ON public.leave_requests FOR SELECT
  USING (public.get_user_role() = 'admin');

CREATE POLICY "Admins can update leave requests"
  ON public.leave_requests FOR UPDATE
  USING (public.get_user_role() = 'admin');

-- ============================
-- SALARY STRUCTURES TABLE
-- ============================
ALTER TABLE public.salary_structures ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own salary"
  ON public.salary_structures FOR SELECT
  USING (profile_id = auth.uid());

CREATE POLICY "Admins can manage all salaries"
  ON public.salary_structures FOR ALL
  USING (public.get_user_role() = 'admin');

-- ============================
-- PAYSLIPS TABLE
-- ============================
ALTER TABLE public.payslips ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own payslips"
  ON public.payslips FOR SELECT
  USING (profile_id = auth.uid());

CREATE POLICY "Admins can manage all payslips"
  ON public.payslips FOR ALL
  USING (public.get_user_role() = 'admin');

-- ============================
-- NOTIFICATIONS TABLE
-- ============================
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications"
  ON public.notifications FOR SELECT
  USING (profile_id = auth.uid());

CREATE POLICY "Users can update own notifications"
  ON public.notifications FOR UPDATE
  USING (profile_id = auth.uid());

CREATE POLICY "Admins can insert notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (public.get_user_role() = 'admin');

CREATE POLICY "Admins can view all notifications"
  ON public.notifications FOR SELECT
  USING (public.get_user_role() = 'admin');

-- Service role can insert notifications (for server-side actions)
CREATE POLICY "Service role can insert notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (true);

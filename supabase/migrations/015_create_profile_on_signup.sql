-- ============================================================
-- Dayflow HRMS — Migration 015: Create employee profile on signup
-- ============================================================
-- This runs with database privileges, so a browser session never needs the
-- service_role key just to create its own employee profile.

CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  employee_role_id UUID;
  generated_employee_id TEXT;
BEGIN
  SELECT id
  INTO employee_role_id
  FROM public.roles
  WHERE name = 'employee';

  IF employee_role_id IS NULL THEN
    RAISE EXCEPTION 'Dayflow roles have not been configured';
  END IF;

  generated_employee_id := COALESCE(
    NULLIF(NEW.raw_user_meta_data ->> 'employee_id', ''),
    'EMP-' || UPPER(SUBSTRING(NEW.id::TEXT FROM 1 FOR 8))
  );

  INSERT INTO public.profiles (
    id,
    employee_id,
    email,
    first_name,
    last_name,
    role_id
  )
  VALUES (
    NEW.id,
    generated_employee_id,
    NEW.email,
    COALESCE(NULLIF(NEW.raw_user_meta_data ->> 'first_name', ''), 'New'),
    COALESCE(NULLIF(NEW.raw_user_meta_data ->> 'last_name', ''), 'Employee'),
    employee_role_id
  );

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created_create_profile
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();

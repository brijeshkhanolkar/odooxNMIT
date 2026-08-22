-- ============================================================
-- Dayflow HRMS — Migration 001: Enums and Roles
-- ============================================================

-- Employment type
CREATE TYPE employment_type AS ENUM ('full_time', 'part_time', 'contract', 'intern');

-- Employee status
CREATE TYPE employee_status AS ENUM ('active', 'inactive', 'terminated');

-- Attendance status
CREATE TYPE attendance_status AS ENUM ('present', 'absent', 'half_day', 'on_leave');

-- Leave type
CREATE TYPE leave_type AS ENUM ('paid', 'sick', 'unpaid');

-- Leave request status
CREATE TYPE leave_status AS ENUM ('pending', 'approved', 'rejected');

-- Notification type
CREATE TYPE notification_type AS ENUM (
  'onboarding',
  'leave_submitted',
  'leave_approved',
  'leave_rejected',
  'checkin_reminder',
  'checkout_reminder',
  'payslip_generated'
);

-- Roles table (separate table instead of enum on profiles)
CREATE TABLE public.roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Seed default roles
INSERT INTO public.roles (name) VALUES ('admin'), ('employee');

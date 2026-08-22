-- ============================================================
-- Dayflow HRMS — Migration 010: Payslips
-- ============================================================

CREATE TABLE public.payslips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  month INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
  year INTEGER NOT NULL,
  basic_salary NUMERIC(12, 2) NOT NULL DEFAULT 0,
  allowances NUMERIC(12, 2) NOT NULL DEFAULT 0,
  deductions NUMERIC(12, 2) NOT NULL DEFAULT 0,
  tax NUMERIC(12, 2) NOT NULL DEFAULT 0,
  gross_pay NUMERIC(12, 2) NOT NULL DEFAULT 0,
  net_pay NUMERIC(12, 2) NOT NULL DEFAULT 0,
  pdf_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- One payslip per employee per month
CREATE UNIQUE INDEX idx_payslips_profile_month_year ON public.payslips(profile_id, month, year);
CREATE INDEX idx_payslips_month_year ON public.payslips(month, year);

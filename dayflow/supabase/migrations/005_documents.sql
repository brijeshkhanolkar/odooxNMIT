-- ============================================================
-- Dayflow HRMS — Migration 005: Employee Documents
-- ============================================================

CREATE TABLE public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  type TEXT, -- e.g. 'resume', 'id_proof', 'contract', 'certificate'
  uploaded_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_documents_profile ON public.documents(profile_id);

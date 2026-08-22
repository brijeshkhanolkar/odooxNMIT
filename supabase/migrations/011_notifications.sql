-- ============================================================
-- Dayflow HRMS — Migration 011: Notifications
-- ============================================================

CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type notification_type NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_notifications_profile ON public.notifications(profile_id);
CREATE INDEX idx_notifications_unread ON public.notifications(profile_id, is_read) WHERE NOT is_read;

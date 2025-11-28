-- Migration: add summary and fixed_typo columns to feedbacks
ALTER TABLE public.feedbacks ADD COLUMN IF NOT EXISTS summary text NULL;
ALTER TABLE public.feedbacks ADD COLUMN IF NOT EXISTS fixed_typo text NULL;
-- (Optional) If the full_response column does not exist physically ignore; if it does and should be dropped uncomment below
-- ALTER TABLE public.feedbacks DROP COLUMN IF EXISTS full_response;
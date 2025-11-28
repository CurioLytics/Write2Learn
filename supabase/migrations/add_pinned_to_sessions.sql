-- Migration: Add pinned column to sessions table
-- This allows users to pin important roleplay sessions to the top of their history

-- Add pinned column with default value false
ALTER TABLE public.sessions 
ADD COLUMN IF NOT EXISTS pinned boolean DEFAULT false;

-- Create index for better query performance when filtering by pinned status
-- This index will help when sorting sessions by pinned status and creation date
CREATE INDEX IF NOT EXISTS idx_sessions_pinned 
ON public.sessions(profile_id, pinned, created_at DESC);

-- Add comment to document the column
COMMENT ON COLUMN public.sessions.pinned IS 'Whether this session is pinned to the top of the user''s history';

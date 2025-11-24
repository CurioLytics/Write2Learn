-- Create learning_events table for tracking user learning activities
CREATE TABLE IF NOT EXISTS learning_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('vocab_created', 'vocab_reviewed', 'journal_created', 'roleplay_completed', 'session_active')),
  reference_id UUID,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Add index on profile_id and created_at for efficient time-based queries
CREATE INDEX IF NOT EXISTS idx_learning_events_profile_created 
ON learning_events(profile_id, created_at DESC);

-- Add index on event_type for filtering by activity type
CREATE INDEX IF NOT EXISTS idx_learning_events_event_type 
ON learning_events(event_type);

-- Add composite index for querying specific user's events by type
CREATE INDEX IF NOT EXISTS idx_learning_events_profile_type 
ON learning_events(profile_id, event_type);

-- Add index on created_at date part for daily aggregations
CREATE INDEX IF NOT EXISTS idx_learning_events_date 
ON learning_events(profile_id, DATE(created_at));

-- Add unique constraint to prevent duplicate session_active events on the same day
CREATE UNIQUE INDEX IF NOT EXISTS idx_learning_events_session_active_daily 
ON learning_events(profile_id, DATE(created_at)) 
WHERE event_type = 'session_active';

-- Add comments for documentation
COMMENT ON TABLE learning_events IS 'Append-only log of user learning activities for progress tracking and analytics';
COMMENT ON COLUMN learning_events.event_type IS 'Type of learning event: vocab_created, vocab_reviewed, journal_created, roleplay_completed, session_active';
COMMENT ON COLUMN learning_events.reference_id IS 'Optional reference to the specific vocabulary, journal, or roleplay session';
COMMENT ON COLUMN learning_events.metadata IS 'Additional event details stored as JSON';

-- Enable Row Level Security
ALTER TABLE learning_events ENABLE ROW LEVEL SECURITY;

-- Create policy for users to view their own events
CREATE POLICY "Users can view their own learning events"
ON learning_events FOR SELECT
USING (auth.uid() = profile_id);

-- Create policy for users to insert their own events
CREATE POLICY "Users can insert their own learning events"
ON learning_events FOR INSERT
WITH CHECK (auth.uid() = profile_id);

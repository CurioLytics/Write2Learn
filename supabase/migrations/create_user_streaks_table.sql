-- Create user_streaks table
CREATE TABLE IF NOT EXISTS user_streaks (
  profile_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_active_date DATE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE user_streaks ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own streak
CREATE POLICY "Users can view their own streak"
ON user_streaks FOR SELECT
USING (auth.uid() = profile_id);

-- Backfill Data
DO $$
DECLARE
    r RECORD;
    evt RECORD;
    curr_streak INT := 0;
    max_streak INT := 0;
    last_date DATE := NULL;
    this_date DATE;
BEGIN
    FOR r IN SELECT id FROM profiles LOOP
        curr_streak := 0;
        max_streak := 0;
        last_date := NULL;
        
        FOR evt IN 
            SELECT DISTINCT DATE(created_at AT TIME ZONE 'UTC') as d
            FROM learning_events 
            WHERE profile_id = r.id 
            AND event_type IN ('vocab_created', 'journal_created', 'roleplay_completed')
            ORDER BY d ASC
        LOOP
            this_date := evt.d;
            
            IF last_date IS NULL THEN
                curr_streak := 1;
            ELSIF this_date = last_date + 1 THEN
                curr_streak := curr_streak + 1;
            ELSIF this_date > last_date + 1 THEN
                curr_streak := 1;
            END IF;
            
            IF curr_streak > max_streak THEN
                max_streak := curr_streak;
            END IF;
            
            last_date := this_date;
        END LOOP;
        
        IF last_date IS NOT NULL THEN
            INSERT INTO user_streaks (profile_id, current_streak, longest_streak, last_active_date)
            VALUES (r.id, curr_streak, max_streak, last_date)
            ON CONFLICT (profile_id) DO UPDATE
            SET current_streak = EXCLUDED.current_streak,
                longest_streak = EXCLUDED.longest_streak,
                last_active_date = EXCLUDED.last_active_date;
        END IF;
    END LOOP;
END $$;

# Plan: Refactor Streak Calculation Logic

## Objective
Refactor the streak calculation logic to be event-driven and persisted in a dedicated table (`user_streaks`), rather than calculated on-the-fly from `learning_events`. This improves performance and allows for more flexible streak rules.

## Current State
- Streak is calculated dynamically in `AnalyticsService.getStreak` by querying `learning_events` with `event_type = 'session_active'`.
- This is inefficient for large datasets and limited to login sessions.

## New Logic
- **Trigger Events**: Streak updates on `journal_created`, `vocab_created`, `roleplay_completed`.
- **Persistence**: New table `user_streaks` stores current state.
- **Flow**:
    1.  Event inserted into `learning_events`.
    2.  Trigger checks `last_active_date`.
    3.  Updates `current_streak` and `longest_streak` accordingly.

## Implementation Steps

### 1. Database Migration
Create a new migration file `supabase/migrations/create_user_streaks_table.sql`:

```sql
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

-- Create Trigger Function
CREATE OR REPLACE FUNCTION update_streak()
RETURNS TRIGGER AS $$
DECLARE
    today DATE;
    yesterday DATE;
    user_streak RECORD;
BEGIN
    -- Only count specific event types
    IF NEW.event_type NOT IN ('vocab_created', 'journal_created', 'roleplay_completed') THEN
        RETURN NEW;
    END IF;

    -- Get today's date (UTC)
    today := DATE(NEW.created_at AT TIME ZONE 'UTC');
    yesterday := today - 1;

    -- Get current streak info
    SELECT * INTO user_streak FROM user_streaks WHERE profile_id = NEW.profile_id;

    IF NOT FOUND THEN
        -- First time user
        INSERT INTO user_streaks (profile_id, current_streak, longest_streak, last_active_date)
        VALUES (NEW.profile_id, 1, 1, today);
    ELSE
        IF user_streak.last_active_date = today THEN
            -- Already counted for today, do nothing
            RETURN NEW;
        ELSIF user_streak.last_active_date = yesterday THEN
            -- Continue streak
            UPDATE user_streaks
            SET current_streak = current_streak + 1,
                longest_streak = GREATEST(longest_streak, current_streak + 1),
                last_active_date = today,
                updated_at = NOW()
            WHERE profile_id = NEW.profile_id;
        ELSE
            -- Streak broken
            UPDATE user_streaks
            SET current_streak = 1,
                last_active_date = today,
                updated_at = NOW()
            WHERE profile_id = NEW.profile_id;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create Trigger
DROP TRIGGER IF EXISTS update_streak_trigger ON learning_events;
CREATE TRIGGER update_streak_trigger
AFTER INSERT ON learning_events
FOR EACH ROW
EXECUTE FUNCTION update_streak();
```

### 2. Backfill Data (Optional but Recommended)
Run a script to populate `user_streaks` from existing `learning_events`.

```sql
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
```

### 3. Update Backend Service
Modify `services/analytics-service.ts`:
- Update `getStreak` method to query `user_streaks` table.
- Remove the old calculation logic.

```typescript
  async getStreak(profileId: string): Promise<StreakData> {
    try {
      const supabase = this.getSupabaseClient();
      const { data, error } = await supabase
        .from('user_streaks')
        .select('current_streak, longest_streak, last_active_date')
        .eq('profile_id', profileId)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "no rows returned"

      if (!data) {
        return { current_streak: 0, longest_streak: 0, last_active_date: null };
      }

      return {
        current_streak: data.current_streak,
        longest_streak: data.longest_streak,
        last_active_date: data.last_active_date,
      };
    } catch (error) {
      console.error('Error fetching streak:', error);
      return { current_streak: 0, longest_streak: 0, last_active_date: null };
    }
  }
```

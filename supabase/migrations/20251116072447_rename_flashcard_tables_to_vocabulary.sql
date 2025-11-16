-- Migration: Rename flashcard tables to vocabulary
-- Date: 2025-11-16
-- Description: Rename flashcard_set -> vocabulary_set, flashcard -> vocabulary, flashcard_status -> vocabulary_status

BEGIN;

-- 1️⃣ Drop existing foreign key constraints that will be affected
ALTER TABLE flashcard DROP CONSTRAINT IF EXISTS flashcard_set_id_fkey;
ALTER TABLE flashcard_status DROP CONSTRAINT IF EXISTS flashcard_status_flashcard_id_fkey;
ALTER TABLE fsrs_review_logs DROP CONSTRAINT IF EXISTS fsrs_review_logs_card_id_fkey;

-- 2️⃣ Rename flashcard_set to vocabulary_set
ALTER TABLE flashcard_set RENAME TO vocabulary_set;

-- 3️⃣ Remove source_type column from vocabulary_set (former flashcard_set)
ALTER TABLE vocabulary_set DROP COLUMN IF EXISTS source_type;

-- 4️⃣ Add is_default column to vocabulary_set
ALTER TABLE vocabulary_set ADD COLUMN is_default boolean DEFAULT false;

-- 5️⃣ Rename flashcard to vocabulary
ALTER TABLE flashcard RENAME TO vocabulary;

-- 6️⃣ Rename journal_entry_id to source_id in vocabulary table
ALTER TABLE vocabulary RENAME COLUMN journal_entry_id TO source_id;

-- 7️⃣ Remove context_sentence and source columns from vocabulary table
ALTER TABLE vocabulary DROP COLUMN IF EXISTS context_sentence;
ALTER TABLE vocabulary DROP COLUMN IF EXISTS source;

-- 8️⃣ Rename flashcard_status to vocabulary_status
ALTER TABLE flashcard_status RENAME TO vocabulary_status;

-- 9️⃣ Rename flashcard_id to vocabulary_id in vocabulary_status table
ALTER TABLE vocabulary_status RENAME COLUMN flashcard_id TO vocabulary_id;

-- 🔟 Re-create foreign key constraints with new table/column names
ALTER TABLE vocabulary 
ADD CONSTRAINT vocabulary_set_id_fkey 
FOREIGN KEY (set_id) REFERENCES vocabulary_set(id) ON DELETE CASCADE;

ALTER TABLE vocabulary_status 
ADD CONSTRAINT vocabulary_status_vocabulary_id_fkey 
FOREIGN KEY (vocabulary_id) REFERENCES vocabulary(id) ON DELETE CASCADE;

ALTER TABLE fsrs_review_logs 
ADD CONSTRAINT fsrs_review_logs_card_id_fkey 
FOREIGN KEY (card_id) REFERENCES vocabulary_status(id) ON DELETE CASCADE;

-- 1️⃣1️⃣ Update RLS policies for renamed tables
-- Drop old policies
DROP POLICY IF EXISTS "Users can view their own flashcard sets" ON vocabulary_set;
DROP POLICY IF EXISTS "Users can insert their own flashcard sets" ON vocabulary_set;
DROP POLICY IF EXISTS "Users can update their own flashcard sets" ON vocabulary_set;
DROP POLICY IF EXISTS "Users can delete their own flashcard sets" ON vocabulary_set;

-- Create new RLS policies for vocabulary_set
CREATE POLICY "Users can view their own vocabulary sets" 
ON vocabulary_set FOR SELECT 
USING (auth.uid() = profile_id);

CREATE POLICY "Users can insert their own vocabulary sets" 
ON vocabulary_set FOR INSERT 
WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "Users can update their own vocabulary sets" 
ON vocabulary_set FOR UPDATE 
USING (auth.uid() = profile_id);

CREATE POLICY "Users can delete their own vocabulary sets" 
ON vocabulary_set FOR DELETE 
USING (auth.uid() = profile_id);

-- 1️⃣2️⃣ Update indexes for performance (if they exist)
-- Drop old indexes
DROP INDEX IF EXISTS idx_flashcard_set_profile_id;
DROP INDEX IF EXISTS idx_flashcard_set_id;
DROP INDEX IF EXISTS idx_flashcard_status_flashcard_id;
DROP INDEX IF EXISTS idx_flashcard_status_next_review;

-- Create new indexes with updated names
CREATE INDEX IF NOT EXISTS idx_vocabulary_set_profile_id ON vocabulary_set(profile_id);
CREATE INDEX IF NOT EXISTS idx_vocabulary_set_id ON vocabulary(set_id);
CREATE INDEX IF NOT EXISTS idx_vocabulary_status_vocabulary_id ON vocabulary_status(vocabulary_id);
CREATE INDEX IF NOT EXISTS idx_vocabulary_status_next_review ON vocabulary_status(next_review_at);

-- 1️⃣3️⃣ Add comment documentation
COMMENT ON TABLE vocabulary_set IS 'Collection of vocabulary words for learning. Renamed from flashcard_set.';
COMMENT ON TABLE vocabulary IS 'Individual vocabulary words with meanings. Renamed from flashcard.';
COMMENT ON TABLE vocabulary_status IS 'FSRS learning status for vocabulary words. Renamed from flashcard_status.';

COMMENT ON COLUMN vocabulary_set.is_default IS 'Indicates if this is a default vocabulary set provided by the system';
COMMENT ON COLUMN vocabulary.source_id IS 'Reference to source journal entry or other content. Renamed from journal_entry_id.';
COMMENT ON COLUMN vocabulary_status.vocabulary_id IS 'Reference to vocabulary word. Renamed from flashcard_id.';

COMMIT;

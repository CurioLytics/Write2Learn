-- Add is_starred column to vocabulary table
ALTER TABLE vocabulary ADD COLUMN is_starred BOOLEAN DEFAULT FALSE;

-- Add is_starred column to vocabulary_set table
ALTER TABLE vocabulary_set ADD COLUMN is_starred BOOLEAN DEFAULT FALSE;
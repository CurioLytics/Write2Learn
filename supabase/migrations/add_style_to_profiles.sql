-- Add style column to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS style TEXT;

-- Add comment to describe the column
COMMENT ON COLUMN profiles.style IS 'English learning style preference: conversational, professional, or academic';

-- Create view to aggregate grammar feedback items by topic
-- This replaces the deprecated feedback_logs table for error analysis
CREATE OR REPLACE VIEW grammar_feedback_view AS
SELECT 
  fgi.id,
  fgi.feedback_id,
  fgi.grammar_topic_id,
  gt.topic_name,
  gt.description as topic_description,
  gt.level as topic_level,
  fgi.description as error_description,
  fgi.tags,
  f.profile_id,
  f.source_type,
  f.source_id,
  fgi.created_at,
  DATE(fgi.created_at) as error_date
FROM feedback_grammar_items fgi
LEFT JOIN grammar_topics gt ON fgi.grammar_topic_id = gt.topic_id
LEFT JOIN feedbacks f ON fgi.feedback_id = f.id
WHERE fgi.grammar_topic_id IS NOT NULL;

-- Add comment for documentation
COMMENT ON VIEW grammar_feedback_view IS 'Aggregated view of grammar errors by topic, replacing deprecated feedback_logs table';

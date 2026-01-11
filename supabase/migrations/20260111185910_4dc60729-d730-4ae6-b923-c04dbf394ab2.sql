-- Add thumbnail_position column to courses table
-- Uses TEXT to allow flexible CSS object-position values like "50% 30%"
ALTER TABLE courses 
ADD COLUMN IF NOT EXISTS thumbnail_position TEXT DEFAULT '50% 50%';

-- Add a comment explaining the format
COMMENT ON COLUMN courses.thumbnail_position IS 'CSS object-position value for focal point, e.g. "50% 30%"';
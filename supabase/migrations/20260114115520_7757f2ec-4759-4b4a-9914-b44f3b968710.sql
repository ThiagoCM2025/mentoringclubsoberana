-- Add is_official column to identify admin posts
ALTER TABLE community_posts 
ADD COLUMN is_official boolean DEFAULT false;

-- Add index for better query performance
CREATE INDEX idx_community_posts_is_official ON community_posts(is_official) WHERE is_official = true;
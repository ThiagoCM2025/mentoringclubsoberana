-- Create trigger to update comments_count on community_posts
CREATE OR REPLACE TRIGGER update_comments_count_trigger
AFTER INSERT OR DELETE ON public.community_comments
FOR EACH ROW
EXECUTE FUNCTION public.update_post_comments_count();

-- Sync all existing comments_count with actual comment counts
UPDATE public.community_posts cp
SET comments_count = (
  SELECT COUNT(*)::integer
  FROM public.community_comments cc
  WHERE cc.post_id = cp.id
);

-- Add is_hidden column to community_comments for moderation
ALTER TABLE public.community_comments 
ADD COLUMN IF NOT EXISTS is_hidden boolean DEFAULT false;

-- Add moderated_at and moderated_by to track comment moderation
ALTER TABLE public.community_comments 
ADD COLUMN IF NOT EXISTS moderated_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS moderated_by uuid;
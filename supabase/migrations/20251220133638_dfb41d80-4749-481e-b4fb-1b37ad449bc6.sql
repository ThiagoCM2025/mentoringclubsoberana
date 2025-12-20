-- Create comment_reactions table for reactions on individual comments
CREATE TABLE public.comment_reactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id uuid REFERENCES public.community_comments(id) ON DELETE CASCADE NOT NULL,
  user_id uuid NOT NULL,
  reaction_type text NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(comment_id, user_id, reaction_type)
);

-- Enable RLS
ALTER TABLE public.comment_reactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view all comment reactions"
ON public.comment_reactions
FOR SELECT
USING (true);

CREATE POLICY "Users can add comment reactions"
ON public.comment_reactions
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their comment reactions"
ON public.comment_reactions
FOR DELETE
USING (auth.uid() = user_id);

-- Add index for better query performance
CREATE INDEX idx_comment_reactions_comment_id ON public.comment_reactions(comment_id);
CREATE INDEX idx_comment_reactions_user_id ON public.comment_reactions(user_id);
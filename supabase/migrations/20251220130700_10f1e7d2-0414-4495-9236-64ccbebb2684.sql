-- Add image_url and poll fields to community_posts
ALTER TABLE public.community_posts 
ADD COLUMN IF NOT EXISTS image_url TEXT,
ADD COLUMN IF NOT EXISTS poll_question TEXT,
ADD COLUMN IF NOT EXISTS poll_options JSONB;

-- Create table for poll votes
CREATE TABLE IF NOT EXISTS public.community_poll_votes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  option_index INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(post_id, user_id)
);

-- Create table for reactions (multiple reaction types)
CREATE TABLE IF NOT EXISTS public.community_reactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  reaction_type TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(post_id, user_id, reaction_type)
);

-- Create table for mentions
CREATE TABLE IF NOT EXISTS public.community_mentions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES public.community_posts(id) ON DELETE CASCADE,
  comment_id UUID REFERENCES public.community_comments(id) ON DELETE CASCADE,
  mentioned_user_id UUID NOT NULL,
  mentioner_user_id UUID NOT NULL,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE public.community_poll_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_mentions ENABLE ROW LEVEL SECURITY;

-- Policies for poll votes
CREATE POLICY "Users can view all poll votes" ON public.community_poll_votes FOR SELECT USING (true);
CREATE POLICY "Users can vote on polls" ON public.community_poll_votes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can change their vote" ON public.community_poll_votes FOR DELETE USING (auth.uid() = user_id);

-- Policies for reactions
CREATE POLICY "Users can view all reactions" ON public.community_reactions FOR SELECT USING (true);
CREATE POLICY "Users can add reactions" ON public.community_reactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can remove their reactions" ON public.community_reactions FOR DELETE USING (auth.uid() = user_id);

-- Policies for mentions
CREATE POLICY "Users can view mentions for them" ON public.community_mentions FOR SELECT USING (auth.uid() = mentioned_user_id OR auth.uid() = mentioner_user_id);
CREATE POLICY "Users can create mentions" ON public.community_mentions FOR INSERT WITH CHECK (auth.uid() = mentioner_user_id);
CREATE POLICY "Users can mark their mentions as read" ON public.community_mentions FOR UPDATE USING (auth.uid() = mentioned_user_id);

-- Enable realtime for community posts
ALTER PUBLICATION supabase_realtime ADD TABLE public.community_posts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.community_comments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.community_reactions;
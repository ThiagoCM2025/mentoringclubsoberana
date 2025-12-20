-- Create function to automatically notify users when mentioned
CREATE OR REPLACE FUNCTION public.notify_on_mention()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_mentioner_name TEXT;
  v_post_title TEXT;
BEGIN
  -- Get mentioner name
  SELECT full_name INTO v_mentioner_name 
  FROM public.profiles 
  WHERE user_id = NEW.mentioner_user_id;
  
  -- Get post title if it's a post mention
  IF NEW.post_id IS NOT NULL THEN
    SELECT title INTO v_post_title 
    FROM public.community_posts 
    WHERE id = NEW.post_id;
  END IF;
  
  -- Create notification for mentioned user
  INSERT INTO public.notifications (
    user_id,
    title,
    message,
    type,
    created_by
  ) VALUES (
    NEW.mentioned_user_id,
    'Você foi mencionado!',
    format('%s mencionou você%s', 
      COALESCE(v_mentioner_name, 'Alguém'),
      CASE 
        WHEN NEW.comment_id IS NOT NULL THEN ' em um comentário'
        WHEN v_post_title IS NOT NULL THEN format(' no post "%s"', LEFT(v_post_title, 50))
        ELSE ' na comunidade'
      END
    ),
    'info',
    NEW.mentioner_user_id
  );
  
  RETURN NEW;
END;
$$;

-- Create trigger for mentions
DROP TRIGGER IF EXISTS on_mention_notify ON public.community_mentions;
CREATE TRIGGER on_mention_notify
  AFTER INSERT ON public.community_mentions
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_on_mention();
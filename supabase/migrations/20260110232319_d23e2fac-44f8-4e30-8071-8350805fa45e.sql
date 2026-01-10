-- Add custom_thumbnail_url column to lessons table for AI-generated thumbnails
ALTER TABLE public.lessons ADD COLUMN IF NOT EXISTS custom_thumbnail_url TEXT;

-- Add welcome_video_thumbnail setting
INSERT INTO public.platform_settings (key, value) 
VALUES ('welcome_video_thumbnail', null)
ON CONFLICT (key) DO NOTHING;
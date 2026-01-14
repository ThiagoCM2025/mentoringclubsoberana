-- Enable realtime for lessons and modules tables
ALTER TABLE public.lessons REPLICA IDENTITY FULL;
ALTER TABLE public.modules REPLICA IDENTITY FULL;
ALTER TABLE public.courses REPLICA IDENTITY FULL;
ALTER TABLE public.weekly_missions REPLICA IDENTITY FULL;

-- Add to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.lessons;
ALTER PUBLICATION supabase_realtime ADD TABLE public.modules;
ALTER PUBLICATION supabase_realtime ADD TABLE public.courses;
ALTER PUBLICATION supabase_realtime ADD TABLE public.weekly_missions;
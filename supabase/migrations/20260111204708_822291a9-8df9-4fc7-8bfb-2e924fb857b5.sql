-- Tabela para rastrear lembretes enviados
CREATE TABLE public.jornada_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  jornada_access_id UUID REFERENCES public.jornada_access(id) ON DELETE CASCADE,
  session_id UUID REFERENCES public.jornada_sessions(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(email, session_id)
);

-- RLS
ALTER TABLE public.jornada_reminders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage jornada reminders"
ON public.jornada_reminders FOR ALL
USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));

-- Fila de notificações para processamento
CREATE TABLE public.jornada_notification_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES public.jornada_sessions(id) ON DELETE CASCADE,
  jornada_slug TEXT NOT NULL,
  session_title TEXT NOT NULL,
  session_day INTEGER NOT NULL,
  youtube_id TEXT,
  materials_url TEXT,
  processed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  processed_at TIMESTAMP WITH TIME ZONE
);

-- RLS
ALTER TABLE public.jornada_notification_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage notification queue"
ON public.jornada_notification_queue FOR ALL
USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));

-- Trigger para detectar quando sessão é desbloqueada
CREATE OR REPLACE FUNCTION public.notify_jornada_session_unlock()
RETURNS TRIGGER AS $$
BEGIN
  -- Quando uma sessão é desbloqueada (is_unlocked muda de false para true)
  IF NEW.is_unlocked = true AND (OLD.is_unlocked = false OR OLD.is_unlocked IS NULL) THEN
    INSERT INTO public.jornada_notification_queue (
      session_id,
      jornada_slug,
      session_title,
      session_day,
      youtube_id,
      materials_url
    ) VALUES (
      NEW.id,
      NEW.jornada_slug,
      NEW.title,
      NEW.session_day,
      NEW.youtube_id,
      NEW.materials_url
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER trg_notify_jornada_session_unlock
AFTER UPDATE ON public.jornada_sessions
FOR EACH ROW EXECUTE FUNCTION public.notify_jornada_session_unlock();
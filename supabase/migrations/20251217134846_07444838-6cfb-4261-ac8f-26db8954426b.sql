-- Create notification_templates table
CREATE TABLE public.notification_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info',
  category TEXT,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.notification_templates ENABLE ROW LEVEL SECURITY;

-- Admins can manage templates
CREATE POLICY "Admins can manage templates" ON public.notification_templates
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for updated_at
CREATE TRIGGER update_notification_templates_updated_at
  BEFORE UPDATE ON public.notification_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default templates
INSERT INTO public.notification_templates (name, title, message, type, category, is_default) VALUES
  ('Boas-vindas', '🎉 Bem-vinda à Soberana!', 'Olá! Seja muito bem-vinda à nossa comunidade de advogadas empreendedoras. Estamos felizes em tê-la conosco nessa jornada de transformação. Explore os cursos e comece sua evolução hoje mesmo!', 'success', 'welcome', true),
  ('Lembrete de Aula', '📚 Continue sua jornada!', 'Percebemos que faz alguns dias desde sua última aula. Que tal retomar de onde parou? Seu progresso está salvo e esperando por você. Cada passo conta na sua transformação!', 'info', 'reminder', true),
  ('Parabéns pelo Progresso', '🏆 Parabéns pelo seu progresso!', 'Você está evoluindo muito bem! Continue assim e logo alcançará seus objetivos. Lembre-se: consistência é a chave do sucesso. Estamos torcendo por você!', 'success', 'progress', true),
  ('Nova Aula Disponível', '🆕 Nova aula disponível!', 'Uma nova aula foi adicionada ao seu curso. Confira agora e continue aprendendo. Não perca tempo, o conhecimento está esperando por você!', 'info', 'content', true),
  ('Lembrete de Certificado', '🎓 Seu certificado está esperando!', 'Parabéns por concluir o curso! Não se esqueça de gerar seu certificado na área de conquistas. Você merece esse reconhecimento pelo seu esforço e dedicação!', 'warning', 'certificate', true),
  ('Acesso Expirando', '⏰ Seu acesso está próximo do fim', 'Seu acesso ao curso expira em breve. Aproveite para concluir as aulas pendentes ou renovar sua assinatura para continuar tendo acesso ao conteúdo completo.', 'alert', 'subscription', true);
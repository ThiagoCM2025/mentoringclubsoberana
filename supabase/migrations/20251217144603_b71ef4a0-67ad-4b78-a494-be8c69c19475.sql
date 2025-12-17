-- Create nurturing sequences table for automated email campaigns
CREATE TABLE public.nurturing_sequences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  step_number INTEGER NOT NULL,
  name TEXT NOT NULL,
  delay_hours INTEGER NOT NULL DEFAULT 24,
  email_subject TEXT NOT NULL,
  email_body TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add unique constraint on step_number
ALTER TABLE public.nurturing_sequences ADD CONSTRAINT nurturing_sequences_step_unique UNIQUE (step_number);

-- Enable RLS
ALTER TABLE public.nurturing_sequences ENABLE ROW LEVEL SECURITY;

-- Only admins can manage nurturing sequences
CREATE POLICY "Admins can manage nurturing sequences"
  ON public.nurturing_sequences
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for updated_at
CREATE TRIGGER update_nurturing_sequences_updated_at
  BEFORE UPDATE ON public.nurturing_sequences
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default nurturing sequence (5 steps)
INSERT INTO public.nurturing_sequences (step_number, name, delay_hours, email_subject, email_body) VALUES
(1, 'Boas-vindas', 24, 'Bem-vinda à Soberana! 🌟', 'Olá {{name}},\n\nÉ uma alegria ter você aqui! Você deu o primeiro passo para transformar sua advocacia.\n\nNos próximos dias, vou compartilhar conteúdos exclusivos que vão te ajudar a crescer.\n\nAbraço,\nFabiana'),
(2, 'Conteúdo de Valor', 48, 'Dica exclusiva para advogadas 💡', 'Olá {{name}},\n\nVocê sabia que 90% das advogadas bem-sucedidas têm uma estratégia clara de posicionamento?\n\nPrepare um café e confira essas dicas que separei para você começar hoje.\n\nAbraço,\nFabiana'),
(3, 'Case de Sucesso', 72, 'Como Maria triplicou o faturamento 📈', 'Olá {{name}},\n\nQuero te contar a história da Maria, uma advogada que estava exatamente onde você está hoje.\n\nEm 6 meses, ela transformou completamente seu escritório usando o método que ensino.\n\nQuer saber como?\n\nAbraço,\nFabiana'),
(4, 'Oferta Especial', 120, 'Uma oportunidade especial para você ✨', 'Olá {{name}},\n\nVocê tem acompanhado nossos conteúdos e sei que está pronta para o próximo nível.\n\nPrepare uma condição especial só para você. Confira!\n\nAbraço,\nFabiana'),
(5, 'Última Chance', 168, 'Última chance, {{name}}! ⏰', 'Olá {{name}},\n\nEsta é minha última mensagem antes de encerrar esta sequência.\n\nSe você quer realmente transformar sua advocacia, agora é o momento.\n\nFicarei feliz em te receber na nossa comunidade.\n\nAbraço,\nFabiana');
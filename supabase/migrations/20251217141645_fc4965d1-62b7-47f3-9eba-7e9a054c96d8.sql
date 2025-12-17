-- Create message_templates table for communication scenarios
CREATE TABLE public.message_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT DEFAULT '📧',
  target_audience TEXT NOT NULL DEFAULT 'student',
  
  whatsapp_message TEXT,
  email_subject TEXT,
  email_body TEXT,
  
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create communication_history table for logging all communications
CREATE TABLE public.communication_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_type TEXT NOT NULL,
  recipient_id UUID NOT NULL,
  recipient_name TEXT,
  recipient_email TEXT,
  recipient_phone TEXT,
  
  channel TEXT NOT NULL,
  template_id UUID REFERENCES public.message_templates(id),
  subject TEXT,
  message TEXT NOT NULL,
  
  status TEXT DEFAULT 'sent',
  sent_by UUID,
  sent_at TIMESTAMPTZ DEFAULT now(),
  metadata JSONB
);

-- Enable RLS
ALTER TABLE public.message_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.communication_history ENABLE ROW LEVEL SECURITY;

-- RLS policies for message_templates (admins only)
CREATE POLICY "Admins can manage message templates"
ON public.message_templates
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS policies for communication_history (admins only)
CREATE POLICY "Admins can manage communication history"
ON public.communication_history
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for updated_at on message_templates
CREATE TRIGGER update_message_templates_updated_at
BEFORE UPDATE ON public.message_templates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert predefined templates for STUDENTS
INSERT INTO public.message_templates (name, description, icon, target_audience, email_subject, email_body, whatsapp_message, display_order)
VALUES
  (
    'Boas-vindas',
    'Primeiro contato após matrícula',
    '🎉',
    'student',
    '🎉 Bem-vinda à Soberana, {nome}!',
    'Olá {nome}!\n\nSeja muito bem-vinda à nossa comunidade de advogadas empreendedoras!\n\nEstamos muito felizes em ter você conosco. Sua jornada para transformar sua prática jurídica em um negócio soberano começa agora.\n\nAcesse a plataforma e comece seus estudos hoje mesmo!\n\nCom carinho,\nFabiana - Mentoria Soberana',
    'Olá {nome}! 🎉\n\nSeja muito bem-vinda à Soberana!\n\nEstou muito feliz em ter você conosco nessa jornada de transformação da sua carreira jurídica.\n\nQualquer dúvida, estou aqui!\n\nAbraços,\nFabiana',
    1
  ),
  (
    'Lembrete de Estudo',
    'Reengajar aluna inativa',
    '📚',
    'student',
    '📚 {nome}, sentimos sua falta na Soberana!',
    'Olá {nome}!\n\nNotamos que faz um tempo que você não acessa a plataforma.\n\nSuas aulas estão te esperando! Que tal reservar alguns minutinhos hoje para continuar sua evolução?\n\nLembre-se: consistência é a chave do sucesso!\n\nTe vejo na plataforma,\nFabiana - Mentoria Soberana',
    'Oi {nome}! 📚\n\nSentimos sua falta por aqui!\n\nSuas aulas estão te esperando. Que tal voltar aos estudos hoje?\n\nQualquer dificuldade, me conta!\n\nAbraços,\nFabiana',
    2
  ),
  (
    'Nova Aula Disponível',
    'Avisar sobre conteúdo novo',
    '🆕',
    'student',
    '🆕 Nova aula disponível para você, {nome}!',
    'Olá {nome}!\n\nTemos novidades! Uma nova aula acabou de ser liberada na plataforma.\n\nNão perca tempo e confira agora mesmo o novo conteúdo preparado especialmente para você.\n\nBons estudos!\n\nFabiana - Mentoria Soberana',
    'Oi {nome}! 🆕\n\nTenho uma novidade: nova aula disponível na plataforma!\n\nCorre lá conferir!\n\nAbraços,\nFabiana',
    3
  ),
  (
    'Parabéns pelo Progresso',
    'Celebrar conquistas da aluna',
    '🏆',
    'student',
    '🏆 Parabéns, {nome}! Você está arrasando!',
    'Olá {nome}!\n\nQuero te parabenizar pelo seu progresso incrível!\n\nVer sua dedicação e evolução me enche de orgulho. Continue assim, você está no caminho certo para se tornar uma advogada verdadeiramente soberana!\n\nContinue brilhando!\n\nCom carinho,\nFabiana - Mentoria Soberana',
    'Oi {nome}! 🏆\n\nPassei aqui para te parabenizar pelo seu progresso!\n\nVocê está arrasando nos estudos! Continue assim!\n\nOrgulho de você!\n\nAbraços,\nFabiana',
    4
  ),
  (
    'Certificado Disponível',
    'Lembrar de gerar certificado',
    '🎓',
    'student',
    '🎓 Seu certificado está disponível, {nome}!',
    'Olá {nome}!\n\nParabéns pela conclusão do curso! 🎉\n\nSeu certificado já está disponível para download na plataforma. Acesse a área de certificados e baixe o seu!\n\nEsse é mais um passo na sua jornada de sucesso!\n\nCom orgulho,\nFabiana - Mentoria Soberana',
    'Oi {nome}! 🎓\n\nParabéns pela conclusão!\n\nSeu certificado já está disponível na plataforma. Corre lá baixar!\n\nMuito orgulho de você!\n\nAbraços,\nFabiana',
    5
  ),
  (
    'Acesso Expirando',
    'Urgência para renovação',
    '⏰',
    'student',
    '⏰ {nome}, seu acesso está expirando em breve!',
    'Olá {nome}!\n\nPassando para avisar que seu acesso à plataforma está expirando em breve.\n\nNão deixe sua evolução parar! Renove agora e continue sua jornada de transformação.\n\nCaso tenha alguma dúvida sobre a renovação, é só me chamar!\n\nAbraços,\nFabiana - Mentoria Soberana',
    'Oi {nome}! ⏰\n\nSeu acesso à plataforma está expirando em breve!\n\nNão deixe sua evolução parar. Renove agora!\n\nDúvidas? Me chama!\n\nAbraços,\nFabiana',
    6
  );
-- Corrigir trigger para NÃO alterar nurturing_step
-- O nurturing_step deve ser controlado APENAS pela edge function send-nurturing-email

CREATE OR REPLACE FUNCTION public.update_lead_message_count()
RETURNS TRIGGER AS $$
BEGIN
  -- Only update message count and last contact, NOT nurturing_step
  -- nurturing_step is managed exclusively by the send-nurturing-email edge function
  IF NEW.recipient_type = 'lead' THEN
    UPDATE public.leads 
    SET 
      messages_sent = COALESCE(messages_sent, 0) + 1,
      last_contact_at = NOW(),
      updated_at = NOW()
    WHERE id = NEW.recipient_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Resetar o lead afetado para testar novamente
UPDATE public.leads 
SET 
  nurturing_step = 0,
  nurturing_active = true,
  last_contact_at = NULL,
  messages_sent = 0
WHERE email = 'thiagocm2016@gmail.com';

-- Limpar histórico de comunicação para teste limpo
DELETE FROM public.communication_history 
WHERE recipient_email = 'thiagocm2016@gmail.com';
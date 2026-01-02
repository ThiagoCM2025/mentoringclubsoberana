-- Trigger para registrar automaticamente evento de formulário quando um lead é criado
CREATE OR REPLACE FUNCTION public.auto_register_form_submission()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Inserir evento de formulário submetido
  INSERT INTO public.lead_engagement_events (lead_id, event_type, points, event_data)
  VALUES (NEW.id, 'form_submitted', 20, jsonb_build_object(
    'source', COALESCE(NEW.source, 'website'),
    'email', NEW.email
  ));
  
  -- Score já é atualizado pelo trigger existente update_lead_score_on_event
  
  RETURN NEW;
END;
$$;

-- Criar trigger para novos leads
DROP TRIGGER IF EXISTS on_lead_created_form_submission ON public.leads;
CREATE TRIGGER on_lead_created_form_submission
AFTER INSERT ON public.leads
FOR EACH ROW EXECUTE FUNCTION public.auto_register_form_submission();

-- Trigger para registrar visitas de página quando lead_events tem lead_id
CREATE OR REPLACE FUNCTION public.auto_register_page_visit()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Só processar se tiver lead_id e for evento de página
  IF NEW.lead_id IS NOT NULL AND NEW.event_type IN ('page_view', 'page_exit') THEN
    -- Verificar se já não existe evento de visita recente (últimos 5 minutos) para evitar duplicatas
    IF NOT EXISTS (
      SELECT 1 FROM public.lead_engagement_events 
      WHERE lead_id = NEW.lead_id 
      AND event_type = 'page_visit'
      AND created_at > NOW() - INTERVAL '5 minutes'
    ) THEN
      INSERT INTO public.lead_engagement_events (lead_id, event_type, points, event_data)
      VALUES (NEW.lead_id, 'page_visit', 3, jsonb_build_object(
        'page_url', NEW.page_url,
        'page_title', NEW.page_title
      ));
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Criar trigger para lead_events
DROP TRIGGER IF EXISTS on_lead_event_page_visit ON public.lead_events;
CREATE TRIGGER on_lead_event_page_visit
AFTER INSERT ON public.lead_events
FOR EACH ROW EXECUTE FUNCTION public.auto_register_page_visit();
-- Trigger para ativar nurturing automaticamente em novos leads
CREATE OR REPLACE FUNCTION public.activate_nurturing_on_new_lead()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Se nurturing_active não foi definido ou é null, ativar automaticamente
  IF NEW.nurturing_active IS NULL THEN
    NEW.nurturing_active := true;
  END IF;
  
  -- Se nurturing_step não foi definido, iniciar em 0
  IF NEW.nurturing_step IS NULL THEN
    NEW.nurturing_step := 0;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Criar trigger que roda antes do insert
DROP TRIGGER IF EXISTS trigger_activate_nurturing_on_new_lead ON public.leads;
CREATE TRIGGER trigger_activate_nurturing_on_new_lead
  BEFORE INSERT ON public.leads
  FOR EACH ROW
  EXECUTE FUNCTION public.activate_nurturing_on_new_lead();

-- Ativar nurturing para leads existentes que ainda não têm nurturing ativo
UPDATE public.leads 
SET nurturing_active = true, nurturing_step = 0 
WHERE nurturing_active IS NULL OR nurturing_active = false;
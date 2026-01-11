-- Criar tabela para sessões das jornadas
CREATE TABLE IF NOT EXISTS public.jornada_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  jornada_slug TEXT NOT NULL DEFAULT 'imobiliaria-2026',
  session_day INTEGER NOT NULL,
  session_month TEXT NOT NULL DEFAULT 'JAN',
  title TEXT NOT NULL,
  description TEXT,
  youtube_id TEXT,
  is_unlocked BOOLEAN DEFAULT false,
  unlock_date TIMESTAMP WITH TIME ZONE,
  materials_url TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(jornada_slug, session_day)
);

-- Inserir as 5 sessões da Jornada Imobiliária com títulos corretos
INSERT INTO public.jornada_sessions (session_day, session_month, title, order_index, is_unlocked) VALUES
(12, 'JAN', 'Como organizar sua rotina e processos para escalar no Direito Imobiliário sem surtar', 1, true),
(15, 'JAN', 'Passo a passo para fechar contratos com clientes qualificados no imobiliário (sem depender de indicação)', 2, false),
(19, 'JAN', 'Como usar inteligência artificial para ganhar tempo no escritório jurídico', 3, false),
(22, 'JAN', 'Passo a passo para criar uma tabela de precificação eficiente', 4, false),
(26, 'JAN', 'Como converter consultas em contratos de alto valor', 5, false)
ON CONFLICT (jornada_slug, session_day) DO UPDATE SET
  title = EXCLUDED.title,
  order_index = EXCLUDED.order_index;

-- Políticas RLS
ALTER TABLE public.jornada_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read jornada sessions"
ON public.jornada_sessions FOR SELECT TO public USING (true);

CREATE POLICY "Admins manage jornada sessions"
ON public.jornada_sessions FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

-- Trigger para updated_at
CREATE TRIGGER update_jornada_sessions_updated_at
BEFORE UPDATE ON public.jornada_sessions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Corrigir nome "Fabiana Augusto" para "Fabiana Duarte" nos templates de nurturing
UPDATE public.nurturing_sequences 
SET email_body = REPLACE(email_body, 'Fabiana Augusto', 'Fabiana Duarte')
WHERE email_body LIKE '%Fabiana Augusto%';

-- Atualizar a função RPC para também atualizar o source quando lead já existe
CREATE OR REPLACE FUNCTION public.upsert_lead_and_return_id(p_full_name text, p_email text, p_phone text DEFAULT NULL::text, p_source text DEFAULT 'website'::text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_lead_id UUID;
BEGIN
  -- Normaliza o email para lowercase
  p_email := LOWER(TRIM(p_email));
  
  -- Tenta inserir ou atualizar (agora também atualiza o source)
  INSERT INTO leads (full_name, email, phone, source, status, temperature, nurturing_active, nurturing_step)
  VALUES (TRIM(p_full_name), p_email, NULLIF(TRIM(p_phone), ''), p_source, 'new', 'warm', true, 0)
  ON CONFLICT (email) 
  DO UPDATE SET 
    full_name = EXCLUDED.full_name,
    phone = COALESCE(NULLIF(TRIM(EXCLUDED.phone), ''), leads.phone),
    source = EXCLUDED.source,
    updated_at = NOW()
  RETURNING id INTO v_lead_id;
  
  RETURN v_lead_id;
END;
$function$;

-- FASE 1: Limpar duplicatas e adicionar constraint UNIQUE

-- 1.1 Remover leads duplicados (mantém o mais antigo)
WITH duplicates AS (
  SELECT email, 
         array_agg(id ORDER BY created_at ASC) as ids
  FROM public.leads 
  GROUP BY email 
  HAVING COUNT(*) > 1
)
DELETE FROM public.leads 
WHERE id IN (
  SELECT unnest(ids[2:]) FROM duplicates
);

-- 1.2 Adicionar constraint UNIQUE na coluna email
ALTER TABLE public.leads ADD CONSTRAINT leads_email_unique UNIQUE (email);

-- FASE 2: Criar função RPC para upsert com retorno de ID (contorna RLS)
CREATE OR REPLACE FUNCTION public.upsert_lead_and_return_id(
  p_full_name TEXT,
  p_email TEXT,
  p_phone TEXT DEFAULT NULL,
  p_source TEXT DEFAULT 'website'
) RETURNS UUID
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_lead_id UUID;
BEGIN
  -- Normaliza o email para lowercase
  p_email := LOWER(TRIM(p_email));
  
  -- Tenta inserir ou atualizar
  INSERT INTO leads (full_name, email, phone, source, status, temperature, nurturing_active, nurturing_step)
  VALUES (TRIM(p_full_name), p_email, NULLIF(TRIM(p_phone), ''), p_source, 'new', 'warm', true, 0)
  ON CONFLICT (email) 
  DO UPDATE SET 
    full_name = EXCLUDED.full_name,
    phone = COALESCE(NULLIF(TRIM(EXCLUDED.phone), ''), leads.phone),
    updated_at = NOW()
  RETURNING id INTO v_lead_id;
  
  RETURN v_lead_id;
END;
$$;

-- Permitir que usuários anônimos chamem a função
GRANT EXECUTE ON FUNCTION public.upsert_lead_and_return_id TO anon;
GRANT EXECUTE ON FUNCTION public.upsert_lead_and_return_id TO authenticated;

-- FASE 3: Vincular downloads órfãos aos leads existentes
UPDATE public.ebook_downloads ed
SET lead_id = l.id
FROM public.leads l
WHERE LOWER(ed.email) = LOWER(l.email)
AND ed.lead_id IS NULL;

-- Corrigir o valor do status na função upsert_lead_and_return_id
-- O bug era: status = 'novo' (não existe no enum)
-- Correção: status = 'new' (valor correto do enum)

CREATE OR REPLACE FUNCTION public.upsert_lead_and_return_id(
  p_full_name TEXT,
  p_email TEXT,
  p_phone TEXT DEFAULT NULL,
  p_source TEXT DEFAULT 'website',
  p_batch_id UUID DEFAULT NULL
)
RETURNS TABLE(lead_id UUID, was_updated BOOLEAN)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  v_lead_id UUID;
  v_existing_id UUID;
  v_clean_phone TEXT;
  v_clean_email TEXT;
BEGIN
  -- Normalize inputs
  v_clean_email := LOWER(TRIM(p_email));
  v_clean_phone := REGEXP_REPLACE(TRIM(COALESCE(p_phone, '')), '[^0-9]', '', 'g');
  
  -- Check for duplicate by phone first (if phone provided)
  IF v_clean_phone != '' AND LENGTH(v_clean_phone) >= 8 THEN
    SELECT id INTO v_existing_id FROM leads 
    WHERE phone IS NOT NULL AND REGEXP_REPLACE(phone, '[^0-9]', '', 'g') = v_clean_phone
    LIMIT 1;
    
    IF v_existing_id IS NOT NULL THEN
      UPDATE leads SET 
        full_name = COALESCE(NULLIF(TRIM(p_full_name), ''), full_name),
        email = CASE WHEN v_clean_email NOT LIKE '%@import.local' THEN v_clean_email ELSE email END,
        source = COALESCE(p_source, source),
        import_batch_id = COALESCE(p_batch_id, import_batch_id),
        imported_at = CASE WHEN p_batch_id IS NOT NULL THEN NOW() ELSE imported_at END,
        updated_at = NOW()
      WHERE id = v_existing_id;
      
      RETURN QUERY SELECT v_existing_id, TRUE;
      RETURN;
    END IF;
  END IF;
  
  -- Check for duplicate by email (if not a placeholder email)
  IF v_clean_email NOT LIKE '%@import.local' THEN
    SELECT id INTO v_existing_id FROM leads 
    WHERE email = v_clean_email
    LIMIT 1;
    
    IF v_existing_id IS NOT NULL THEN
      UPDATE leads SET 
        full_name = COALESCE(NULLIF(TRIM(p_full_name), ''), full_name),
        phone = COALESCE(NULLIF(v_clean_phone, ''), phone),
        source = COALESCE(p_source, source),
        import_batch_id = COALESCE(p_batch_id, import_batch_id),
        imported_at = CASE WHEN p_batch_id IS NOT NULL THEN NOW() ELSE imported_at END,
        updated_at = NOW()
      WHERE id = v_existing_id;
      
      RETURN QUERY SELECT v_existing_id, TRUE;
      RETURN;
    END IF;
  END IF;
  
  -- Insert new lead com status CORRETO
  INSERT INTO leads (
    full_name, 
    email, 
    phone, 
    source, 
    status,
    import_batch_id,
    imported_at
  )
  VALUES (
    TRIM(p_full_name),
    v_clean_email,
    NULLIF(v_clean_phone, ''),
    COALESCE(p_source, 'website'),
    'new',  -- CORRIGIDO: era 'novo', agora é 'new'
    p_batch_id,
    CASE WHEN p_batch_id IS NOT NULL THEN NOW() ELSE NULL END
  )
  RETURNING id INTO v_lead_id;
  
  -- Calculate initial lead score
  PERFORM calculate_lead_score(v_lead_id);
  
  RETURN QUERY SELECT v_lead_id, FALSE;
END;
$function$;
-- Corrigir política RLS para permitir reenvio de missões rejeitadas
-- O problema: usuários só podiam atualizar missões com status 'pending'
-- A solução: permitir atualização também quando status é 'rejected'

DROP POLICY IF EXISTS "Users can update own pending completions" ON public.user_mission_completions;

CREATE POLICY "Users can update own submissions" 
  ON public.user_mission_completions 
  FOR UPDATE
  USING (
    auth.uid() = user_id 
    AND status IN ('pending', 'rejected')
  );
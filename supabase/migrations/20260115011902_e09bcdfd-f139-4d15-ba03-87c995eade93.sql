-- Tabela para tokens de tracking de leads importados
CREATE TABLE lead_tracking_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  target_url TEXT DEFAULT '/',
  expires_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índice para busca rápida por token
CREATE INDEX idx_lead_tracking_tokens_token ON lead_tracking_tokens(token);

-- RLS
ALTER TABLE lead_tracking_tokens ENABLE ROW LEVEL SECURITY;

-- Admins podem gerenciar tokens
CREATE POLICY "Admins podem gerenciar tokens"
  ON lead_tracking_tokens FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Acesso público para leitura (necessário para redirect)
CREATE POLICY "Tokens podem ser lidos publicamente"
  ON lead_tracking_tokens FOR SELECT
  TO anon
  USING (true);

-- Permitir update anônimo para marcar clicked_at
CREATE POLICY "Tokens podem ser atualizados publicamente"
  ON lead_tracking_tokens FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);
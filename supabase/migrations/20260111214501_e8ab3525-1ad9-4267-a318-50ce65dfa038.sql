-- Criar bucket para provas de missões
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('mission-proofs', 'mission-proofs', true, 5242880)
ON CONFLICT (id) DO NOTHING;

-- RLS para upload (apenas usuário autenticado pode fazer upload na sua pasta)
CREATE POLICY "Users can upload their own proof images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'mission-proofs' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- RLS para atualização
CREATE POLICY "Users can update their own proof images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'mission-proofs' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- RLS para deleção
CREATE POLICY "Users can delete their own proof images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'mission-proofs' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- RLS para visualização pública
CREATE POLICY "Proof images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'mission-proofs');
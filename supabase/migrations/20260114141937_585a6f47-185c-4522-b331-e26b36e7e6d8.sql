-- Create bucket for agent thumbnails
INSERT INTO storage.buckets (id, name, public) 
VALUES ('agent-thumbnails', 'agent-thumbnails', true)
ON CONFLICT (id) DO NOTHING;

-- Policy for admins to upload thumbnails
CREATE POLICY "Admins podem fazer upload de thumbnails de agentes"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'agent-thumbnails' AND
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

-- Policy for public read access
CREATE POLICY "Thumbnails de agentes são públicas"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'agent-thumbnails');

-- Policy for admins to delete thumbnails
CREATE POLICY "Admins podem deletar thumbnails de agentes"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'agent-thumbnails' AND
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

-- Policy for admins to update thumbnails
CREATE POLICY "Admins podem atualizar thumbnails de agentes"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'agent-thumbnails' AND
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);
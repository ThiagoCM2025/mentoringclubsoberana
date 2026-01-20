-- Create whatsapp-media storage bucket (public for Evolution API access)
INSERT INTO storage.buckets (id, name, public)
VALUES ('whatsapp-media', 'whatsapp-media', true)
ON CONFLICT (id) DO NOTHING;

-- Policy: Admins can upload whatsapp media
CREATE POLICY "Admins can upload whatsapp media"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'whatsapp-media' AND
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
);

-- Policy: Admins can delete whatsapp media
CREATE POLICY "Admins can delete whatsapp media"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'whatsapp-media' AND
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
);

-- Policy: Public can view whatsapp media (Evolution API needs to access)
CREATE POLICY "Public can view whatsapp media"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'whatsapp-media');
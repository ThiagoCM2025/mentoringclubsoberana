-- Create ebooks storage bucket for public PDF downloads
INSERT INTO storage.buckets (id, name, public) 
VALUES ('ebooks', 'ebooks', true)
ON CONFLICT (id) DO NOTHING;

-- Allow anyone to download ebooks (public bucket)
CREATE POLICY "Anyone can download ebooks" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'ebooks');

-- Only admins can upload/manage ebooks
CREATE POLICY "Admins can manage ebooks" 
ON storage.objects 
FOR ALL 
USING (bucket_id = 'ebooks' AND has_role(auth.uid(), 'admin'::app_role));
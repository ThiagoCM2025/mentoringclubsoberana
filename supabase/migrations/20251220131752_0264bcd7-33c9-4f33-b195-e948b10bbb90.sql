-- Create community-images bucket for post images
INSERT INTO storage.buckets (id, name, public)
VALUES ('community-images', 'community-images', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for community images
CREATE POLICY "Anyone can view community images"
ON storage.objects FOR SELECT
USING (bucket_id = 'community-images');

CREATE POLICY "Authenticated users can upload community images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'community-images' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Users can delete own community images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'community-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
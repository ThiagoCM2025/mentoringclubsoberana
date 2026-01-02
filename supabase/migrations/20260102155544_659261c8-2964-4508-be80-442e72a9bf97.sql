-- Add RLS policy to allow admins to delete ebook_downloads
CREATE POLICY "Admins can delete ebook downloads"
ON ebook_downloads
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add RLS policy to allow admins to update ebook_downloads
CREATE POLICY "Admins can update ebook downloads"
ON ebook_downloads
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));
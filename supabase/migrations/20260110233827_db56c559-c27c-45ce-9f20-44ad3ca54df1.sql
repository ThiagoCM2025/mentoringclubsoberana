-- Make course-materials bucket public so AI-generated thumbnails are accessible
UPDATE storage.buckets 
SET public = true 
WHERE id = 'course-materials';
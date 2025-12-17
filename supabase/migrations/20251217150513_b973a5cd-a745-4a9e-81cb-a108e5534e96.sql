-- Create storage bucket for course materials
INSERT INTO storage.buckets (id, name, public)
VALUES ('course-materials', 'course-materials', false)
ON CONFLICT (id) DO NOTHING;

-- Allow admins to upload/manage materials
CREATE POLICY "Admins can manage course materials"
ON storage.objects FOR ALL
USING (bucket_id = 'course-materials' AND public.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (bucket_id = 'course-materials' AND public.has_role(auth.uid(), 'admin'::public.app_role));

-- Allow enrolled students to view/download materials
CREATE POLICY "Enrolled students can view course materials"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'course-materials' 
  AND (
    public.has_role(auth.uid(), 'admin'::public.app_role)
    OR EXISTS (
      SELECT 1 FROM public.enrollments e
      JOIN public.modules m ON m.course_id = e.course_id
      JOIN public.lessons l ON l.module_id = m.id
      WHERE e.user_id = auth.uid()
    )
  )
);
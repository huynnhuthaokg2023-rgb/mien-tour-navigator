CREATE POLICY "Admins can read media" ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'mien-tour-media' AND public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins can upload media" ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'mien-tour-media' AND public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins can update media" ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'mien-tour-media' AND public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins can delete media" ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'mien-tour-media' AND public.has_role(auth.uid(),'admin'));
DROP POLICY IF EXISTS "Public can view published guides" ON public.guides;
DROP POLICY IF EXISTS "Public can view published partners" ON public.vehicle_partners;

CREATE POLICY "Admins can view all guides via table" ON public.guides FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can view all partners via table" ON public.vehicle_partners FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role));

REVOKE SELECT ON public.guides FROM anon;
REVOKE SELECT ON public.vehicle_partners FROM anon;

CREATE OR REPLACE VIEW public.guides_public AS
SELECT id, full_name, photo_url, languages, experience, rating, price_note, service_area, bio,
       phone, zalo, certificate_url, video_url, gender, nationality, specialties,
       featured, availability_status, sort_order, published, created_at, updated_at
FROM public.guides
WHERE published = true;

CREATE OR REPLACE VIEW public.vehicle_partners_public AS
SELECT id, name, logo_url, cover_image_url, vehicle_image_url, vehicle_types, price_note,
       service_area, description, phone, zalo, facebook, website, price_list_url, license_url,
       video_url, address, notes, featured, availability_status, sort_order, published,
       created_at, updated_at
FROM public.vehicle_partners
WHERE published = true;

GRANT SELECT ON public.guides_public TO anon, authenticated;
GRANT SELECT ON public.vehicle_partners_public TO anon, authenticated;
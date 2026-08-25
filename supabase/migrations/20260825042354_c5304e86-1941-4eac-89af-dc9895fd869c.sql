DROP VIEW IF EXISTS public.guides_public;
DROP VIEW IF EXISTS public.vehicle_partners_public;

CREATE POLICY "Public can view published guides" ON public.guides FOR SELECT TO anon, authenticated USING (published = true);
CREATE POLICY "Public can view published partners" ON public.vehicle_partners FOR SELECT TO anon, authenticated USING (published = true);

GRANT SELECT (id, full_name, photo_url, languages, experience, rating, price_note, service_area, bio,
  phone, zalo, certificate_url, video_url, gender, nationality, specialties,
  featured, availability_status, sort_order, published, created_at, updated_at)
ON public.guides TO anon;

GRANT SELECT (id, name, logo_url, cover_image_url, vehicle_image_url, vehicle_types, price_note,
  service_area, description, phone, zalo, facebook, website, price_list_url, license_url,
  video_url, address, notes, featured, availability_status, sort_order, published,
  created_at, updated_at)
ON public.vehicle_partners TO anon;
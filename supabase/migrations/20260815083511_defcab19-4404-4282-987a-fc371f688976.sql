ALTER TABLE public.vehicle_partners
  ADD COLUMN IF NOT EXISTS cover_image_url text,
  ADD COLUMN IF NOT EXISTS video_url text,
  ADD COLUMN IF NOT EXISTS contact_person text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS address text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS notes text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS featured boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS availability_status text NOT NULL DEFAULT 'available';

ALTER TABLE public.guides
  ADD COLUMN IF NOT EXISTS video_url text,
  ADD COLUMN IF NOT EXISTS gender text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS birth_date date,
  ADD COLUMN IF NOT EXISTS nationality text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS specialties text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS facebook text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS featured boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS availability_status text NOT NULL DEFAULT 'accepting';

CREATE TABLE IF NOT EXISTS public.vehicle_partner_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id uuid NOT NULL REFERENCES public.vehicle_partners(id) ON DELETE CASCADE,
  url text NOT NULL,
  caption text NOT NULL DEFAULT '',
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.vehicle_partner_images TO authenticated;
GRANT SELECT ON public.vehicle_partner_images TO anon;
GRANT ALL ON public.vehicle_partner_images TO service_role;
ALTER TABLE public.vehicle_partner_images ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view images of published partners" ON public.vehicle_partner_images FOR SELECT TO anon, authenticated USING (EXISTS (SELECT 1 FROM public.vehicle_partners p WHERE p.id = partner_id AND p.published = true));
CREATE POLICY "Admins can view all partner images" ON public.vehicle_partner_images FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can insert partner images" ON public.vehicle_partner_images FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update partner images" ON public.vehicle_partner_images FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete partner images" ON public.vehicle_partner_images FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TABLE IF NOT EXISTS public.guide_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  guide_id uuid NOT NULL REFERENCES public.guides(id) ON DELETE CASCADE,
  url text NOT NULL,
  caption text NOT NULL DEFAULT '',
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.guide_images TO authenticated;
GRANT SELECT ON public.guide_images TO anon;
GRANT ALL ON public.guide_images TO service_role;
ALTER TABLE public.guide_images ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view images of published guides" ON public.guide_images FOR SELECT TO anon, authenticated USING (EXISTS (SELECT 1 FROM public.guides g WHERE g.id = guide_id AND g.published = true));
CREATE POLICY "Admins can view all guide images" ON public.guide_images FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can insert guide images" ON public.guide_images FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update guide images" ON public.guide_images FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete guide images" ON public.guide_images FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
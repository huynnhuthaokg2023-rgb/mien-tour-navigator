
CREATE TABLE public.tours (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id uuid REFERENCES public.locations(id) ON DELETE CASCADE,
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  summary text NOT NULL DEFAULT '',
  duration_label text NOT NULL DEFAULT '',
  duration_minutes integer NOT NULL DEFAULT 0,
  distance_km numeric NOT NULL DEFAULT 0,
  transport text NOT NULL DEFAULT '',
  itinerary text NOT NULL DEFAULT '',
  price_note text NOT NULL DEFAULT '',
  cover_image_url text,
  video_url text,
  audio_vi_url text,
  audio_en_url text,
  map_embed_url text,
  sort_order integer NOT NULL DEFAULT 0,
  published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tours TO authenticated;
GRANT SELECT ON public.tours TO anon;
GRANT ALL ON public.tours TO service_role;
ALTER TABLE public.tours ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view published tours" ON public.tours FOR SELECT TO anon, authenticated USING (published = true);
CREATE POLICY "Admins can view all tours" ON public.tours FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can insert tours" ON public.tours FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update tours" ON public.tours FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete tours" ON public.tours FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'));
CREATE TRIGGER tours_updated_at BEFORE UPDATE ON public.tours FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.tour_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tour_id uuid NOT NULL REFERENCES public.tours(id) ON DELETE CASCADE,
  url text NOT NULL,
  caption text NOT NULL DEFAULT '',
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tour_images TO authenticated;
GRANT SELECT ON public.tour_images TO anon;
GRANT ALL ON public.tour_images TO service_role;
ALTER TABLE public.tour_images ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view images of published tours" ON public.tour_images FOR SELECT TO anon, authenticated USING (EXISTS (SELECT 1 FROM public.tours t WHERE t.id = tour_images.tour_id AND t.published = true));
CREATE POLICY "Admins can view all tour images" ON public.tour_images FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can insert tour images" ON public.tour_images FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update tour images" ON public.tour_images FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete tour images" ON public.tour_images FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'));

CREATE TABLE public.vehicle_partners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  logo_url text,
  vehicle_image_url text,
  vehicle_types text[] NOT NULL DEFAULT '{}',
  price_note text NOT NULL DEFAULT '',
  service_area text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  phone text NOT NULL DEFAULT '',
  zalo text NOT NULL DEFAULT '',
  facebook text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  website text NOT NULL DEFAULT '',
  price_list_url text,
  license_url text,
  sort_order integer NOT NULL DEFAULT 0,
  published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.vehicle_partners TO authenticated;
GRANT SELECT ON public.vehicle_partners TO anon;
GRANT ALL ON public.vehicle_partners TO service_role;
ALTER TABLE public.vehicle_partners ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view published partners" ON public.vehicle_partners FOR SELECT TO anon, authenticated USING (published = true);
CREATE POLICY "Admins can view all partners" ON public.vehicle_partners FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can insert partners" ON public.vehicle_partners FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update partners" ON public.vehicle_partners FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete partners" ON public.vehicle_partners FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'));
CREATE TRIGGER vehicle_partners_updated_at BEFORE UPDATE ON public.vehicle_partners FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.guides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  photo_url text,
  languages text[] NOT NULL DEFAULT '{}',
  experience text NOT NULL DEFAULT '',
  rating numeric NOT NULL DEFAULT 5,
  price_note text NOT NULL DEFAULT '',
  service_area text NOT NULL DEFAULT '',
  bio text NOT NULL DEFAULT '',
  phone text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  zalo text NOT NULL DEFAULT '',
  certificate_url text,
  sort_order integer NOT NULL DEFAULT 0,
  published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.guides TO authenticated;
GRANT SELECT ON public.guides TO anon;
GRANT ALL ON public.guides TO service_role;
ALTER TABLE public.guides ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view published guides" ON public.guides FOR SELECT TO anon, authenticated USING (published = true);
CREATE POLICY "Admins can view all guides" ON public.guides FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can insert guides" ON public.guides FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update guides" ON public.guides FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete guides" ON public.guides FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'));
CREATE TRIGGER guides_updated_at BEFORE UPDATE ON public.guides FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  cover_image_url text,
  start_date date,
  end_date date,
  place text NOT NULL DEFAULT '',
  sort_order integer NOT NULL DEFAULT 0,
  published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.events TO authenticated;
GRANT SELECT ON public.events TO anon;
GRANT ALL ON public.events TO service_role;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view published events" ON public.events FOR SELECT TO anon, authenticated USING (published = true);
CREATE POLICY "Admins can view all events" ON public.events FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can insert events" ON public.events FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update events" ON public.events FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete events" ON public.events FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'));
CREATE TRIGGER events_updated_at BEFORE UPDATE ON public.events FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.service_bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_type text NOT NULL DEFAULT 'vehicle',
  partner_id uuid REFERENCES public.vehicle_partners(id) ON DELETE SET NULL,
  guide_id uuid REFERENCES public.guides(id) ON DELETE SET NULL,
  tour_id uuid REFERENCES public.tours(id) ON DELETE SET NULL,
  full_name text NOT NULL,
  phone text NOT NULL,
  email text NOT NULL DEFAULT '',
  travel_date date,
  guests integer NOT NULL DEFAULT 1,
  pickup text NOT NULL DEFAULT '',
  note text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'new',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.service_bookings TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.service_bookings TO authenticated;
GRANT ALL ON public.service_bookings TO service_role;
ALTER TABLE public.service_bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can submit a booking" ON public.service_bookings FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Admins can view bookings" ON public.service_bookings FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update bookings" ON public.service_bookings FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete bookings" ON public.service_bookings FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'));
CREATE TRIGGER service_bookings_updated_at BEFORE UPDATE ON public.service_bookings FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  target_type text NOT NULL CHECK (target_type IN ('location','tour')),
  target_id uuid NOT NULL,
  author_name text NOT NULL DEFAULT 'Khách',
  rating integer NOT NULL DEFAULT 5 CHECK (rating BETWEEN 1 AND 5),
  comment text NOT NULL DEFAULT '',
  approved boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.reviews TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.reviews TO authenticated;
GRANT ALL ON public.reviews TO service_role;

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view approved reviews" ON public.reviews
  FOR SELECT TO anon, authenticated USING (approved = true);
CREATE POLICY "Anyone can submit a review" ON public.reviews
  FOR INSERT TO anon, authenticated WITH CHECK (approved = false);
CREATE POLICY "Admins can view all reviews" ON public.reviews
  FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update reviews" ON public.reviews
  FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete reviews" ON public.reviews
  FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

CREATE INDEX reviews_target_idx ON public.reviews (target_type, target_id, approved);
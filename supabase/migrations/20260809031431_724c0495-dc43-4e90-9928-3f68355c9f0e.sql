CREATE TABLE public.analytics_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL,
  target_type text NOT NULL DEFAULT '',
  target_id uuid,
  target_label text NOT NULL DEFAULT '',
  path text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT INSERT ON public.analytics_events TO anon, authenticated;
GRANT SELECT, DELETE ON public.analytics_events TO authenticated;
GRANT ALL ON public.analytics_events TO service_role;

ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can log analytics events"
  ON public.analytics_events FOR INSERT TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can read analytics"
  ON public.analytics_events FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete analytics"
  ON public.analytics_events FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX analytics_events_type_created_idx ON public.analytics_events (event_type, created_at DESC);
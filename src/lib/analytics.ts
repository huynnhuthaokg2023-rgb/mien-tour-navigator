import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export type AnalyticsEventType =
  | "page_view"
  | "location_view"
  | "tour_view"
  | "video_play"
  | "audio_play";

export type AnalyticsInput = {
  event_type: AnalyticsEventType;
  target_type?: string;
  target_id?: string | null;
  target_label?: string;
};

export type AnalyticsRow = {
  id: string;
  event_type: string;
  target_type: string;
  target_id: string | null;
  target_label: string;
  path: string;
  created_at: string;
};

function onceKey(input: AnalyticsInput) {
  return `mt:an:${input.event_type}:${input.target_id ?? input.target_label ?? "-"}`;
}

export function trackEvent(input: AnalyticsInput, once = false) {
  if (typeof window === "undefined") return;
  if (once) {
    const k = onceKey(input);
    if (sessionStorage.getItem(k)) return;
    sessionStorage.setItem(k, "1");
  }
  void supabase
    .from("analytics_events")
    .insert({
      event_type: input.event_type,
      target_type: input.target_type ?? "",
      target_id: input.target_id ?? null,
      target_label: input.target_label ?? "",
      path: window.location.pathname,
    })
    .then(() => undefined);
}

/** Ghi nhận lượt xem một lần cho mỗi phiên truy cập. */
export function useTrackView(input: AnalyticsInput | null) {
  const key = input ? onceKey(input) : "";
  useEffect(() => {
    if (!input) return;
    trackEvent(input, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
}

export async function fetchAnalytics(days = 30): Promise<AnalyticsRow[]> {
  const since = new Date(Date.now() - days * 86400000).toISOString();
  const { data, error } = await supabase
    .from("analytics_events")
    .select("*")
    .gte("created_at", since)
    .order("created_at", { ascending: false })
    .limit(5000);
  if (error) throw error;
  return (data ?? []) as AnalyticsRow[];
}

import { supabase } from "@/integrations/supabase/client";

export const MEDIA_BUCKET = "mien-tour-media";
const SIGNED_URL_TTL = 60 * 60 * 24 * 365 * 5; // ~5 năm

export type Region = {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  cover_image_url: string | null;
  sort_order: number;
  published: boolean;
};

export type LocationImage = {
  id: string;
  location_id: string;
  url: string;
  caption: string;
  sort_order: number;
};

export type TourLocation = {
  id: string;
  region_id: string;
  slug: string;
  name: string;
  address: string;
  short_description: string;
  description: string;
  highlights: string[];
  culture_history: string;
  activities: string;
  suggestions: string;
  visit_time: string;
  ticket_price: string;
  notes: string;
  contact: string;
  cover_image_url: string | null;
  video_url: string | null;
  map_embed_url: string | null;
  latitude: number | null;
  longitude: number | null;
  audio_vi_url: string | null;
  audio_en_url: string | null;
  sort_order: number;
  published: boolean;
};

const REGION_FIELDS =
  "id, slug, name, tagline, description, cover_image_url, sort_order, published";

export async function fetchRegions(includeHidden = false): Promise<Region[]> {
  let q = supabase.from("regions").select(REGION_FIELDS).order("sort_order");
  if (!includeHidden) q = q.eq("published", true);
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as Region[];
}

export async function fetchRegion(slug: string): Promise<Region | null> {
  const { data, error } = await supabase
    .from("regions")
    .select(REGION_FIELDS)
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw error;
  return (data as Region) ?? null;
}

export async function fetchLocations(
  regionId?: string,
  includeHidden = false,
): Promise<TourLocation[]> {
  let q = supabase.from("locations").select("*").order("sort_order");
  if (regionId) q = q.eq("region_id", regionId);
  if (!includeHidden) q = q.eq("published", true);
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as TourLocation[];
}

export async function fetchLocation(slug: string): Promise<TourLocation | null> {
  const { data, error } = await supabase
    .from("locations")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw error;
  return (data as TourLocation) ?? null;
}

export async function fetchLocationById(id: string): Promise<TourLocation | null> {
  const { data, error } = await supabase
    .from("locations")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return (data as TourLocation) ?? null;
}

export async function fetchLocationImages(locationId: string): Promise<LocationImage[]> {
  const { data, error } = await supabase
    .from("location_images")
    .select("*")
    .eq("location_id", locationId)
    .order("sort_order");
  if (error) throw error;
  return (data ?? []) as LocationImage[];
}

/** Tải tệp lên kho lưu trữ và trả về đường dẫn có thể dùng công khai. */
export async function uploadMedia(folder: string, file: File): Promise<string> {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "bin";
  const path = `${folder}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage
    .from(MEDIA_BUCKET)
    .upload(path, file, { cacheControl: "31536000", upsert: false });
  if (error) throw error;
  const { data, error: signError } = await supabase.storage
    .from(MEDIA_BUCKET)
    .createSignedUrl(path, SIGNED_URL_TTL);
  if (signError || !data?.signedUrl) throw signError ?? new Error("Không tạo được đường dẫn tệp");
  return data.signedUrl;
}

export function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "d")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 70);
}

export function mapsEmbedSrc(loc: {
  map_embed_url: string | null;
  latitude: number | null;
  longitude: number | null;
  address: string;
  name: string;
}): string | null {
  if (loc.map_embed_url) return loc.map_embed_url;
  const q =
    loc.latitude != null && loc.longitude != null
      ? `${loc.latitude},${loc.longitude}`
      : [loc.name, loc.address].filter(Boolean).join(", ");
  if (!q) return null;
  return `https://maps.google.com/maps?q=${encodeURIComponent(q)}&z=16&output=embed`;
}

export function directionsUrl(loc: {
  latitude: number | null;
  longitude: number | null;
  address: string;
  name: string;
}): string {
  const q =
    loc.latitude != null && loc.longitude != null
      ? `${loc.latitude},${loc.longitude}`
      : [loc.name, loc.address].filter(Boolean).join(", ");
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(q)}`;
}

export function embedVideoSrc(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtube.com")) {
      const id = u.searchParams.get("v") ?? u.pathname.split("/").pop();
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }
    if (u.hostname === "youtu.be") return `https://www.youtube.com/embed${u.pathname}`;
    if (u.hostname.includes("vimeo.com"))
      return `https://player.vimeo.com/video${u.pathname}`;
    return null;
  } catch {
    return null;
  }
}

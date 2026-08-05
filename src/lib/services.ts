import { supabase } from "@/integrations/supabase/client";

export type Tour = {
  id: string;
  location_id: string | null;
  slug: string;
  name: string;
  summary: string;
  duration_label: string;
  duration_minutes: number;
  distance_km: number;
  transport: string;
  itinerary: string;
  price_note: string;
  cover_image_url: string | null;
  video_url: string | null;
  audio_vi_url: string | null;
  audio_en_url: string | null;
  map_embed_url: string | null;
  sort_order: number;
  published: boolean;
};

export type TourImage = {
  id: string;
  tour_id: string;
  url: string;
  caption: string;
  sort_order: number;
};

export type VehiclePartner = {
  id: string;
  name: string;
  logo_url: string | null;
  vehicle_image_url: string | null;
  vehicle_types: string[];
  price_note: string;
  service_area: string;
  description: string;
  phone: string;
  zalo: string;
  facebook: string;
  email: string;
  website: string;
  price_list_url: string | null;
  license_url: string | null;
  sort_order: number;
  published: boolean;
};

export type Guide = {
  id: string;
  full_name: string;
  photo_url: string | null;
  languages: string[];
  experience: string;
  rating: number;
  price_note: string;
  service_area: string;
  bio: string;
  phone: string;
  email: string;
  zalo: string;
  certificate_url: string | null;
  sort_order: number;
  published: boolean;
};

export type TourEvent = {
  id: string;
  slug: string;
  title: string;
  description: string;
  cover_image_url: string | null;
  start_date: string | null;
  end_date: string | null;
  place: string;
  sort_order: number;
  published: boolean;
};

export type ServiceBooking = {
  id: string;
  service_type: string;
  partner_id: string | null;
  guide_id: string | null;
  tour_id: string | null;
  full_name: string;
  phone: string;
  email: string;
  travel_date: string | null;
  guests: number;
  pickup: string;
  note: string;
  status: string;
  created_at: string;
};

export const VEHICLE_TYPES = [
  "Xe 4 chỗ",
  "Xe 7 chỗ",
  "Xe 16 chỗ",
  "Xe 29 chỗ",
  "Xe 45 chỗ",
  "Xe Limousine",
  "Xe điện",
  "Xe đưa đón sân bay",
] as const;

export const VEHICLE_DISCLAIMER =
  "Dịch vụ thuê xe được cung cấp bởi các đối tác và cộng tác viên của MIỀN TOUR. MIỀN TOUR chỉ đóng vai trò giới thiệu và kết nối. Giá dịch vụ, hợp đồng và thanh toán sẽ được thực hiện trực tiếp giữa khách hàng và đơn vị cung cấp dịch vụ.";

export const GUIDE_DISCLAIMER =
  "Đây là dịch vụ hợp tác giữa MIỀN TOUR và các cộng tác viên. Khách hàng sẽ thanh toán thêm phí thuê hướng dẫn viên theo báo giá của cộng tác viên hoặc đơn vị cung cấp dịch vụ. MIỀN TOUR chỉ đóng vai trò kết nối.";

export async function fetchTours(
  locationId?: string,
  includeHidden = false,
): Promise<Tour[]> {
  let q = supabase.from("tours").select("*").order("sort_order");
  if (locationId) q = q.eq("location_id", locationId);
  if (!includeHidden) q = q.eq("published", true);
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as Tour[];
}

export async function fetchTour(slug: string): Promise<Tour | null> {
  const { data, error } = await supabase
    .from("tours")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw error;
  return (data as Tour) ?? null;
}

export async function fetchTourImages(tourId: string): Promise<TourImage[]> {
  const { data, error } = await supabase
    .from("tour_images")
    .select("*")
    .eq("tour_id", tourId)
    .order("sort_order");
  if (error) throw error;
  return (data ?? []) as TourImage[];
}

export async function fetchVehiclePartners(includeHidden = false): Promise<VehiclePartner[]> {
  let q = supabase.from("vehicle_partners").select("*").order("sort_order");
  if (!includeHidden) q = q.eq("published", true);
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as VehiclePartner[];
}

export async function fetchGuides(includeHidden = false): Promise<Guide[]> {
  let q = supabase.from("guides").select("*").order("sort_order");
  if (!includeHidden) q = q.eq("published", true);
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as Guide[];
}

export async function fetchEvents(includeHidden = false): Promise<TourEvent[]> {
  let q = supabase.from("events").select("*").order("sort_order");
  if (!includeHidden) q = q.eq("published", true);
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as TourEvent[];
}

export async function fetchBookings(): Promise<ServiceBooking[]> {
  const { data, error } = await supabase
    .from("service_bookings")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as ServiceBooking[];
}

export type BookingInput = {
  service_type: "vehicle" | "guide" | "tour";
  partner_id?: string | null;
  guide_id?: string | null;
  tour_id?: string | null;
  full_name: string;
  phone: string;
  email: string;
  travel_date: string | null;
  guests: number;
  pickup: string;
  note: string;
};

export async function createBooking(input: BookingInput): Promise<void> {
  const { error } = await supabase.from("service_bookings").insert(input);
  if (error) throw error;
}

export function zaloLink(value: string): string {
  const digits = value.replace(/[^\d]/g, "");
  if (value.startsWith("http")) return value;
  return digits ? `https://zalo.me/${digits}` : "#";
}

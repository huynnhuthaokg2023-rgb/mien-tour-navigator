import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

function client() {
  return createClient<Database>(
    process.env["SUPABASE_URL"]!,
    process.env["SUPABASE_PUBLISHABLE_KEY"]!,
    { auth: { storage: undefined, persistSession: false, autoRefreshToken: false } },
  );
}

const clean = (v: unknown) => String(v ?? "").replace(/\s+/g, " ").trim();

/** Gom toàn bộ dữ liệu công khai của website làm ngữ cảnh cho trợ lý AI. */
export async function buildKnowledgeBase(): Promise<string> {
  const db = client();
  const [regions, locations, tours, partners, guides, events] = await Promise.all([
    db.from("regions").select("name, tagline, description").eq("published", true),
    db
      .from("locations")
      .select(
        "name, slug, address, short_description, description, highlights, culture_history, activities, suggestions, visit_time, ticket_price, notes, contact",
      )
      .eq("published", true),
    db
      .from("tours")
      .select(
        "name, slug, summary, duration_label, distance_km, transport, itinerary, price_note",
      )
      .eq("published", true),
    db
      .from("vehicle_partners")
      .select("name, vehicle_types, price_note, service_area, description, phone, zalo")
      .eq("published", true),
    db
      .from("guides")
      .select("full_name, languages, experience, rating, price_note, service_area, bio, phone")
      .eq("published", true),
    db.from("events").select("title, description, place, start_date, end_date").eq("published", true),
  ]);

  const parts: string[] = [];

  parts.push(
    "## KHU VỰC\n" +
      ((regions.data ?? [])
        .map((r) => `- ${clean(r.name)}: ${clean(r.tagline)}. ${clean(r.description)}`)
        .join("\n") || "(chưa có dữ liệu)"),
  );

  parts.push(
    "## ĐỊA ĐIỂM\n" +
      ((locations.data ?? [])
        .map((l) =>
          [
            `- ${clean(l.name)} (/dia-diem/${l.slug})`,
            `  Địa chỉ: ${clean(l.address)}`,
            `  Mô tả: ${clean(l.short_description)} ${clean(l.description)}`,
            `  Điểm nổi bật: ${(l.highlights ?? []).join(", ")}`,
            `  Văn hoá - lịch sử: ${clean(l.culture_history)}`,
            `  Hoạt động: ${clean(l.activities)}`,
            `  Gợi ý: ${clean(l.suggestions)}`,
            `  Thời gian tham quan: ${clean(l.visit_time)} | Vé: ${clean(l.ticket_price)}`,
            `  Lưu ý: ${clean(l.notes)} | Liên hệ: ${clean(l.contact)}`,
          ].join("\n"),
        )
        .join("\n") || "(chưa có dữ liệu)"),
  );

  parts.push(
    "## TOUR\n" +
      ((tours.data ?? [])
        .map((t) =>
          [
            `- ${clean(t.name)} (/tour/${t.slug})`,
            `  Tóm tắt: ${clean(t.summary)}`,
            `  Thời lượng: ${clean(t.duration_label)} | Quãng đường: ${t.distance_km} km | Phương tiện: ${clean(t.transport)}`,
            `  Lịch trình: ${clean(t.itinerary)}`,
            `  Giá: ${clean(t.price_note)}`,
          ].join("\n"),
        )
        .join("\n") || "(chưa có dữ liệu)"),
  );

  parts.push(
    "## THUÊ XE (đối tác)\n" +
      ((partners.data ?? [])
        .map(
          (p) =>
            `- ${clean(p.name)} | Loại xe: ${(p.vehicle_types ?? []).join(", ")} | Khu vực: ${clean(p.service_area)} | Giá: ${clean(p.price_note)} | ĐT: ${clean(p.phone)} | Zalo: ${clean(p.zalo)} | ${clean(p.description)}`,
        )
        .join("\n") || "(chưa có dữ liệu)"),
  );

  parts.push(
    "## HƯỚNG DẪN VIÊN\n" +
      ((guides.data ?? [])
        .map(
          (g) =>
            `- ${clean(g.full_name)} | Ngoại ngữ: ${(g.languages ?? []).join(", ")} | Kinh nghiệm: ${clean(g.experience)} | Đánh giá: ${g.rating} | Giá: ${clean(g.price_note)} | Khu vực: ${clean(g.service_area)} | ${clean(g.bio)}`,
        )
        .join("\n") || "(chưa có dữ liệu)"),
  );

  parts.push(
    "## SỰ KIỆN\n" +
      ((events.data ?? [])
        .map(
          (e) =>
            `- ${clean(e.title)} | Nơi diễn ra: ${clean(e.place)} | Từ ${e.start_date ?? "?"} đến ${e.end_date ?? "?"} | ${clean(e.description)}`,
        )
        .join("\n") || "(chưa có dữ liệu)"),
  );

  return parts.join("\n\n").slice(0, 60000);
}

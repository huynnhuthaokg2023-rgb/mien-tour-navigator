import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, LogOut, Plus, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { claimFirstAdmin } from "@/lib/admin.functions";
import { useIsAdmin, useSession } from "@/hooks/use-admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { AdminCrud, type CrudField } from "@/components/admin-crud";
import { fetchBookings } from "@/lib/services";
import {
  fetchLocationImages,
  fetchLocations,
  fetchRegions,
  slugify,
  uploadMedia,
  type TourLocation,
} from "@/lib/mien-tour";

export const Route = createFileRoute("/quan-tri")({
  head: () => ({
    meta: [
      { title: "Quản trị nội dung | MIỀN TOUR" },
      {
        name: "description",
        content: "Khu vực đăng nhập và quản trị nội dung địa điểm của MIỀN TOUR.",
      },
      { property: "og:title", content: "Quản trị nội dung | MIỀN TOUR" },
      { property: "og:description", content: "Đăng nhập dành cho quản trị viên MIỀN TOUR." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const { user, loading } = useSession();
  const isAdmin = useIsAdmin(user?.id);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    if (user && isAdmin === false) {
      claimFirstAdmin()
        .then((r) => {
          if (r.granted) {
            toast.success("Bạn đã được cấp quyền quản trị viên đầu tiên.");
            window.location.reload();
          }
        })
        .catch(() => undefined);
    }
  }, [user, isAdmin]);

  if (loading) return <div className="p-10 text-center text-muted-foreground">Đang tải…</div>;
  if (!user) return <LoginCard />;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
        <div className="min-w-0">
          <h1 className="truncate text-2xl font-extrabold text-primary">
            MIỀN TOUR ADMIN DASHBOARD
          </h1>
          <p className="truncate text-xs text-muted-foreground">{user.email}</p>
        </div>
        <Button
          variant="outline"
          className="shrink-0 rounded-2xl"
          onClick={async () => {
            await supabase.auth.signOut();
            window.location.href = "/";
          }}
        >
          <LogOut className="size-4" /> Đăng xuất
        </Button>
      </header>

      {isAdmin === false && (
        <p className="mt-6 rounded-2xl bg-secondary p-4 text-sm text-secondary-foreground">
          Tài khoản này chưa có quyền quản trị. Vui lòng liên hệ quản trị viên hệ thống.
        </p>
      )}

      {isAdmin && editingId && (
        <LocationEditor id={editingId} onBack={() => setEditingId(null)} />
      )}

      {isAdmin && !editingId && (
        <>
          <nav className="mt-6 flex flex-wrap gap-2">
            {TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`rounded-2xl px-4 py-2 text-sm font-semibold ${
                  tab === t.key
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground"
                }`}
              >
                {t.label}
              </button>
            ))}
          </nav>

          {tab === "locations" && <AdminList onEdit={setEditingId} />}
          {tab === "tours" && <ToursAdmin />}
          {tab === "vehicles" && (
            <div className="mt-6">
              <AdminCrud
                table="vehicle_partners"
                title="ĐỐI TÁC THUÊ XE"
                titleKey="name"
                subtitleKey="service_area"
                defaults={{ name: "Đối tác mới", published: false }}
                fields={VEHICLE_FIELDS}
              />
            </div>
          )}
          {tab === "guides" && (
            <div className="mt-6">
              <AdminCrud
                table="guides"
                title="HƯỚNG DẪN VIÊN"
                titleKey="full_name"
                subtitleKey="service_area"
                defaults={{ full_name: "Hướng dẫn viên mới", published: false }}
                fields={GUIDE_FIELDS}
              />
            </div>
          )}
          {tab === "events" && (
            <div className="mt-6">
              <AdminCrud
                table="events"
                title="SỰ KIỆN"
                titleKey="title"
                subtitleKey="place"
                defaults={{
                  title: "Sự kiện mới",
                  slug: `su-kien-${Date.now().toString(36)}`,
                  published: false,
                }}
                fields={EVENT_FIELDS}
              />
            </div>
          )}
          {tab === "bookings" && <BookingsAdmin />}
        </>
      )}

      <Link to="/" className="mt-10 inline-block text-sm font-semibold text-primary">
        ← Về trang khách du lịch
      </Link>
    </div>
  );
}

const TABS = [
  { key: "locations", label: "Địa điểm" },
  { key: "tours", label: "Tour" },
  { key: "vehicles", label: "Thuê xe" },
  { key: "guides", label: "Hướng dẫn viên" },
  { key: "events", label: "Sự kiện" },
  { key: "bookings", label: "Đặt dịch vụ" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

const VEHICLE_FIELDS: CrudField[] = [
  { key: "name", label: "Tên đối tác", type: "text" },
  { key: "vehicle_types", label: "Loại xe", type: "list" },
  { key: "price_note", label: "Giá tham khảo", type: "text" },
  { key: "service_area", label: "Khu vực phục vụ", type: "text" },
  { key: "description", label: "Mô tả", type: "textarea" },
  { key: "phone", label: "Điện thoại", type: "text" },
  { key: "zalo", label: "Zalo", type: "text" },
  { key: "facebook", label: "Facebook", type: "text" },
  { key: "email", label: "Email", type: "text" },
  { key: "website", label: "Website", type: "text" },
  { key: "logo_url", label: "Logo", type: "file", accept: "image/*" },
  { key: "vehicle_image_url", label: "Ảnh xe", type: "file", accept: "image/*" },
  { key: "price_list_url", label: "Bảng giá (PDF/ảnh)", type: "file", accept: "image/*,application/pdf" },
  { key: "license_url", label: "Giấy phép kinh doanh", type: "file", accept: "image/*,application/pdf" },
  { key: "sort_order", label: "Thứ tự hiển thị", type: "number" },
  { key: "published", label: "Xuất bản", type: "switch" },
];

const GUIDE_FIELDS: CrudField[] = [
  { key: "full_name", label: "Họ tên", type: "text" },
  { key: "languages", label: "Ngoại ngữ", type: "list" },
  { key: "experience", label: "Kinh nghiệm", type: "text" },
  { key: "rating", label: "Đánh giá (0–5)", type: "number" },
  { key: "price_note", label: "Giá tham khảo", type: "text" },
  { key: "service_area", label: "Khu vực hoạt động", type: "text" },
  { key: "bio", label: "Giới thiệu", type: "textarea" },
  { key: "phone", label: "Điện thoại", type: "text" },
  { key: "email", label: "Email", type: "text" },
  { key: "zalo", label: "Zalo", type: "text" },
  { key: "photo_url", label: "Ảnh chân dung", type: "file", accept: "image/*" },
  { key: "certificate_url", label: "Thẻ / chứng chỉ HDV", type: "file", accept: "image/*,application/pdf" },
  { key: "sort_order", label: "Thứ tự hiển thị", type: "number" },
  { key: "published", label: "Xuất bản", type: "switch" },
];

const EVENT_FIELDS: CrudField[] = [
  { key: "title", label: "Tên sự kiện", type: "text" },
  { key: "slug", label: "Đường dẫn (slug)", type: "text" },
  { key: "description", label: "Mô tả", type: "textarea", rows: 5 },
  { key: "place", label: "Địa điểm tổ chức", type: "text" },
  { key: "start_date", label: "Ngày bắt đầu", type: "date" },
  { key: "end_date", label: "Ngày kết thúc", type: "date" },
  { key: "cover_image_url", label: "Ảnh bìa", type: "file", accept: "image/*" },
  { key: "sort_order", label: "Thứ tự hiển thị", type: "number" },
  { key: "published", label: "Xuất bản", type: "switch" },
];

function ToursAdmin() {
  const locations = useQuery({
    queryKey: ["admin-locations"],
    queryFn: () => fetchLocations(undefined, true),
  });

  const fields: CrudField[] = [
    { key: "name", label: "Tên tour", type: "text" },
    { key: "slug", label: "Đường dẫn (slug)", type: "text" },
    { key: "summary", label: "Mô tả ngắn", type: "textarea", rows: 3 },
    {
      key: "location_id",
      label: "Địa điểm liên quan",
      type: "select",
      options: (locations.data ?? []).map((l) => ({ value: l.id, label: l.name })),
    },
    { key: "duration_label", label: "Thời lượng (2h, nửa ngày, 1 ngày…)", type: "text" },
    { key: "duration_minutes", label: "Thời lượng (phút)", type: "number" },
    { key: "distance_km", label: "Khoảng cách (km)", type: "number" },
    { key: "transport", label: "Phương tiện", type: "text" },
    { key: "itinerary", label: "Lịch trình (mỗi dòng một chặng)", type: "textarea", rows: 8 },
    { key: "price_note", label: "Giá tham khảo", type: "text" },
    { key: "cover_image_url", label: "Ảnh bìa", type: "file", accept: "image/*" },
    { key: "video_url", label: "Video", type: "file", accept: "video/*" },
    { key: "audio_vi_url", label: "🇻🇳 Audio tiếng Việt", type: "file", accept: "audio/*" },
    { key: "audio_en_url", label: "🇬🇧 Audio English", type: "file", accept: "audio/*" },
    { key: "map_embed_url", label: "Google Maps embed URL", type: "text" },
    { key: "sort_order", label: "Thứ tự hiển thị", type: "number" },
    { key: "published", label: "Xuất bản", type: "switch" },
  ];

  return (
    <div className="mt-6">
      <AdminCrud
        table="tours"
        title="TOUR GỢI Ý"
        titleKey="name"
        subtitleKey="duration_label"
        defaults={{
          name: "Tour mới",
          slug: `tour-${Date.now().toString(36)}`,
          published: false,
        }}
        fields={fields}
      />
    </div>
  );
}

const BOOKING_LABELS: Record<string, string> = {
  vehicle: "Thuê xe",
  guide: "Hướng dẫn viên",
  tour: "Tour",
};

function BookingsAdmin() {
  const qc = useQueryClient();
  const bookings = useQuery({ queryKey: ["admin-bookings"], queryFn: fetchBookings });

  const setStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("service_bookings").update({ status }).eq("id", id);
    if (error) return toast.error(error.message);
    await qc.invalidateQueries();
  };

  const remove = async (id: string) => {
    if (!confirm("Xoá yêu cầu này?")) return;
    const { error } = await supabase.from("service_bookings").delete().eq("id", id);
    if (error) return toast.error(error.message);
    await qc.invalidateQueries();
  };

  return (
    <section className="mt-6 rounded-3xl bg-card p-4 shadow-elevated">
      <h2 className="text-lg font-extrabold text-primary">YÊU CẦU ĐẶT DỊCH VỤ</h2>
      {bookings.isLoading && <p className="mt-2 text-sm text-muted-foreground">Đang tải…</p>}
      {!bookings.isLoading && (bookings.data ?? []).length === 0 && (
        <p className="mt-2 text-sm text-muted-foreground">Chưa có yêu cầu nào.</p>
      )}
      <ul className="mt-3 space-y-3">
        {(bookings.data ?? []).map((b) => (
          <li key={b.id} className="rounded-2xl bg-secondary/60 p-4">
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-2">
              <div className="min-w-0">
                <p className="text-sm font-bold">
                  {b.full_name} · {b.phone}
                </p>
                <p className="text-xs text-muted-foreground">
                  {BOOKING_LABELS[b.service_type] ?? b.service_type} ·{" "}
                  {new Date(b.created_at).toLocaleString("vi-VN")}
                </p>
              </div>
              <button
                onClick={() => remove(b.id)}
                aria-label="Xoá"
                className="grid size-9 shrink-0 place-items-center rounded-xl bg-card text-destructive"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
            <dl className="mt-2 space-y-1 text-xs text-foreground/85">
              {b.email && <div>Email: {b.email}</div>}
              {b.travel_date && <div>Ngày đi: {b.travel_date}</div>}
              <div>Số khách: {b.guests}</div>
              {b.pickup && <div>Điểm đón: {b.pickup}</div>}
              {b.note && <div>Ghi chú: {b.note}</div>}
            </dl>
            <div className="mt-3 flex flex-wrap gap-2">
              {["new", "contacted", "done", "cancelled"].map((s) => (
                <button
                  key={s}
                  onClick={() => setStatus(b.id, s)}
                  className={`rounded-xl px-3 py-1.5 text-xs font-semibold ${
                    b.status === s
                      ? "bg-primary text-primary-foreground"
                      : "bg-card text-foreground/70"
                  }`}
                >
                  {s === "new"
                    ? "Mới"
                    : s === "contacted"
                      ? "Đã liên hệ"
                      : s === "done"
                        ? "Hoàn tất"
                        : "Huỷ"}
                </button>
              ))}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}


function LoginCard() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const signIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) toast.error(error.message);
  };

  const signUp = async () => {
    setBusy(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/quan-tri` },
    });
    setBusy(false);
    if (error) toast.error(error.message);
    else toast.success("Đã tạo tài khoản. Bạn có thể đăng nhập ngay.");
  };

  return (
    <div className="mx-auto max-w-md px-4 py-14">
      <h1 className="text-2xl font-extrabold text-primary">Đăng nhập quản trị</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Khu vực dành riêng cho quản trị viên MIỀN TOUR.
      </p>
      <form onSubmit={signIn} className="mt-6 space-y-3 rounded-3xl bg-card p-5 shadow-elevated">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 h-12 rounded-2xl"
          />
        </div>
        <div>
          <Label htmlFor="password">Mật khẩu</Label>
          <Input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 h-12 rounded-2xl"
          />
        </div>
        <Button type="submit" disabled={busy} className="h-12 w-full rounded-2xl font-bold">
          ĐĂNG NHẬP
        </Button>
        <Button
          type="button"
          variant="ghost"
          disabled={busy}
          onClick={signUp}
          className="w-full rounded-2xl text-sm"
        >
          Tạo tài khoản quản trị mới
        </Button>
        <Button
          type="button"
          variant="outline"
          className="h-12 w-full rounded-2xl font-semibold"
          onClick={async () => {
            const result = await lovable.auth.signInWithOAuth("google", {
              redirect_uri: `${window.location.origin}/quan-tri`,
            });
            if (result.error) toast.error("Không đăng nhập được bằng Google.");
          }}
        >
          Đăng nhập bằng Google
        </Button>
      </form>
    </div>
  );
}

function AdminList({ onEdit }: { onEdit: (id: string) => void }) {
  const qc = useQueryClient();
  const regions = useQuery({
    queryKey: ["admin-regions"],
    queryFn: () => fetchRegions(true),
  });
  const locations = useQuery({
    queryKey: ["admin-locations"],
    queryFn: () => fetchLocations(undefined, true),
  });

  const addLocation = async (regionId: string) => {
    const name = "Địa điểm mới";
    const { data, error } = await supabase
      .from("locations")
      .insert({
        region_id: regionId,
        name,
        slug: `${slugify(name)}-${Date.now().toString(36)}`,
        published: false,
      })
      .select("id")
      .single();
    if (error) return toast.error(error.message);
    await qc.invalidateQueries();
    onEdit(data.id);
  };

  const removeLocation = async (id: string) => {
    if (!confirm("Xoá địa điểm này?")) return;
    const { error } = await supabase.from("locations").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Đã xoá địa điểm.");
    await qc.invalidateQueries();
  };

  return (
    <div className="mt-6 space-y-6">
      {(regions.data ?? []).map((region) => (
        <section key={region.id} className="rounded-3xl bg-card p-4 shadow-elevated">
          <h2 className="text-lg font-extrabold text-primary">{region.name}</h2>
          <ul className="mt-3 space-y-2">
            {(locations.data ?? [])
              .filter((l) => l.region_id === region.id)
              .map((l) => (
                <li
                  key={l.id}
                  className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 rounded-2xl bg-secondary/60 px-4 py-3"
                >
                  <button onClick={() => onEdit(l.id)} className="min-w-0 text-left">
                    <p className="truncate text-sm font-semibold">{l.name}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {l.published ? "Đã xuất bản" : "Đang ẩn"} · thứ tự {l.sort_order}
                    </p>
                  </button>
                  <button
                    onClick={() => removeLocation(l.id)}
                    aria-label="Xoá"
                    className="grid size-9 shrink-0 place-items-center rounded-xl bg-card text-destructive"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </li>
              ))}
          </ul>
          <Button
            variant="outline"
            className="mt-3 w-full rounded-2xl font-semibold"
            onClick={() => addLocation(region.id)}
          >
            <Plus className="size-4" /> Thêm địa điểm mới
          </Button>
        </section>
      ))}
    </div>
  );
}

const TEXT_FIELDS = [
  ["name", "Tên địa điểm"],
  ["address", "Địa chỉ"],
  ["visit_time", "Thời gian tham quan"],
  ["ticket_price", "Giá vé"],
  ["contact", "Thông tin liên hệ"],
  ["map_embed_url", "Google Maps embed URL (tuỳ chọn)"],
] as const;

const AREA_FIELDS = [
  ["short_description", "Mô tả ngắn"],
  ["description", "Giới thiệu chi tiết"],
  ["culture_history", "Thông tin văn hoá / lịch sử"],
  ["activities", "Hoạt động nên thử"],
  ["suggestions", "Gợi ý tham quan"],
  ["notes", "Lưu ý cho du khách"],
] as const;

function LocationEditor({ id, onBack }: { id: string; onBack: () => void }) {
  const qc = useQueryClient();
  const [form, setForm] = useState<TourLocation | null>(null);
  const [busy, setBusy] = useState(false);

  const location = useQuery({
    queryKey: ["admin-location", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("locations").select("*").eq("id", id).single();
      if (error) throw error;
      return data as TourLocation;
    },
  });
  const images = useQuery({
    queryKey: ["admin-images", id],
    queryFn: () => fetchLocationImages(id),
  });

  useEffect(() => {
    if (location.data) setForm(location.data);
  }, [location.data]);

  if (!form) return <p className="mt-6 text-sm text-muted-foreground">Đang tải…</p>;

  const set = (patch: Partial<TourLocation>) => setForm({ ...form, ...patch });

  const save = async () => {
    setBusy(true);
    const { id: _id, ...payload } = form;
    const { error } = await supabase.from("locations").update(payload).eq("id", id);
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Đã lưu. Website công khai đã cập nhật.");
    await qc.invalidateQueries();
  };

  /** Ghi ngay thay đổi media vào CSDL để tệp gắn đúng với địa điểm. */
  const persistMedia = async (patch: Partial<TourLocation>) => {
    set(patch);
    const { error } = await supabase.from("locations").update(patch).eq("id", id);
    if (error) throw error;
    await qc.invalidateQueries();
  };

  const uploadMediaField = async (
    file: File,
    folder: string,
    field: "cover_image_url" | "video_url" | "audio_vi_url" | "audio_en_url",
  ) => {
    setBusy(true);
    try {
      const url = await uploadMedia(folder, file);
      await persistMedia({ [field]: url } as Partial<TourLocation>);
      toast.success("Đã tải tệp lên và lưu vào địa điểm.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Tải tệp thất bại");
    } finally {
      setBusy(false);
    }
  };

  const clearMediaField = async (
    field: "cover_image_url" | "video_url" | "audio_vi_url" | "audio_en_url",
  ) => {
    setBusy(true);
    try {
      await persistMedia({ [field]: null } as Partial<TourLocation>);
      toast.success("Đã xoá tệp.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Xoá tệp thất bại");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mt-6 space-y-4">
      <Button variant="ghost" onClick={onBack} className="rounded-2xl">
        <ArrowLeft className="size-4" /> Danh sách địa điểm
      </Button>

      <div className="space-y-4 rounded-3xl bg-card p-5 shadow-elevated">
        {TEXT_FIELDS.map(([key, label]) => (
          <div key={key}>
            <Label htmlFor={key}>{label}</Label>
            <Input
              id={key}
              value={(form[key] as string) ?? ""}
              onChange={(e) => set({ [key]: e.target.value } as Partial<TourLocation>)}
              className="mt-1 h-12 rounded-2xl"
            />
          </div>
        ))}

        {AREA_FIELDS.map(([key, label]) => (
          <div key={key}>
            <Label htmlFor={key}>{label}</Label>
            <Textarea
              id={key}
              rows={key === "description" ? 6 : 3}
              value={form[key] ?? ""}
              onChange={(e) => set({ [key]: e.target.value } as Partial<TourLocation>)}
              className="mt-1 rounded-2xl"
            />
          </div>
        ))}

        <div>
          <Label htmlFor="highlights">Điểm nổi bật (mỗi dòng một ý)</Label>
          <Textarea
            id="highlights"
            rows={5}
            value={form.highlights.join("\n")}
            onChange={(e) =>
              set({ highlights: e.target.value.split("\n").filter((s) => s.trim()) })
            }
            className="mt-1 rounded-2xl"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="lat">Vĩ độ</Label>
            <Input
              id="lat"
              value={form.latitude ?? ""}
              onChange={(e) => set({ latitude: e.target.value ? Number(e.target.value) : null })}
              className="mt-1 h-12 rounded-2xl"
            />
          </div>
          <div>
            <Label htmlFor="lng">Kinh độ</Label>
            <Input
              id="lng"
              value={form.longitude ?? ""}
              onChange={(e) => set({ longitude: e.target.value ? Number(e.target.value) : null })}
              className="mt-1 h-12 rounded-2xl"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="order">Thứ tự hiển thị</Label>
            <Input
              id="order"
              type="number"
              value={form.sort_order}
              onChange={(e) => set({ sort_order: Number(e.target.value) })}
              className="mt-1 h-12 rounded-2xl"
            />
          </div>
          <div className="flex items-end gap-3 pb-3">
            <Switch
              id="published"
              checked={form.published}
              onCheckedChange={(v) => set({ published: v })}
            />
            <Label htmlFor="published">Xuất bản</Label>
          </div>
        </div>

        <FileField
          label="Ảnh đại diện"
          accept="image/*"
          current={form.cover_image_url}
          busy={busy}
          onFile={(f) => uploadMediaField(f, `covers/${id}`, "cover_image_url")}
          onClear={() => clearMediaField("cover_image_url")}
        />

        <Button onClick={save} disabled={busy} className="h-13 w-full rounded-2xl text-base font-bold">
          LƯU THAY ĐỔI
        </Button>
      </div>

      <section className="space-y-3 rounded-3xl bg-card p-5 shadow-elevated">
        <h3 className="font-extrabold text-primary">🎥 VIDEO MINH HOẠ</h3>
        <p className="text-xs text-muted-foreground">
          Tải trực tiếp tệp video từ máy tính (MP4/WebM/MOV). Không cần nhập đường dẫn.
        </p>
        {form.video_url && (
          <video
            src={form.video_url}
            controls
            preload="metadata"
            className="w-full rounded-2xl"
          />
        )}
        <FileField
          label={form.video_url ? "Thay video khác" : "Chọn tệp video"}
          accept="video/mp4,video/webm,video/quicktime,video/*"
          current={form.video_url}
          busy={busy}
          onFile={(f) => uploadMediaField(f, `video/${id}`, "video_url")}
          onClear={() => clearMediaField("video_url")}
        />
      </section>

      <section className="space-y-3 rounded-3xl bg-card p-5 shadow-elevated">
        <h3 className="font-extrabold text-primary">🇻🇳 AUDIO GUIDE – TIẾNG VIỆT</h3>
        {form.audio_vi_url && (
          <audio src={form.audio_vi_url} controls preload="metadata" className="w-full" />
        )}
        <FileField
          label={form.audio_vi_url ? "Thay tệp audio tiếng Việt" : "Chọn tệp MP3/WAV"}
          accept="audio/mpeg,audio/wav,audio/*"
          current={form.audio_vi_url}
          busy={busy}
          onFile={(f) => uploadMediaField(f, `audio-vi/${id}`, "audio_vi_url")}
          onClear={() => clearMediaField("audio_vi_url")}
        />
      </section>

      <section className="space-y-3 rounded-3xl bg-card p-5 shadow-elevated">
        <h3 className="font-extrabold text-primary">🇬🇧 AUDIO GUIDE – ENGLISH</h3>
        {form.audio_en_url && (
          <audio src={form.audio_en_url} controls preload="metadata" className="w-full" />
        )}
        <FileField
          label={form.audio_en_url ? "Thay tệp audio tiếng Anh" : "Chọn tệp MP3/WAV"}
          accept="audio/mpeg,audio/wav,audio/*"
          current={form.audio_en_url}
          busy={busy}
          onFile={(f) => uploadMediaField(f, `audio-en/${id}`, "audio_en_url")}
          onClear={() => clearMediaField("audio_en_url")}
        />
      </section>

      <div className="space-y-3 rounded-3xl bg-card p-5 shadow-elevated">
        <h3 className="font-extrabold text-primary">Thư viện hình ảnh</h3>
        <div className="grid grid-cols-3 gap-2">
          {(images.data ?? []).map((img) => (
            <div key={img.id} className="relative">
              <img src={img.url} alt={img.caption} className="aspect-square w-full rounded-xl object-cover" />
              <button
                aria-label="Xoá ảnh"
                onClick={async () => {
                  await supabase.from("location_images").delete().eq("id", img.id);
                  await qc.invalidateQueries();
                }}
                className="absolute right-1 top-1 grid size-7 place-items-center rounded-lg bg-card text-destructive"
              >
                <Trash2 className="size-3.5" />
              </button>
            </div>
          ))}
        </div>
        <Input
          type="file"
          accept="image/*"
          multiple
          disabled={busy}
          onChange={async (e) => {
            const files = Array.from(e.target.files ?? []);
            setBusy(true);
            try {
              for (const [i, file] of files.entries()) {
                const url = await uploadMedia(`gallery/${id}`, file);
                await supabase
                  .from("location_images")
                  .insert({ location_id: id, url, sort_order: (images.data?.length ?? 0) + i });
              }
              await qc.invalidateQueries();
              toast.success("Đã thêm ảnh vào thư viện.");
            } catch (err) {
              toast.error(err instanceof Error ? err.message : "Tải ảnh thất bại");
            } finally {
              setBusy(false);
            }
          }}
          className="rounded-2xl"
        />
      </div>
    </div>
  );
}

function FileField({
  label,
  accept,
  current,
  busy,
  onFile,
  onClear,
}: {
  label: string;
  accept: string;
  current: string | null;
  busy?: boolean;
  onFile: (file: File) => void;
  onClear?: () => void;
}) {
  return (
    <div>
      <Label>{label}</Label>
      <Input
        type="file"
        accept={accept}
        disabled={busy}
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onFile(f);
          e.target.value = "";
        }}
        className="mt-1 rounded-2xl"
      />
      {current && (
        <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
          <span className="truncate">Đã có tệp trong hệ thống lưu trữ</span>
          {onClear && (
            <button
              type="button"
              disabled={busy}
              onClick={onClear}
              className="font-semibold text-destructive"
            >
              Xoá tệp
            </button>
          )}
        </div>
      )}
    </div>
  );
}


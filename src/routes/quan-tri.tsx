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

      {isAdmin && !editingId && <AdminList onEdit={setEditingId} />}
      {isAdmin && editingId && (
        <LocationEditor id={editingId} onBack={() => setEditingId(null)} />
      )}

      <Link to="/" className="mt-10 inline-block text-sm font-semibold text-primary">
        ← Về trang khách du lịch
      </Link>
    </div>
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
          onFile={(f) => upload(f, `covers/${id}`, (url) => set({ cover_image_url: url }))}
          onClear={() => set({ cover_image_url: null })}
        />
        <FileField
          label="Audio Guide 🇻🇳 Tiếng Việt (MP3/WAV)"
          accept="audio/mpeg,audio/wav,audio/*"
          current={form.audio_vi_url}
          onFile={(f) => upload(f, `audio/${id}`, (url) => set({ audio_vi_url: url }))}
          onClear={() => set({ audio_vi_url: null })}
        />
        <FileField
          label="Audio Guide 🇬🇧 English (MP3/WAV)"
          accept="audio/mpeg,audio/wav,audio/*"
          current={form.audio_en_url}
          onFile={(f) => upload(f, `audio/${id}`, (url) => set({ audio_en_url: url }))}
          onClear={() => set({ audio_en_url: null })}
        />
        <FileField
          label="Tải video lên (tuỳ chọn)"
          accept="video/*"
          current={null}
          onFile={(f) => upload(f, `video/${id}`, (url) => set({ video_url: url }))}
        />

        <Button onClick={save} disabled={busy} className="h-13 w-full rounded-2xl text-base font-bold">
          LƯU THAY ĐỔI
        </Button>
      </div>

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
  onFile,
  onClear,
}: {
  label: string;
  accept: string;
  current: string | null;
  onFile: (file: File) => void;
  onClear?: () => void;
}) {
  return (
    <div>
      <Label>{label}</Label>
      <Input
        type="file"
        accept={accept}
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onFile(f);
        }}
        className="mt-1 rounded-2xl"
      />
      {current && (
        <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
          <span className="truncate">Đã có tệp</span>
          {onClear && (
            <button onClick={onClear} className="font-semibold text-destructive">
              Xoá
            </button>
          )}
        </div>
      )}
    </div>
  );
}

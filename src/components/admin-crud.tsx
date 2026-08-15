import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { uploadMedia } from "@/lib/mien-tour";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

type Row = Record<string, unknown> & { id: string };

export type CrudField = {
  key: string;
  label: string;
  type: "text" | "date" | "number" | "textarea" | "switch" | "list" | "file" | "select" | "gallery";
  rows?: number;
  accept?: string;
  options?: { value: string; label: string }[];
  /** Bảng ảnh con dùng cho type = "gallery" */
  childTable?: GalleryTable;
  /** Cột khoá ngoại trong bảng ảnh con */
  childKey?: string;
};

export type GalleryTable = "vehicle_partner_images" | "guide_images";

export type CrudTable = "tours" | "vehicle_partners" | "guides" | "events";


export function AdminCrud({
  table,
  title,
  fields,
  titleKey,
  subtitleKey,
  defaults,
}: {
  table: CrudTable;
  title: string;
  fields: CrudField[];
  titleKey: string;
  subtitleKey?: string;
  defaults: Record<string, unknown>;
}) {
  const qc = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);

  const list = useQuery({
    queryKey: ["admin-crud", table],
    queryFn: async () => {
      const { data, error } = await supabase.from(table).select("*").order("sort_order");
      if (error) throw error;
      return (data ?? []) as unknown as Row[];
    },
  });

  const add = async () => {
    const { data, error } = await supabase
      .from(table)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .insert(defaults as any)
      .select("id")
      .single();
    if (error) return toast.error(error.message);
    await qc.invalidateQueries();
    setEditingId((data as { id: string }).id);
  };

  const remove = async (id: string) => {
    if (!confirm("Xoá mục này?")) return;
    const { error } = await supabase.from(table).delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Đã xoá.");
    await qc.invalidateQueries();
  };

  const editing = (list.data ?? []).find((r) => r.id === editingId);

  if (editingId && editing)
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => setEditingId(null)} className="rounded-2xl">
          <ArrowLeft className="size-4" /> {title}
        </Button>
        <CrudEditor table={table} row={editing} fields={fields} />
      </div>
    );

  return (
    <section className="rounded-3xl bg-card p-4 shadow-elevated">
      <h2 className="text-lg font-extrabold text-primary">{title}</h2>
      {list.isLoading && <p className="mt-2 text-sm text-muted-foreground">Đang tải…</p>}
      <ul className="mt-3 space-y-2">
        {(list.data ?? []).map((r) => (
          <li
            key={r.id}
            className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 rounded-2xl bg-secondary/60 px-4 py-3"
          >
            <button onClick={() => setEditingId(r.id)} className="min-w-0 text-left">
              <p className="truncate text-sm font-semibold">{String(r[titleKey] ?? "—")}</p>
              <p className="truncate text-xs text-muted-foreground">
                {r["published"] ? "Đã xuất bản" : "Đang ẩn"}
                {subtitleKey && r[subtitleKey] ? ` · ${String(r[subtitleKey])}` : ""}
              </p>
            </button>
            <button
              onClick={() => remove(r.id)}
              aria-label="Xoá"
              className="grid size-9 shrink-0 place-items-center rounded-xl bg-card text-destructive"
            >
              <Trash2 className="size-4" />
            </button>
          </li>
        ))}
      </ul>
      {!list.isLoading && (list.data ?? []).length === 0 && (
        <p className="mt-3 text-sm text-muted-foreground">Chưa có dữ liệu.</p>
      )}
      <Button variant="outline" className="mt-3 w-full rounded-2xl font-semibold" onClick={add}>
        <Plus className="size-4" /> Thêm mới
      </Button>
    </section>
  );
}

function CrudEditor({
  table,
  row,
  fields,
}: {
  table: CrudTable;
  row: Row;
  fields: CrudField[];
}) {
  const qc = useQueryClient();
  const [form, setForm] = useState<Row>(row);
  const [busy, setBusy] = useState(false);

  const set = (patch: Record<string, unknown>) => setForm({ ...form, ...patch });

  const persist = async (patch: Record<string, unknown>) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await supabase.from(table).update(patch as any).eq("id", row.id);
    if (error) throw error;
    await qc.invalidateQueries();
  };

  const save = async () => {
    setBusy(true);
    try {
      const { id: _id, created_at: _c, updated_at: _u, ...payload } = form;
      await persist(payload);
      toast.success("Đã lưu thay đổi.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Lưu thất bại");
    } finally {
      setBusy(false);
    }
  };

  const upload = async (file: File, key: string) => {
    setBusy(true);
    try {
      const url = await uploadMedia(`${table}/${row.id}/${key}`, file);
      set({ [key]: url });
      await persist({ [key]: url });
      toast.success("Đã tải tệp lên.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Tải tệp thất bại");
    } finally {
      setBusy(false);
    }
  };

  const clearFile = async (key: string) => {
    setBusy(true);
    try {
      set({ [key]: null });
      await persist({ [key]: null });
      toast.success("Đã xoá tệp.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Xoá tệp thất bại");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4 rounded-3xl bg-card p-5 shadow-elevated">
      {fields.map((f) => {
        const value = form[f.key];
        if (f.type === "switch")
          return (
            <div key={f.key} className="flex items-center gap-3">
              <Switch
                id={f.key}
                checked={Boolean(value)}
                onCheckedChange={(v) => set({ [f.key]: v })}
              />
              <Label htmlFor={f.key}>{f.label}</Label>
            </div>
          );
        if (f.type === "textarea")
          return (
            <div key={f.key}>
              <Label htmlFor={f.key}>{f.label}</Label>
              <Textarea
                id={f.key}
                rows={f.rows ?? 4}
                value={(value as string) ?? ""}
                onChange={(e) => set({ [f.key]: e.target.value })}
                className="mt-1 rounded-2xl"
              />
            </div>
          );
        if (f.type === "list")
          return (
            <div key={f.key}>
              <Label htmlFor={f.key}>{f.label} (mỗi dòng một mục)</Label>
              <Textarea
                id={f.key}
                rows={f.rows ?? 4}
                value={((value as string[]) ?? []).join("\n")}
                onChange={(e) =>
                  set({ [f.key]: e.target.value.split("\n").filter((s) => s.trim()) })
                }
                className="mt-1 rounded-2xl"
              />
            </div>
          );
        if (f.type === "select")
          return (
            <div key={f.key}>
              <Label htmlFor={f.key}>{f.label}</Label>
              <select
                id={f.key}
                value={(value as string) ?? ""}
                onChange={(e) => set({ [f.key]: e.target.value || null })}
                className="mt-1 h-12 w-full rounded-2xl border border-input bg-background px-3 text-sm"
              >
                <option value="">— Không chọn —</option>
                {(f.options ?? []).map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          );
        if (f.type === "gallery")
          return (
            <GalleryEditor
              key={f.key}
              label={f.label}
              table={f.childTable ?? "vehicle_partner_images"}
              fkKey={f.childKey ?? "partner_id"}
              ownerId={row.id}
              storageFolder={`${table}/${row.id}/gallery`}
            />
          );
        if (f.type === "file")

          return (
            <div key={f.key}>
              <Label>{f.label}</Label>
              <Input
                type="file"
                accept={f.accept ?? "image/*"}
                disabled={busy}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) upload(file, f.key);
                  e.target.value = "";
                }}
                className="mt-1 rounded-2xl"
              />
              {value ? (
                <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="truncate">Đã có tệp trong hệ thống lưu trữ</span>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => clearFile(f.key)}
                    className="font-semibold text-destructive"
                  >
                    Xoá tệp
                  </button>
                </div>
              ) : null}
            </div>
          );
        return (
          <div key={f.key}>
            <Label htmlFor={f.key}>{f.label}</Label>
            <Input
              id={f.key}
              type={f.type === "number" ? "number" : f.type === "date" ? "date" : "text"}
              value={
                f.type === "date"
                  ? ((value as string) ?? "")
                  : ((value as string | number | null) ?? "") === null
                    ? ""
                    : String(value ?? "")
              }
              onChange={(e) =>
                set({
                  [f.key]:
                    f.type === "number"
                      ? Number(e.target.value)
                      : f.type === "date"
                        ? e.target.value || null
                        : e.target.value,
                })
              }
              className="mt-1 h-12 rounded-2xl"
            />
          </div>
        );
      })}

      <Button onClick={save} disabled={busy} className="h-13 w-full rounded-2xl text-base font-bold">
        LƯU THAY ĐỔI
      </Button>
    </div>
  );
}

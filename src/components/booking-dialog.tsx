import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { createBooking, type BookingInput } from "@/lib/services";

export type BookingTarget = {
  service_type: BookingInput["service_type"];
  partner_id?: string | null;
  guide_id?: string | null;
  tour_id?: string | null;
  title: string;
};

export function BookingDialog({
  target,
  onOpenChange,
}: {
  target: BookingTarget | null;
  onOpenChange: (open: boolean) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    full_name: "",
    phone: "",
    email: "",
    travel_date: "",
    guests: 1,
    pickup: "",
    note: "",
  });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!target) return;
    if (form.full_name.trim().length < 2) return toast.error("Vui lòng nhập họ tên.");
    if (form.phone.replace(/\D/g, "").length < 8)
      return toast.error("Vui lòng nhập số điện thoại hợp lệ.");
    setBusy(true);
    try {
      await createBooking({
        service_type: target.service_type,
        partner_id: target.partner_id ?? null,
        guide_id: target.guide_id ?? null,
        tour_id: target.tour_id ?? null,
        full_name: form.full_name.trim().slice(0, 120),
        phone: form.phone.trim().slice(0, 30),
        email: form.email.trim().slice(0, 160),
        travel_date: form.travel_date || null,
        guests: Math.max(1, Math.min(200, Number(form.guests) || 1)),
        pickup: form.pickup.trim().slice(0, 300),
        note: form.note.trim().slice(0, 1000),
      });
      toast.success("Đã gửi yêu cầu. MIỀN TOUR sẽ liên hệ với bạn sớm nhất.");
      setForm({
        full_name: "",
        phone: "",
        email: "",
        travel_date: "",
        guests: 1,
        pickup: "",
        note: "",
      });
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gửi yêu cầu thất bại");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={Boolean(target)} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto rounded-3xl sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-primary">GỬI YÊU CẦU DỊCH VỤ</DialogTitle>
          <DialogDescription>{target?.title}</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-3">
          <div>
            <Label htmlFor="bk-name">Họ tên</Label>
            <Input
              id="bk-name"
              required
              maxLength={120}
              value={form.full_name}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
              className="mt-1 h-12 rounded-2xl"
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label htmlFor="bk-phone">Số điện thoại</Label>
              <Input
                id="bk-phone"
                required
                maxLength={30}
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="mt-1 h-12 rounded-2xl"
              />
            </div>
            <div>
              <Label htmlFor="bk-email">Email</Label>
              <Input
                id="bk-email"
                type="email"
                maxLength={160}
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="mt-1 h-12 rounded-2xl"
              />
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label htmlFor="bk-date">Ngày đi</Label>
              <Input
                id="bk-date"
                type="date"
                value={form.travel_date}
                onChange={(e) => setForm({ ...form, travel_date: e.target.value })}
                className="mt-1 h-12 rounded-2xl"
              />
            </div>
            <div>
              <Label htmlFor="bk-guests">Số khách</Label>
              <Input
                id="bk-guests"
                type="number"
                min={1}
                max={200}
                value={form.guests}
                onChange={(e) => setForm({ ...form, guests: Number(e.target.value) })}
                className="mt-1 h-12 rounded-2xl"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="bk-pickup">Điểm đón</Label>
            <Input
              id="bk-pickup"
              maxLength={300}
              value={form.pickup}
              onChange={(e) => setForm({ ...form, pickup: e.target.value })}
              className="mt-1 h-12 rounded-2xl"
            />
          </div>
          <div>
            <Label htmlFor="bk-note">Ghi chú</Label>
            <Textarea
              id="bk-note"
              rows={3}
              maxLength={1000}
              value={form.note}
              onChange={(e) => setForm({ ...form, note: e.target.value })}
              className="mt-1 rounded-2xl"
            />
          </div>
          <Button
            type="submit"
            disabled={busy}
            className="h-13 w-full rounded-2xl text-base font-bold"
          >
            GỬI YÊU CẦU
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

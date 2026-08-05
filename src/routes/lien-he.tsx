import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BookingDialog, type BookingTarget } from "@/components/booking-dialog";

export const Route = createFileRoute("/lien-he")({
  head: () => ({
    meta: [
      { title: "Liên hệ MIỀN TOUR" },
      {
        name: "description",
        content:
          "Liên hệ MIỀN TOUR để được tư vấn hành trình, đặt xe du lịch hoặc thuê hướng dẫn viên tại địa phương.",
      },
      { property: "og:title", content: "Liên hệ MIỀN TOUR" },
      {
        property: "og:description",
        content: "Gửi yêu cầu tư vấn, đặt xe hoặc thuê hướng dẫn viên cùng MIỀN TOUR.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const [booking, setBooking] = useState<BookingTarget | null>(null);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="flex items-center gap-2 text-3xl font-extrabold text-primary">
        <Phone className="size-7" aria-hidden /> LIÊN HỆ
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        MIỀN TOUR luôn sẵn sàng hỗ trợ bạn lên kế hoạch cho hành trình khám phá địa phương.
      </p>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <a
          href="tel:+84900000000"
          className="rounded-3xl bg-card p-5 shadow-elevated transition-shadow hover:shadow-floating"
        >
          <p className="flex items-center gap-2 text-sm font-bold text-primary">
            <Phone className="size-4" aria-hidden /> Điện thoại
          </p>
          <p className="mt-1 text-sm text-foreground/85">0900 000 000</p>
        </a>
        <a
          href="mailto:lienhe@mientour.vn"
          className="rounded-3xl bg-card p-5 shadow-elevated transition-shadow hover:shadow-floating"
        >
          <p className="flex items-center gap-2 text-sm font-bold text-primary">
            <Mail className="size-4" aria-hidden /> Email
          </p>
          <p className="mt-1 text-sm text-foreground/85">lienhe@mientour.vn</p>
        </a>
        <a
          href="https://zalo.me/0900000000"
          target="_blank"
          rel="noreferrer"
          className="rounded-3xl bg-card p-5 shadow-elevated transition-shadow hover:shadow-floating"
        >
          <p className="flex items-center gap-2 text-sm font-bold text-primary">
            <MessageCircle className="size-4" aria-hidden /> Zalo
          </p>
          <p className="mt-1 text-sm text-foreground/85">Chat trực tiếp với MIỀN TOUR</p>
        </a>
        <div className="rounded-3xl bg-card p-5 shadow-elevated">
          <p className="flex items-center gap-2 text-sm font-bold text-primary">
            <MapPin className="size-4" aria-hidden /> Khu vực hoạt động
          </p>
          <p className="mt-1 text-sm text-foreground/85">Rạch Giá – Kiên Giang</p>
        </div>
      </div>

      <Button
        className="mt-6 h-13 w-full rounded-2xl text-base font-bold"
        onClick={() =>
          setBooking({ service_type: "tour", title: "Yêu cầu tư vấn hành trình" })
        }
      >
        📩 GỬI YÊU CẦU TƯ VẤN
      </Button>

      <BookingDialog target={booking} onOpenChange={(o) => !o && setBooking(null)} />
    </div>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Mail, MessageCircle, Phone, Star, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BookingDialog, type BookingTarget } from "@/components/booking-dialog";
import { fetchGuides, GUIDE_DISCLAIMER, zaloLink } from "@/lib/services";

export const Route = createFileRoute("/huong-dan-vien")({
  head: () => ({
    meta: [
      { title: "Hướng dẫn viên du lịch | MIỀN TOUR" },
      {
        name: "description",
        content:
          "Danh sách hướng dẫn viên cộng tác cùng MIỀN TOUR: ngoại ngữ, kinh nghiệm, khu vực hoạt động và giá tham khảo.",
      },
      { property: "og:title", content: "Hướng dẫn viên du lịch | MIỀN TOUR" },
      {
        property: "og:description",
        content: "Chọn hướng dẫn viên phù hợp cho hành trình khám phá của bạn.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: GuidesPage,
});

function GuidesPage() {
  const [booking, setBooking] = useState<BookingTarget | null>(null);
  const guides = useQuery({ queryKey: ["guides"], queryFn: () => fetchGuides() });

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="flex items-center gap-2 text-3xl font-extrabold text-primary">
        <UserRound className="size-7" aria-hidden /> HƯỚNG DẪN VIÊN
      </h1>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
        Đội ngũ hướng dẫn viên cộng tác, đồng hành cùng bạn trên từng hành trình.
      </p>

      <p className="mt-4 rounded-3xl bg-gold-soft p-4 text-xs leading-relaxed text-foreground/80">
        {GUIDE_DISCLAIMER}
      </p>

      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {guides.isLoading &&
          [0, 1, 2].map((i) => (
            <div key={i} className="h-72 animate-pulse rounded-3xl bg-secondary" />
          ))}
        {(guides.data ?? []).map((g) => (
          <article key={g.id} className="overflow-hidden rounded-3xl bg-card shadow-elevated">
            {g.photo_url && (
              <img
                src={g.photo_url}
                alt={g.full_name}
                loading="lazy"
                className="aspect-[4/3] w-full object-cover"
              />
            )}
            <div className="p-5">
              <h2 className="text-lg font-extrabold text-primary">{g.full_name}</h2>
              <p className="flex items-center gap-1 text-xs font-semibold text-gold">
                <Star className="size-3.5 fill-current" aria-hidden /> {g.rating}/5
              </p>
              {g.bio && <p className="mt-2 text-sm text-muted-foreground">{g.bio}</p>}
              <dl className="mt-2 space-y-1 text-sm text-foreground/85">
                {g.languages.length > 0 && (
                  <div>
                    <dt className="inline font-semibold">Ngoại ngữ: </dt>
                    <dd className="inline">{g.languages.join(", ")}</dd>
                  </div>
                )}
                {g.experience && (
                  <div>
                    <dt className="inline font-semibold">Kinh nghiệm: </dt>
                    <dd className="inline">{g.experience}</dd>
                  </div>
                )}
                {g.service_area && (
                  <div>
                    <dt className="inline font-semibold">Khu vực: </dt>
                    <dd className="inline">{g.service_area}</dd>
                  </div>
                )}
                {g.price_note && (
                  <div>
                    <dt className="inline font-semibold">Giá tham khảo: </dt>
                    <dd className="inline">{g.price_note}</dd>
                  </div>
                )}
              </dl>

              <div className="mt-3 flex flex-wrap gap-3 text-xs font-semibold text-primary">
                {g.phone && (
                  <a href={`tel:${g.phone}`} className="inline-flex items-center gap-1">
                    <Phone className="size-3.5" aria-hidden /> {g.phone}
                  </a>
                )}
                {g.email && (
                  <a href={`mailto:${g.email}`} className="inline-flex items-center gap-1">
                    <Mail className="size-3.5" aria-hidden /> {g.email}
                  </a>
                )}
                {(g.zalo || g.phone) && (
                  <a
                    href={zaloLink(g.zalo || g.phone)}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1"
                  >
                    <MessageCircle className="size-3.5" aria-hidden /> Zalo
                  </a>
                )}
              </div>

              <Button
                className="mt-4 h-12 w-full rounded-2xl font-bold"
                onClick={() =>
                  setBooking({
                    service_type: "guide",
                    guide_id: g.id,
                    title: `Thuê hướng dẫn viên ${g.full_name}`,
                  })
                }
              >
                📩 ĐĂNG KÝ THUÊ
              </Button>
            </div>
          </article>
        ))}
      </div>

      {!guides.isLoading && (guides.data ?? []).length === 0 && (
        <p className="mt-10 rounded-3xl border border-dashed border-border bg-secondary/50 p-8 text-center text-sm text-muted-foreground">
          Danh sách hướng dẫn viên đang được cập nhật.
        </p>
      )}

      <BookingDialog target={booking} onOpenChange={(o) => !o && setBooking(null)} />
    </div>
  );
}

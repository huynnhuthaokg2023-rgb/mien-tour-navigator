import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Facebook, Globe, Mail, MessageCircle, Phone, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BookingDialog, type BookingTarget } from "@/components/booking-dialog";
import {
  fetchVehiclePartners,
  VEHICLE_DISCLAIMER,
  VEHICLE_TYPES,
  zaloLink,
} from "@/lib/services";

export const Route = createFileRoute("/thue-xe")({
  head: () => ({
    meta: [
      { title: "Thuê xe du lịch | MIỀN TOUR" },
      {
        name: "description",
        content:
          "Danh sách đơn vị cho thuê xe du lịch hợp tác cùng MIỀN TOUR: xe 4–45 chỗ, Limousine, xe điện, đưa đón sân bay. Gọi ngay hoặc gửi yêu cầu.",
      },
      { property: "og:title", content: "Thuê xe du lịch | MIỀN TOUR" },
      {
        property: "og:description",
        content: "Kết nối nhanh với các đơn vị cho thuê xe uy tín tại địa phương.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: VehiclePage,
});

function VehiclePage() {
  const [filter, setFilter] = useState<string | null>(null);
  const [booking, setBooking] = useState<BookingTarget | null>(null);
  const partners = useQuery({
    queryKey: ["vehicle-partners"],
    queryFn: () => fetchVehiclePartners(),
  });

  const list = (partners.data ?? []).filter(
    (p) => !filter || p.vehicle_types.includes(filter),
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="flex items-center gap-2 text-3xl font-extrabold text-primary">
        <Truck className="size-7" aria-hidden /> THUÊ XE DU LỊCH
      </h1>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
        Nơi giới thiệu các đơn vị hợp tác và cộng tác viên cung cấp dịch vụ vận chuyển.
      </p>

      <p className="mt-4 rounded-3xl bg-gold-soft p-4 text-xs leading-relaxed text-foreground/80">
        {VEHICLE_DISCLAIMER}
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        <FilterChip active={filter === null} onClick={() => setFilter(null)}>
          Tất cả
        </FilterChip>
        {VEHICLE_TYPES.map((t) => (
          <FilterChip key={t} active={filter === t} onClick={() => setFilter(t)}>
            {t}
          </FilterChip>
        ))}
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        {partners.isLoading &&
          [0, 1].map((i) => (
            <div key={i} className="h-72 animate-pulse rounded-3xl bg-secondary" />
          ))}
        {list.map((p) => (
          <article key={p.id} className="overflow-hidden rounded-3xl bg-card shadow-elevated">
            {p.vehicle_image_url && (
              <img
                src={p.vehicle_image_url}
                alt={`Xe của ${p.name}`}
                loading="lazy"
                className="aspect-[16/9] w-full object-cover"
              />
            )}
            <div className="p-5">
              <div className="flex items-center gap-3">
                {p.logo_url && (
                  <img
                    src={p.logo_url}
                    alt={`Logo ${p.name}`}
                    loading="lazy"
                    className="size-12 rounded-xl object-contain"
                  />
                )}
                <h2 className="text-lg font-extrabold text-primary">{p.name}</h2>
              </div>

              {p.vehicle_types.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {p.vehicle_types.map((t) => (
                    <span
                      key={t}
                      className="rounded-full bg-secondary px-2.5 py-1 text-xs font-semibold text-secondary-foreground"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              )}

              {p.description && (
                <p className="mt-3 text-sm text-muted-foreground">{p.description}</p>
              )}
              <dl className="mt-3 space-y-1 text-sm text-foreground/85">
                {p.price_note && (
                  <div>
                    <dt className="inline font-semibold">Giá tham khảo: </dt>
                    <dd className="inline">{p.price_note}</dd>
                  </div>
                )}
                {p.service_area && (
                  <div>
                    <dt className="inline font-semibold">Địa bàn phục vụ: </dt>
                    <dd className="inline">{p.service_area}</dd>
                  </div>
                )}
              </dl>

              <div className="mt-3 flex flex-wrap gap-3 text-xs font-semibold text-primary">
                {p.email && (
                  <a href={`mailto:${p.email}`} className="inline-flex items-center gap-1">
                    <Mail className="size-3.5" aria-hidden /> {p.email}
                  </a>
                )}
                {p.facebook && (
                  <a
                    href={p.facebook}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1"
                  >
                    <Facebook className="size-3.5" aria-hidden /> Facebook
                  </a>
                )}
                {p.website && (
                  <a
                    href={p.website}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1"
                  >
                    <Globe className="size-3.5" aria-hidden /> Website
                  </a>
                )}
              </div>

              <div className="mt-4 grid gap-2 sm:grid-cols-3">
                <Button asChild className="h-12 rounded-2xl font-bold" disabled={!p.phone}>
                  <a href={p.phone ? `tel:${p.phone}` : "#"}>
                    <Phone className="size-4" /> GỌI NGAY
                  </a>
                </Button>
                <Button asChild variant="outline" className="h-12 rounded-2xl font-semibold">
                  <a href={zaloLink(p.zalo || p.phone)} target="_blank" rel="noreferrer">
                    <MessageCircle className="size-4" /> CHAT ZALO
                  </a>
                </Button>
                <Button
                  variant="secondary"
                  className="h-12 rounded-2xl font-semibold"
                  onClick={() =>
                    setBooking({
                      service_type: "vehicle",
                      partner_id: p.id,
                      title: `Đặt xe – ${p.name}`,
                    })
                  }
                >
                  📩 GỬI YÊU CẦU
                </Button>
              </div>
            </div>
          </article>
        ))}
      </div>

      {!partners.isLoading && list.length === 0 && (
        <p className="mt-10 rounded-3xl border border-dashed border-border bg-secondary/50 p-8 text-center text-sm text-muted-foreground">
          Chưa có đơn vị phù hợp với bộ lọc này.
        </p>
      )}

      <BookingDialog target={booking} onOpenChange={(o) => !o && setBooking(null)} />
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-3.5 py-2 text-xs font-semibold transition-colors ${
        active
          ? "bg-primary text-primary-foreground"
          : "bg-secondary text-secondary-foreground hover:text-primary"
      }`}
    >
      {children}
    </button>
  );
}

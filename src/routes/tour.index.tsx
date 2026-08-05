import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Bike, Clock, MapPin, Route as RouteIcon } from "lucide-react";
import { fetchTours } from "@/lib/services";
import { coverFor } from "@/lib/images";

export const Route = createFileRoute("/tour/")({
  head: () => ({
    meta: [
      { title: "Tour gợi ý | MIỀN TOUR" },
      {
        name: "description",
        content:
          "Các tour tham quan gợi ý: tour 2 giờ, nửa ngày, 1 ngày và 2 ngày với lịch trình, bản đồ, video và Audio Guide Việt – Anh.",
      },
      { property: "og:title", content: "Tour gợi ý | MIỀN TOUR" },
      {
        property: "og:description",
        content: "Chọn tour phù hợp với thời gian của bạn và bắt đầu hành trình khám phá.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TourListPage,
});

export function TourCard({
  tour,
}: {
  tour: {
    slug: string;
    name: string;
    summary: string;
    duration_label: string;
    distance_km: number;
    transport: string;
    cover_image_url: string | null;
  };
}) {
  return (
    <Link
      to="/tour/$slug"
      params={{ slug: tour.slug }}
      className="group overflow-hidden rounded-3xl bg-card shadow-elevated transition-shadow hover:shadow-floating"
    >
      <img
        src={coverFor(tour.slug, tour.cover_image_url)}
        alt={tour.name}
        loading="lazy"
        className="aspect-[16/10] w-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
      <div className="p-4">
        <h3 className="text-lg font-extrabold text-primary">{tour.name}</h3>
        {tour.summary && (
          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{tour.summary}</p>
        )}
        <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold text-secondary-foreground">
          {tour.duration_label && (
            <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1">
              <Clock className="size-3.5" aria-hidden /> {tour.duration_label}
            </span>
          )}
          {tour.distance_km > 0 && (
            <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1">
              <MapPin className="size-3.5" aria-hidden /> {tour.distance_km} km
            </span>
          )}
          {tour.transport && (
            <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1">
              <Bike className="size-3.5" aria-hidden /> {tour.transport}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

function TourListPage() {
  const tours = useQuery({ queryKey: ["tours"], queryFn: () => fetchTours() });

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="flex items-center gap-2 text-3xl font-extrabold text-primary">
        <RouteIcon className="size-7" aria-hidden /> TOUR GỢI Ý
      </h1>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
        Mỗi tour gồm lịch trình chi tiết, bản đồ, video, thư viện ảnh, thuyết minh tiếng Việt –
        English, thời gian, khoảng cách và phương tiện di chuyển.
      </p>

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {tours.isLoading &&
          [0, 1, 2].map((i) => (
            <div key={i} className="h-72 animate-pulse rounded-3xl bg-secondary" />
          ))}
        {(tours.data ?? []).map((t) => (
          <TourCard key={t.id} tour={t} />
        ))}
      </div>

      {!tours.isLoading && (tours.data ?? []).length === 0 && (
        <p className="mt-10 rounded-3xl border border-dashed border-border bg-secondary/50 p-8 text-center text-sm text-muted-foreground">
          Các tour đang được cập nhật. Vui lòng quay lại sau.
        </p>
      )}
    </div>
  );
}

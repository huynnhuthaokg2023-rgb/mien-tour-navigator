import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ChevronRight, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { LocationCard } from "@/components/location-card";
import { fetchLocations, fetchRegion } from "@/lib/mien-tour";
import { coverFor } from "@/lib/images";

export const Route = createFileRoute("/khu-vuc/$slug")({
  head: () => ({
    meta: [
      { title: "Khu vực du lịch | MIỀN TOUR" },
      {
        name: "description",
        content:
          "Danh sách các điểm du lịch trong khu vực, kèm hình ảnh, mô tả ngắn và đường dẫn tới trang chi tiết.",
      },
      { property: "og:title", content: "Khu vực du lịch | MIỀN TOUR" },
      {
        property: "og:description",
        content: "Khám phá toàn bộ điểm đến trong khu vực cùng MIỀN TOUR.",
      },
    ],
  }),
  component: RegionPage,
});

function RegionPage() {
  const { slug } = Route.useParams();
  const [term, setTerm] = useState("");

  const region = useQuery({ queryKey: ["region", slug], queryFn: () => fetchRegion(slug) });
  const locations = useQuery({
    queryKey: ["locations", region.data?.id],
    queryFn: () => fetchLocations(region.data!.id),
    enabled: Boolean(region.data?.id),
  });

  if (region.isLoading) {
    return <div className="mx-auto h-80 max-w-6xl animate-pulse rounded-3xl bg-secondary" />;
  }

  if (!region.data) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-20 text-center">
        <h1 className="text-2xl font-extrabold text-primary">Không tìm thấy khu vực</h1>
        <Link to="/dia-diem" className="mt-4 inline-block font-semibold text-primary">
          Xem tất cả địa điểm
        </Link>
      </div>
    );
  }

  const list = (locations.data ?? []).filter((l) =>
    `${l.name} ${l.address}`.toLowerCase().includes(term.trim().toLowerCase()),
  );

  return (
    <div>
      <section className="relative">
        <img
          src={coverFor(region.data.slug, region.data.cover_image_url)}
          alt={region.data.name}
          className="h-56 w-full object-cover sm:h-80"
        />
        <div className="absolute inset-0 bg-gradient-hero" />
        <div className="absolute inset-x-0 bottom-0 mx-auto max-w-6xl px-4 pb-6">
          <nav className="flex items-center gap-1 text-xs font-semibold text-background/90">
            <Link to="/">MIỀN TOUR</Link>
            <ChevronRight className="size-3.5" aria-hidden />
            <span>{region.data.name.toUpperCase()}</span>
          </nav>
          <h1 className="mt-2 text-3xl font-extrabold text-background sm:text-5xl">
            {region.data.name}
          </h1>
          <p className="text-sm font-semibold text-background/90">{region.data.tagline}</p>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-8">
        {region.data.description && (
          <p className="max-w-3xl text-[15px] leading-relaxed text-foreground/85">
            {region.data.description}
          </p>
        )}

        <div className="relative mt-6 max-w-md">
          <Search
            className="absolute left-3.5 top-1/2 size-4.5 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="Tìm địa danh…"
            aria-label="Tìm địa danh trong khu vực"
            className="h-12 rounded-2xl bg-card pl-10 text-base"
          />
        </div>

        <h2 className="mt-8 text-xl font-extrabold text-primary">
          CÁC ĐIỂM DU LỊCH ({list.length})
        </h2>
        <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((l) => (
            <LocationCard key={l.id} location={l} />
          ))}
        </div>
        {!locations.isLoading && list.length === 0 && (
          <p className="mt-8 text-sm text-muted-foreground">
            Khu vực này chưa có địa điểm được xuất bản.
          </p>
        )}
      </div>
    </div>
  );
}

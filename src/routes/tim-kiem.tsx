import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Bus, MapPin, Route as RouteIcon, Search, UserRound } from "lucide-react";
import { fetchLocations } from "@/lib/mien-tour";
import { fetchGuides, fetchTours, fetchVehiclePartners } from "@/lib/services";

export const Route = createFileRoute("/tim-kiem")({
  head: () => ({
    meta: [
      { title: "Tìm kiếm | MIỀN TOUR" },
      {
        name: "description",
        content:
          "Tìm nhanh địa điểm du lịch, tour gợi ý, đơn vị cho thuê xe và hướng dẫn viên trên MIỀN TOUR.",
      },
      { property: "og:title", content: "Tìm kiếm | MIỀN TOUR" },
      {
        property: "og:description",
        content: "Tìm địa điểm, tour, xe du lịch và hướng dẫn viên chỉ với một thanh tìm kiếm.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  validateSearch: (s: Record<string, unknown>) => ({ q: typeof s.q === "string" ? s.q : "" }),
  component: SearchPage,
});

const norm = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .toLowerCase();

function SearchPage() {
  const { q } = Route.useSearch();
  const [term, setTerm] = useState(q);

  const locations = useQuery({ queryKey: ["locations", "all"], queryFn: () => fetchLocations() });
  const tours = useQuery({ queryKey: ["tours"], queryFn: () => fetchTours() });
  const partners = useQuery({ queryKey: ["vehicle-partners"], queryFn: () => fetchVehiclePartners() });
  const guides = useQuery({ queryKey: ["guides"], queryFn: () => fetchGuides() });

  const k = norm(term.trim());

  const results = useMemo(() => {
    if (!k) return { locations: [], tours: [], partners: [], guides: [] };
    const match = (...parts: (string | null | undefined)[]) =>
      norm(parts.filter(Boolean).join(" ")).includes(k);
    return {
      locations: (locations.data ?? []).filter((l) =>
        match(l.name, l.address, l.short_description),
      ),
      tours: (tours.data ?? []).filter((t) => match(t.name, t.summary, t.duration_label)),
      partners: (partners.data ?? []).filter((p) =>
        match(p.name, p.service_area, p.vehicle_types.join(" ")),
      ),
      guides: (guides.data ?? []).filter((g) =>
        match(g.full_name, g.languages.join(" "), g.service_area),
      ),
    };
  }, [k, locations.data, tours.data, partners.data, guides.data]);

  const total =
    results.locations.length +
    results.tours.length +
    results.partners.length +
    results.guides.length;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="flex items-center gap-2 text-3xl font-extrabold text-primary">
        <Search className="size-7" aria-hidden /> TÌM KIẾM
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Tìm địa điểm, tour, xe du lịch và hướng dẫn viên.
      </p>

      <div className="sticky top-16 z-10 mt-5 rounded-2xl bg-background/95 py-2 backdrop-blur">
        <div className="flex items-center gap-2 rounded-2xl border border-border bg-card px-4 shadow-elevated">
          <Search className="size-5 shrink-0 text-muted-foreground" aria-hidden />
          <input
            autoFocus
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="Nhập tên địa điểm, tour, nhà xe, hướng dẫn viên..."
            aria-label="Ô tìm kiếm"
            className="h-13 w-full bg-transparent text-base outline-none"
          />
        </div>
      </div>

      {!k && (
        <p className="mt-8 rounded-3xl border border-dashed border-border bg-secondary/50 p-8 text-center text-sm text-muted-foreground">
          Nhập từ khoá để bắt đầu tìm kiếm.
        </p>
      )}

      {k && total === 0 && (
        <p className="mt-8 rounded-3xl border border-dashed border-border bg-secondary/50 p-8 text-center text-sm text-muted-foreground">
          Không tìm thấy kết quả cho “{term}”.
        </p>
      )}

      {k && total > 0 && (
        <div className="mt-6 space-y-8">
          <Group icon={MapPin} title="ĐỊA ĐIỂM" count={results.locations.length}>
            {results.locations.map((l) => (
              <Link
                key={l.id}
                to="/dia-diem/$slug"
                params={{ slug: l.slug }}
                className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3 hover:border-primary"
              >
                <Thumb src={l.cover_image_url} alt={l.name} />
                <span className="min-w-0">
                  <span className="block truncate font-bold text-foreground">{l.name}</span>
                  <span className="block truncate text-xs text-muted-foreground">{l.address}</span>
                </span>
              </Link>
            ))}
          </Group>

          <Group icon={RouteIcon} title="TOUR" count={results.tours.length}>
            {results.tours.map((t) => (
              <Link
                key={t.id}
                to="/tour/$slug"
                params={{ slug: t.slug }}
                className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3 hover:border-primary"
              >
                <Thumb src={t.cover_image_url} alt={t.name} />
                <span className="min-w-0">
                  <span className="block truncate font-bold text-foreground">{t.name}</span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {t.duration_label}
                  </span>
                </span>
              </Link>
            ))}
          </Group>

          <Group icon={Bus} title="THUÊ XE" count={results.partners.length}>
            {results.partners.map((p) => (
              <Link
                key={p.id}
                to="/thue-xe"
                className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3 hover:border-primary"
              >
                <Thumb src={p.vehicle_image_url ?? p.logo_url} alt={p.name} />
                <span className="min-w-0">
                  <span className="block truncate font-bold text-foreground">{p.name}</span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {p.vehicle_types.join(", ")}
                  </span>
                </span>
              </Link>
            ))}
          </Group>

          <Group icon={UserRound} title="HƯỚNG DẪN VIÊN" count={results.guides.length}>
            {results.guides.map((g) => (
              <Link
                key={g.id}
                to="/huong-dan-vien"
                className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3 hover:border-primary"
              >
                <Thumb src={g.photo_url} alt={g.full_name} />
                <span className="min-w-0">
                  <span className="block truncate font-bold text-foreground">{g.full_name}</span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {g.languages.join(", ")}
                  </span>
                </span>
              </Link>
            ))}
          </Group>
        </div>
      )}
    </div>
  );
}

function Thumb({ src, alt }: { src: string | null; alt: string }) {
  return src ? (
    <img src={src} alt={alt} loading="lazy" className="size-14 shrink-0 rounded-xl object-cover" />
  ) : (
    <span className="grid size-14 shrink-0 place-items-center rounded-xl bg-secondary text-primary">
      <MapPin className="size-5" aria-hidden />
    </span>
  );
}

function Group({
  icon: Icon,
  title,
  count,
  children,
}: {
  icon: typeof MapPin;
  title: string;
  count: number;
  children: React.ReactNode;
}) {
  if (count === 0) return null;
  return (
    <section>
      <h2 className="flex items-center gap-2 text-sm font-extrabold tracking-wide text-primary">
        <Icon className="size-4" aria-hidden /> {title} ({count})
      </h2>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">{children}</div>
    </section>
  );
}

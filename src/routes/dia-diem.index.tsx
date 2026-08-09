import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { LocationCard } from "@/components/location-card";
import { fetchLocations, fetchRegions } from "@/lib/mien-tour";

export const Route = createFileRoute("/dia-diem/")({
  head: () => ({
    meta: [
      { title: "Tất cả địa điểm du lịch | MIỀN TOUR" },
      {
        name: "description",
        content:
          "Danh sách toàn bộ địa điểm du lịch trên MIỀN TOUR: thông tin, hình ảnh, video và thuyết minh cho từng địa danh.",
      },
      { property: "og:title", content: "Tất cả địa điểm du lịch | MIỀN TOUR" },
      {
        property: "og:description",
        content: "Duyệt và tìm kiếm mọi địa danh đang có trên MIỀN TOUR.",
      },
    ],
  }),
  component: AllLocationsPage,
});

function AllLocationsPage() {
  const [term, setTerm] = useState("");
  const [regionId, setRegionId] = useState<string | "all">("all");

  const regions = useQuery({ queryKey: ["regions"], queryFn: () => fetchRegions() });
  const locations = useQuery({
    queryKey: ["locations", "all"],
    queryFn: () => fetchLocations(),
  });

  const list = (locations.data ?? []).filter((l) => {
    const matchRegion = regionId === "all" || l.region_id === regionId;
    const matchTerm = `${l.name} ${l.address}`
      .toLowerCase()
      .includes(term.trim().toLowerCase());
    return matchRegion && matchTerm;
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-extrabold text-primary">Địa điểm</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Chọn một địa điểm để xem thông tin, hình ảnh, video và nghe thuyết minh.
      </p>

      <div className="mt-5 space-y-3">
        <div className="relative">
          <Search
            className="absolute left-3.5 top-1/2 size-4.5 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="Tìm địa danh…"
            aria-label="Tìm địa danh"
            className="h-12 rounded-2xl bg-card pl-10 text-base"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <FilterChip active={regionId === "all"} onClick={() => setRegionId("all")}>
            Tất cả
          </FilterChip>
          {(regions.data ?? []).map((r) => (
            <FilterChip
              key={r.id}
              active={regionId === r.id}
              onClick={() => setRegionId(r.id)}
            >
              {r.name}
            </FilterChip>
          ))}
        </div>
      </div>

      <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {locations.isLoading
          ? Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-72 animate-pulse rounded-3xl bg-secondary" />
            ))
          : list.map((l) => <LocationCard key={l.id} location={l} />)}
      </div>
      {!locations.isLoading && list.length === 0 && (
        <p className="mt-10 text-center text-sm text-muted-foreground">
          Chưa có địa điểm phù hợp.
        </p>
      )}
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
      aria-pressed={active}
      className={
        active
          ? "rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
          : "rounded-full bg-secondary px-4 py-2 text-sm font-semibold text-secondary-foreground"
      }
    >
      {children}
    </button>
  );
}

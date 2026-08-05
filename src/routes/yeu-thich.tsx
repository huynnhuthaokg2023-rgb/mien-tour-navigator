import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Heart } from "lucide-react";
import { LocationCard } from "@/components/location-card";
import { useFavorites } from "@/hooks/use-favorites";
import { fetchLocations } from "@/lib/mien-tour";

export const Route = createFileRoute("/yeu-thich")({
  head: () => ({
    meta: [
      { title: "Địa điểm yêu thích | MIỀN TOUR" },
      {
        name: "description",
        content:
          "Danh sách các địa điểm bạn đã lưu để tham quan sau, được ghi nhớ ngay trên thiết bị của bạn.",
      },
      { property: "og:title", content: "Địa điểm yêu thích | MIỀN TOUR" },
      {
        property: "og:description",
        content: "Lưu lại những điểm đến bạn muốn ghé thăm cùng MIỀN TOUR.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: FavoritesPage,
});

function FavoritesPage() {
  const { slugs } = useFavorites();
  const locations = useQuery({
    queryKey: ["locations", "all"],
    queryFn: () => fetchLocations(),
  });

  const list = (locations.data ?? []).filter((l) => slugs.includes(l.slug));

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="flex items-center gap-2 text-3xl font-extrabold text-primary">
        <Heart className="size-7" aria-hidden /> ĐỊA ĐIỂM YÊU THÍCH
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Những nơi bạn đã lưu lại để khám phá sau.
      </p>

      {list.length > 0 ? (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((l) => (
            <LocationCard key={l.id} location={l} />
          ))}
        </div>
      ) : (
        <div className="mt-10 rounded-3xl border border-dashed border-border bg-secondary/50 p-8 text-center">
          <p className="text-sm text-muted-foreground">
            Bạn chưa lưu địa điểm nào. Hãy nhấn biểu tượng trái tim ở trang chi tiết địa điểm.
          </p>
          <Link
            to="/dia-diem"
            className="mt-3 inline-block font-semibold text-primary"
          >
            Khám phá địa điểm →
          </Link>
        </div>
      )}
    </div>
  );
}

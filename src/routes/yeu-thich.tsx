import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Heart } from "lucide-react";
import { LocationCard } from "@/components/location-card";
import { TourCard } from "@/components/tour-card";
import { useFavorites } from "@/hooks/use-favorites";
import { fetchLocations } from "@/lib/mien-tour";
import { fetchTours } from "@/lib/services";

export const Route = createFileRoute("/yeu-thich")({
  head: () => ({
    meta: [
      { title: "Yêu thích | MIỀN TOUR" },
      {
        name: "description",
        content:
          "Danh sách địa điểm và tour bạn đã lưu để tham quan sau, được ghi nhớ ngay trên thiết bị của bạn.",
      },
      { property: "og:title", content: "Yêu thích | MIỀN TOUR" },
      {
        property: "og:description",
        content: "Lưu lại điểm đến và tour bạn muốn trải nghiệm cùng MIỀN TOUR.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: FavoritesPage,
});

function FavoritesPage() {
  const { slugs } = useFavorites("location");
  const { slugs: tourSlugs } = useFavorites("tour");

  const locations = useQuery({
    queryKey: ["locations", "all"],
    queryFn: () => fetchLocations(),
  });
  const tours = useQuery({ queryKey: ["tours"], queryFn: () => fetchTours() });

  const list = (locations.data ?? []).filter((l) => slugs.includes(l.slug));
  const tourList = (tours.data ?? []).filter((t) => tourSlugs.includes(t.slug));
  const empty = list.length === 0 && tourList.length === 0;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="flex items-center gap-2 text-3xl font-extrabold text-primary">
        <Heart className="size-7" aria-hidden /> YÊU THÍCH
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Những địa điểm và tour bạn đã lưu lại để khám phá sau.
      </p>

      {list.length > 0 && (
        <section className="mt-8">
          <h2 className="text-lg font-extrabold text-primary">ĐỊA ĐIỂM ĐÃ LƯU</h2>
          <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((l) => (
              <LocationCard key={l.id} location={l} />
            ))}
          </div>
        </section>
      )}

      {tourList.length > 0 && (
        <section className="mt-10">
          <h2 className="text-lg font-extrabold text-primary">TOUR ĐÃ LƯU</h2>
          <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {tourList.map((t) => (
              <TourCard key={t.id} tour={t} />
            ))}
          </div>
        </section>
      )}

      {empty && (
        <div className="mt-10 rounded-3xl border border-dashed border-border bg-secondary/50 p-8 text-center">
          <p className="text-sm text-muted-foreground">
            Bạn chưa lưu mục nào. Hãy nhấn biểu tượng trái tim ở trang chi tiết địa điểm hoặc tour.
          </p>
          <div className="mt-3 flex flex-wrap justify-center gap-4">
            <Link to="/dia-diem" className="font-semibold text-primary">
              Khám phá địa điểm →
            </Link>
            <Link to="/tour" className="font-semibold text-primary">
              Xem tour gợi ý →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

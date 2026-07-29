import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ArrowRight, Search, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { OnboardingSheet, useFirstVisitOnboarding } from "@/components/onboarding";
import { fetchLocations, fetchRegions } from "@/lib/mien-tour";
import { coverFor, heroImage } from "@/lib/images";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "MIỀN TOUR – Khám phá điểm đến tiếp theo của bạn" },
      {
        name: "description",
        content:
          "Khám phá điểm đến địa phương cùng MIỀN TOUR: thông tin, hình ảnh, video, Audio Guide tiếng Việt – English và chỉ đường Google Maps.",
      },
      { property: "og:title", content: "MIỀN TOUR – Khám phá điểm đến tiếp theo của bạn" },
      {
        property: "og:description",
        content: "Khám phá điểm đến địa phương cùng MIỀN TOUR: thông tin, hình ảnh, video, Audio Guide tiếng Việt – English và chỉ đường Google Maps.",
      },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const onboarding = useFirstVisitOnboarding();
  const navigate = useNavigate();
  const [term, setTerm] = useState("");

  const regions = useQuery({ queryKey: ["regions"], queryFn: () => fetchRegions() });
  const locations = useQuery({
    queryKey: ["locations", "all"],
    queryFn: () => fetchLocations(),
  });

  const matches = term.trim()
    ? (locations.data ?? []).filter((l) =>
        `${l.name} ${l.address}`.toLowerCase().includes(term.trim().toLowerCase()),
      )
    : [];

  return (
    <>
      <OnboardingSheet open={onboarding.open} onClose={onboarding.close} />

      <section className="relative">
        <img
          src={heroImage}
          alt="Toàn cảnh thành phố biển Rạch Giá lúc hoàng hôn"
          width={1600}
          height={1008}
          className="absolute inset-0 size-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-hero" />
        <div className="relative mx-auto max-w-6xl px-4 pb-14 pt-20 sm:pt-28">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-background/95 px-3 py-1.5 text-xs font-bold text-primary">
            <Sparkles className="size-3.5" aria-hidden /> MIỀN TOUR
          </span>
          <p className="mt-4 max-w-xl border-l-2 border-background/70 pl-3 text-base font-semibold italic tracking-wide text-background sm:text-xl">
            “Chân chạm đất bằng, hồn chạm văn hoá”
          </p>
          <h1 className="mt-3 max-w-2xl text-4xl leading-[1.1] font-extrabold text-background sm:text-6xl">
            Khám phá điểm đến tiếp theo của bạn
          </h1>
          <p className="mt-3 text-base font-semibold text-background/95 sm:text-lg">
            Khám phá địa phương – Trải nghiệm trọn vẹn
          </p>
          <p className="mt-2 max-w-xl text-sm text-background/85 sm:text-base">
            Khám phá những điểm đến thú vị, tìm hiểu văn hóa địa phương và lên kế hoạch cho
            hành trình của bạn với MIỀN TOUR.
          </p>

          <div className="mt-6 max-w-xl rounded-3xl bg-card p-3 shadow-floating">
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
                className="h-12 rounded-2xl border-transparent bg-secondary/60 pl-10 text-base"
              />
            </div>
            {matches.length > 0 && (
              <ul className="mt-2 max-h-64 space-y-1 overflow-y-auto">
                {matches.map((l) => (
                  <li key={l.id}>
                    <Link
                      to="/dia-diem/$slug"
                      params={{ slug: l.slug }}
                      className="block rounded-2xl px-3 py-2.5 text-sm font-semibold text-foreground hover:bg-secondary"
                    >
                      {l.name}
                      <span className="block text-xs font-normal text-muted-foreground">
                        {l.address}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
            <Button
              size="lg"
              className="mt-3 h-13 w-full rounded-2xl text-base font-bold"
              onClick={() => navigate({ to: "/dia-diem" })}
            >
              BẮT ĐẦU KHÁM PHÁ <ArrowRight className="size-5" />
            </Button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="text-2xl font-extrabold text-primary sm:text-3xl">ĐIỂM ĐẾN NỔI BẬT</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Chọn khu vực bạn muốn khám phá.
        </p>

        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {regions.isLoading &&
            [0, 1].map((i) => (
              <div key={i} className="h-64 animate-pulse rounded-3xl bg-secondary" />
            ))}
          {(regions.data ?? []).map((region) => (
            <Link
              key={region.id}
              to="/khu-vuc/$slug"
              params={{ slug: region.slug }}
              className="group overflow-hidden rounded-3xl bg-card shadow-elevated transition-shadow hover:shadow-floating"
            >
              <img
                src={coverFor(region.slug, region.cover_image_url)}
                alt={region.name}
                loading="lazy"
                className="aspect-[16/10] w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="p-4">
                <h3 className="text-xl font-extrabold text-primary">{region.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{region.tagline}</p>
                <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-bold text-primary">
                  Khám phá <ArrowRight className="size-4" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}

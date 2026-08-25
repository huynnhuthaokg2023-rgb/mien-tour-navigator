import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { CalendarDays, MapPin } from "lucide-react";
import { fetchEvents } from "@/lib/services";
import { coverFor } from "@/lib/images";

const SITE_URL = "https://mien-tour-navigator.lovable.app";
const EVENTS_URL = `${SITE_URL}/su-kien`;

export const Route = createFileRoute("/su-kien")({
  loader: () => fetchEvents(),
  head: ({ loaderData }) => ({
    meta: [
      { title: "Sự kiện & lễ hội Rạch Giá – Kiên Giang | MIỀN TOUR" },
      {
        name: "description",
        content:
          "Lịch sự kiện, lễ hội và hoạt động văn hoá địa phương tại Rạch Giá – Kiên Giang để bạn lên kế hoạch cho chuyến đi.",
      },
      { property: "og:title", content: "Sự kiện & lễ hội Rạch Giá – Kiên Giang | MIỀN TOUR" },
      {
        property: "og:description",
        content: "Cập nhật các sự kiện văn hoá – du lịch đang diễn ra tại địa phương.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: EVENTS_URL },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: EVENTS_URL }],
    scripts: (loaderData ?? []).length
      ? [
          {
            type: "application/ld+json",
            children: JSON.stringify(
              (loaderData ?? []).slice(0, 20).map((e) => ({
                "@context": "https://schema.org",
                "@type": "Event",
                name: e.title,
                ...(e.description ? { description: e.description } : {}),
                ...(e.start_date ? { startDate: e.start_date } : {}),
                ...(e.end_date ? { endDate: e.end_date } : {}),
                ...(e.place ? { location: { "@type": "Place", name: e.place } } : {}),
                url: EVENTS_URL,
              })),
            ),
          },
        ]
      : [],
  }),
  component: EventsPage,
  errorComponent: () => (
    <div className="mx-auto max-w-6xl px-4 py-20 text-center">
      <h1 className="text-2xl font-extrabold text-primary">Không tải được sự kiện</h1>
    </div>
  ),
  notFoundComponent: () => (
    <div className="mx-auto max-w-6xl px-4 py-20 text-center">
      <h1 className="text-2xl font-extrabold text-primary">Không tìm thấy trang</h1>
    </div>
  ),
});


function fmtDate(value: string | null) {
  if (!value) return "";
  const [y, m, d] = value.split("-");
  return `${d}/${m}/${y}`;
}

function EventsPage() {
  const events = useQuery({ queryKey: ["events"], queryFn: () => fetchEvents() });

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="flex items-center gap-2 text-3xl font-extrabold text-primary">
        <CalendarDays className="size-7" aria-hidden /> SỰ KIỆN &amp; LỄ HỘI
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Những hoạt động văn hoá – du lịch nổi bật tại địa phương.
      </p>

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {events.isLoading &&
          [0, 1, 2].map((i) => (
            <div key={i} className="h-64 animate-pulse rounded-3xl bg-secondary" />
          ))}
        {(events.data ?? []).map((ev) => (
          <article key={ev.id} className="overflow-hidden rounded-3xl bg-card shadow-elevated">
            <img
              src={coverFor(ev.slug, ev.cover_image_url)}
              alt={ev.title}
              loading="lazy"
              className="aspect-[16/10] w-full object-cover"
            />
            <div className="p-4">
              <h2 className="text-lg font-extrabold text-primary">{ev.title}</h2>
              {(ev.start_date || ev.place) && (
                <p className="mt-1 flex flex-wrap items-center gap-3 text-xs font-semibold text-muted-foreground">
                  {ev.start_date && (
                    <span className="inline-flex items-center gap-1">
                      <CalendarDays className="size-3.5" aria-hidden />
                      {fmtDate(ev.start_date)}
                      {ev.end_date && ev.end_date !== ev.start_date
                        ? ` – ${fmtDate(ev.end_date)}`
                        : ""}
                    </span>
                  )}
                  {ev.place && (
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="size-3.5" aria-hidden /> {ev.place}
                    </span>
                  )}
                </p>
              )}
              {ev.description && (
                <p className="mt-2 text-sm whitespace-pre-line text-foreground/80">
                  {ev.description}
                </p>
              )}
            </div>
          </article>
        ))}
      </div>

      {!events.isLoading && (events.data ?? []).length === 0 && (
        <p className="mt-10 rounded-3xl border border-dashed border-border bg-secondary/50 p-8 text-center text-sm text-muted-foreground">
          Lịch sự kiện đang được cập nhật.
        </p>
      )}
    </div>
  );
}

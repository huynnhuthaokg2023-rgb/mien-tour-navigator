import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ChevronRight, Clock, Compass, Heart, Info, MapPin, Navigation, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AudioPlayer } from "@/components/audio-guide";
import { ImageGallery } from "@/components/image-gallery";
import { TourCard } from "@/routes/tour.index";
import { useFavorites } from "@/hooks/use-favorites";
import { fetchTours } from "@/lib/services";
import {
  directionsUrl,
  embedVideoSrc,
  fetchLocation,
  fetchLocationImages,
  fetchRegions,
  mapsEmbedSrc,
} from "@/lib/mien-tour";
import { coverFor } from "@/lib/images";


export const Route = createFileRoute("/dia-diem/$slug")({
  head: () => ({
    meta: [
      { title: "Chi tiết địa điểm | MIỀN TOUR" },
      {
        name: "description",
        content:
          "Thông tin chi tiết, hình ảnh, video, Audio Guide tiếng Việt – English và bản đồ chỉ đường của địa điểm.",
      },
      { property: "og:title", content: "Chi tiết địa điểm | MIỀN TOUR" },
      {
        property: "og:description",
        content: "Xem thông tin, nghe thuyết minh và chỉ đường tới địa điểm.",
      },
    ],
  }),
  component: LocationPage,
});

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="text-xl font-extrabold text-primary">{title}</h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function LocationPage() {
  const { slug } = Route.useParams();
  const location = useQuery({ queryKey: ["location", slug], queryFn: () => fetchLocation(slug) });
  const images = useQuery({
    queryKey: ["location-images", location.data?.id],
    queryFn: () => fetchLocationImages(location.data!.id),
    enabled: Boolean(location.data?.id),
  });
  const regions = useQuery({ queryKey: ["regions"], queryFn: () => fetchRegions() });

  if (location.isLoading) {
    return <div className="mx-auto h-96 max-w-3xl animate-pulse rounded-3xl bg-secondary" />;
  }

  const loc = location.data;
  if (!loc) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-20 text-center">
        <h1 className="text-2xl font-extrabold text-primary">Không tìm thấy địa điểm</h1>
        <Link to="/dia-diem" className="mt-4 inline-block font-semibold text-primary">
          Khám phá địa điểm khác
        </Link>
      </div>
    );
  }

  const region = (regions.data ?? []).find((r) => r.id === loc.region_id);
  const mapSrc = mapsEmbedSrc(loc);
  const videoSrc = loc.video_url ? embedVideoSrc(loc.video_url) : null;

  return (
    <article>
      <div className="relative">
        <img
          src={coverFor(loc.slug, loc.cover_image_url)}
          alt={loc.name}
          className="h-60 w-full object-cover sm:h-96"
        />
        <div className="absolute inset-0 bg-gradient-hero" />
        <div className="absolute inset-x-0 bottom-0 mx-auto max-w-3xl px-4 pb-6">
          <nav className="flex flex-wrap items-center gap-1 text-xs font-semibold text-background/90">
            <Link to="/">MIỀN TOUR</Link>
            <ChevronRight className="size-3.5" aria-hidden />
            {region && (
              <>
                <Link to="/khu-vuc/$slug" params={{ slug: region.slug }}>
                  {region.name.toUpperCase()}
                </Link>
                <ChevronRight className="size-3.5" aria-hidden />
              </>
            )}
            <span className="truncate">{loc.name.toUpperCase()}</span>
          </nav>
          <h1 className="mt-2 text-2xl font-extrabold text-background sm:text-4xl">
            {loc.name}
          </h1>
          {loc.address && (
            <p className="mt-1 flex items-start gap-1.5 text-sm text-background/90">
              <MapPin className="mt-0.5 size-4 shrink-0" aria-hidden /> {loc.address}
            </p>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 pb-4">
        {loc.description && (
          <Section title="GIỚI THIỆU">
            <p className="text-[15px] leading-relaxed whitespace-pre-line text-foreground/85">
              {loc.description}
            </p>
          </Section>
        )}

        {loc.highlights.length > 0 && (
          <Section title="ĐIỂM NỔI BẬT">
            <ul className="space-y-2">
              {loc.highlights.map((h) => (
                <li
                  key={h}
                  className="flex gap-2 rounded-2xl bg-secondary/70 px-4 py-3 text-sm text-foreground/85"
                >
                  <Compass className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
                  <span>{h}</span>
                </li>
              ))}
            </ul>
          </Section>
        )}

        {loc.culture_history && (
          <Section title="VĂN HOÁ – LỊCH SỬ">
            <p className="text-[15px] leading-relaxed whitespace-pre-line text-foreground/85">
              {loc.culture_history}
            </p>
          </Section>
        )}

        {loc.activities && (
          <Section title="HOẠT ĐỘNG NÊN THỬ">
            <p className="text-[15px] leading-relaxed whitespace-pre-line text-foreground/85">
              {loc.activities}
            </p>
          </Section>
        )}

        {loc.suggestions && (
          <Section title="GỢI Ý THAM QUAN">
            <p className="text-[15px] leading-relaxed whitespace-pre-line text-foreground/85">
              {loc.suggestions}
            </p>
          </Section>
        )}

        {(loc.visit_time || loc.ticket_price || loc.notes || loc.contact) && (
          <Section title="THÔNG TIN THAM QUAN">
            <dl className="grid gap-3 sm:grid-cols-2">
              {loc.visit_time && (
                <InfoRow icon={Clock} label="Thời gian tham quan" value={loc.visit_time} />
              )}
              {loc.ticket_price && (
                <InfoRow icon={Ticket} label="Giá vé" value={loc.ticket_price} />
              )}
              {loc.notes && <InfoRow icon={Info} label="Lưu ý" value={loc.notes} />}
              {loc.contact && <InfoRow icon={Info} label="Liên hệ" value={loc.contact} />}
            </dl>
          </Section>
        )}

        <Section title="THƯ VIỆN HÌNH ẢNH">
          <ImageGallery images={images.data ?? []} />
        </Section>

        <Section title="🎥 VIDEO MINH HOẠ">
          {videoSrc ? (
            <div className="overflow-hidden rounded-3xl shadow-elevated">
              <iframe
                src={videoSrc}
                title={`Video ${loc.name}`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture"
                allowFullScreen
                className="aspect-video w-full"
              />
            </div>
          ) : loc.video_url ? (
            <video
              src={loc.video_url}
              controls
              preload="metadata"
              playsInline
              className="w-full rounded-3xl shadow-elevated"
            />
          ) : (
            <p className="rounded-3xl border border-dashed border-border bg-secondary/50 p-6 text-center text-sm text-muted-foreground">
              Video đang được cập nhật.
            </p>
          )}
        </Section>

        {(loc.audio_vi_url || loc.audio_en_url) && (
          <Section title="🎧 AUDIO GUIDE – THUYẾT MINH">
            <div className="space-y-4">
              {loc.audio_vi_url && (
                <AudioPlayer
                  url={loc.audio_vi_url}
                  flag="🇻🇳"
                  title="THUYẾT MINH TIẾNG VIỆT"
                />
              )}
              {loc.audio_en_url && (
                <AudioPlayer
                  url={loc.audio_en_url}
                  flag="🇬🇧"
                  title="ENGLISH AUDIO GUIDE"
                />
              )}
            </div>
          </Section>
        )}

        <Section title="VỊ TRÍ TRÊN BẢN ĐỒ">
          {mapSrc ? (
            <div className="overflow-hidden rounded-3xl shadow-elevated">
              <iframe
                src={mapSrc}
                title={`Bản đồ ${loc.name}`}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="aspect-[4/3] w-full sm:aspect-[16/9]"
              />
            </div>
          ) : (
            <p className="rounded-3xl border border-dashed border-border bg-secondary/50 p-6 text-center text-sm text-muted-foreground">
              Vị trí bản đồ đang được cập nhật.
            </p>
          )}
          <Button asChild size="lg" className="mt-3 h-13 w-full rounded-2xl text-base font-bold">
            <a href={directionsUrl(loc)} target="_blank" rel="noreferrer">
              <Navigation className="size-5" /> CHỈ ĐƯỜNG
            </a>
          </Button>
        </Section>

        <div className="mt-10 grid gap-2 sm:grid-cols-2">
          <Button asChild variant="outline" className="h-12 rounded-2xl font-semibold">
            <Link to={region ? "/khu-vuc/$slug" : "/dia-diem"} params={{ slug: region?.slug ?? "" }}>
              <ArrowLeft className="size-4" /> QUAY LẠI
            </Link>
          </Button>
          <Button asChild className="h-12 rounded-2xl font-semibold">
            <Link to="/dia-diem">KHÁM PHÁ ĐỊA ĐIỂM KHÁC</Link>
          </Button>
        </div>
      </div>
    </article>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Clock;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl bg-card p-4 shadow-elevated">
      <dt className="flex items-center gap-1.5 text-xs font-bold text-primary">
        <Icon className="size-4" aria-hidden /> {label}
      </dt>
      <dd className="mt-1 text-sm text-foreground/85">{value}</dd>
    </div>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
  ArrowLeft,
  Bike,
  Clock,
  Heart,
  MapPin,
  Navigation,
  PlayCircle,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AudioPlayer } from "@/components/audio-guide";
import { ImageGallery } from "@/components/image-gallery";
import { BookingDialog, type BookingTarget } from "@/components/booking-dialog";
import { useFavorites } from "@/hooks/use-favorites";
import { embedVideoSrc, fetchLocations } from "@/lib/mien-tour";
import { fetchGuides, fetchTour, fetchTourImages, GUIDE_DISCLAIMER } from "@/lib/services";
import { coverFor } from "@/lib/images";

export const Route = createFileRoute("/tour/$slug")({
  head: () => ({
    meta: [
      { title: "Chi tiết tour | MIỀN TOUR" },
      {
        name: "description",
        content:
          "Lịch trình, bản đồ, video, thư viện ảnh và Audio Guide Việt – Anh cho tour tham quan của bạn.",
      },
      { property: "og:title", content: "Chi tiết tour | MIỀN TOUR" },
      {
        property: "og:description",
        content: "Xem lịch trình chi tiết và bắt đầu tour cùng MIỀN TOUR.",
      },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TourDetailPage,
});

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="text-xl font-extrabold text-primary">{title}</h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function TourDetailPage() {
  const { slug } = Route.useParams();
  const [wantGuide, setWantGuide] = useState(false);
  const [booking, setBooking] = useState<BookingTarget | null>(null);

  const tour = useQuery({ queryKey: ["tour", slug], queryFn: () => fetchTour(slug) });
  const images = useQuery({
    queryKey: ["tour-images", tour.data?.id],
    queryFn: () => fetchTourImages(tour.data!.id),
    enabled: Boolean(tour.data?.id),
  });
  const locations = useQuery({
    queryKey: ["locations", "all"],
    queryFn: () => fetchLocations(),
  });
  const guides = useQuery({ queryKey: ["guides"], queryFn: () => fetchGuides() });

  if (tour.isLoading)
    return <div className="mx-auto h-96 max-w-3xl animate-pulse rounded-3xl bg-secondary" />;

  const t = tour.data;
  if (!t) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-20 text-center">
        <h1 className="text-2xl font-extrabold text-primary">Không tìm thấy tour</h1>
        <Link to="/tour" className="mt-4 inline-block font-semibold text-primary">
          Xem các tour khác
        </Link>
      </div>
    );
  }

  const place = (locations.data ?? []).find((l) => l.id === t.location_id);
  const videoSrc = t.video_url ? embedVideoSrc(t.video_url) : null;

  return (
    <article>
      <div className="relative">
        <img
          src={coverFor(t.slug, t.cover_image_url)}
          alt={t.name}
          className="h-56 w-full object-cover sm:h-80"
        />
        <div className="absolute inset-0 bg-gradient-hero" />
        <button
          type="button"
          onClick={() => fav.toggle(t.slug)}
          aria-pressed={fav.has(t.slug)}
          aria-label={fav.has(t.slug) ? "Bỏ khỏi yêu thích" : "Lưu tour yêu thích"}
          className="absolute right-4 top-4 grid size-11 place-items-center rounded-full bg-background/90 shadow-elevated"
        >
          <Heart
            className={`size-5 ${fav.has(t.slug) ? "fill-primary text-primary" : "text-primary"}`}
          />
        </button>
        <div className="absolute inset-x-0 bottom-0 mx-auto max-w-3xl px-4 pb-6">
          <h1 className="text-2xl font-extrabold text-background sm:text-4xl">{t.name}</h1>
          {t.summary && <p className="mt-1 text-sm text-background/90">{t.summary}</p>}
        </div>
      </div>


      <div className="mx-auto max-w-3xl px-4 pb-6">
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <Fact icon={Clock} label="Thời gian" value={t.duration_label || "Đang cập nhật"} />
          <Fact
            icon={MapPin}
            label="Khoảng cách"
            value={t.distance_km > 0 ? `${t.distance_km} km` : "Đang cập nhật"}
          />
          <Fact icon={Bike} label="Phương tiện" value={t.transport || "Linh hoạt"} />
        </div>

        {t.price_note && (
          <p className="mt-3 rounded-2xl bg-secondary/70 px-4 py-3 text-sm text-foreground/85">
            Giá tham khảo: {t.price_note}
          </p>
        )}

        {t.itinerary && (
          <Section title="LỊCH TRÌNH">
            <p className="whitespace-pre-line text-[15px] leading-relaxed text-foreground/85">
              {t.itinerary}
            </p>
          </Section>
        )}

        <Section title="THƯ VIỆN HÌNH ẢNH">
          <ImageGallery images={images.data ?? []} />
        </Section>

        <Section title="🎥 VIDEO">
          {videoSrc ? (
            <div className="overflow-hidden rounded-3xl shadow-elevated">
              <iframe
                src={videoSrc}
                title={`Video ${t.name}`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture"
                allowFullScreen
                className="aspect-video w-full"
              />
            </div>
          ) : t.video_url ? (
            <video
              src={t.video_url}
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

        {t.audio_vi_url && (
          <Section title="🇻🇳 AUDIO GUIDE – TIẾNG VIỆT">
            <AudioPlayer url={t.audio_vi_url} flag="🇻🇳" title="THUYẾT MINH TIẾNG VIỆT" />
          </Section>
        )}
        {t.audio_en_url && (
          <Section title="🇬🇧 AUDIO GUIDE – ENGLISH">
            <AudioPlayer url={t.audio_en_url} flag="🇬🇧" title="ENGLISH AUDIO GUIDE" />
          </Section>
        )}

        <Section title="BẢN ĐỒ HÀNH TRÌNH">
          {t.map_embed_url ? (
            <div className="overflow-hidden rounded-3xl shadow-elevated">
              <iframe
                src={t.map_embed_url}
                title={`Bản đồ ${t.name}`}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="aspect-[4/3] w-full sm:aspect-[16/9]"
              />
            </div>
          ) : (
            <p className="rounded-3xl border border-dashed border-border bg-secondary/50 p-6 text-center text-sm text-muted-foreground">
              Bản đồ hành trình đang được cập nhật.
            </p>
          )}
        </Section>

        <Section title="👨‍🏫 THUÊ HƯỚNG DẪN VIÊN">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setWantGuide(false)}
              className={`rounded-2xl px-4 py-2.5 text-sm font-semibold ${
                wantGuide ? "bg-secondary text-secondary-foreground" : "bg-primary text-primary-foreground"
              }`}
            >
              ☑ Không thuê
            </button>
            <button
              onClick={() => setWantGuide(true)}
              className={`rounded-2xl px-4 py-2.5 text-sm font-semibold ${
                wantGuide ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
              }`}
            >
              ☑ Thuê hướng dẫn viên
            </button>
          </div>

          {wantGuide && (
            <div className="mt-4 space-y-4">
              {(guides.data ?? []).map((g) => (
                <div key={g.id} className="rounded-3xl bg-card p-4 shadow-elevated">
                  <div className="flex gap-3">
                    {g.photo_url && (
                      <img
                        src={g.photo_url}
                        alt={g.full_name}
                        loading="lazy"
                        className="size-20 shrink-0 rounded-2xl object-cover"
                      />
                    )}
                    <div className="min-w-0">
                      <p className="font-extrabold text-primary">{g.full_name}</p>
                      <p className="flex items-center gap-1 text-xs font-semibold text-gold">
                        <Star className="size-3.5 fill-current" aria-hidden /> {g.rating}/5
                      </p>
                      {g.languages.length > 0 && (
                        <p className="mt-1 text-xs text-muted-foreground">
                          Ngoại ngữ: {g.languages.join(", ")}
                        </p>
                      )}
                      {g.experience && (
                        <p className="text-xs text-muted-foreground">Kinh nghiệm: {g.experience}</p>
                      )}
                      {g.service_area && (
                        <p className="text-xs text-muted-foreground">Khu vực: {g.service_area}</p>
                      )}
                      {g.price_note && (
                        <p className="text-xs font-semibold text-foreground/80">
                          Giá tham khảo: {g.price_note}
                        </p>
                      )}
                    </div>
                  </div>
                  <Button
                    className="mt-3 h-12 w-full rounded-2xl font-bold"
                    onClick={() =>
                      setBooking({
                        service_type: "guide",
                        guide_id: g.id,
                        tour_id: t.id,
                        title: `Thuê hướng dẫn viên ${g.full_name} – ${t.name}`,
                      })
                    }
                  >
                    📩 Đăng ký thuê
                  </Button>
                </div>
              ))}
              {(guides.data ?? []).length === 0 && (
                <p className="rounded-3xl border border-dashed border-border bg-secondary/50 p-6 text-center text-sm text-muted-foreground">
                  Danh sách hướng dẫn viên đang được cập nhật.
                </p>
              )}
              <p className="rounded-2xl bg-gold-soft p-4 text-xs leading-relaxed text-foreground/80">
                {GUIDE_DISCLAIMER}
              </p>
            </div>
          )}
        </Section>

        <div className="mt-8 grid gap-2 sm:grid-cols-2">
          <Button
            size="lg"
            className="h-13 rounded-2xl text-base font-bold"
            onClick={() =>
              setBooking({ service_type: "tour", tour_id: t.id, title: `Bắt đầu ${t.name}` })
            }
          >
            <PlayCircle className="size-5" /> BẮT ĐẦU TOUR
          </Button>
          {place ? (
            <Button asChild variant="outline" className="h-13 rounded-2xl font-semibold">
              <Link to="/dia-diem/$slug" params={{ slug: place.slug }}>
                <Navigation className="size-4" /> XEM ĐỊA ĐIỂM
              </Link>
            </Button>
          ) : (
            <Button asChild variant="outline" className="h-13 rounded-2xl font-semibold">
              <Link to="/tour">
                <ArrowLeft className="size-4" /> TẤT CẢ TOUR
              </Link>
            </Button>
          )}
        </div>
      </div>

      <BookingDialog target={booking} onOpenChange={(o) => !o && setBooking(null)} />
    </article>
  );
}

function Fact({
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
      <p className="flex items-center gap-1.5 text-xs font-bold text-primary">
        <Icon className="size-4" aria-hidden /> {label}
      </p>
      <p className="mt-1 text-sm text-foreground/85">{value}</p>
    </div>
  );
}

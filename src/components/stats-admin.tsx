import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Eye, Headphones, MapPin, Route, Video } from "lucide-react";
import { fetchAnalytics, type AnalyticsRow } from "@/lib/analytics";
import { Skeleton } from "@/components/ui/skeleton";

const RANGES = [
  { days: 7, label: "7 ngày" },
  { days: 30, label: "30 ngày" },
  { days: 365, label: "1 năm" },
] as const;

function topOf(rows: AnalyticsRow[], type: string, limit = 5) {
  const map = new Map<string, number>();
  for (const r of rows) {
    if (r.event_type !== type) continue;
    const label = r.target_label || r.path || "(không tên)";
    map.set(label, (map.get(label) ?? 0) + 1);
  }
  return [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, limit);
}

export function StatsAdmin() {
  const [days, setDays] = useState<number>(30);
  const q = useQuery({
    queryKey: ["analytics", days],
    queryFn: () => fetchAnalytics(days),
  });

  const rows = useMemo(() => q.data ?? [], [q.data]);
  const views = rows.filter((r) => r.event_type === "page_view").length;
  const tours = topOf(rows, "tour_view");
  const places = topOf(rows, "location_view");
  const videos = topOf(rows, "video_play");
  const audios = topOf(rows, "audio_play");

  return (
    <div className="animate-fade-in mt-6 space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-extrabold text-primary">THỐNG KÊ HOẠT ĐỘNG</h2>
        <div className="flex gap-2">
          {RANGES.map((r) => (
            <button
              key={r.days}
              onClick={() => setDays(r.days)}
              className={`rounded-2xl px-3 py-1.5 text-xs font-semibold transition-colors ${
                days === r.days
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-accent"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {q.isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-3xl" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-3">
            <StatCard icon={<Eye className="size-5" />} label="Lượt truy cập" value={views} />
            <StatCard
              icon={<Video className="size-5" />}
              label="Lượt xem video"
              value={rows.filter((r) => r.event_type === "video_play").length}
            />
            <StatCard
              icon={<Headphones className="size-5" />}
              label="Lượt nghe audio"
              value={rows.filter((r) => r.event_type === "audio_play").length}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <TopList title="TOUR PHỔ BIẾN" icon={<Route className="size-4" />} items={tours} />
            <TopList title="ĐỊA ĐIỂM NỔI BẬT" icon={<MapPin className="size-4" />} items={places} />
            <TopList title="VIDEO ĐƯỢC XEM NHIỀU" icon={<Video className="size-4" />} items={videos} />
            <TopList
              title="AUDIO ĐƯỢC NGHE NHIỀU"
              icon={<Headphones className="size-4" />}
              items={audios}
            />
          </div>
        </>
      )}
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-3xl bg-gradient-brand p-5 text-primary-foreground shadow-floating transition-transform hover:-translate-y-0.5">
      <div className="flex items-center gap-2 text-sm font-semibold opacity-90">
        {icon}
        {label}
      </div>
      <p className="mt-2 text-3xl font-extrabold">{value.toLocaleString("vi-VN")}</p>
    </div>
  );
}

function TopList({
  title,
  icon,
  items,
}: {
  title: string;
  icon: React.ReactNode;
  items: [string, number][];
}) {
  const max = items[0]?.[1] ?? 1;
  return (
    <section className="rounded-3xl bg-card p-5 shadow-elevated">
      <p className="flex items-center gap-2 text-sm font-extrabold text-primary">
        {icon}
        {title}
      </p>
      {items.length === 0 ? (
        <p className="mt-3 text-sm text-muted-foreground">Chưa có dữ liệu.</p>
      ) : (
        <ul className="mt-3 space-y-3">
          {items.map(([label, count]) => (
            <li key={label}>
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="min-w-0 truncate font-semibold">{label}</span>
                <span className="shrink-0 text-muted-foreground">{count}</span>
              </div>
              <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full rounded-full bg-gold-solid transition-all duration-500"
                  style={{ width: `${Math.max(6, (count / max) * 100)}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

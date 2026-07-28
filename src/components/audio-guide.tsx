import { useEffect, useRef, useState } from "react";
import { Pause, Play, Volume2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Track = { lang: "vi" | "en"; label: string; flag: string; url: string };

function fmt(t: number) {
  if (!Number.isFinite(t)) return "0:00";
  const m = Math.floor(t / 60);
  const s = Math.floor(t % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function AudioGuide({ vi, en }: { vi: string | null; en: string | null }) {
  const tracks: Track[] = [
    vi ? ({ lang: "vi", label: "TIẾNG VIỆT", flag: "🇻🇳", url: vi } as Track) : null,
    en ? ({ lang: "en", label: "ENGLISH", flag: "🇬🇧", url: en } as Track) : null,
  ].filter(Boolean) as Track[];

  const [active, setActive] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const ref = useRef<HTMLAudioElement>(null);

  const current = tracks[active];

  useEffect(() => {
    setPlaying(false);
    setTime(0);
    setDuration(0);
  }, [active]);

  if (tracks.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-border bg-secondary/50 p-6 text-center">
        <p className="text-sm text-muted-foreground">
          Audio Guide cho địa điểm này đang được cập nhật.
        </p>
      </div>
    );
  }

  const toggle = () => {
    const el = ref.current;
    if (!el) return;
    if (el.paused) {
      void el.play();
      setPlaying(true);
    } else {
      el.pause();
      setPlaying(false);
    }
  };

  return (
    <div className="rounded-3xl bg-gradient-brand p-5 text-primary-foreground shadow-floating">
      <div className="flex flex-wrap gap-2">
        {tracks.map((t, i) => (
          <button
            key={t.lang}
            onClick={() => setActive(i)}
            aria-pressed={i === active}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-semibold transition-colors",
              i === active
                ? "bg-card text-primary"
                : "bg-primary-foreground/15 text-primary-foreground",
            )}
          >
            {t.flag} {t.label}
          </button>
        ))}
      </div>

      <div className="mt-4 flex items-center gap-4">
        <button
          onClick={toggle}
          aria-label={playing ? "Tạm dừng" : "Phát"}
          className="grid size-14 shrink-0 place-items-center rounded-full bg-card text-primary shadow-elevated"
        >
          {playing ? <Pause className="size-6" /> : <Play className="ml-0.5 size-6" />}
        </button>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">
            Đang phát: {current.flag} {current.label}
          </p>
          <input
            type="range"
            min={0}
            max={duration || 0}
            step={0.1}
            value={time}
            aria-label="Thanh tiến trình"
            onChange={(e) => {
              const v = Number(e.target.value);
              setTime(v);
              if (ref.current) ref.current.currentTime = v;
            }}
            className="mt-2 h-1.5 w-full cursor-pointer appearance-none rounded-full bg-primary-foreground/30 accent-current"
          />
          <div className="mt-1 flex justify-between text-xs opacity-90">
            <span>{fmt(time)}</span>
            <span>{fmt(duration)}</span>
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-3">
        <Volume2 className="size-4 shrink-0" aria-hidden />
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={volume}
          aria-label="Âm lượng"
          onChange={(e) => {
            const v = Number(e.target.value);
            setVolume(v);
            if (ref.current) ref.current.volume = v;
          }}
          className="h-1.5 w-32 cursor-pointer appearance-none rounded-full bg-primary-foreground/30"
        />
      </div>

      <audio
        ref={ref}
        src={current.url}
        preload="metadata"
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)}
        onEnded={() => setPlaying(false)}
      />
    </div>
  );
}

import { useRef, useState } from "react";
import { Pause, Play, Volume2 } from "lucide-react";

function fmt(t: number) {
  if (!Number.isFinite(t)) return "0:00";
  const m = Math.floor(t / 60);
  const s = Math.floor(t % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

/** Trình phát cho MỘT tệp audio (tiếng Việt hoặc tiếng Anh) – hoàn toàn độc lập. */
export function AudioPlayer({
  url,
  title,
  flag,
}: {
  url: string;
  title: string;
  flag: string;
}) {
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const ref = useRef<HTMLAudioElement>(null);

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
      <p className="text-sm font-bold tracking-wide">
        {flag} {title}
      </p>

      <div className="mt-4 flex items-center gap-4">
        <button
          onClick={toggle}
          aria-label={playing ? `Tạm dừng ${title}` : `Phát ${title}`}
          className="grid size-14 shrink-0 place-items-center rounded-full bg-card text-primary shadow-elevated"
        >
          {playing ? <Pause className="size-6" /> : <Play className="ml-0.5 size-6" />}
        </button>
        <div className="min-w-0 flex-1">
          <input
            type="range"
            min={0}
            max={duration || 0}
            step={0.1}
            value={time}
            aria-label={`Thanh tiến trình ${title}`}
            onChange={(e) => {
              const v = Number(e.target.value);
              setTime(v);
              if (ref.current) ref.current.currentTime = v;
            }}
            className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-primary-foreground/30 accent-current"
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
          aria-label={`Âm lượng ${title}`}
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
        src={url}
        preload="metadata"
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)}
        onEnded={() => setPlaying(false)}
      />
    </div>
  );
}

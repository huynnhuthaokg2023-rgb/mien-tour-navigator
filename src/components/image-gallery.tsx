import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Minus, Plus, X } from "lucide-react";

type GalleryImage = { id: string; url: string; caption: string };

const MIN_ZOOM = 1;
const MAX_ZOOM = 5;

const clamp = (v: number, a: number, b: number) => Math.min(Math.max(v, a), b);

export function ImageGallery({ images }: { images: GalleryImage[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const stageRef = useRef<HTMLDivElement | null>(null);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const pinch = useRef<{ dist: number; zoom: number } | null>(null);
  const drag = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null);
  const swipe = useRef<{ x: number; y: number; t: number } | null>(null);

  const reset = useCallback(() => {
    setZoom(1);
    setOffset({ x: 0, y: 0 });
  }, []);

  const go = useCallback(
    (dir: number) => {
      setOpenIndex((i) => (i === null ? i : (i + dir + images.length) % images.length));
      reset();
    },
    [images.length, reset],
  );

  const close = useCallback(() => {
    setOpenIndex(null);
    reset();
  }, [reset]);

  // Keyboard navigation
  useEffect(() => {
    if (openIndex === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [openIndex, close, go]);

  const zoomAt = useCallback((next: number, px: number, py: number) => {
    setZoom((z) => {
      const nz = clamp(next, MIN_ZOOM, MAX_ZOOM);
      const k = nz / z;
      setOffset((o) =>
        nz === MIN_ZOOM ? { x: 0, y: 0 } : { x: px - (px - o.x) * k, y: py - (py - o.y) * k },
      );
      return nz;
    });
  }, []);

  // Non-passive wheel/pinch zoom
  useEffect(() => {
    const el = stageRef.current;
    if (!el || openIndex === null) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const dy = e.deltaY * (e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? 100 : 1);
      const rect = el.getBoundingClientRect();
      setZoom((z) => {
        const nz = clamp(z * Math.exp(-dy * 0.002), MIN_ZOOM, MAX_ZOOM);
        const px = e.clientX - rect.left;
        const py = e.clientY - rect.top;
        const k = nz / z;
        setOffset((o) =>
          nz === MIN_ZOOM ? { x: 0, y: 0 } : { x: px - (px - o.x) * k, y: py - (py - o.y) * k },
        );
        return nz;
      });
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [openIndex]);

  if (images.length === 0) {
    return (
      <p className="rounded-3xl border border-dashed border-border bg-secondary/50 p-6 text-center text-sm text-muted-foreground">
        Thư viện hình ảnh đang được cập nhật.
      </p>
    );
  }

  const current = openIndex === null ? null : images[openIndex];

  const onPointerDown = (e: React.PointerEvent) => {
    (e.target as Element).setPointerCapture?.(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      pinch.current = { dist: Math.hypot(a.x - b.x, a.y - b.y), zoom };
      drag.current = null;
      swipe.current = null;
    } else {
      drag.current = { x: e.clientX, y: e.clientY, ox: offset.x, oy: offset.y };
      swipe.current = { x: e.clientX, y: e.clientY, t: Date.now() };
    }
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!pointers.current.has(e.pointerId)) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const el = stageRef.current;
    if (pointers.current.size === 2 && pinch.current && el) {
      const [a, b] = [...pointers.current.values()];
      const dist = Math.hypot(a.x - b.x, a.y - b.y);
      const rect = el.getBoundingClientRect();
      zoomAt(
        pinch.current.zoom * (dist / pinch.current.dist),
        (a.x + b.x) / 2 - rect.left,
        (a.y + b.y) / 2 - rect.top,
      );
      return;
    }
    if (drag.current && zoom > 1) {
      setOffset({
        x: drag.current.ox + (e.clientX - drag.current.x),
        y: drag.current.oy + (e.clientY - drag.current.y),
      });
    }
  };

  const onPointerUp = (e: React.PointerEvent) => {
    pointers.current.delete(e.pointerId);
    if (pointers.current.size < 2) pinch.current = null;
    // swipe to change image only when not zoomed
    if (swipe.current && zoom === 1) {
      const dx = e.clientX - swipe.current.x;
      const dy = e.clientY - swipe.current.y;
      if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy)) go(dx < 0 ? 1 : -1);
    }
    swipe.current = null;
    drag.current = null;
  };

  return (
    <>
      <div className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-3 sm:px-0">
        {images.map((img, i) => (
          <button
            key={img.id}
            onClick={() => {
              setOpenIndex(i);
              reset();
            }}
            className="w-[78%] shrink-0 snap-center overflow-hidden rounded-2xl shadow-elevated sm:w-auto"
          >
            <img
              src={img.url}
              alt={img.caption || "Hình ảnh địa điểm"}
              loading="lazy"
              className="aspect-[4/3] w-full object-cover transition-transform duration-300 hover:scale-105"
            />
          </button>
        ))}
      </div>

      {current && (
        <div className="fixed inset-0 z-50 flex flex-col bg-foreground/95 select-none">
          <div className="flex items-center justify-between p-3 text-background">
            <span className="rounded-full bg-background/15 px-3 py-1 text-xs font-semibold">
              {(openIndex ?? 0) + 1} / {images.length}
            </span>
            <div className="flex items-center gap-2">
              <button
                aria-label="Thu nhỏ"
                onClick={() => zoomAt(zoom - 0.5, 0, 0)}
                className="grid size-10 place-items-center rounded-full bg-background/15"
              >
                <Minus className="size-5" />
              </button>
              <button
                aria-label="Phóng to"
                onClick={() => {
                  const r = stageRef.current?.getBoundingClientRect();
                  zoomAt(zoom + 0.5, (r?.width ?? 0) / 2, (r?.height ?? 0) / 2);
                }}
                className="grid size-10 place-items-center rounded-full bg-background/15"
              >
                <Plus className="size-5" />
              </button>
              <button
                aria-label="Đóng"
                onClick={close}
                className="grid size-10 place-items-center rounded-full bg-card text-foreground"
              >
                <X className="size-5" />
              </button>
            </div>
          </div>

          <div
            ref={stageRef}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            onDoubleClick={(e) => {
              const r = stageRef.current!.getBoundingClientRect();
              zoomAt(zoom > 1 ? 1 : 2.5, e.clientX - r.left, e.clientY - r.top);
            }}
            className="relative flex-1 touch-none overflow-hidden"
            style={{ cursor: zoom > 1 ? "grab" : "zoom-in" }}
          >
            <img
              key={current.id}
              src={current.url}
              alt={current.caption || "Hình ảnh địa điểm"}
              draggable={false}
              className="absolute inset-0 mx-auto h-full w-full object-contain"
              style={{
                transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
                transformOrigin: "0 0",
                transition: pinch.current || drag.current ? "none" : "transform 120ms ease-out",
              }}
            />

            {images.length > 1 && (
              <>
                <button
                  aria-label="Ảnh trước"
                  onClick={() => go(-1)}
                  className="absolute left-3 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-background/80 text-foreground"
                >
                  <ChevronLeft className="size-6" />
                </button>
                <button
                  aria-label="Ảnh kế tiếp"
                  onClick={() => go(1)}
                  className="absolute right-3 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-background/80 text-foreground"
                >
                  <ChevronRight className="size-6" />
                </button>
              </>
            )}
          </div>

          {current.caption && (
            <p className="px-4 pb-3 text-center text-sm text-background/90">{current.caption}</p>
          )}

          <div className="-mx-0 flex gap-2 overflow-x-auto px-3 pb-4">
            {images.map((img, i) => (
              <button
                key={img.id}
                onClick={() => {
                  setOpenIndex(i);
                  reset();
                }}
                aria-label={`Xem ảnh ${i + 1}`}
                className={
                  i === openIndex
                    ? "size-16 shrink-0 overflow-hidden rounded-xl ring-2 ring-background"
                    : "size-16 shrink-0 overflow-hidden rounded-xl opacity-60"
                }
              >
                <img src={img.url} alt="" className="size-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

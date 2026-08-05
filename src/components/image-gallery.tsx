import { useState } from "react";
import { X } from "lucide-react";

type GalleryImage = { id: string; url: string; caption: string };

export function ImageGallery({ images }: { images: GalleryImage[] }) {

  const [openIndex, setOpenIndex] = useState<number | null>(null);

  if (images.length === 0) {
    return (
      <p className="rounded-3xl border border-dashed border-border bg-secondary/50 p-6 text-center text-sm text-muted-foreground">
        Thư viện hình ảnh đang được cập nhật.
      </p>
    );
  }

  return (
    <>
      <div className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-3 sm:px-0">
        {images.map((img, i) => (
          <button
            key={img.id}
            onClick={() => setOpenIndex(i)}
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

      {openIndex !== null && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-foreground/85 p-4"
          onClick={() => setOpenIndex(null)}
        >
          <button
            aria-label="Đóng"
            className="absolute right-4 top-4 grid size-10 place-items-center rounded-full bg-card text-foreground"
          >
            <X className="size-5" />
          </button>
          <figure onClick={(e) => e.stopPropagation()} className="max-w-3xl">
            <img
              src={images[openIndex].url}
              alt={images[openIndex].caption || "Hình ảnh địa điểm"}
              className="max-h-[80dvh] w-full rounded-2xl object-contain"
            />
            {images[openIndex].caption && (
              <figcaption className="mt-2 text-center text-sm text-background">
                {images[openIndex].caption}
              </figcaption>
            )}
          </figure>
        </div>
      )}
    </>
  );
}

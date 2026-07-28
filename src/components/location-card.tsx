import { Link } from "@tanstack/react-router";
import { ArrowRight, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { coverFor } from "@/lib/images";
import type { TourLocation } from "@/lib/mien-tour";

export function LocationCard({ location }: { location: TourLocation }) {
  return (
    <article className="group overflow-hidden rounded-3xl bg-card shadow-elevated transition-shadow hover:shadow-floating">
      <Link
        to="/dia-diem/$slug"
        params={{ slug: location.slug }}
        className="block overflow-hidden"
      >
        <img
          src={coverFor(location.slug, location.cover_image_url)}
          alt={location.name}
          loading="lazy"
          className="aspect-[16/10] w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </Link>
      <div className="space-y-2.5 p-4">
        <h3 className="text-lg leading-snug font-bold text-primary">{location.name}</h3>
        {location.address && (
          <p className="flex items-start gap-1.5 text-sm text-muted-foreground">
            <MapPin className="mt-0.5 size-4 shrink-0" aria-hidden />
            <span>{location.address}</span>
          </p>
        )}
        {location.short_description && (
          <p className="line-clamp-3 text-sm text-foreground/80">
            {location.short_description}
          </p>
        )}
        <Button asChild className="mt-1 h-11 w-full rounded-2xl font-semibold">
          <Link to="/dia-diem/$slug" params={{ slug: location.slug }}>
            KHÁM PHÁ <ArrowRight className="size-4" />
          </Link>
        </Button>
      </div>
    </article>
  );
}

import { Link } from "@tanstack/react-router";
import { Bike, Clock, MapPin } from "lucide-react";
import { coverFor } from "@/lib/images";

export function TourCard({
  tour,
}: {
  tour: {
    slug: string;
    name: string;
    summary: string;
    duration_label: string;
    distance_km: number;
    transport: string;
    cover_image_url: string | null;
  };
}) {
  return (
    <Link
      to="/tour/$slug"
      params={{ slug: tour.slug }}
      className="group hover-lift animate-fade-in overflow-hidden rounded-3xl bg-card shadow-elevated"
    >
      <img
        src={coverFor(tour.slug, tour.cover_image_url)}
        alt={tour.name}
        loading="lazy"
        className="aspect-[16/10] w-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
      <div className="p-4">
        <h3 className="text-lg font-extrabold text-primary">{tour.name}</h3>
        {tour.summary && (
          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{tour.summary}</p>
        )}
        <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold text-secondary-foreground">
          {tour.duration_label && (
            <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1">
              <Clock className="size-3.5" aria-hidden /> {tour.duration_label}
            </span>
          )}
          {tour.distance_km > 0 && (
            <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1">
              <MapPin className="size-3.5" aria-hidden /> {tour.distance_km} km
            </span>
          )}
          {tour.transport && (
            <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1">
              <Bike className="size-3.5" aria-hidden /> {tour.transport}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

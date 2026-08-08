import { useCallback, useEffect, useState } from "react";

export type FavoriteKind = "location" | "tour";

const KEYS: Record<FavoriteKind, string> = {
  location: "mien-tour:favorites",
  tour: "mien-tour:favorites-tours",
};
const EVENT = "mien-tour:favorites-changed";

function read(kind: FavoriteKind): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEYS[kind]);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

/** Danh sách địa điểm / tour yêu thích, lưu ngay trên thiết bị của khách. */
export function useFavorites(kind: FavoriteKind = "location") {
  const [slugs, setSlugs] = useState<string[]>([]);

  useEffect(() => {
    setSlugs(read(kind));
    const sync = () => setSlugs(read(kind));
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, [kind]);

  const toggle = useCallback(
    (slug: string) => {
      const current = read(kind);
      const next = current.includes(slug)
        ? current.filter((s) => s !== slug)
        : [...current, slug];
      window.localStorage.setItem(KEYS[kind], JSON.stringify(next));
      window.dispatchEvent(new Event(EVENT));
    },
    [kind],
  );

  const has = useCallback((slug: string) => slugs.includes(slug), [slugs]);

  return { slugs, toggle, has };
}

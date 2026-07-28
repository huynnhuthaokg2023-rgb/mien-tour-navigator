import hero from "@/assets/hero-rachgia.jpg";
import dinhThan from "@/assets/place-dinh-than.jpg";
import denTuongNiem from "@/assets/place-den-tuong-niem.jpg";

const bySlug: Record<string, string> = {
  "rach-gia": hero,
  "dinh-than-nguyen-trung-truc": dinhThan,
  "den-tuong-niem-anh-hung-liet-si": denTuongNiem,
};

export const heroImage = hero;

export function coverFor(slug: string, url: string | null | undefined): string {
  return url || bySlug[slug] || hero;
}

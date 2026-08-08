import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Compass, Menu, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

const nav = [
  { to: "/", label: "🏠 TRANG CHỦ" },
  { to: "/dia-diem", label: "📍 ĐỊA ĐIỂM" },
  { to: "/tour", label: "🗺️ TOUR" },
  { to: "/thue-xe", label: "🚐 THUÊ XE" },
  { to: "/huong-dan-vien", label: "👨‍🏫 HƯỚNG DẪN VIÊN" },
  { to: "/yeu-thich", label: "❤️ YÊU THÍCH" },
  { to: "/su-kien", label: "📅 SỰ KIỆN" },
  { to: "/gioi-thieu", label: "ℹ️ GIỚI THIỆU" },
  { to: "/lien-he", label: "📞 LIÊN HỆ" },
] as const;

const SLOGAN = "Chân chạm đất bằng, hồn chạm văn hoá.";

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex min-h-16 max-w-6xl items-center justify-between gap-4 px-4 py-2">
        <Link to="/" className="flex min-w-0 items-center gap-2">
          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-gradient-brand text-primary-foreground">
            <Compass className="size-5" aria-hidden />
          </span>
          <span className="min-w-0">
            <span className="block truncate text-lg font-extrabold tracking-tight text-primary">
              MIỀN TOUR
            </span>
            <span className="animate-fade-in block truncate text-[11px] font-semibold tracking-wide text-gold italic sm:text-xs">
              {SLOGAN}
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-0.5 lg:flex">
          {nav.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeOptions={{ exact: item.to === "/" }}
              activeProps={{ className: "bg-secondary text-primary" }}
              className="rounded-full px-2.5 py-2 text-[11px] font-semibold whitespace-nowrap text-muted-foreground transition-colors hover:text-primary xl:text-[12px]"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            to="/tim-kiem"
            search={{ q: "" }}
            aria-label="Tìm kiếm"
            className="grid size-10 shrink-0 place-items-center rounded-xl bg-secondary text-primary"
          >
            <Search className="size-5" />
          </Link>
          <button
            onClick={() => setOpen((v) => !v)}
            aria-label="Mở menu"
            aria-expanded={open}
            className="grid size-10 shrink-0 place-items-center rounded-xl bg-secondary text-primary lg:hidden"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>

      </div>

      <div
        className={cn(
          "overflow-hidden border-t border-border/70 bg-background lg:hidden",
          open ? "block" : "hidden",
        )}
      >
        <nav className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-3">
          {nav.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setOpen(false)}
              activeOptions={{ exact: item.to === "/" }}
              activeProps={{ className: "bg-secondary text-primary" }}
              className="rounded-2xl px-4 py-3 text-sm font-semibold text-foreground/80"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-border/70 bg-secondary/50">
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-10 sm:grid-cols-2">
        <div>
          <p className="text-lg font-extrabold text-primary">MIỀN TOUR</p>
          <p className="animate-fade-in mt-1 text-sm font-semibold text-gold italic">
            {SLOGAN}
          </p>
          <p className="mt-2 max-w-sm text-sm text-muted-foreground">
            Nền tảng khám phá du lịch địa phương: thông tin, hình ảnh, video, thuyết minh
            đa ngôn ngữ và bản đồ chỉ đường.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2 text-sm sm:justify-items-end">
          {nav.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="text-muted-foreground hover:text-primary"
            >
              {item.label}
            </Link>
          ))}
          <Link to="/quan-tri" className="text-muted-foreground hover:text-primary">
            ĐĂNG NHẬP QUẢN TRỊ
          </Link>
        </div>
      </div>
      <p className="border-t border-border/70 py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} MIỀN TOUR – Khám phá địa phương, trải nghiệm trọn vẹn.
      </p>
    </footer>
  );
}

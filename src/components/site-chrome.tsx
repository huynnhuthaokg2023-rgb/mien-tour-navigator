import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Compass, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const nav = [
  { to: "/", label: "TRANG CHỦ" },
  { to: "/dia-diem", label: "ĐỊA ĐIỂM" },
  { to: "/huong-dan", label: "HƯỚNG DẪN SỬ DỤNG" },
  { to: "/gioi-thieu", label: "GIỚI THIỆU MIỀN TOUR" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
        <Link to="/" className="flex min-w-0 items-center gap-2">
          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-gradient-brand text-primary-foreground">
            <Compass className="size-5" aria-hidden />
          </span>
          <span className="truncate text-lg font-extrabold tracking-tight text-primary">
            MIỀN TOUR
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {nav.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeOptions={{ exact: item.to === "/" }}
              activeProps={{ className: "bg-secondary text-primary" }}
              className="rounded-full px-3.5 py-2 text-[13px] font-semibold text-muted-foreground transition-colors hover:text-primary"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <button
          onClick={() => setOpen((v) => !v)}
          aria-label="Mở menu"
          aria-expanded={open}
          className="grid size-10 shrink-0 place-items-center rounded-xl bg-secondary text-primary md:hidden"
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      <div
        className={cn(
          "overflow-hidden border-t border-border/70 bg-background md:hidden",
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
          <p className="mt-2 max-w-sm text-sm text-muted-foreground">
            Nền tảng khám phá du lịch địa phương: thông tin, hình ảnh, video, thuyết minh
            đa ngôn ngữ và bản đồ chỉ đường.
          </p>
        </div>
        <div className="flex flex-col gap-2 text-sm sm:items-end">
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

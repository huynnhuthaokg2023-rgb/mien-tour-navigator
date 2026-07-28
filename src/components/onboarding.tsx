import { useEffect, useState } from "react";
import { Compass, Headphones, MapPin, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "mien-tour-onboarded";

const steps = [
  {
    icon: MapPin,
    title: "BƯỚC 1 – CHỌN ĐỊA ĐIỂM",
    text: "Chọn khu vực hoặc địa phương bạn muốn khám phá.",
  },
  {
    icon: Compass,
    title: "BƯỚC 2 – KHÁM PHÁ ĐỊA DANH",
    text: "Nhấn vào từng địa điểm để xem thông tin, hình ảnh và video.",
  },
  {
    icon: Headphones,
    title: "BƯỚC 3 – NGHE THUYẾT MINH",
    text: "Chọn ngôn ngữ và nghe Audio Guide về địa điểm.",
  },
  {
    icon: Sparkles,
    title: "BƯỚC 4 – XEM VỊ TRÍ",
    text: "Xem vị trí trên Google Maps và sử dụng chức năng chỉ đường.",
  },
];

export function OnboardingSteps() {
  return (
    <ol className="space-y-3">
      {steps.map((s) => (
        <li
          key={s.title}
          className="flex gap-3 rounded-2xl bg-secondary/70 p-3.5 text-left"
        >
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground">
            <s.icon className="size-5" aria-hidden />
          </span>
          <div className="min-w-0">
            <p className="text-[13px] font-bold tracking-wide text-primary">{s.title}</p>
            <p className="mt-0.5 text-sm text-muted-foreground">{s.text}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

export function OnboardingSheet({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <button
        aria-label="Đóng hướng dẫn"
        onClick={onClose}
        className="absolute inset-0 bg-foreground/45 backdrop-blur-sm"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="onboarding-title"
        className="animate-rise relative max-h-[92dvh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-card p-5 shadow-floating sm:rounded-3xl"
      >
        <button
          onClick={onClose}
          aria-label="Đóng"
          className="absolute right-4 top-4 grid size-9 place-items-center rounded-full bg-secondary text-secondary-foreground"
        >
          <X className="size-4" />
        </button>
        <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-border sm:hidden" />
        <h2 id="onboarding-title" className="pr-10 text-2xl font-extrabold text-primary">
          Chào mừng bạn đến với MIỀN TOUR!
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Khám phá địa điểm – Tìm hiểu văn hóa – Lên kế hoạch cho hành trình của bạn.
        </p>
        <div className="mt-5">
          <OnboardingSteps />
        </div>
        <div className="mt-6 space-y-2">
          <Button size="lg" className="h-13 w-full rounded-2xl text-base" onClick={onClose}>
            BẮT ĐẦU KHÁM PHÁ
          </Button>
          <Button
            variant="ghost"
            className="w-full rounded-2xl text-muted-foreground"
            onClick={onClose}
          >
            BỎ QUA
          </Button>
        </div>
      </div>
    </div>
  );
}

export function useFirstVisitOnboarding() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(STORAGE_KEY)) setOpen(true);
    } catch {
      /* bỏ qua */
    }
  }, []);

  const close = () => {
    setOpen(false);
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* bỏ qua */
    }
  };

  return { open, close, reopen: () => setOpen(true) };
}

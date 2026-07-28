import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { OnboardingSteps } from "@/components/onboarding";

export const Route = createFileRoute("/huong-dan")({
  head: () => ({
    meta: [
      { title: "Hướng dẫn sử dụng | MIỀN TOUR" },
      {
        name: "description",
        content:
          "Bốn bước sử dụng MIỀN TOUR: chọn địa điểm, khám phá địa danh, nghe thuyết minh và xem vị trí trên bản đồ.",
      },
      { property: "og:title", content: "Hướng dẫn sử dụng | MIỀN TOUR" },
      {
        property: "og:description",
        content: "Hướng dẫn 4 bước khám phá địa danh cùng MIỀN TOUR.",
      },
    ],
  }),
  component: GuidePage,
});

function GuidePage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-3xl font-extrabold text-primary">
        Chào mừng bạn đến với MIỀN TOUR!
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Khám phá địa điểm – Tìm hiểu văn hóa – Lên kế hoạch cho hành trình của bạn.
      </p>
      <div className="mt-6">
        <OnboardingSteps />
      </div>
      <Button asChild size="lg" className="mt-6 h-13 w-full rounded-2xl text-base font-bold">
        <Link to="/dia-diem">BẮT ĐẦU KHÁM PHÁ</Link>
      </Button>
    </div>
  );
}

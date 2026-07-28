import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/gioi-thieu")({
  head: () => ({
    meta: [
      { title: "Giới thiệu MIỀN TOUR" },
      {
        name: "description",
        content:
          "MIỀN TOUR là nền tảng du lịch số giúp du khách khám phá địa danh địa phương qua thông tin, hình ảnh, video, thuyết minh và bản đồ.",
      },
      { property: "og:title", content: "Giới thiệu MIỀN TOUR" },
      {
        property: "og:description",
        content: "Nền tảng khám phá du lịch địa phương, tối ưu cho quét mã QR.",
      },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-3xl font-extrabold text-primary">Giới thiệu MIỀN TOUR</h1>
      <div className="mt-4 space-y-4 text-[15px] leading-relaxed text-foreground/85">
        <p>
          MIỀN TOUR là nền tảng khám phá du lịch địa phương, giúp du khách tìm hiểu các địa
          danh, xem hình ảnh, video, nghe thuyết minh bằng tiếng Việt hoặc tiếng Anh và xem
          vị trí trên bản đồ chỉ trong vài thao tác.
        </p>
        <p>
          Nền tảng được thiết kế ưu tiên điện thoại, tối ưu cho du khách truy cập sau khi
          quét mã QR ngay tại điểm tham quan. Nội dung được quản trị động: mỗi địa điểm đều
          có thông tin, thư viện ảnh, video, bản đồ và Audio Guide riêng.
        </p>
        <p>
          Khu vực đầu tiên là <strong>Rạch Giá</strong> – cửa ngõ biển Tây Nam Bộ, và hệ
          thống sẵn sàng mở rộng thêm các tỉnh, thành phố khác.
        </p>
      </div>
      <div className="mt-6 grid gap-2 sm:grid-cols-2">
        <Button asChild className="h-12 rounded-2xl font-semibold">
          <Link to="/dia-diem">KHÁM PHÁ ĐỊA ĐIỂM</Link>
        </Button>
        <Button asChild variant="outline" className="h-12 rounded-2xl font-semibold">
          <Link to="/huong-dan">HƯỚNG DẪN SỬ DỤNG</Link>
        </Button>
      </div>
    </div>
  );
}

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { Toaster } from "@/components/ui/sonner";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import { AiAssistant } from "@/components/ai-assistant";

import { trackEvent } from "@/lib/analytics";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-primary">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Không tìm thấy trang</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Trang bạn tìm không tồn tại hoặc đã được di chuyển.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-2xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Về trang chủ
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          Trang này chưa tải được
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Đã có lỗi xảy ra. Bạn có thể thử lại hoặc quay về trang chủ.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-2xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
          >
            Thử lại
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-2xl border border-input bg-background px-5 py-2.5 text-sm font-semibold text-foreground"
          >
            Về trang chủ
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "MIỀN TOUR – Khám phá điểm đến tiếp theo của bạn" },
      {
        name: "description",
        content:
          "Khám phá điểm đến địa phương cùng MIỀN TOUR: thông tin, hình ảnh, video, Audio Guide tiếng Việt – English và chỉ đường Google Maps.",
      },
      { property: "og:title", content: "MIỀN TOUR – Khám phá điểm đến tiếp theo của bạn" },
      {
        property: "og:description",
        content: "Khám phá điểm đến địa phương cùng MIỀN TOUR: thông tin, hình ảnh, video, Audio Guide tiếng Việt – English và chỉ đường Google Maps.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "theme-color", content: "#166534" },
      { name: "twitter:title", content: "MIỀN TOUR – Khám phá điểm đến tiếp theo của bạn" },
      { name: "twitter:description", content: "Khám phá điểm đến địa phương cùng MIỀN TOUR: thông tin, hình ảnh, video, Audio Guide tiếng Việt – English và chỉ đường Google Maps." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/f8350f8d-1369-49cd-b369-c248a0de5596/id-preview-e50f2df3--91253c11-12fe-46ea-a228-e23eead2cde6.lovable.app-1785240635843.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/f8350f8d-1369-49cd-b369-c248a0de5596/id-preview-e50f2df3--91253c11-12fe-46ea-a228-e23eead2cde6.lovable.app-1785240635843.png" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700;800&display=swap",
      },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="vi">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isAdminArea = pathname.startsWith("/quan-tri");

  useEffect(() => {
    if (isAdminArea) return;
    trackEvent({ event_type: "page_view", target_type: "page", target_label: pathname });
  }, [pathname, isAdminArea]);



  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex min-h-dvh flex-col">
        {!isAdminArea && <SiteHeader />}
        <main className="flex-1">
          <Outlet />
        </main>
        {!isAdminArea && <SiteFooter />}
      </div>
      {!isAdminArea && <AiAssistant />}
      <Toaster position="top-center" richColors />

    </QueryClientProvider>
  );
}

import { useState } from "react";
import { LocateFixed, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

type Target = { latitude: number | null; longitude: number | null };

function haversineKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const la1 = (a.lat * Math.PI) / 180;
  const la2 = (b.lat * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 + Math.sin(dLng / 2) ** 2 * Math.cos(la1) * Math.cos(la2);
  return 2 * R * Math.asin(Math.sqrt(h));
}

/** Nút tính khoảng cách từ vị trí hiện tại của khách tới địa điểm. */
export function DistanceBadge({ target }: { target: Target }) {
  const [state, setState] = useState<
    { status: "idle" | "loading" } | { status: "done"; km: number } | { status: "error"; msg: string }
  >({ status: "idle" });

  if (target.latitude == null || target.longitude == null) return null;

  const measure = () => {
    if (!("geolocation" in navigator)) {
      setState({ status: "error", msg: "Thiết bị không hỗ trợ định vị." });
      return;
    }
    setState({ status: "loading" });
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        setState({
          status: "done",
          km: haversineKm(
            { lat: pos.coords.latitude, lng: pos.coords.longitude },
            { lat: target.latitude as number, lng: target.longitude as number },
          ),
        }),
      () => setState({ status: "error", msg: "Không lấy được vị trí. Hãy cho phép định vị." }),
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  return (
    <div className="mt-3">
      <Button
        variant="outline"
        onClick={measure}
        disabled={state.status === "loading"}
        className="h-12 w-full rounded-2xl font-semibold"
      >
        {state.status === "loading" ? (
          <Loader2 className="size-5 animate-spin" />
        ) : (
          <LocateFixed className="size-5" />
        )}
        {state.status === "done"
          ? `CÁCH BẠN KHOẢNG ${state.km < 1 ? `${Math.round(state.km * 1000)} m` : `${state.km.toFixed(1)} km`}`
          : "TÍNH KHOẢNG CÁCH TỪ VỊ TRÍ CỦA BẠN"}
      </Button>
      {state.status === "error" && (
        <p className="mt-2 text-center text-xs text-destructive">{state.msg}</p>
      )}
    </div>
  );
}

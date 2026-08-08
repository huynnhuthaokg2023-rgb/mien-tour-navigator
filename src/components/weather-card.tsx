import { useQuery } from "@tanstack/react-query";
import { CloudRain, Droplets, Thermometer, Wind } from "lucide-react";

type WeatherProps = { latitude?: number | null; longitude?: number | null; name?: string };

type Current = {
  temperature_2m: number;
  relative_humidity_2m: number;
  precipitation: number;
  wind_speed_10m: number;
  weather_code: number;
};

const codeText = (code: number) => {
  if (code === 0) return "Trời quang";
  if (code <= 3) return "Có mây";
  if (code <= 48) return "Sương mù";
  if (code <= 57) return "Mưa phùn";
  if (code <= 67) return "Mưa";
  if (code <= 77) return "Mưa tuyết";
  if (code <= 82) return "Mưa rào";
  if (code <= 99) return "Dông";
  return "—";
};

async function fetchWeather(lat: number, lon: number): Promise<Current> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m&timezone=auto`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Không lấy được dữ liệu thời tiết");
  const json = (await res.json()) as { current: Current };
  return json.current;
}

function Item({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-2xl bg-secondary/60 p-3 text-center">
      <span className="text-primary">{icon}</span>
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <span className="text-sm font-bold text-foreground">{value}</span>
    </div>
  );
}

export function WeatherCard({ latitude, longitude, name }: WeatherProps) {
  const hasCoords = typeof latitude === "number" && typeof longitude === "number";
  const { data, isLoading, isError } = useQuery({
    queryKey: ["weather", latitude, longitude],
    queryFn: () => fetchWeather(latitude as number, longitude as number),
    enabled: hasCoords,
    staleTime: 10 * 60 * 1000,
  });

  if (!hasCoords) return null;

  return (
    <div className="rounded-3xl border border-border bg-card p-4 shadow-elevated">
      {isLoading && <p className="text-sm text-muted-foreground">Đang tải thời tiết…</p>}
      {isError && <p className="text-sm text-muted-foreground">Chưa lấy được dữ liệu thời tiết.</p>}
      {data && (
        <>
          <div className="mb-3 flex items-baseline justify-between gap-2">
            <p className="text-sm font-semibold text-muted-foreground">
              Thời tiết hiện tại{name ? ` · ${name}` : ""}
            </p>
            <p className="text-sm font-medium text-primary">{codeText(data.weather_code)}</p>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Item
              icon={<Thermometer className="size-5" />}
              label="Nhiệt độ"
              value={`${Math.round(data.temperature_2m)}°C`}
            />
            <Item
              icon={<CloudRain className="size-5" />}
              label="Mưa"
              value={`${data.precipitation} mm`}
            />
            <Item
              icon={<Droplets className="size-5" />}
              label="Độ ẩm"
              value={`${Math.round(data.relative_humidity_2m)}%`}
            />
            <Item
              icon={<Wind className="size-5" />}
              label="Gió"
              value={`${Math.round(data.wind_speed_10m)} km/h`}
            />
          </div>
        </>
      )}
    </div>
  );
}

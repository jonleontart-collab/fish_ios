'use client';

import { useEffect, useState } from "react";
import { Cloud, Loader2, MapPin, Navigation, Sparkles, Droplets, Wind, X } from "lucide-react";
import { Drawer } from "vaul";
import { useLocation } from "@/components/LocationProvider";

type WeatherPayload = {
  temperatureC: number;
  pressureMm: number;
  windKmh: number;
  biteIndex: number;
  biteLabel: string;
  condition: string;
  sunrise: string;
  sunset: string;
  source: "live" | "estimated";
};

export function HomeHero({
  userName,
  savedPlacesCount,
}: {
  userName: string;
  savedPlacesCount: number;
  pendingShoppingCount: number;
  upcomingTripsCount: number;
}) {
  const { location, status, error: locationError, refreshLocation } = useLocation();
  const [weather, setWeather] = useState<WeatherPayload | null>(null);
  const [loading, setLoading] = useState(false);
  const [weatherError, setWeatherError] = useState("");
  const [aiOpen, setAiOpen] = useState(false);

  useEffect(() => {
    if (!location) return;

    const currentLocation = location;
    let cancelled = false;

    async function loadWeather() {
      setLoading(true);
      setWeatherError("");

      try {
        const params = new URLSearchParams({
          latitude: String(currentLocation.latitude),
          longitude: String(currentLocation.longitude),
          name: [currentLocation.city, currentLocation.region].filter(Boolean).join(", ") || "Current location",
        });

        const response = await fetch(`/api/weather?${params.toString()}`, { cache: "no-store" });
        if (!response.ok) throw new Error("weather failed");

        const payload = (await response.json()) as WeatherPayload;
        if (!cancelled) setWeather(payload);
      } catch {
        if (!cancelled) setWeatherError("Сводка недоступна");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadWeather();
    return () => { cancelled = true; };
  }, [location]);

  const locationLabel = [location?.city, location?.region].filter(Boolean).join(", ") || 
    (location ? `${location.latitude.toFixed(2)}, ${location.longitude.toFixed(2)}` : "Определение позиции...");

  return (
    <section className="relative overflow-hidden rounded-[32px] bg-[#0a1520] shadow-sm -mt-2">
      {/* Background Graphic */}
      <div className="absolute inset-0 z-0">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-50" 
          style={{ backgroundImage: "url('/images/home-hero-bg.png')" }} 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a1520] via-[#0a1520]/60 to-transparent" />
      </div>

      <div className="relative z-10 p-6 space-y-7">
        
        {/* Header Row */}
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-1.5 w-full pr-4">
             <div className="flex items-center gap-1.5 text-text-muted">
               <MapPin size={14} className="text-primary" />
               <span className="text-[11px] font-bold uppercase tracking-wider">{location ? "Ваша локация" : "Подключение"}</span>
             </div>
             <h1 suppressHydrationWarning className="font-display text-[26px] font-bold tracking-tight text-white leading-tight line-clamp-2">
               {location ? (location.city || "Текущая геопозиция") : "Определение..."}
             </h1>
          </div>
          <button
            onClick={refreshLocation}
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/5 border border-white/10 text-white hover:bg-white/10 transition backdrop-blur-md"
          >
            <Navigation size={16} />
          </button>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-2 gap-3">
          
          {/* Weather Card */}
          <div className="rounded-[24px] bg-white/[0.03] border border-white/5 p-5 backdrop-blur-lg flex flex-col justify-between h-[140px] shadow-sm">
            <div className="flex items-center gap-2 text-[12px] font-semibold text-text-muted uppercase tracking-wider">
              <Cloud size={14} /> Погода
            </div>
            {loading ? (
              <div className="flex items-center gap-2 text-[13px] text-text-muted mt-auto mb-2">
                <Loader2 size={14} className="animate-spin" /> Загрузка...
              </div>
            ) : weather ? (
              <div className="mt-auto">
                <div className="font-display text-[36px] font-bold text-white tracking-tighter leading-none mt-1">
                  {weather.temperatureC}°<span className="text-lg text-text-muted ml-0.5">C</span>
                </div>
                <div className="text-[13px] text-white/50 mt-2 font-medium">
                  {weather.condition}
                </div>
              </div>
            ) : (
              <div className="text-[13px] text-white/50 mt-auto mb-1 flex items-center gap-2">
                 <Cloud size={16} /> {weatherError || "Нет данных"}
              </div>
            )}
          </div>

          {/* Activity / Score Card */}
          <div className="rounded-[24px] bg-white/[0.03] border border-white/5 p-5 backdrop-blur-lg flex flex-col justify-between h-[140px] shadow-sm">
            <div className="flex items-center gap-2 text-[12px] font-semibold text-text-muted uppercase tracking-wider">
              <Droplets size={14} /> Активность
            </div>
            <div className="mt-auto">
               <div className="font-display text-[32px] font-bold text-primary tracking-tighter leading-none mt-1">
                 {weather?.biteLabel ? (weather.biteIndex > 70 ? "Высокая" : weather.biteIndex > 40 ? "Средн." : "Низк.") : "—"}
               </div>
               <div className="text-[13px] text-white/50 mt-2 font-medium flex items-center justify-between">
                 <span>Клев сейчас</span>
               </div>
            </div>
          </div>
        </div>

        {/* One-Tap AI Action */}
        <button 
          onClick={() => setAiOpen(true)}
          disabled={loading || (!weather && !weatherError)}
          className="w-full relative overflow-hidden flex items-center justify-between px-6 py-4 rounded-[22px] bg-primary text-[#0a1520] font-bold text-[16px] group disabled:opacity-50 transition-all active:scale-95 shadow-[0_8px_24px_rgba(103,232,178,0.2)]"
        >
          <div className="flex items-center gap-3 relative z-10">
            <Sparkles size={20} className="text-[#0a1520] shrink-0" />
            <span className="truncate">Анализ водоема от ИИ</span>
          </div>
          <div className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/10">
             <Navigation size={14} className="rotate-90 text-[#0a1520]" />
          </div>
        </button>
      </div>

      {/* AI Drawer (Premium style) */}
      <Drawer.Root open={aiOpen} onOpenChange={setAiOpen}>
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 z-[1000] bg-black/80 backdrop-blur-md" />
          <Drawer.Content className="fixed bottom-0 left-0 right-0 z-[1001] mx-auto mt-24 flex max-h-[90vh] max-w-md flex-col rounded-t-[36px] bg-[#0c1218] border-t border-white/10 outline-none">
            <div className="flex-1 overflow-y-auto hide-scrollbar">
              
              {/* Sticky Drawer Header */}
              <div className="sticky top-0 z-10 bg-[#0c1218]/90 backdrop-blur-xl border-b border-white/5 px-6 py-5 flex items-center justify-between">
                 <div className="flex items-center gap-2.5">
                   <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                     <Sparkles size={20} />
                   </div>
                   <div>
                     <h2 className="text-lg font-bold text-white leading-tight">Сводка аналитики</h2>
                     <p suppressHydrationWarning className="text-[13px] text-text-muted mt-0.5">{location ? (location.city || "Текущая локация") : "Сводка гео"}</p>
                   </div>
                 </div>
                 <button onClick={() => setAiOpen(false)} className="w-8 h-8 flex flex-col items-center justify-center rounded-full bg-surface-soft text-text-muted hover:text-white transition">
                   <X size={18} />
                 </button>
              </div>

              <div className="p-6 pb-12 space-y-6">
                 {/* Greeting block */}
                 <div className="text-[17px] leading-relaxed text-white">
                    Привет, <strong>{userName}</strong>. Погода показывает <strong>{weather?.temperatureC ?? "--"}°C</strong>, а атмосферное давление — <strong>{weather?.pressureMm ?? "--"} мм рт.ст.</strong> 
                    Такие условия оптимальны для поиска хищника на выходе из ям или белой рыбы на бровках со слабым течением.
                 </div>

                 {/* Focus Area */}
                 <div className="space-y-3">
                    <h3 className="font-semibold text-text-muted text-[13px] uppercase tracking-wider">Где искать рыбу</h3>
                    <div className="grid gap-3">
                       <div className="rounded-[20px] bg-surface-soft border border-white/5 p-4">
                         <div className="font-bold text-white mb-1">Мелководные заливы</div>
                         <div className="text-[14px] text-text-muted leading-relaxed">Вода здесь быстрее прогревается на солнце, привлекая малька и мирную рыбу.</div>
                       </div>
                       <div className="rounded-[20px] bg-surface-soft border border-white/5 p-4">
                         <div className="font-bold text-white mb-1">Глубокие бровки (закат: {weather?.sunset ?? "--"})</div>
                         <div className="text-[14px] text-text-muted leading-relaxed">Ближе к вечеру крупный хищник выйдет из глубины к береговым откосам.</div>
                       </div>
                    </div>
                 </div>

                 {/* Gear Recommendations */}
                 <div className="space-y-3">
                    <h3 className="font-semibold text-text-muted text-[13px] uppercase tracking-wider">Рекомендуемые снасти</h3>
                    <div className="flex flex-wrap gap-2">
                       <span className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-[14px] font-semibold text-white">Джиг 10-18г</span>
                       <span className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-[14px] font-semibold text-white">Флюорокарбон</span>
                       <span className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-[14px] font-semibold text-white">Воблеры Minnow 90-110</span>
                       <span className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-[14px] font-semibold text-white">Эхолот</span>
                    </div>
                 </div>
              </div>
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    </section>
  );
}

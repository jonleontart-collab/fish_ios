'use client';

import { useEffect, useState } from "react";
import { Cloud, Droplets, Loader2, MapPin, Navigation, Navigation2, Sparkles, Waves, Wind, X } from "lucide-react";
import { Drawer } from "vaul";

import { useLocation } from "@/components/LocationProvider";
import { apiPath, withBasePath } from "@/lib/app-paths";
import type { LanguageCode, TranslationMap } from "@/lib/i18n";

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

const translations: TranslationMap<{
  yourLocation: string;
  connecting: string;
  currentPosition: string;
  resolving: string;
  weather: string;
  loading: string;
  noData: string;
  unavailable: string;
  activity: string;
  high: string;
  medium: string;
  low: string;
  biteNow: string;
  aiAnalysis: string;
  analyticsSummary: string;
  geoSummary: string;
  greeting: (userName: string, temperature: string, pressure: string) => string;
  whereToSearch: string;
  shallowBays: string;
  shallowBaysDescription: string;
  dropOffs: (sunset: string) => string;
  dropOffsDescription: string;
  recommendedGear: string;
  locationFallback: string;
}> = {
  ru: {
    yourLocation: "Ваша локация",
    connecting: "Подключение",
    currentPosition: "Текущая геопозиция",
    resolving: "Определение...",
    weather: "Погода",
    loading: "Загрузка...",
    noData: "Нет данных",
    unavailable: "Сводка недоступна",
    activity: "Активность",
    high: "Высокая",
    medium: "Средняя",
    low: "Низкая",
    biteNow: "Клев сейчас",
    aiAnalysis: "Анализ водоема от ИИ",
    analyticsSummary: "Сводка аналитики",
    geoSummary: "Сводка гео",
    greeting: (userName, temperature, pressure) =>
      `Привет, ${userName}. Погода показывает ${temperature}, а атмосферное давление — ${pressure}. Такие условия подходят для поиска рыбы на свалах, бровках и спокойных участках.`,
    whereToSearch: "Где искать рыбу",
    shallowBays: "Мелководные заливы",
    shallowBaysDescription: "Вода здесь прогревается быстрее и притягивает малька и мирную рыбу.",
    dropOffs: (sunset) => `Глубокие бровки (закат: ${sunset})`,
    dropOffsDescription: "Ближе к вечеру крупный хищник выходит из глубины к береговым откосам.",
    recommendedGear: "Рекомендуемые снасти",
    locationFallback: "Определение позиции...",
  },
  en: {
    yourLocation: "Your location",
    connecting: "Connecting",
    currentPosition: "Current position",
    resolving: "Resolving...",
    weather: "Weather",
    loading: "Loading...",
    noData: "No data",
    unavailable: "Summary unavailable",
    activity: "Activity",
    high: "High",
    medium: "Medium",
    low: "Low",
    biteNow: "Bite now",
    aiAnalysis: "AI water analysis",
    analyticsSummary: "Analytics summary",
    geoSummary: "Geo summary",
    greeting: (userName, temperature, pressure) =>
      `Hi, ${userName}. The weather shows ${temperature}, and the air pressure is ${pressure}. These conditions look promising around ledges, drop-offs, and calmer water.`,
    whereToSearch: "Where to search for fish",
    shallowBays: "Shallow bays",
    shallowBaysDescription: "Water warms faster here and draws baitfish and peaceful species.",
    dropOffs: (sunset) => `Deep drop-offs (sunset: ${sunset})`,
    dropOffsDescription: "Closer to evening, larger predators move from depth toward the shoreline edges.",
    recommendedGear: "Recommended tackle",
    locationFallback: "Resolving position...",
  },
  es: {
    yourLocation: "Tu ubicación",
    connecting: "Conectando",
    currentPosition: "Ubicación actual",
    resolving: "Resolviendo...",
    weather: "Clima",
    loading: "Cargando...",
    noData: "Sin datos",
    unavailable: "Resumen no disponible",
    activity: "Actividad",
    high: "Alta",
    medium: "Media",
    low: "Baja",
    biteNow: "Actividad ahora",
    aiAnalysis: "Análisis del agua con IA",
    analyticsSummary: "Resumen analítico",
    geoSummary: "Resumen geo",
    greeting: (userName, temperature, pressure) =>
      `Hola, ${userName}. El tiempo muestra ${temperature} y la presión es ${pressure}. Estas condiciones son favorables cerca de orillas, cortes y zonas tranquilas.`,
    whereToSearch: "Dónde buscar peces",
    shallowBays: "Bahías poco profundas",
    shallowBaysDescription: "El agua se calienta más rápido aquí y atrae alevines y peces pacíficos.",
    dropOffs: (sunset) => `Cortes profundos (puesta: ${sunset})`,
    dropOffsDescription: "Al atardecer, los depredadores grandes salen de la profundidad hacia la orilla.",
    recommendedGear: "Equipo recomendado",
    locationFallback: "Resolviendo ubicación...",
  },
  fr: {
    yourLocation: "Votre position",
    connecting: "Connexion",
    currentPosition: "Position actuelle",
    resolving: "Résolution...",
    weather: "Météo",
    loading: "Chargement...",
    noData: "Aucune donnée",
    unavailable: "Résumé indisponible",
    activity: "Activité",
    high: "Élevée",
    medium: "Moyenne",
    low: "Faible",
    biteNow: "Activité actuelle",
    aiAnalysis: "Analyse IA du plan d'eau",
    analyticsSummary: "Résumé analytique",
    geoSummary: "Résumé géo",
    greeting: (userName, temperature, pressure) =>
      `Bonjour, ${userName}. La météo indique ${temperature} et la pression est de ${pressure}. Ces conditions sont intéressantes près des cassures, bordures et zones calmes.`,
    whereToSearch: "Où chercher le poisson",
    shallowBays: "Baies peu profondes",
    shallowBaysDescription: "L'eau s'y réchauffe plus vite et attire les alevins et les poissons blancs.",
    dropOffs: (sunset) => `Cassures profondes (coucher: ${sunset})`,
    dropOffsDescription: "En fin de journée, les gros prédateurs quittent la profondeur vers les bordures.",
    recommendedGear: "Matériel conseillé",
    locationFallback: "Localisation...",
  },
  pt: {
    yourLocation: "Sua localização",
    connecting: "Conectando",
    currentPosition: "Posição atual",
    resolving: "Resolvendo...",
    weather: "Clima",
    loading: "Carregando...",
    noData: "Sem dados",
    unavailable: "Resumo indisponível",
    activity: "Atividade",
    high: "Alta",
    medium: "Média",
    low: "Baixa",
    biteNow: "Atividade agora",
    aiAnalysis: "Análise da água por IA",
    analyticsSummary: "Resumo analítico",
    geoSummary: "Resumo geográfico",
    greeting: (userName, temperature, pressure) =>
      `Olá, ${userName}. O tempo mostra ${temperature} e a pressão está em ${pressure}. Essas condições favorecem áreas de quebra, bordas e águas mais calmas.`,
    whereToSearch: "Onde procurar peixe",
    shallowBays: "Baías rasas",
    shallowBaysDescription: "A água aquece mais rápido aqui e atrai pequenos peixes e espécies pacíficas.",
    dropOffs: (sunset) => `Quedas profundas (pôr do sol: ${sunset})`,
    dropOffsDescription: "No fim do dia, os grandes predadores saem da profundidade para as bordas.",
    recommendedGear: "Equipamentos recomendados",
    locationFallback: "Resolvendo posição...",
  },
};

function getBiteLevelLabel(biteIndex: number | undefined, lang: LanguageCode) {
  const t = translations[lang];

  if (typeof biteIndex !== "number") {
    return "—";
  }

  if (biteIndex > 70) {
    return t.high;
  }

  if (biteIndex > 40) {
    return t.medium;
  }

  return t.low;
}

export function HomeHero({
  lang,
  userName,
  savedPlacesCount,
}: {
  lang: LanguageCode;
  userName: string;
  savedPlacesCount: number;
  pendingShoppingCount: number;
  upcomingTripsCount: number;
}) {
  const { location, refreshLocation } = useLocation();
  const [weather, setWeather] = useState<WeatherPayload | null>(null);
  const [loading, setLoading] = useState(false);
  const [weatherError, setWeatherError] = useState("");
  const [aiOpen, setAiOpen] = useState(false);
  const t = translations[lang];

  useEffect(() => {
    if (!location) {
      return;
    }

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

        const response = await fetch(apiPath(`/api/weather?${params.toString()}`), { cache: "no-store" });

        if (!response.ok) {
          throw new Error("weather failed");
        }

        const payload = (await response.json()) as WeatherPayload;

        if (!cancelled) {
          setWeather(payload);
        }
      } catch {
        if (!cancelled) {
          setWeatherError(t.unavailable);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadWeather();

    return () => {
      cancelled = true;
    };
  }, [location, t.unavailable]);

  return (
    <section className="relative -mt-2 overflow-hidden rounded-[32px] bg-[#0a1520] shadow-sm">
      <div className="absolute inset-0 z-0">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-50"
          style={{ backgroundImage: `url('${withBasePath("/images/home-hero-bg.png")}')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a1520] via-[#0a1520]/60 to-transparent" />
      </div>

      <div className="relative z-10 space-y-7 p-6">
        <div className="flex items-start justify-between">
          <div className="flex w-full flex-col gap-1.5 pr-4">
            <div className="flex items-center gap-1.5 text-text-muted">
              <MapPin size={14} className="text-primary" />
              <span className="text-[11px] font-bold uppercase tracking-wider">
                {location ? t.yourLocation : t.connecting}
              </span>
            </div>
            <h1 suppressHydrationWarning className="line-clamp-2 font-display text-[26px] font-bold leading-tight tracking-tight text-white">
              {location ? location.city || t.currentPosition : t.resolving}
            </h1>
          </div>
          <button
            onClick={refreshLocation}
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white backdrop-blur-md transition hover:bg-white/10"
          >
            <Navigation size={16} />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex h-[140px] flex-col justify-between rounded-[24px] border border-white/5 bg-white/[0.03] p-5 shadow-sm backdrop-blur-lg">
            <div className="flex items-center gap-2 text-[12px] font-semibold uppercase tracking-wider text-text-muted">
              <Cloud size={14} /> {t.weather}
            </div>
            {loading ? (
              <div className="mb-2 mt-auto flex items-center gap-2 text-[13px] text-text-muted">
                <Loader2 size={14} className="animate-spin" /> {t.loading}
              </div>
            ) : weather ? (
              <div className="mt-auto">
                <div className="mt-1 font-display text-[36px] font-bold leading-none tracking-tighter text-white">
                  {weather.temperatureC}°<span className="ml-0.5 text-lg text-text-muted">C</span>
                </div>
                <div className="mt-2 text-[13px] font-medium text-white/50">{weather.condition}</div>
              </div>
            ) : (
              <div className="mb-1 mt-auto flex items-center gap-2 text-[13px] text-white/50">
                <Cloud size={16} /> {weatherError || t.noData}
              </div>
            )}
          </div>

          <div className="flex h-[140px] flex-col justify-between rounded-[24px] border border-white/5 bg-white/[0.03] p-5 shadow-sm backdrop-blur-lg">
            <div className="flex items-center gap-2 text-[12px] font-semibold uppercase tracking-wider text-text-muted">
              <Droplets size={14} /> {t.activity}
            </div>
            <div className="mt-auto">
              <div className="mt-1 font-display text-[32px] font-bold leading-none tracking-tighter text-primary">
                {getBiteLevelLabel(weather?.biteIndex, lang)}
              </div>
              <div className="mt-2 flex items-center justify-between text-[13px] font-medium text-white/50">
                <span>{t.biteNow}</span>
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={() => setAiOpen(true)}
          disabled={loading || (!weather && !weatherError)}
          className="group relative flex w-full items-center justify-between overflow-hidden rounded-[22px] bg-primary px-6 py-4 text-[16px] font-bold text-[#0a1520] shadow-[0_8px_24px_rgba(103,232,178,0.2)] transition-all active:scale-95 disabled:opacity-50"
        >
          <div className="relative z-10 flex items-center gap-3">
            <Sparkles size={20} className="shrink-0 text-[#0a1520]" />
            <span className="truncate">{t.aiAnalysis}</span>
          </div>
          <div className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/10">
            <Navigation2 size={14} className="rotate-90 text-[#0a1520]" />
          </div>
        </button>
      </div>

      <Drawer.Root open={aiOpen} onOpenChange={setAiOpen}>
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 z-[1000] bg-black/80 backdrop-blur-md" />
          <Drawer.Content className="fixed bottom-0 left-0 right-0 z-[1001] mx-auto mt-24 flex max-h-[90vh] max-w-md flex-col rounded-t-[36px] border-t border-white/10 bg-[#0c1218] outline-none">
            <div className="hide-scrollbar flex-1 overflow-y-auto">
              <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/5 bg-[#0c1218]/90 px-6 py-5 backdrop-blur-xl">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Sparkles size={20} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold leading-tight text-white">{t.analyticsSummary}</h2>
                    <p suppressHydrationWarning className="mt-0.5 text-[13px] text-text-muted">
                      {location ? location.city || t.currentPosition : t.geoSummary}
                    </p>
                  </div>
                </div>
                <button onClick={() => setAiOpen(false)} className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-soft text-text-muted transition hover:text-white">
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-6 p-6 pb-12">
                <div className="text-[17px] leading-relaxed text-white">
                  {t.greeting(
                    userName,
                    weather ? `${weather.temperatureC}°C` : "--",
                    weather ? `${weather.pressureMm} mmHg` : "--",
                  )}
                </div>

                <div className="space-y-3">
                  <h3 className="text-[13px] font-semibold uppercase tracking-wider text-text-muted">{t.whereToSearch}</h3>
                  <div className="grid gap-3">
                    <div className="rounded-[20px] border border-white/5 bg-surface-soft p-4">
                      <div className="mb-1 font-bold text-white">{t.shallowBays}</div>
                      <div className="text-[14px] leading-relaxed text-text-muted">{t.shallowBaysDescription}</div>
                    </div>
                    <div className="rounded-[20px] border border-white/5 bg-surface-soft p-4">
                      <div className="mb-1 font-bold text-white">{t.dropOffs(weather?.sunset ?? "--")}</div>
                      <div className="text-[14px] leading-relaxed text-text-muted">{t.dropOffsDescription}</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-[13px] font-semibold uppercase tracking-wider text-text-muted">{t.recommendedGear}</h3>
                  <div className="flex flex-wrap gap-2">
                    {["Jig 10-18 g", "Fluorocarbon", "Minnow 90-110", "Echo sounder"].map((item) => (
                      <span key={item} className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-[14px] font-semibold text-white">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 rounded-[24px] border border-white/5 bg-white/[0.03] p-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-text-muted">
                      <Waves size={14} />
                      Water
                    </div>
                    <div className="text-sm font-semibold text-white">{savedPlacesCount} spots saved</div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-text-muted">
                      <Wind size={14} />
                      Wind
                    </div>
                    <div className="text-sm font-semibold text-white">{weather ? `${weather.windKmh} km/h` : "--"}</div>
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

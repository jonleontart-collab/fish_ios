'use client';

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Cloud,
  Droplets,
  Gauge,
  Loader2,
  MapPin,
  MessageSquareQuote,
  MoonStar,
  Navigation,
  Navigation2,
  Sparkles,
  SunMedium,
  Wind,
  X,
} from "lucide-react";
import { Drawer } from "vaul";

import { useLocation } from "@/components/LocationProvider";
import { apiPath, withBasePath } from "@/lib/app-paths";
import type { LanguageCode, TranslationMap } from "@/lib/i18n";

type WeatherPayload = {
  temperatureC: number;
  pressureMm: number;
  windKmh: number;
  cloudCover: number;
  biteIndex: number;
  biteLabel: string;
  moonLabel: string;
  condition: string;
  sunrise: string;
  sunset: string;
  isDay: boolean;
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
  factsNow: string;
  askCommunity: string;
}> = {
  ru: {
    yourLocation: "Ваша локация",
    connecting: "Подключение",
    currentPosition: "Текущая позиция",
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
    analyticsSummary: "Факты по водоему",
    geoSummary: "Геосводка",
    factsNow: "Факты на сейчас",
    askCommunity: "Спросить рыбаков в чате",
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
    analyticsSummary: "Water facts",
    geoSummary: "Geo summary",
    factsNow: "Current facts",
    askCommunity: "Ask anglers in chat",
  },
  es: {
    yourLocation: "Tu ubicación",
    connecting: "Conectando",
    currentPosition: "Posición actual",
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
    analyticsSummary: "Datos del agua",
    geoSummary: "Resumen geográfico",
    factsNow: "Datos actuales",
    askCommunity: "Preguntar en el chat",
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
    analyticsSummary: "Faits sur le spot",
    geoSummary: "Résumé géo",
    factsNow: "Faits du moment",
    askCommunity: "Demander dans le chat",
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
    analyticsSummary: "Fatos do local",
    geoSummary: "Resumo geográfico",
    factsNow: "Fatos atuais",
    askCommunity: "Perguntar no chat",
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

function describePressure(weather: WeatherPayload, lang: LanguageCode) {
  if (lang === "ru") {
    if (weather.pressureMm >= 750 && weather.pressureMm <= 760) {
      return "Давление в рабочем диапазоне, рыба чаще держится стабильнее.";
    }

    if (weather.pressureMm < 750) {
      return "Пониженное давление. Ищи рыбу ближе к укрытиям и мягким бровкам.";
    }

    return "Давление выше среднего. Крупная рыба может быть осторожнее на мели.";
  }

  if (weather.pressureMm >= 750 && weather.pressureMm <= 760) {
    return "Pressure is in a steady working range.";
  }

  if (weather.pressureMm < 750) {
    return "Lower pressure suggests softer structure and cover.";
  }

  return "Higher pressure can push larger fish off the shallows.";
}

function describeWind(weather: WeatherPayload, lang: LanguageCode) {
  if (lang === "ru") {
    if (weather.windKmh <= 8) {
      return "Слабый ветер. Можно аккуратно работать по окнам и кромке травы.";
    }

    if (weather.windKmh <= 18) {
      return "Умеренный ветер. Хорошее окно для поиска активной рыбы по наветренной стороне.";
    }

    return "Сильный ветер. Лучше держаться закрытых участков и брать более тяжелую оснастку.";
  }

  if (weather.windKmh <= 8) {
    return "Light wind works well around edges and grass lines.";
  }

  if (weather.windKmh <= 18) {
    return "Moderate wind often wakes up fish on windward banks.";
  }

  return "Strong wind favors protected water and heavier tackle.";
}

function describeFocus(weather: WeatherPayload, lang: LanguageCode) {
  if (lang === "ru") {
    if (!weather.isDay) {
      return `После заката (${weather.sunset}) проверь береговые свалы, входы в ямы и тихие карманы рядом с глубиной.`;
    }

    if (weather.temperatureC <= 10) {
      return "Вода прохладная. Начни с глубины, русловых бровок и мест рядом с корягой.";
    }

    if (weather.windKmh >= 10 && weather.windKmh <= 18) {
      return "Работай по наветренной стороне, косам и участкам, куда ветер сгоняет кормовую рыбу.";
    }

    return "Смотри заливы, кромку травы и спокойные окна у берега, особенно ближе к утру и вечеру.";
  }

  if (!weather.isDay) {
    return `After sunset (${weather.sunset}), work shoreline breaks, pit entries, and calm pockets near depth.`;
  }

  if (weather.temperatureC <= 10) {
    return "Cool water favors depth changes, channel edges, and timber nearby.";
  }

  if (weather.windKmh >= 10 && weather.windKmh <= 18) {
    return "Check windward banks and points where bait is pushed in.";
  }

  return "Check shallows, grass edges, and calm shoreline windows, especially morning and evening.";
}

function describeTackle(weather: WeatherPayload, lang: LanguageCode) {
  if (lang === "ru") {
    if (weather.windKmh >= 18) {
      return "Оснастка: джиг 16-24 г, более плотная резина, поводок покороче для контроля на ветру.";
    }

    if (weather.temperatureC <= 10) {
      return "Оснастка: джиг 10-18 г, медленная ступенька, минноу 90-110 на паузах.";
    }

    return "Оснастка: минноу 90-110, легкий джиг, вертушка или шэд по активной рыбе у кромки.";
  }

  if (weather.windKmh >= 18) {
    return "Tackle: 16-24 g jig, denser soft bait, shorter leader for wind control.";
  }

  if (weather.temperatureC <= 10) {
    return "Tackle: 10-18 g jig, slow step retrieve, 90-110 mm minnows with pauses.";
  }

  return "Tackle: 90-110 mm minnows, light jig, spinner, or shad for active edge fish.";
}

function getSourceLabel(source: WeatherPayload["source"], lang: LanguageCode) {
  if (lang === "ru") {
    return source === "live" ? "Живые данные Open-Meteo" : "Оценка по координатам";
  }

  return source === "live" ? "Live Open-Meteo data" : "Estimated by coordinates";
}

export function HomeHero({
  lang,
  userName,
  savedPlacesCount,
}: {
  lang: LanguageCode;
  userName: string;
  savedPlacesCount: number;
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

  const locationLabel = location ? location.city || location.country || t.currentPosition : t.currentPosition;
  const fishRequestSummary = weather
    ? lang === "ru"
      ? `Нужна свежая информация по клеву в районе ${locationLabel}. Сейчас ${weather.temperatureC}°C, давление ${weather.pressureMm} мм, ветер ${weather.windKmh} км/ч, индекс клева ${weather.biteIndex}/100.`
      : `Need fresh bite reports near ${locationLabel}. It is ${weather.temperatureC}°C, pressure ${weather.pressureMm} mmHg, wind ${weather.windKmh} km/h, bite index ${weather.biteIndex}/100.`
    : lang === "ru"
      ? `Нужна свежая информация по клеву в районе ${locationLabel}.`
      : `Need fresh bite reports near ${locationLabel}.`;

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
              {location ? location.city || location.country || t.currentPosition : t.resolving}
            </h1>
          </div>
          <button
            type="button"
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
              <div className="mt-2 text-[13px] font-medium text-white/50">
                {weather?.biteIndex ? `${t.biteNow} · ${weather.biteIndex}/100` : t.biteNow}
              </div>
            </div>
          </div>
        </div>

        <button
          type="button"
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
          <Drawer.Content
            className="fixed bottom-0 left-0 right-0 z-[1001] mx-auto mt-24 flex max-h-[90vh] max-w-md flex-col rounded-t-[36px] border-t border-white/10 bg-[#0c1218] outline-none"
            style={{
              backgroundImage: `linear-gradient(180deg, rgba(5, 9, 15, 0.76), rgba(5, 9, 15, 0.96)), url('${withBasePath("/modal-backgrounds/profile-panel-bg.png")}')`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <div className="hide-scrollbar flex-1 overflow-y-auto">
              <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/5 bg-[#0c1218]/90 px-6 py-5 backdrop-blur-xl">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Sparkles size={20} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold leading-tight text-white">{t.analyticsSummary}</h2>
                    <p suppressHydrationWarning className="mt-0.5 text-[13px] text-text-muted">
                      {location ? location.city || location.country || t.currentPosition : t.geoSummary}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setAiOpen(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-soft text-text-muted transition hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-6 p-6 pb-12">
                {weather ? (
                  <>
                    <div className="rounded-[24px] border border-primary/15 bg-primary/10 p-4">
                      <div className="text-[13px] font-semibold uppercase tracking-[0.22em] text-primary">{t.factsNow}</div>
                      <div className="mt-3 text-[16px] leading-7 text-white">
                        {lang === "ru"
                          ? `${userName}, сейчас в точке ${weather.condition.toLowerCase()}, индекс клева ${weather.biteIndex}/100, ${weather.biteLabel.toLowerCase()}. Источник: ${getSourceLabel(weather.source, lang).toLowerCase()}.`
                          : `${userName}, current conditions are ${weather.condition.toLowerCase()}, bite index ${weather.biteIndex}/100, ${weather.biteLabel.toLowerCase()}. Source: ${getSourceLabel(weather.source, lang).toLowerCase()}.`}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-[20px] border border-white/5 bg-surface-soft p-4">
                        <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-text-muted">
                          <Cloud size={14} />
                          {lang === "ru" ? "Температура" : "Temperature"}
                        </div>
                        <div className="mt-2 text-lg font-semibold text-white">{weather.temperatureC}°C</div>
                      </div>
                      <div className="rounded-[20px] border border-white/5 bg-surface-soft p-4">
                        <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-text-muted">
                          <Gauge size={14} />
                          {lang === "ru" ? "Давление" : "Pressure"}
                        </div>
                        <div className="mt-2 text-lg font-semibold text-white">{weather.pressureMm} мм</div>
                      </div>
                      <div className="rounded-[20px] border border-white/5 bg-surface-soft p-4">
                        <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-text-muted">
                          <Wind size={14} />
                          {lang === "ru" ? "Ветер" : "Wind"}
                        </div>
                        <div className="mt-2 text-lg font-semibold text-white">{weather.windKmh} км/ч</div>
                      </div>
                      <div className="rounded-[20px] border border-white/5 bg-surface-soft p-4">
                        <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-text-muted">
                          <Cloud size={14} />
                          {lang === "ru" ? "Облачность" : "Cloud cover"}
                        </div>
                        <div className="mt-2 text-lg font-semibold text-white">{weather.cloudCover}%</div>
                      </div>
                      <div className="rounded-[20px] border border-white/5 bg-surface-soft p-4">
                        <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-text-muted">
                          <MoonStar size={14} />
                          {lang === "ru" ? "Луна" : "Moon"}
                        </div>
                        <div className="mt-2 text-sm font-semibold text-white">{weather.moonLabel}</div>
                      </div>
                      <div className="rounded-[20px] border border-white/5 bg-surface-soft p-4">
                        <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-text-muted">
                          <SunMedium size={14} />
                          {lang === "ru" ? "Световой день" : "Light window"}
                        </div>
                        <div className="mt-2 text-sm font-semibold text-white">
                          {weather.sunrise} – {weather.sunset}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="text-[13px] font-semibold uppercase tracking-[0.22em] text-text-muted">
                        {lang === "ru" ? "Что говорят данные" : "What the data says"}
                      </div>
                      <div className="grid gap-3">
                        <div className="rounded-[20px] border border-white/5 bg-surface-soft p-4">
                          <div className="font-bold text-white">{lang === "ru" ? "По давлению" : "Pressure"}</div>
                          <div className="mt-2 text-[14px] leading-relaxed text-text-muted">{describePressure(weather, lang)}</div>
                        </div>
                        <div className="rounded-[20px] border border-white/5 bg-surface-soft p-4">
                          <div className="font-bold text-white">{lang === "ru" ? "По ветру" : "Wind"}</div>
                          <div className="mt-2 text-[14px] leading-relaxed text-text-muted">{describeWind(weather, lang)}</div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="text-[13px] font-semibold uppercase tracking-[0.22em] text-text-muted">
                        {lang === "ru" ? "Где начать" : "Where to start"}
                      </div>
                      <div className="rounded-[20px] border border-white/5 bg-surface-soft p-4 text-[14px] leading-relaxed text-text-muted">
                        {describeFocus(weather, lang)}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="text-[13px] font-semibold uppercase tracking-[0.22em] text-text-muted">
                        {lang === "ru" ? "Оснастка под условия" : "Tackle for conditions"}
                      </div>
                      <div className="rounded-[20px] border border-white/5 bg-surface-soft p-4 text-[14px] leading-relaxed text-text-muted">
                        {describeTackle(weather, lang)}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 rounded-[24px] border border-white/5 bg-white/[0.03] p-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-text-muted">
                          <MapPin size={14} />
                          {lang === "ru" ? "Сохраненные точки" : "Saved places"}
                        </div>
                        <div className="text-sm font-semibold text-white">
                          {lang === "ru" ? `${savedPlacesCount} в профиле` : `${savedPlacesCount} saved`}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-text-muted">
                          <Sparkles size={14} />
                          {lang === "ru" ? "Источник" : "Source"}
                        </div>
                        <div className="text-sm font-semibold text-white">{getSourceLabel(weather.source, lang)}</div>
                      </div>
                    </div>

                    <Link
                      href={{
                        pathname: "/chats",
                        query: {
                          compose: "fish-request",
                          location: locationLabel,
                          summary: fishRequestSummary,
                        },
                      }}
                      onClick={() => setAiOpen(false)}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-[22px] border border-primary/20 bg-primary px-4 py-4 text-[15px] font-bold text-[#0a1520] shadow-[0_10px_28px_rgba(103,232,178,0.24)] transition hover:bg-primary/90"
                    >
                      <MessageSquareQuote size={18} />
                      {t.askCommunity}
                    </Link>
                  </>
                ) : (
                  <div className="rounded-[24px] border border-dashed border-border-subtle bg-surface-soft p-5 text-sm text-text-muted">
                    {weatherError || t.unavailable}
                  </div>
                )}
              </div>
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    </section>
  );
}

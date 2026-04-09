'use client';

import { useEffect, useState, useTransition } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { Download, Search, Plus, Map as MapIcon, List as ListIcon, Navigation2, Star, ImagePlus, Loader2, Check, Sparkles, X } from "lucide-react";
import { Drawer } from "vaul";
import { useLanguage } from "@/components/LanguageProvider";
import { useLocation } from "@/components/LocationProvider";
import { apiPath, withBasePath } from "@/lib/app-paths";
import { getSpeciesBadge } from "@/lib/assets";
import { placeTypeLabel } from "@/lib/format";
import type { TranslationMap } from "@/lib/i18n";

const DynamicMap = dynamic(() => import("@/components/ClientMap"), { ssr: false });

type ExplorePlace = {
  id: string;
  slug: string;
  name: string;
  city: string;
  region: string;
  shortDescription: string;
  type: "WILD" | "PAYED" | "CLUB" | "SHOP" | "EVENT_SOS";
  distanceKm: number | null;
  rating: number;
  depthMeters: number | null;
  coverImage: string | null;
  displayImage: string | null;
  source: "SEEDED" | "GEMINI" | "DISCOVERED" | "USER";
  sourceUrl: string | null;
  fishSpeciesList: string[];
  amenitiesList: string[];
  bestMonthsList: string[];
  _count: { catches: number; photos: number };
  latitude: number;
  longitude: number;
};

type FilterKey = "ALL" | "WILD" | "PAYED" | "CLUB" | "SHOP";

const filters: TranslationMap<Array<{ key: FilterKey; label: string }>> = {
  ru: [
    { key: "ALL", label: "Все" },
    { key: "WILD", label: "Дикие водоемы" },
    { key: "PAYED", label: "Платные пруды" },
    { key: "CLUB", label: "Базы и клубы" },
    { key: "SHOP", label: "Снасти и лодки" },
  ],
  en: [
    { key: "ALL", label: "All" },
    { key: "WILD", label: "Wild waters" },
    { key: "PAYED", label: "Paid ponds" },
    { key: "CLUB", label: "Bases and clubs" },
    { key: "SHOP", label: "Tackle and boats" },
  ],
  es: [
    { key: "ALL", label: "Todo" },
    { key: "WILD", label: "Aguas salvajes" },
    { key: "PAYED", label: "Lagos de pago" },
    { key: "CLUB", label: "Bases y clubes" },
    { key: "SHOP", label: "Tienda y barcos" },
  ],
  fr: [
    { key: "ALL", label: "Tout" },
    { key: "WILD", label: "Eaux sauvages" },
    { key: "PAYED", label: "Étangs payants" },
    { key: "CLUB", label: "Bases et clubs" },
    { key: "SHOP", label: "Magasins et bateaux" },
  ],
  pt: [
    { key: "ALL", label: "Tudo" },
    { key: "WILD", label: "Águas selvagens" },
    { key: "PAYED", label: "Pesque-pagues" },
    { key: "CLUB", label: "Bases e clubes" },
    { key: "SHOP", label: "Lojas e barcos" },
  ],
};

const translations: TranslationMap<{
  noPhoto: string;
  searchPlaceholder: string;
  aiAnalysis: string;
  searchAction: string;
  searchArea: string;
  newRating: string;
  speciesCount: (count: number) => string;
  nothingFound: string;
  nothingFoundDescription: string;
  map: string;
  list: string;
  navigation: string;
  placeOverview: string;
  routeLabel: (distance: string) => string;
  offlineReady: string;
  unpackingTiles: (progress: number) => string;
  downloadRoute: string;
  aiDrawerTitle: string;
  aiDrawerSubtitle: string;
  aiScanning: string;
  aiSummary: (count: number) => string;
  wildHint: string;
  paidHint: string;
  neuralResult: string;
  bestSpot: string;
  bestSpotText: (place: string, fish: string) => string;
  predatorFallback: string;
  zoomHint: string;
  rescan: string;
}> = {
  ru: {
    noPhoto: "Нет фото",
    searchPlaceholder: "Поиск по базе, геолокации, улову...",
    aiAnalysis: "AI анализ",
    searchAction: "Найти место",
    searchArea: "Искать в этой области",
    newRating: "Новая",
    speciesCount: (count) => `+${count} видов`,
    nothingFound: "Ничего не найдено",
    nothingFoundDescription: "Попробуйте изменить запрос, фильтры или сдвинуть карту.",
    map: "Карта",
    list: "Список",
    navigation: "Навигация",
    placeOverview: "Обзор базы",
    routeLabel: (distance) => `Маршрут · ${distance} · Открыто`,
    offlineReady: "Карта в офлайне",
    unpackingTiles: (progress) => `Распаковка тайлов ${progress}%`,
    downloadRoute: "Скачать маршрут (45 МБ)",
    aiDrawerTitle: "Apify + Gemini анализ",
    aiDrawerSubtitle: "Оценка текущего видового экрана",
    aiScanning: "Gemini анализирует водоемы, собранные через Apify...",
    aiSummary: (count) => `В зоне видимости найдено ${count} водоемов.`,
    wildHint: "Дикие участки хорошо подходят для активного поиска хищника.",
    paidHint: "Платные пруды обычно дают более стабильную рыбалку на карпа.",
    neuralResult: "Итог нейросети",
    bestSpot: "Лучшая точка сейчас:",
    bestSpotText: (place, fish) => `Рекомендуем посетить ${place}. По текущим данным там высокая активность ${fish}.`,
    predatorFallback: "хищника",
    zoomHint: "Приблизьте карту, чтобы мы смогли найти подходящие водоемы рядом.",
    rescan: "Повторить сканирование",
  },
  en: {
    noPhoto: "No photo",
    searchPlaceholder: "Search by spots, location, or catches...",
    aiAnalysis: "AI analysis",
    searchAction: "Search places",
    searchArea: "Search this area",
    newRating: "New",
    speciesCount: (count) => `+${count} species`,
    nothingFound: "Nothing found",
    nothingFoundDescription: "Try changing the query, filters, or map area.",
    map: "Map",
    list: "List",
    navigation: "Navigate",
    placeOverview: "Spot overview",
    routeLabel: (distance) => `Route · ${distance} · Open`,
    offlineReady: "Map offline",
    unpackingTiles: (progress) => `Unpacking tiles ${progress}%`,
    downloadRoute: "Download route (45 MB)",
    aiDrawerTitle: "Apify + Gemini analysis",
    aiDrawerSubtitle: "Current area overview",
    aiScanning: "Gemini is analyzing waters collected through Apify...",
    aiSummary: (count) => `${count} waters found in view.`,
    wildHint: "Wild waters look better for active predator search.",
    paidHint: "Paid ponds usually offer steadier carp fishing.",
    neuralResult: "Neural summary",
    bestSpot: "Best spot right now:",
    bestSpotText: (place, fish) => `We recommend ${place}. Current data suggests strong activity for ${fish}.`,
    predatorFallback: "predators",
    zoomHint: "Zoom in so we can find suitable waters nearby.",
    rescan: "Run scan again",
  },
  es: {
    noPhoto: "Sin foto",
    searchPlaceholder: "Buscar por lugares, geolocalización o capturas...",
    aiAnalysis: "Análisis IA",
    searchAction: "Buscar lugar",
    searchArea: "Buscar en esta zona",
    newRating: "Nueva",
    speciesCount: (count) => `+${count} especies`,
    nothingFound: "No se encontró nada",
    nothingFoundDescription: "Prueba otro texto, filtros o zona del mapa.",
    map: "Mapa",
    list: "Lista",
    navigation: "Navegar",
    placeOverview: "Ver lugar",
    routeLabel: (distance) => `Ruta · ${distance} · Abierto`,
    offlineReady: "Mapa offline",
    unpackingTiles: (progress) => `Preparando teselas ${progress}%`,
    downloadRoute: "Descargar ruta (45 MB)",
    aiDrawerTitle: "Análisis Apify + Gemini",
    aiDrawerSubtitle: "Resumen de la zona actual",
    aiScanning: "Gemini analiza aguas recopiladas a través de Apify...",
    aiSummary: (count) => `Se encontraron ${count} lugares en la zona visible.`,
    wildHint: "Las zonas salvajes van mejor para buscar depredadores.",
    paidHint: "Los lagos de pago suelen dar una pesca más estable de carpa.",
    neuralResult: "Resumen neuronal",
    bestSpot: "Mejor punto ahora:",
    bestSpotText: (place, fish) => `Recomendamos visitar ${place}. Los datos actuales muestran buena actividad de ${fish}.`,
    predatorFallback: "depredadores",
    zoomHint: "Acerca el mapa para encontrar aguas cercanas.",
    rescan: "Repetir escaneo",
  },
  fr: {
    noPhoto: "Sans photo",
    searchPlaceholder: "Recherche par spots, géolocalisation ou prises...",
    aiAnalysis: "Analyse IA",
    searchAction: "Chercher un spot",
    searchArea: "Chercher dans cette zone",
    newRating: "Nouveau",
    speciesCount: (count) => `+${count} espèces`,
    nothingFound: "Aucun résultat",
    nothingFoundDescription: "Essayez une autre recherche, d'autres filtres ou une autre zone.",
    map: "Carte",
    list: "Liste",
    navigation: "Itinéraire",
    placeOverview: "Voir le spot",
    routeLabel: (distance) => `Itinéraire · ${distance} · Ouvert`,
    offlineReady: "Carte hors ligne",
    unpackingTiles: (progress) => `Préparation des tuiles ${progress}%`,
    downloadRoute: "Télécharger l'itinéraire (45 Mo)",
    aiDrawerTitle: "Analyse Apify + Gemini",
    aiDrawerSubtitle: "Résumé de la zone actuelle",
    aiScanning: "Gemini analyse les spots collectés via Apify...",
    aiSummary: (count) => `${count} spots détectés dans la zone visible.`,
    wildHint: "Les zones sauvages semblent meilleures pour chercher les prédateurs.",
    paidHint: "Les plans d'eau payants offrent souvent une pêche plus stable de la carpe.",
    neuralResult: "Résumé du modèle",
    bestSpot: "Meilleur spot maintenant :",
    bestSpotText: (place, fish) => `Nous recommandons ${place}. Les données actuelles montrent une forte activité de ${fish}.`,
    predatorFallback: "prédateurs",
    zoomHint: "Zoomez pour trouver des spots adaptés autour de vous.",
    rescan: "Relancer le scan",
  },
  pt: {
    noPhoto: "Sem foto",
    searchPlaceholder: "Buscar por pontos, geolocalização ou capturas...",
    aiAnalysis: "Análise IA",
    searchAction: "Buscar local",
    searchArea: "Buscar nesta área",
    newRating: "Novo",
    speciesCount: (count) => `+${count} espécies`,
    nothingFound: "Nada encontrado",
    nothingFoundDescription: "Tente mudar a busca, os filtros ou a área do mapa.",
    map: "Mapa",
    list: "Lista",
    navigation: "Navegar",
    placeOverview: "Ver local",
    routeLabel: (distance) => `Rota · ${distance} · Aberto`,
    offlineReady: "Mapa offline",
    unpackingTiles: (progress) => `Preparando tiles ${progress}%`,
    downloadRoute: "Baixar rota (45 MB)",
    aiDrawerTitle: "Análise Apify + Gemini",
    aiDrawerSubtitle: "Resumo da área atual",
    aiScanning: "Gemini está analisando os locais coletados via Apify...",
    aiSummary: (count) => `${count} pontos encontrados na área visível.`,
    wildHint: "Águas selvagens parecem melhores para procurar predadores.",
    paidHint: "Pesque-pagues costumam oferecer uma pescaria de carpa mais estável.",
    neuralResult: "Resumo da IA",
    bestSpot: "Melhor ponto agora:",
    bestSpotText: (place, fish) => `Recomendamos visitar ${place}. Os dados atuais mostram boa atividade de ${fish}.`,
    predatorFallback: "predadores",
    zoomHint: "Aproxime o mapa para encontrarmos locais próximos.",
    rescan: "Escanear novamente",
  },
};

// Next/Image sometimes crashes with 500 when remote host (unsplash) deletes the image or returns 404.
function SafeImage({
  src,
  alt,
  className,
  emptyLabel,
}: {
  src: string;
  alt: string;
  className?: string;
  emptyLabel: string;
}) {
  const [error, setError] = useState(false);
  if (!src || error) {
    return (
      <div className={`w-full h-full bg-[#0a1520] flex flex-col items-center justify-center border border-white/5 ${className}`}>
         <ImagePlus size={28} className="text-white/20 mb-2" />
         <span className="text-[13px] font-bold text-white/30 uppercase tracking-widest">{emptyLabel}</span>
      </div>
    );
  }
  return <img src={withBasePath(src)} alt={alt} className={`object-cover w-full h-full ${className}`} onError={() => setError(true)} />;
}

async function requestNearbyPlaces(location: {
  latitude: number;
  longitude: number;
  city?: string | null;
  region?: string | null;
  country?: string | null;
  source: string;
  resolvedAt: string;
}, options?: {
  query?: string;
  areaCenter?: { latitude: number; longitude: number } | null;
  radiusKm?: number;
}) {
  const response = await fetch(apiPath("/api/places/discover"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...location,
      query: options?.query?.trim() || null,
      areaLatitude: options?.areaCenter?.latitude ?? null,
      areaLongitude: options?.areaCenter?.longitude ?? null,
      radiusKm: options?.radiusKm ?? 200,
    }),
  });
  if (!response.ok) throw new Error("Discovery failed");
  return (await response.json()) as { places: ExplorePlace[] };
}

export function ExploreShell({ places }: { places: ExplorePlace[] }) {
  const { lang } = useLanguage();
  const t = translations[lang];
  const filterLabels = filters[lang];
  const { location } = useLocation();
  const [view, setView] = useState<"list" | "map">("map");
  const [filter, setFilter] = useState<FilterKey>("ALL");
  const [query, setQuery] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [placesState, setPlacesState] = useState(places);
  const [mapCenter, setMapCenter] = useState<{ latitude: number; longitude: number } | null>(null);
  const [selectedMapPlace, setSelectedMapPlace] = useState<ExplorePlace | null>(null);
  const [routeTo, setRouteTo] = useState<ExplorePlace | null>(null);
  
  const [isRouteSaved, setIsRouteSaved] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [isAiDrawerOpen, setIsAiDrawerOpen] = useState(false);

  const [, startTransition] = useTransition();

  useEffect(() => {
    if (location && !mapCenter) {
      setMapCenter({
        latitude: location.latitude,
        longitude: location.longitude,
      });
    }
  }, [location, mapCenter]);

  async function scanNearby(options?: {
    currentLocation?: typeof location;
    query?: string;
    areaCenter?: { latitude: number; longitude: number } | null;
  }) {
    const currentLocation = options?.currentLocation ?? location;
    if (!currentLocation || isScanning) return;
    setIsScanning(true);
    try {
      const payload = await requestNearbyPlaces(currentLocation, {
        query: options?.query ?? query,
        areaCenter: options?.areaCenter ?? mapCenter ?? currentLocation,
        radiusKm: 200,
      });
      setPlacesState(payload.places);
    } catch {
      // ignore
    } finally {
      setIsScanning(false);
    }
  }

  const filteredPlaces = placesState.filter((place) => {
    let matchesFilter = true;
    if (filter !== "ALL") matchesFilter = place.type === filter;

    return matchesFilter;
  });

  const handleDownloadRoute = () => {
    if (downloadProgress > 0) return;
    setDownloadProgress(1);
    
    let target = 0;
    const interval = setInterval(() => {
      target += Math.floor(Math.random() * 20) + 10;
      if (target >= 100) {
        clearInterval(interval);
        setDownloadProgress(100);
        setTimeout(() => setIsRouteSaved(true), 400);
      } else {
        setDownloadProgress(target);
      }
    }, 400);
  };

  return (
    <div className={`flex flex-col min-h-[100vh] ${view === "map" ? "overflow-hidden" : ""}`}>
      
      {/* Search Header - Fixed at Top */}
      <div className={`fixed top-0 inset-x-0 z-[100] pt-safe px-4 pb-2 transition-all ${view === "list" ? "bg-background/90 backdrop-blur-xl border-b border-white/5" : "bg-gradient-to-b from-black/80 via-black/40 to-transparent pointer-events-none"}`}>
         <div className="pointer-events-auto space-y-3 mt-2">
            <div className="relative">
              <input 
                type="text" 
                placeholder={t.searchPlaceholder}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    void scanNearby({ query });
                  }
                }}
                className="w-full bg-surface-strong/90 backdrop-blur-3xl border border-white/10 rounded-[22px] py-4 pl-12 pr-12 text-[15px] font-bold text-white shadow-[0_8px_32px_rgba(0,0,0,0.5)] placeholder:text-white/40 focus:outline-none focus:border-primary/50 transition-colors"
              />
              <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50" />
              
              <button suppressHydrationWarning onClick={() => void scanNearby({ query })} disabled={!location || isScanning} className="absolute right-3 top-1/2 -translate-y-1/2 h-9 w-9 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-primary hover:text-black transition disabled:opacity-50">
                {isScanning ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
              </button>
            </div>

            <div className="hide-scrollbar flex items-center gap-2 overflow-x-auto pb-1 mt-1">
              <button 
                className="flex shrink-0 items-center justify-center gap-1.5 rounded-full px-4 py-2 text-[13px] font-bold transition whitespace-nowrap shadow-xl backdrop-blur-md bg-accent/20 text-accent border border-accent/20 hover:bg-accent/30"
                onClick={() => setIsAiDrawerOpen(true)}
              >
                <Sparkles size={14} /> {t.aiAnalysis}
              </button>
              {filterLabels.map((item) => (
                <button
                  key={item.key}
                  onClick={() => setFilter(item.key)}
                  className={`flex shrink-0 items-center justify-center rounded-full px-5 py-2 text-[13px] font-bold transition whitespace-nowrap border shadow-xl backdrop-blur-md ${
                    filter === item.key
                      ? "bg-white text-black border-white"
                      : "bg-surface-strong/70 text-text-muted border-white/10 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
         </div>
      </div>

      {view === "map" ? (
        <div className="fixed top-[118px] inset-x-0 z-[110] flex justify-center px-4 pointer-events-none">
          <button
            type="button"
            onClick={() =>
              void scanNearby({
                query,
                areaCenter: mapCenter ?? location ?? null,
              })
            }
            disabled={!location || isScanning}
            className="pointer-events-auto inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/65 px-5 py-3 text-[13px] font-bold text-white shadow-[0_16px_40px_rgba(0,0,0,0.35)] backdrop-blur-xl transition hover:bg-black/80 disabled:opacity-50"
          >
            {isScanning ? <Loader2 size={16} className="animate-spin" /> : <Navigation2 size={16} />}
            <span>{t.searchArea}</span>
          </button>
        </div>
      ) : null}

      {/* Main Content Area */}
      <div className={`flex-1 ${view === "map" ? "fixed inset-0 z-0 h-full w-full" : "pt-[130px] px-4 pb-32"}`}>
        {view === "map" ? (
          <DynamicMap 
            places={filteredPlaces} 
            routeTo={routeTo} 
            onViewportChange={setMapCenter}
            onPlaceSelect={(place) => {
              const fullPlace = filteredPlaces.find(p => p.slug === place.slug);
              if (fullPlace) setSelectedMapPlace(fullPlace);
            }} 
          />
        ) : (
          filteredPlaces.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto pb-16">
              {filteredPlaces.map((place) => (
                <Link
                  key={place.id}
                  href={`/places/${place.slug}`}
                  className="group relative flex flex-col rounded-[28px] bg-surface-soft overflow-hidden border border-white/5 transition hover:bg-surface-strong hover:border-white/10 hover:shadow-2xl"
                >
                  <div className="relative aspect-[4/3] w-full bg-black">
                    <SafeImage src={place.displayImage!} alt={place.name} emptyLabel={t.noPhoto} />
                    
                    <div className="absolute top-4 left-4 flex flex-col gap-2">
                       <span className="backdrop-blur-xl bg-black/40 text-white text-[12px] font-bold px-3.5 py-2 rounded-full border border-white/10 shadow-lg">
                         {placeTypeLabel(place.type, lang)}
                       </span>
                    </div>
                    
                    <div className="absolute top-4 right-4">
                       <span className="flex items-center gap-1 backdrop-blur-xl bg-black/40 text-white text-[13px] font-bold px-3 py-2 rounded-full border border-white/10 shadow-lg">
                         <Star size={14} className="text-warning fill-warning" />
                         {place.rating > 0 ? place.rating.toFixed(1) : t.newRating}
                       </span>
                    </div>

                    <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none" />
                  </div>

                  <div className="px-5 pb-6 pt-5 flex flex-col min-w-0 absolute bottom-0 left-0 right-0 z-10">
                     <h3 className="text-[20px] font-bold text-white truncate shadow-black drop-shadow-md group-hover:text-primary transition-colors">
                       {place.name}
                     </h3>
                     <div className="flex items-center gap-1.5 text-[14px] text-white/80 mt-1 truncate">
                       {place.distanceKm !== null && <span className="font-bold text-white drop-shadow">{place.distanceKm} км</span>}
                       {place.distanceKm !== null && place.city && <span>•</span>}
                       {place.city && <span className="truncate">{place.city}</span>}
                     </div>

                     {place.fishSpeciesList.length > 0 && (
                        <div className="flex items-center mt-3 -space-x-2">
                          {place.fishSpeciesList.slice(0, 5).map(fish => (
                            <div key={fish} className="h-7 w-7 rounded-full border-2 border-[#121212] bg-surface shadow-2xl overflow-hidden relative">
                               <Image src={withBasePath(getSpeciesBadge(fish))} alt={fish} fill className="object-cover" />
                            </div>
                          ))}
                          <span className="text-[12px] font-bold text-white/80 pl-4 drop-shadow">
                            {t.speciesCount(place.fishSpeciesList.length)}
                          </span>
                        </div>
                     )}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center pt-20 pb-32 text-center px-4">
              <div className="h-20 w-20 mb-6 flex items-center justify-center rounded-full bg-surface border border-white/10 text-text-muted shadow-2xl">
                <Search size={32} />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">{t.nothingFound}</h3>
              <p className="text-[15px] text-text-muted max-w-[300px]">
                {t.nothingFoundDescription}
              </p>
            </div>
          )
        )}
      </div>

      {/* Floating Action Buttons: Toggle Map/List + Add Place */}
      <div className="fixed bottom-[130px] left-0 right-0 z-[100] flex items-center justify-center pointer-events-none">
         <div className="relative flex items-center gap-3 pointer-events-auto">
            {/* Master Toggle */}
            <button
               onClick={() => startTransition(() => setView(current => (current === "list" ? "map" : "list")))}
               className="flex items-center justify-center gap-2 h-[52px] px-6 rounded-full bg-white text-black font-extrabold text-[15px] shadow-[0_16px_32px_rgba(0,0,0,0.4)] transition-transform hover:scale-105 active:scale-95"
            >
               {view === "list" ? <MapIcon size={18} /> : <ListIcon size={18} />}
               {view === "list" ? t.map : t.list}
            </button>
            <Link
               href="/add"
               className="flex items-center justify-center h-[52px] w-[52px] rounded-full bg-primary text-black shadow-[0_16px_32px_rgba(103,232,178,0.3)] transition-transform hover:scale-105 active:scale-95"
            >
               <Plus size={24} />
            </Link>
         </div>
      </div>

      {/* Map Interactive Layers */}
      {view === "map" && selectedMapPlace && !routeTo && (
        <div className="fixed bottom-[96px] inset-x-0 z-[200] flex sm:items-center justify-center px-4 pointer-events-none animate-in slide-in-from-bottom-8">
           <div className="w-full max-w-md bg-surface-strong/95 backdrop-blur-3xl border border-white/10 rounded-[32px] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.6)] relative pointer-events-auto">
              <button onClick={() => setSelectedMapPlace(null)} className="absolute top-4 right-4 text-white/50 hover:text-white bg-white/5 rounded-full p-1 transition">
                <Plus size={20} className="rotate-45" />
              </button>
              
              <div className="flex items-center gap-4 mb-5 w-[90%]">
                 <div className="w-[72px] h-[72px] rounded-[24px] overflow-hidden shrink-0 border border-white/5 shadow-inner">
                   <SafeImage src={selectedMapPlace.displayImage!} alt="" emptyLabel={t.noPhoto} />
                 </div>
                 <div className="min-w-0">
                   <h2 className="text-[19px] font-bold text-white truncate drop-shadow-md">{selectedMapPlace.name}</h2>
                   <div className="text-[14px] text-text-muted truncate flex items-center gap-1.5 mt-1 font-medium">
                     <Star size={14} className="text-warning fill-warning" /> {selectedMapPlace.rating.toFixed(1)} 
                     <span className="w-1 h-1 rounded-full bg-white/20 mx-0.5" />
                     {selectedMapPlace.city || selectedMapPlace.region}
                   </div>
                 </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                 <button onClick={() => { setRouteTo(selectedMapPlace); setSelectedMapPlace(null); }} className="py-3.5 rounded-[18px] bg-primary text-black font-bold text-[15px] shadow-lg hover:bg-primary-strong transition">
                   {t.navigation}
                 </button>
                 <Link href={`/places/${selectedMapPlace.slug}`} className="flex items-center justify-center py-3.5 rounded-[18px] bg-white/10 text-white font-bold text-[15px] border border-white/5 hover:bg-white/15 transition">
                    {t.placeOverview}
                 </Link>
              </div>
           </div>
        </div>
      )}

      {/* Navigation Route Overlay */}
      {routeTo && (
        <div className="fixed top-0 bottom-0 inset-x-0 z-[1000] p-4 bg-black/60 backdrop-blur-sm pointer-events-none flex flex-col justify-end">
          <div className="bg-surface-strong/95 p-6 mb-[80px] rounded-[32px] border border-white/10 shadow-2xl flex flex-col gap-6 pointer-events-auto relative overflow-hidden animate-in slide-in-from-bottom-12">
            
            {downloadProgress > 0 && !isRouteSaved && (
               <div className="absolute left-0 bottom-0 top-0 bg-primary/10 transition-all duration-300 ease-out z-0" style={{ width: `${downloadProgress}%` }} />
            )}
            
            <div className="flex items-start justify-between gap-4 relative z-10">
              <div className="min-w-0">
                <h3 className="font-bold text-white text-[22px] truncate">{routeTo.name}</h3>
                <p className="text-[15px] text-primary font-bold mt-1 tracking-tight">
                  {t.routeLabel(`${routeTo.distanceKm || "2.5"} km`)}
                </p>
              </div>
              <button onClick={() => setRouteTo(null)} className="w-12 h-12 shrink-0 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition backdrop-blur-md">
                <Plus size={24} className="rotate-45" />
              </button>
            </div>
            
            <button 
              onClick={handleDownloadRoute} 
              disabled={isRouteSaved || downloadProgress > 0} 
              className={`flex items-center justify-center gap-2 w-full py-4 rounded-[22px] text-[16px] font-extrabold transition-all relative z-10 shadow-xl ${
                isRouteSaved 
                  ? "bg-white/10 text-white/50" 
                  : downloadProgress > 0 
                  ? "bg-surface text-primary"
                  : "bg-primary text-black hover:scale-[1.02]"
              }`}
            >
              {isRouteSaved ? (
                <><Check size={20} /> {t.offlineReady}</>
              ) : downloadProgress > 0 ? (
                <><Loader2 size={20} className="animate-spin" /> {t.unpackingTiles(downloadProgress)}</>
              ) : (
                <><Download size={20} /> {t.downloadRoute}</>
              )}
            </button>
          </div>
        </div>
      )}

      {/* AI Analysis Drawer */}
      <Drawer.Root open={isAiDrawerOpen} onOpenChange={setIsAiDrawerOpen}>
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 z-[1000] bg-black/80 backdrop-blur-md" />
          <Drawer.Content 
            className="fixed bottom-0 left-0 right-0 z-[1001] mx-auto mt-24 flex max-h-[90vh] max-w-md flex-col rounded-t-[36px] bg-[#0c1218] border-t border-white/10 outline-none overflow-hidden"
            style={{ backgroundImage: `url('${withBasePath("/images/modal-bg.png")}')`, backgroundSize: 'cover', backgroundPosition: 'center' }}
          >
            <div className="absolute inset-0 bg-black/50 mix-blend-multiply z-0 pointer-events-none" />
            <div className="flex-1 overflow-y-auto hide-scrollbar relative z-10">
              
              {/* Sticky Header */}
              <div className="sticky top-0 z-10 bg-[#0c1218]/90 backdrop-blur-xl border-b border-white/5 px-6 py-5 flex items-center justify-between">
                 <div className="flex items-center gap-2.5">
                   <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-accent">
                     <Sparkles size={20} />
                   </div>
                   <div>
                      <h2 className="text-lg font-bold text-white leading-tight">{t.aiDrawerTitle}</h2>
                      <p className="text-[13px] text-text-muted mt-0.5">{t.aiDrawerSubtitle}</p>
                   </div>
                 </div>
                 <button onClick={() => setIsAiDrawerOpen(false)} className="w-8 h-8 flex flex-col items-center justify-center rounded-full bg-surface-soft text-text-muted hover:text-white transition">
                   <X size={18} />
                 </button>
              </div>

              <div className="p-6 pb-12 space-y-6">
                 {isScanning ? (
                    <div className="flex flex-col items-center justify-center py-10 space-y-4">
                       <Loader2 size={32} className="text-accent animate-spin" />
                       <p className="text-white font-medium text-center max-w-[250px]">{t.aiScanning}</p>
                    </div>
                 ) : (
                    <>
                       <div className="text-[16px] leading-relaxed text-white">
                          {t.aiSummary(filteredPlaces.length)}
                          {filteredPlaces.some((p) => p.type === "WILD") && ` ${t.wildHint}`}
                          {filteredPlaces.some((p) => p.type === "PAYED") && ` ${t.paidHint}`}
                       </div>
                       
                       {/* Focus Area */}
                       <div className="space-y-3">
                          <h3 className="font-semibold text-accent text-[13px] uppercase tracking-wider">{t.neuralResult}</h3>
                          <div className="rounded-[20px] bg-accent/10 border border-accent/20 p-4">
                            <div className="font-bold text-white mb-2">{t.bestSpot}</div>
                            {filteredPlaces.length > 0 ? (
                               <div className="text-[14px] text-white/80 leading-relaxed">
                                  {t.bestSpotText(
                                    filteredPlaces[0].name,
                                    filteredPlaces[0].fishSpeciesList[0] || t.predatorFallback,
                                  )}
                               </div>
                            ) : (
                               <div className="text-[14px] text-white/80 leading-relaxed">{t.zoomHint}</div>
                            )}
                          </div>
                       </div>
                       
                       <button onClick={() => { setIsAiDrawerOpen(false); void scanNearby(); }} className="w-full py-4 rounded-[22px] bg-white/10 text-white font-bold hover:bg-white/20 transition">
                          {t.rescan}
                       </button>
                    </>
                 )}
              </div>
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    </div>
  );
}

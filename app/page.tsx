import Image from "next/image";
import Link from "next/link";
import { CalendarDays, Compass, Plus } from "lucide-react";

import { CatchCard } from "@/components/CatchCard";
import { HomeHero } from "@/components/HomeHero";
import { withBasePath } from "@/lib/app-paths";
import { formatDateTime } from "@/lib/format";
import { type TranslationMap } from "@/lib/i18n";
import { getServerLanguage } from "@/lib/i18n-server";
import { getDashboardData } from "@/lib/queries";

export const dynamic = "force-dynamic";

const translations: TranslationMap<{
  mapTitle: string;
  nearbyPlaces: (count: number) => string;
  newPlaces: string;
  tripsTitle: string;
  planTrip: string;
  addCatch: string;
  activityFeed: string;
  emptyFeedTitle: string;
  emptyFeedDescription: string;
}> = {
  ru: {
    mapTitle: "Карта мест",
    nearbyPlaces: (count) => `${count} точек рядом`,
    newPlaces: "Новые места",
    tripsTitle: "Выезды",
    planTrip: "Спланировать",
    addCatch: "Добавить улов",
    activityFeed: "Лента активности",
    emptyFeedTitle: "Лента пока пуста",
    emptyFeedDescription: "Подпишись на других рыбаков или добавь свой первый улов.",
  },
  en: {
    mapTitle: "Places map",
    nearbyPlaces: (count) => `${count} spots nearby`,
    newPlaces: "New places",
    tripsTitle: "Trips",
    planTrip: "Plan one",
    addCatch: "Add catch",
    activityFeed: "Activity feed",
    emptyFeedTitle: "The feed is empty",
    emptyFeedDescription: "Follow other anglers or add your first catch.",
  },
  es: {
    mapTitle: "Mapa de lugares",
    nearbyPlaces: (count) => `${count} lugares cerca`,
    newPlaces: "Nuevos lugares",
    tripsTitle: "Salidas",
    planTrip: "Planificar",
    addCatch: "Añadir captura",
    activityFeed: "Actividad",
    emptyFeedTitle: "El feed está vacío",
    emptyFeedDescription: "Sigue a otros pescadores o añade tu primera captura.",
  },
  fr: {
    mapTitle: "Carte des spots",
    nearbyPlaces: (count) => `${count} spots à proximité`,
    newPlaces: "Nouveaux spots",
    tripsTitle: "Sorties",
    planTrip: "Planifier",
    addCatch: "Ajouter une prise",
    activityFeed: "Activité",
    emptyFeedTitle: "Le feed est vide",
    emptyFeedDescription: "Suivez d'autres pêcheurs ou ajoutez votre première prise.",
  },
  pt: {
    mapTitle: "Mapa de locais",
    nearbyPlaces: (count) => `${count} pontos por perto`,
    newPlaces: "Novos locais",
    tripsTitle: "Saídas",
    planTrip: "Planejar",
    addCatch: "Adicionar captura",
    activityFeed: "Feed de atividade",
    emptyFeedTitle: "O feed está vazio",
    emptyFeedDescription: "Siga outros pescadores ou adicione sua primeira captura.",
  },
};

export default async function Home() {
  const lang = await getServerLanguage();
  const t = translations[lang];
  const dashboard = await getDashboardData();
  const nextTrip = dashboard.upcomingTrips[0];

  return (
    <div className="pb-24 pt-safe sm:pt-6">
      <header className="mb-2 flex items-center justify-between px-4 py-3 sm:px-0">
        <h1 className="font-display text-2xl font-bold tracking-tight text-text-main">FishFlow</h1>
        <Link href="/profile" className="group shrink-0">
          {dashboard.user.avatarPath ? (
            <Image
              src={withBasePath(dashboard.user.avatarPath)}
              alt={dashboard.user.name}
              width={44}
              height={44}
              className="h-11 w-11 rounded-full object-cover ring-2 ring-transparent transition-all group-hover:ring-primary/50"
            />
          ) : (
            <div
              className={`flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br ${dashboard.user.avatarGradient} ring-2 ring-transparent transition-all group-hover:ring-primary/50`}
            >
              <span className="font-display text-[15px] font-semibold text-slate-950">
                {dashboard.user.name.slice(0, 1)}
              </span>
            </div>
          )}
        </Link>
      </header>

      <div className="px-4 sm:px-0">
        <HomeHero
          lang={lang}
          userName={dashboard.user.name}
          savedPlacesCount={dashboard.stats.placesCount}
          pendingShoppingCount={dashboard.stats.pendingShoppingCount}
          upcomingTripsCount={dashboard.stats.upcomingTripsCount}
        />
      </div>

      <div className="mt-5 px-4 sm:px-0">
        <div className="grid grid-cols-2 gap-3">
          <Link href="/explore" className="bento-card group p-4 transition-transform active:scale-95">
            <Compass className="mb-2.5 text-primary" size={24} />
            <div className="font-semibold text-text-main transition-colors group-hover:text-primary">{t.mapTitle}</div>
            <div className="mt-1 text-xs leading-relaxed text-text-muted">
              {dashboard.nearbyPlaces.length > 0 ? t.nearbyPlaces(dashboard.nearbyPlaces.length) : t.newPlaces}
            </div>
          </Link>

          <Link href="/trips" className="bento-card group relative overflow-hidden p-4 transition-transform active:scale-95">
            <CalendarDays className="relative z-10 mb-2.5 text-accent" size={24} />
            <div className="relative z-10 font-semibold text-text-main transition-colors group-hover:text-accent">{t.tripsTitle}</div>
            <div className="relative z-10 mt-1 truncate text-xs leading-relaxed text-text-muted">
              {nextTrip ? formatDateTime(nextTrip.startAt, lang) : t.planTrip}
            </div>
            <div className="pointer-events-none absolute bottom-[-1rem] right-[-0.5rem] text-accent/5">
              <CalendarDays size={80} strokeWidth={1} />
            </div>
          </Link>
        </div>

        <Link href="/add" className="bento-card mt-3 flex items-center justify-center gap-2 border-primary/20 bg-primary/10 p-4 text-primary transition-colors hover:bg-primary/15">
          <Plus size={20} />
          <span className="font-semibold">{t.addCatch}</span>
        </Link>
      </div>

      <div className="mb-4 mt-8 flex items-center justify-between px-4 sm:px-0">
        <h2 className="font-display text-xl font-bold text-text-main">{t.activityFeed}</h2>
      </div>

      <div className="sm:space-y-6">
        {dashboard.recentCatches.length > 0 ? (
          dashboard.recentCatches.map((catchItem) => (
            <CatchCard key={catchItem.id} catchItem={catchItem} />
          ))
        ) : (
          <div className="px-4 sm:px-0">
            <div className="bento-card border-dashed p-6 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white/5">
                <Compass className="text-text-muted" size={24} />
              </div>
              <div className="mb-1 font-semibold text-text-main">{t.emptyFeedTitle}</div>
              <p className="mx-auto max-w-[250px] text-sm text-text-muted">{t.emptyFeedDescription}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

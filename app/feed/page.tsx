import Image from "next/image";
import Link from "next/link";

import { CatchCard } from "@/components/CatchCard";
import { TripReportCard } from "@/components/TripReportCard";
import { withBasePath } from "@/lib/app-paths";
import { type TranslationMap } from "@/lib/i18n";
import { getServerLanguage } from "@/lib/i18n-server";
import { getFeedPageData } from "@/lib/queries";

export const dynamic = "force-dynamic";

const translations: TranslationMap<{
  section: string;
  title: string;
  posts: string;
  trophies: string;
  reports: string;
  emptyAlt: string;
  emptyTitle: string;
  emptyDescription: string;
}> = {
  ru: {
    section: "Лента",
    title: "Публикации сообщества",
    posts: "Постов",
    trophies: "Трофеев",
    reports: "Отчетов",
    emptyAlt: "Пока нет публикаций",
    emptyTitle: "Лента пока пустая",
    emptyDescription: "Опубликуй улов, добавь точку на карту или заверши поездку отчетом.",
  },
  en: {
    section: "Feed",
    title: "Community posts",
    posts: "Posts",
    trophies: "Trophies",
    reports: "Reports",
    emptyAlt: "No posts yet",
    emptyTitle: "The feed is empty",
    emptyDescription: "Publish a catch, add a place to the map, or complete a trip with a report.",
  },
  es: {
    section: "Feed",
    title: "Publicaciones de la comunidad",
    posts: "Publicaciones",
    trophies: "Trofeos",
    reports: "Reportes",
    emptyAlt: "Todavía no hay publicaciones",
    emptyTitle: "El feed está vacío",
    emptyDescription: "Publica una captura, añade un lugar al mapa o completa una salida con un reporte.",
  },
  fr: {
    section: "Feed",
    title: "Publications de la communauté",
    posts: "Posts",
    trophies: "Trophées",
    reports: "Rapports",
    emptyAlt: "Aucune publication pour le moment",
    emptyTitle: "Le feed est vide",
    emptyDescription: "Publiez une prise, ajoutez un spot sur la carte ou terminez une sortie avec un rapport.",
  },
  pt: {
    section: "Feed",
    title: "Publicações da comunidade",
    posts: "Posts",
    trophies: "Troféus",
    reports: "Relatórios",
    emptyAlt: "Ainda não há publicações",
    emptyTitle: "O feed está vazio",
    emptyDescription: "Publique uma captura, adicione um ponto no mapa ou finalize uma saída com relatório.",
  },
};

export default async function FeedPage() {
  const lang = await getServerLanguage();
  const t = translations[lang];
  const { user, catches, tripReports, feedItems } = await getFeedPageData();
  const trophyCount = catches.filter((item) => item.weightKg && item.weightKg >= 4).length;

  return (
    <div className="space-y-5 px-4 pb-8 pt-safe">
      <header className="space-y-3">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-text-muted">{t.section}</p>
            <h1 className="font-display text-[30px] font-semibold tracking-tight text-text-main">{t.title}</h1>
          </div>
          <Link href="/profile" className="text-sm font-semibold text-primary">
            @{user?.handle}
          </Link>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="glass-panel rounded-[24px] border border-border-subtle p-4">
            <div className="text-sm text-text-muted">{t.posts}</div>
            <div className="mt-2 font-display text-2xl font-semibold text-text-main">{feedItems.length}</div>
          </div>
          <div className="glass-panel rounded-[24px] border border-border-subtle p-4">
            <div className="text-sm text-text-muted">{t.trophies}</div>
            <div className="mt-2 font-display text-2xl font-semibold text-text-main">{trophyCount}</div>
          </div>
          <div className="glass-panel rounded-[24px] border border-border-subtle p-4">
            <div className="text-sm text-text-muted">{t.reports}</div>
            <div className="mt-2 font-display text-2xl font-semibold text-text-main">{tripReports.length}</div>
          </div>
        </div>
      </header>

      {feedItems.length > 0 ? (
        <div className="space-y-4">
          {feedItems.map((item) =>
            item.type === "catch" || item.type === "repost" ? (
              <CatchCard key={`${item.type}-${item.catchItem.id}-${item.sortDate.toString()}`} catchItem={item.catchItem} />
            ) : (
              <TripReportCard key={item.tripItem.id} trip={item.tripItem} />
            ),
          )}
        </div>
      ) : (
        <div className="glass-panel flex flex-col items-center gap-4 rounded-[30px] border border-border-subtle p-6 text-center">
          <Image
            src={withBasePath("/graphics/empty-catches-lure.png")}
            alt={t.emptyAlt}
            width={220}
            height={220}
            className="h-auto w-[180px]"
          />
          <div className="space-y-1">
            <div className="font-semibold text-text-main">{t.emptyTitle}</div>
            <p className="text-sm leading-6 text-text-muted">{t.emptyDescription}</p>
          </div>
        </div>
      )}
    </div>
  );
}

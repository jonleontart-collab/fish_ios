import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { CatchCard } from "@/components/CatchCard";
import { SectionHeader } from "@/components/SectionHeader";
import { TripReportCard } from "@/components/TripReportCard";
import { withBasePath } from "@/lib/app-paths";
import { type TranslationMap } from "@/lib/i18n";
import { getServerLanguage } from "@/lib/i18n-server";
import { getFeedPageData } from "@/lib/queries";

export const dynamic = "force-dynamic";

const translations: TranslationMap<{
  section: string;
  title: string;
  subtitle: string;
  posts: string;
  trophies: string;
  reports: string;
  recommended: string;
  recommendedTitle: string;
  openPost: string;
  emptyAlt: string;
  emptyTitle: string;
  emptyDescription: string;
}> = {
  ru: {
    section: "Лента",
    title: "Сообщество",
    subtitle: "Реальные публикации, трофеи и отчеты без лишнего шума",
    posts: "Постов",
    trophies: "Трофеев",
    reports: "Отчетов",
    recommended: "Рекомендации",
    recommendedTitle: "Для тебя",
    openPost: "Открыть пост",
    emptyAlt: "Пока нет публикаций",
    emptyTitle: "Лента пока пустая",
    emptyDescription: "Опубликуй улов, добавь точку на карту или заверши поездку отчетом.",
  },
  en: {
    section: "Feed",
    title: "Community",
    subtitle: "Real posts, trophies, and trip reports without clutter",
    posts: "Posts",
    trophies: "Trophies",
    reports: "Reports",
    recommended: "Recommended",
    recommendedTitle: "For you",
    openPost: "Open post",
    emptyAlt: "No posts yet",
    emptyTitle: "The feed is empty",
    emptyDescription: "Publish a catch, add a place to the map, or complete a trip with a report.",
  },
  es: {
    section: "Feed",
    title: "Comunidad",
    subtitle: "Publicaciones reales, trofeos y reportes sin ruido visual",
    posts: "Publicaciones",
    trophies: "Trofeos",
    reports: "Reportes",
    recommended: "Recomendado",
    recommendedTitle: "Para ti",
    openPost: "Abrir publicación",
    emptyAlt: "Todavía no hay publicaciones",
    emptyTitle: "El feed está vacío",
    emptyDescription: "Publica una captura, añade un lugar al mapa o completa una salida con un reporte.",
  },
  fr: {
    section: "Feed",
    title: "Communauté",
    subtitle: "De vraies publications, trophées et rapports sans surcharge visuelle",
    posts: "Posts",
    trophies: "Trophées",
    reports: "Rapports",
    recommended: "Recommandé",
    recommendedTitle: "Pour vous",
    openPost: "Ouvrir le post",
    emptyAlt: "Aucune publication pour le moment",
    emptyTitle: "Le feed est vide",
    emptyDescription: "Publiez une prise, ajoutez un spot sur la carte ou terminez une sortie avec un rapport.",
  },
  pt: {
    section: "Feed",
    title: "Comunidade",
    subtitle: "Posts reais, troféus e relatórios sem poluição visual",
    posts: "Posts",
    trophies: "Troféus",
    reports: "Relatórios",
    recommended: "Recomendado",
    recommendedTitle: "Para você",
    openPost: "Abrir post",
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
  const recommendedCatches = [...catches]
    .filter((item) => item.user.handle !== user?.handle)
    .sort((left, right) => {
      const leftScore =
        (left.isFeatured ? 25 : 0) +
        (left.likesCount ?? 0) +
        (left.place.city === user?.city ? 12 : 0) +
        (left.repostsCount ?? 0) * 2;
      const rightScore =
        (right.isFeatured ? 25 : 0) +
        (right.likesCount ?? 0) +
        (right.place.city === user?.city ? 12 : 0) +
        (right.repostsCount ?? 0) * 2;

      return rightScore - leftScore;
    })
    .slice(0, 3);

  return (
    <div className="space-y-5 px-4 pb-8 pt-safe">
      <header className="space-y-4">
        <SectionHeader
          title={t.title}
          description={t.subtitle}
          action={
            <Link
              href="/profile"
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/6 px-3.5 py-2 text-sm font-semibold text-text-main transition hover:bg-white/10"
            >
              <span>@{user?.handle}</span>
              <ChevronRight size={15} className="text-primary" />
            </Link>
          }
        />

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

      {recommendedCatches.length > 0 ? (
        <section className="space-y-3">
          <SectionHeader title={t.recommendedTitle} />
          <div className="hide-scrollbar flex gap-3 overflow-x-auto pb-1">
            {recommendedCatches.map((catchItem) => {
              const preview = catchItem.mediaItems[0];

              return (
                <Link
                  key={catchItem.id}
                  href={`/feed/${catchItem.id}`}
                  className="glass-panel min-w-[250px] max-w-[250px] rounded-[26px] border border-border-subtle p-3 transition hover:border-primary/20"
                >
                  <div className="relative mb-3 aspect-[4/3] overflow-hidden rounded-[20px] bg-black/30">
                    {preview ? (
                      preview.mediaType === "VIDEO" ? (
                        <video
                          src={withBasePath(preview.mediaPath)}
                          className="h-full w-full object-cover"
                          muted
                          playsInline
                        />
                      ) : (
                        <img
                          src={withBasePath(preview.mediaPath)}
                          alt={catchItem.species}
                          className="h-full w-full object-cover"
                        />
                      )
                    ) : null}
                  </div>
                  <div className="text-[15px] font-semibold text-white">{catchItem.species}</div>
                  <div className="mt-1 text-sm text-text-muted">
                    {catchItem.place.name}
                    {catchItem.place.city ? `, ${catchItem.place.city}` : ""}
                  </div>
                  <div className="mt-2 text-sm text-primary">{t.openPost}</div>
                </Link>
              );
            })}
          </div>
        </section>
      ) : null}

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

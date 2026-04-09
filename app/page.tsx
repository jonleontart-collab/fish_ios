import type { CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { Plus } from "lucide-react";

import { CatchCard } from "@/components/CatchCard";
import { FriendsPanel } from "@/components/FriendsPanel";
import { HomeFishingEventsWidget } from "@/components/HomeFishingEventsWidget";
import { HomeHero } from "@/components/HomeHero";
import { HomeTripsWidget } from "@/components/HomeTripsWidget";
import { SectionHeader } from "@/components/SectionHeader";
import { UserAvatar } from "@/components/UserAvatar";
import { withBasePath } from "@/lib/app-paths";
import { type TranslationMap } from "@/lib/i18n";
import { getServerLanguage } from "@/lib/i18n-server";
import { getDashboardData } from "@/lib/queries";

export const dynamic = "force-dynamic";

const translations: TranslationMap<{
  homeLabel: string;
  homeTitle: string;
  addCatch: string;
  friendsTitle: string;
  friendsSubtitle: string;
  friendsEmptyTitle: string;
  friendsEmptyDescription: string;
  openFriends: string;
  activityLabel: string;
  emptyFeedTitle: string;
  emptyFeedDescription: string;
}> = {
  ru: {
    homeLabel: "Waterline",
    homeTitle: "FishFlow",
    addCatch: "Добавить улов",
    friendsTitle: "Друзья",
    friendsSubtitle: "Люди, с кем ты уже на связи",
    friendsEmptyTitle: "Пока без друзей",
    friendsEmptyDescription: "Добавь рыбаков из профилей, и они появятся здесь.",
    openFriends: "Все",
    activityLabel: "Лента",
    emptyFeedTitle: "Лента пока пустая",
    emptyFeedDescription: "Подпишись на других рыбаков или добавь свой первый улов.",
  },
  en: {
    homeLabel: "Waterline",
    homeTitle: "FishFlow",
    addCatch: "Add catch",
    friendsTitle: "Friends",
    friendsSubtitle: "People already in your circle",
    friendsEmptyTitle: "No friends yet",
    friendsEmptyDescription: "Add anglers from profiles and they will appear here.",
    openFriends: "All",
    activityLabel: "Feed",
    emptyFeedTitle: "The feed is empty",
    emptyFeedDescription: "Follow other anglers or add your first catch.",
  },
  es: {
    homeLabel: "Waterline",
    homeTitle: "FishFlow",
    addCatch: "Agregar captura",
    friendsTitle: "Amigos",
    friendsSubtitle: "Gente con la que ya estás conectado",
    friendsEmptyTitle: "Aún no hay amigos",
    friendsEmptyDescription: "Añade pescadores desde sus perfiles y aparecerán aquí.",
    openFriends: "Todos",
    activityLabel: "Feed",
    emptyFeedTitle: "El feed está vacío",
    emptyFeedDescription: "Sigue a otros pescadores o añade tu primera captura.",
  },
  fr: {
    homeLabel: "Waterline",
    homeTitle: "FishFlow",
    addCatch: "Ajouter une prise",
    friendsTitle: "Amis",
    friendsSubtitle: "Les personnes déjà dans votre cercle",
    friendsEmptyTitle: "Pas encore d'amis",
    friendsEmptyDescription: "Ajoutez des pêcheurs depuis leurs profils et ils apparaîtront ici.",
    openFriends: "Tout",
    activityLabel: "Feed",
    emptyFeedTitle: "Le feed est vide",
    emptyFeedDescription: "Suivez d'autres pêcheurs ou ajoutez votre première prise.",
  },
  pt: {
    homeLabel: "Waterline",
    homeTitle: "FishFlow",
    addCatch: "Adicionar captura",
    friendsTitle: "Amigos",
    friendsSubtitle: "Pessoas que já estão no seu círculo",
    friendsEmptyTitle: "Ainda sem amigos",
    friendsEmptyDescription: "Adicione pescadores pelos perfis e eles aparecerão aqui.",
    openFriends: "Todos",
    activityLabel: "Feed",
    emptyFeedTitle: "O feed está vazio",
    emptyFeedDescription: "Siga outros pescadores ou adicione sua primeira captura.",
  },
};

export default async function Home() {
  const lang = await getServerLanguage();
  const t = translations[lang];
  const dashboard = await getDashboardData();

  return (
    <div className="pb-24 pt-safe sm:pt-6">
      <header className="mb-4 flex items-center justify-between gap-4 px-4 py-3 sm:px-0">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-[18px] border border-white/8 bg-white/5 shadow-[0_12px_30px_rgba(0,0,0,0.25)]">
            <Image
              src={withBasePath("/brand/app-mark-square.png")}
              alt={t.homeTitle}
              width={36}
              height={36}
              className="h-9 w-9"
            />
          </div>
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-text-muted">
              {t.homeLabel}
            </div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-text-main">{t.homeTitle}</h1>
          </div>
        </div>

        <Link
          href="/profile"
          className="group flex items-center gap-3 rounded-[20px] border border-white/8 bg-white/4 px-3 py-2.5 transition hover:bg-white/8"
        >
          <div className="text-right">
            <div className="text-sm font-semibold text-white">@{dashboard.user.handle}</div>
            <div className="text-xs text-text-muted">{dashboard.user.name}</div>
          </div>
          <UserAvatar
            name={dashboard.user.name}
            avatarPath={dashboard.user.avatarPath}
            className="h-11 w-11 ring-2 ring-transparent transition-all group-hover:ring-primary/50"
            fallbackClassName="border border-white/10 bg-white/6"
            iconSize={18}
          />
        </Link>
      </header>

      <div className="space-y-5 px-4 sm:px-0">
        <HomeHero
          lang={lang}
          userName={dashboard.user.name}
          savedPlacesCount={dashboard.stats.placesCount}
        />

        <FriendsPanel
          title={t.friendsTitle}
          subtitle={t.friendsSubtitle}
          emptyTitle={t.friendsEmptyTitle}
          emptyDescription={t.friendsEmptyDescription}
          openLabel={t.openFriends}
          friends={dashboard.friends}
          variant="home"
        />

        <HomeTripsWidget lang={lang} trips={dashboard.upcomingTrips} />
        <HomeFishingEventsWidget />

        <Link
          href="/add"
          className="bento-card flex items-center justify-center gap-2 border-primary/20 bg-primary/10 p-4 text-primary transition-colors hover:bg-primary/15"
        >
          <Plus size={20} />
          <span className="font-semibold">{t.addCatch}</span>
        </Link>
      </div>

      <div className="mb-4 mt-8 px-4 sm:px-0">
        <SectionHeader title={t.activityLabel} />
      </div>

      <div className="sm:space-y-6">
        {dashboard.recentCatches.length > 0 ? (
          dashboard.recentCatches.map((catchItem) => <CatchCard key={catchItem.id} catchItem={catchItem} />)
        ) : (
          <div className="px-4 sm:px-0">
            <div
              className="glass-panel panel-scene rounded-[30px] border border-dashed border-border-subtle p-6 text-center"
              style={{ "--panel-scene-image": `url('${withBasePath("/graphics/empty-catches-lure.png")}')` } as CSSProperties}
            >
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white/5">
                <Plus className="text-text-muted" size={24} />
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

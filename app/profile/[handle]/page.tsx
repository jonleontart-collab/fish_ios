import type { CSSProperties } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, Trophy } from "lucide-react";

import { CatchCard } from "@/components/CatchCard";
import { DirectChatButton } from "@/components/DirectChatButton";
import { FriendsPanel } from "@/components/FriendsPanel";
import { FriendToggleButton } from "@/components/FriendToggleButton";
import { ProfileInventoryShowcase } from "@/components/ProfileInventoryShowcase";
import { SectionHeader } from "@/components/SectionHeader";
import { TripReportCard } from "@/components/TripReportCard";
import { UserAvatar } from "@/components/UserAvatar";
import { withBasePath } from "@/lib/app-paths";
import { type TranslationMap } from "@/lib/i18n";
import { getServerLanguage } from "@/lib/i18n-server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/queries";
import { getFriendRelationship, getFriendsForUser } from "@/lib/social";

export const dynamic = "force-dynamic";

const translations: TranslationMap<{
  profile: string;
  fallbackBio: string;
  catches: string;
  trips: string;
  friends: string;
  friendsSubtitle: string;
  friendsEmptyTitle: string;
  friendsEmptyDescription: string;
  openFriends: string;
  experience: string;
  prefers: string;
  favoriteWater: string;
  postsTitle: string;
  tripsTitle: string;
  gearTitle: string;
  emptyGear: string;
  emptyCatches: string;
  emptyTrips: string;
  years: (value: number) => string;
}> = {
  ru: {
    profile: "Профиль",
    fallbackBio: "Пользователь пока не заполнил био, но его публикации и поездки уже многое говорят о стиле ловли.",
    catches: "Уловы",
    trips: "Поездки",
    friends: "Друзья",
    friendsSubtitle: "Круг общения",
    friendsEmptyTitle: "Пока без друзей",
    friendsEmptyDescription: "Когда у пользователя появятся друзья, они будут показаны здесь.",
    openFriends: "Все",
    experience: "Опыт",
    prefers: "Стиль",
    favoriteWater: "Основная акватория",
    postsTitle: "Улов",
    tripsTitle: "Поездки",
    gearTitle: "Снаряжение",
    emptyGear: "Этот пользователь пока не открыл свой инвентарь.",
    emptyCatches: "Пользователь пока не добавил публикации.",
    emptyTrips: "У пользователя пока нет опубликованных поездок.",
    years: (value) => `${value} лет`,
  },
  en: {
    profile: "Profile",
    fallbackBio: "This user has not filled in a bio yet, but the posts and trips already show the fishing style.",
    catches: "Catches",
    trips: "Trips",
    friends: "Friends",
    friendsSubtitle: "Circle",
    friendsEmptyTitle: "No friends yet",
    friendsEmptyDescription: "When the user adds friends, they will appear here.",
    openFriends: "All",
    experience: "Experience",
    prefers: "Style",
    favoriteWater: "Home water",
    postsTitle: "Posts",
    tripsTitle: "Trips",
    gearTitle: "Gear",
    emptyGear: "This user has not opened the inventory yet.",
    emptyCatches: "This user has not added posts yet.",
    emptyTrips: "This user does not have published trips yet.",
    years: (value) => `${value} years`,
  },
  es: {
    profile: "Perfil",
    fallbackBio: "Este usuario aún no ha completado su bio, pero sus publicaciones y salidas ya muestran su estilo.",
    catches: "Capturas",
    trips: "Salidas",
    friends: "Amigos",
    friendsSubtitle: "Círculo",
    friendsEmptyTitle: "Aún no hay amigos",
    friendsEmptyDescription: "Cuando el usuario tenga amigos, aparecerán aquí.",
    openFriends: "Todos",
    experience: "Experiencia",
    prefers: "Estilo",
    favoriteWater: "Agua principal",
    postsTitle: "Publicaciones",
    tripsTitle: "Salidas",
    gearTitle: "Equipo",
    emptyGear: "Este usuario aún no ha abierto su inventario.",
    emptyCatches: "Este usuario todavía no ha añadido publicaciones.",
    emptyTrips: "Este usuario aún no tiene salidas publicadas.",
    years: (value) => `${value} años`,
  },
  fr: {
    profile: "Profil",
    fallbackBio: "Cet utilisateur n'a pas encore rempli sa bio, mais ses publications et sorties montrent déjà son style.",
    catches: "Prises",
    trips: "Sorties",
    friends: "Amis",
    friendsSubtitle: "Cercle",
    friendsEmptyTitle: "Pas encore d'amis",
    friendsEmptyDescription: "Quand l'utilisateur aura des amis, ils apparaîtront ici.",
    openFriends: "Tout",
    experience: "Expérience",
    prefers: "Style",
    favoriteWater: "Plan d'eau principal",
    postsTitle: "Publications",
    tripsTitle: "Sorties",
    gearTitle: "Équipement",
    emptyGear: "Cet utilisateur n'a pas encore ouvert son inventaire.",
    emptyCatches: "Cet utilisateur n'a pas encore ajouté de publications.",
    emptyTrips: "Cet utilisateur n'a pas encore de sorties publiées.",
    years: (value) => `${value} ans`,
  },
  pt: {
    profile: "Perfil",
    fallbackBio: "Este usuário ainda não preencheu a bio, mas as publicações e viagens já mostram seu estilo.",
    catches: "Capturas",
    trips: "Viagens",
    friends: "Amigos",
    friendsSubtitle: "Círculo",
    friendsEmptyTitle: "Ainda sem amigos",
    friendsEmptyDescription: "Quando o usuário tiver amigos, eles aparecerão aqui.",
    openFriends: "Todos",
    experience: "Experiência",
    prefers: "Estilo",
    favoriteWater: "Água principal",
    postsTitle: "Publicações",
    tripsTitle: "Viagens",
    gearTitle: "Equipamentos",
    emptyGear: "Este usuário ainda não abriu o inventário.",
    emptyCatches: "Este usuário ainda não adicionou publicações.",
    emptyTrips: "Este usuário ainda não tem viagens publicadas.",
    years: (value) => `${value} anos`,
  },
};

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const lang = await getServerLanguage();
  const t = translations[lang];
  const viewer = await getCurrentUser();
  const { handle } = await params;

  const user = await prisma.user.findUnique({
    where: { handle },
    include: {
      catches: {
        include: {
          user: true,
          place: true,
          media: {
            orderBy: {
              sortOrder: "asc",
            },
          },
          likes: viewer
            ? {
                where: { userId: viewer.id },
                select: { id: true },
              }
            : false,
          reposts: viewer
            ? {
                where: { userId: viewer.id },
                select: { id: true },
              }
            : false,
          _count: {
            select: {
              comments: true,
              likes: true,
              reposts: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 6,
      },
      trips: {
        where: {
          publishedAt: {
            not: null,
          },
        },
        include: {
          place: {
            include: {
              photos: {
                orderBy: { createdAt: "desc" },
                take: 1,
              },
            },
          },
        },
        orderBy: {
          publishedAt: "desc",
        },
        take: 3,
      },
      inventoryItems: {
        orderBy: [{ category: "asc" }, { createdAt: "desc" }],
        take: 8,
      },
      _count: {
        select: {
          catches: true,
          trips: true,
        },
      },
    },
  });

  if (!user) {
    notFound();
  }

  const [friends, relationship] = await Promise.all([
    getFriendsForUser(user.id),
    viewer ? getFriendRelationship(viewer.id, user.id) : Promise.resolve("none" as const),
  ]);

  const catches = user.catches.map((catchItem) => ({
    ...catchItem,
    likesCount: catchItem._count.likes,
    commentsCount: catchItem._count.comments,
    repostsCount: catchItem._count.reposts,
    likedByViewer: Boolean(catchItem.likes?.length),
    repostedByViewer: Boolean(catchItem.reposts?.length),
    mediaItems:
      catchItem.media.length > 0
        ? catchItem.media
        : [
            {
              id: `${catchItem.id}-cover`,
              mediaPath: catchItem.imagePath,
              mediaType: "IMAGE" as const,
              sortOrder: 0,
            },
          ],
  }));

  const profileSceneStyle = {
    "--panel-scene-image": `url('${withBasePath("/modal-backgrounds/profile-panel-bg.png")}')`,
  } as CSSProperties;

  return (
    <div className="space-y-5 px-4 pb-8 pt-safe">
      <header className="flex items-center justify-between">
        <Link
          href="/feed"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur transition-colors hover:bg-white/20"
        >
          <ArrowLeft size={20} />
        </Link>
        <div className="font-semibold text-text-main">{t.profile}</div>
        <div className="w-10" />
      </header>

      <div className="relative">
        <div className="h-48 w-full overflow-hidden rounded-[28px] bg-[linear-gradient(135deg,#0b1520,#17324a)]">
          {user.bannerPath ? (
            <img src={withBasePath(user.bannerPath)} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="h-full w-full bg-[radial-gradient(ellipse_at_top_right,rgba(103,232,178,0.3),transparent_60%),linear-gradient(180deg,transparent,#000000_90%)]" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-black/20 to-transparent" />
        </div>

        <div className="relative z-10 -mt-12 px-5 text-center">
          <UserAvatar
            name={user.name}
            avatarPath={user.avatarPath}
            className="mx-auto h-24 w-24 border-4 border-background shadow-2xl"
            fallbackClassName="border-dashed bg-black/20"
            iconSize={24}
          />

          <h1 className="mt-4 font-display text-2xl font-bold text-text-main">{user.name}</h1>
          <p className="text-[15px] font-medium text-primary">@{user.handle}</p>

          <div className="mx-auto mt-4 max-w-[300px] whitespace-pre-wrap text-center text-[14px] leading-relaxed text-text-muted">
            {user.bio || t.fallbackBio}
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="rounded-[20px] border border-white/5 bg-white/5 p-4 shadow-lg backdrop-blur-md">
              <div className="flex items-center justify-center gap-2 text-sm text-text-muted">
                <Trophy size={14} className="text-primary" />
                {t.catches}
              </div>
              <div className="mt-2 text-[28px] font-bold leading-none text-white">{user._count.catches}</div>
            </div>
            <div className="rounded-[20px] border border-white/5 bg-white/5 p-4 shadow-lg backdrop-blur-md">
              <div className="flex items-center justify-center gap-2 text-sm text-text-muted">
                <CalendarDays size={14} className="text-accent" />
                {t.trips}
              </div>
              <div className="mt-2 text-[28px] font-bold leading-none text-white">{user._count.trips}</div>
            </div>
          </div>

          {viewer && viewer.id !== user.id ? (
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <FriendToggleButton handle={user.handle} initialRelationship={relationship} />
              <DirectChatButton handle={user.handle} />
            </div>
          ) : null}
        </div>
      </div>

      <FriendsPanel
        title={t.friends}
        subtitle={t.friendsSubtitle}
        emptyTitle={t.friendsEmptyTitle}
        emptyDescription={t.friendsEmptyDescription}
        openLabel={t.openFriends}
        friends={friends}
      />

      {user.experienceYears || user.preferredStyles || user.homeWater ? (
        <section className="glass-panel panel-scene rounded-[30px] border border-border-subtle p-4" style={profileSceneStyle}>
          <SectionHeader title={t.profile} />
          <div className="mt-4 grid gap-3">
            {user.experienceYears ? (
              <div className="rounded-[22px] border border-border-subtle bg-white/4 p-4">
                <div className="text-sm text-text-muted">{t.experience}</div>
                <div className="mt-1 text-lg font-semibold text-text-main">{t.years(user.experienceYears)}</div>
              </div>
            ) : null}
            {user.preferredStyles ? (
              <div className="rounded-[22px] border border-border-subtle bg-white/4 p-4">
                <div className="text-sm text-text-muted">{t.prefers}</div>
                <div className="mt-1 text-lg font-semibold text-text-main">{user.preferredStyles}</div>
              </div>
            ) : null}
            {user.homeWater ? (
              <div className="rounded-[22px] border border-border-subtle bg-white/4 p-4">
                <div className="text-sm text-text-muted">{t.favoriteWater}</div>
                <div className="mt-1 text-lg font-semibold text-text-main">{user.homeWater}</div>
              </div>
            ) : null}
          </div>
        </section>
      ) : null}

      {user.showInventory ? (
        <ProfileInventoryShowcase
          title={t.gearTitle}
          emptyLabel={t.emptyGear}
          items={user.inventoryItems}
        />
      ) : null}

      <section className="space-y-4">
        <SectionHeader title={t.postsTitle} />

        {catches.length > 0 ? (
          <div className="space-y-4">
            {catches.map((catchItem) => (
              <CatchCard key={catchItem.id} catchItem={catchItem} />
            ))}
          </div>
        ) : (
          <div className="rounded-[24px] border border-white/10 bg-white/5 py-10 text-center text-[13px] text-text-muted shadow-inner backdrop-blur-md">
            {t.emptyCatches}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <SectionHeader title={t.tripsTitle} />

        {user.trips.length > 0 ? (
          <div className="space-y-4">
            {user.trips.map((trip) => (
              <TripReportCard
                key={trip.id}
                trip={{
                  ...trip,
                  user,
                  place: {
                    ...trip.place,
                    displayImage: trip.place.photos[0]?.imagePath ?? trip.place.coverImage,
                    fishSpeciesList: trip.place.fishSpecies.split("|").map((item) => item.trim()).filter(Boolean),
                  },
                }}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-[24px] border border-white/10 bg-white/5 py-10 text-center text-[13px] text-text-muted shadow-inner backdrop-blur-md">
            {t.emptyTrips}
          </div>
        )}
      </section>
    </div>
  );
}

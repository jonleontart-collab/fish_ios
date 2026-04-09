import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays } from "lucide-react";

import { CatchCard } from "@/components/CatchCard";
import { DirectChatButton } from "@/components/DirectChatButton";
import { FriendToggleButton } from "@/components/FriendToggleButton";
import { FriendsDrawer } from "@/components/FriendsDrawer";
import { ProfileInventoryShowcase } from "@/components/ProfileInventoryShowcase";
import { SectionHeader } from "@/components/SectionHeader";
import { TripReportCard } from "@/components/TripReportCard";
import { UserAvatar } from "@/components/UserAvatar";
import { withBasePath } from "@/lib/app-paths";
import { type TranslationMap } from "@/lib/i18n";
import { getServerLanguage } from "@/lib/i18n-server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/queries";
import { areFriends, getFriendsForUser } from "@/lib/social";

export const dynamic = "force-dynamic";

const translations: TranslationMap<{
  profile: string;
  fallbackBio: string;
  catches: string;
  trips: string;
  friends: string;
  experience: string;
  prefers: string;
  favoriteWater: string;
  recentCatches: string;
  recentTrips: string;
  gear: string;
  gearLabel: string;
  emptyGear: string;
  emptyCatches: string;
  emptyTrips: string;
  noPhoto: string;
  years: (value: number) => string;
}> = {
  ru: {
    profile: "Профиль",
    fallbackBio: "Пользователь пока не заполнил био, но его публикации и поездки уже многое говорят о стиле ловли.",
    catches: "Уловы",
    trips: "Поездки",
    friends: "Друзья",
    experience: "Опыт ловли",
    prefers: "Предпочитает",
    favoriteWater: "Любимый водоем",
    recentCatches: "Публикации",
    recentTrips: "Поездки и отчеты",
    gear: "Инвентарь",
    gearLabel: "Снасти и экипировка",
    emptyGear: "Этот пользователь пока не открыл свой инвентарь.",
    emptyCatches: "Пользователь пока не добавил публикации.",
    emptyTrips: "У пользователя пока нет опубликованных поездок.",
    noPhoto: "Нет фото",
    years: (value) => `${value} лет`,
  },
  en: {
    profile: "Profile",
    fallbackBio: "This user has not filled in a bio yet, but the posts and trips already show the fishing style.",
    catches: "Catches",
    trips: "Trips",
    friends: "Friends",
    experience: "Experience",
    prefers: "Prefers",
    favoriteWater: "Favorite water",
    recentCatches: "Posts",
    recentTrips: "Trips and reports",
    gear: "Inventory",
    gearLabel: "Tackle and gear",
    emptyGear: "This user has not opened the inventory yet.",
    emptyCatches: "This user has not added posts yet.",
    emptyTrips: "This user does not have published trips yet.",
    noPhoto: "No photo",
    years: (value) => `${value} years`,
  },
  es: {
    profile: "Perfil",
    fallbackBio: "Este usuario aún no ha completado su bio, pero sus publicaciones y salidas ya muestran su estilo.",
    catches: "Capturas",
    trips: "Salidas",
    friends: "Amigos",
    experience: "Experiencia",
    prefers: "Prefiere",
    favoriteWater: "Agua favorita",
    recentCatches: "Publicaciones",
    recentTrips: "Salidas y reportes",
    gear: "Inventario",
    gearLabel: "Equipo y aparejos",
    emptyGear: "Este usuario aún no ha abierto su inventario.",
    emptyCatches: "Este usuario todavía no ha añadido publicaciones.",
    emptyTrips: "Este usuario aún no tiene salidas publicadas.",
    noPhoto: "Sin foto",
    years: (value) => `${value} años`,
  },
  fr: {
    profile: "Profil",
    fallbackBio: "Cet utilisateur n'a pas encore rempli sa bio, mais ses publications et sorties montrent déjà son style.",
    catches: "Prises",
    trips: "Sorties",
    friends: "Amis",
    experience: "Expérience",
    prefers: "Préfère",
    favoriteWater: "Plan d'eau favori",
    recentCatches: "Publications",
    recentTrips: "Sorties et rapports",
    gear: "Inventaire",
    gearLabel: "Matériel et équipement",
    emptyGear: "Cet utilisateur n'a pas encore ouvert son inventaire.",
    emptyCatches: "Cet utilisateur n'a pas encore ajouté de publications.",
    emptyTrips: "Cet utilisateur n'a pas encore de sorties publiées.",
    noPhoto: "Sans photo",
    years: (value) => `${value} ans`,
  },
  pt: {
    profile: "Perfil",
    fallbackBio: "Este usuário ainda não preencheu a bio, mas as publicações e viagens já mostram seu estilo.",
    catches: "Capturas",
    trips: "Viagens",
    friends: "Amigos",
    experience: "Experiência",
    prefers: "Prefere",
    favoriteWater: "Água favorita",
    recentCatches: "Publicações",
    recentTrips: "Viagens e relatórios",
    gear: "Inventário",
    gearLabel: "Equipamentos e apetrechos",
    emptyGear: "Este usuário ainda não abriu o inventário.",
    emptyCatches: "Este usuário ainda não adicionou publicações.",
    emptyTrips: "Este usuário ainda não tem viagens publicadas.",
    noPhoto: "Sem foto",
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

  const [friends, isFriend] = await Promise.all([
    getFriendsForUser(user.id),
    viewer ? areFriends(viewer.id, user.id) : false,
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

          <div className="mt-5 flex items-center justify-center gap-4 text-sm font-semibold text-text-muted">
            <div className="rounded-[16px] border border-white/5 bg-white/5 px-4 py-2 text-center shadow-lg backdrop-blur-md">
              <div className="font-display text-[20px] font-bold text-white">{user._count.catches}</div>
              <div className="mt-0.5 text-[10px] uppercase tracking-wider">{t.catches}</div>
            </div>
            <div className="rounded-[16px] border border-white/5 bg-white/5 px-4 py-2 text-center shadow-lg backdrop-blur-md">
              <div className="font-display text-[20px] font-bold text-white">{user._count.trips}</div>
              <div className="mt-0.5 text-[10px] uppercase tracking-wider">{t.trips}</div>
            </div>
            <FriendsDrawer title={t.friends} subtitle={`@${user.handle}`} friends={friends}>
              <button type="button" className="rounded-[16px] border border-white/5 bg-white/5 px-4 py-2 text-center shadow-lg backdrop-blur-md">
                <div className="font-display text-[20px] font-bold text-white">{friends.length}</div>
                <div className="mt-0.5 text-[10px] uppercase tracking-wider">{t.friends}</div>
              </button>
            </FriendsDrawer>
          </div>

          {viewer && viewer.id !== user.id ? (
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <FriendToggleButton handle={user.handle} initialIsFriend={isFriend} />
              <DirectChatButton handle={user.handle} />
            </div>
          ) : null}

          {user.experienceYears || user.preferredStyles || user.homeWater ? (
            <div className="mx-auto mt-6 grid max-w-[340px] grid-cols-1 gap-3 rounded-[20px] border border-white/5 bg-white/5 p-4 text-left shadow-inner sm:grid-cols-2">
              {user.experienceYears ? (
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-text-muted">{t.experience}</div>
                  <div className="mt-0.5 text-[14px] font-medium text-white">{t.years(user.experienceYears)}</div>
                </div>
              ) : null}
              {user.preferredStyles ? (
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-text-muted">{t.prefers}</div>
                  <div className="mt-0.5 text-[14px] font-medium text-white">{user.preferredStyles}</div>
                </div>
              ) : null}
              {user.homeWater ? (
                <div className="sm:col-span-2">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-text-muted">{t.favoriteWater}</div>
                  <div className="mt-0.5 text-[14px] font-medium text-white">{user.homeWater}</div>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>

      {user.showInventory ? (
        <ProfileInventoryShowcase
          title={t.gearLabel}
          subtitle={t.gear}
          emptyLabel={t.emptyGear}
          items={user.inventoryItems}
        />
      ) : null}

      <section className="space-y-4">
        <SectionHeader eyebrow={t.catches} />

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
        <SectionHeader
          eyebrow={t.trips}
          action={
            user.trips.length > 0 ? (
              <span className="inline-flex items-center gap-2 rounded-full bg-white/6 px-3 py-2 text-sm font-semibold text-text-muted">
                <CalendarDays size={14} />
                {user.trips.length}
              </span>
            ) : null
          }
        />

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

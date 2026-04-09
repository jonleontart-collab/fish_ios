import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Fish, MapPin, UserPlus } from "lucide-react";

import { withBasePath } from "@/lib/app-paths";
import { type TranslationMap } from "@/lib/i18n";
import { getServerLanguage } from "@/lib/i18n-server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const translations: TranslationMap<{
  profile: string;
  fallbackBio: string;
  catches: string;
  trips: string;
  follow: string;
  experience: string;
  prefers: string;
  favoriteWater: string;
  recentCatches: string;
  emptyCatches: string;
  years: (value: number) => string;
}> = {
  ru: {
    profile: "Профиль",
    fallbackBio: "Это страница рыбака-энтузиаста. О себе пока ничего не добавил, но уловы говорят сами за себя.",
    catches: "Уловов",
    trips: "Поездок",
    follow: "Подписаться",
    experience: "Опыт ловли",
    prefers: "Предпочитает",
    favoriteWater: "Любимый водоем",
    recentCatches: "Недавние уловы",
    emptyCatches: "Пользователь пока не загружал фото уловов.",
    years: (value) => `${value} ${value > 4 ? "лет" : "года"}`,
  },
  en: {
    profile: "Profile",
    fallbackBio: "This is an angler’s profile. No bio yet, but the catches speak for themselves.",
    catches: "Catches",
    trips: "Trips",
    follow: "Follow",
    experience: "Experience",
    prefers: "Prefers",
    favoriteWater: "Favorite water",
    recentCatches: "Recent catches",
    emptyCatches: "This user has not uploaded catch photos yet.",
    years: (value) => `${value} years`,
  },
  es: {
    profile: "Perfil",
    fallbackBio: "Esta es la página de un pescador entusiasta. Aún no añadió biografía, pero las capturas hablan por sí solas.",
    catches: "Capturas",
    trips: "Salidas",
    follow: "Seguir",
    experience: "Experiencia",
    prefers: "Prefiere",
    favoriteWater: "Agua favorita",
    recentCatches: "Capturas recientes",
    emptyCatches: "Este usuario todavía no ha subido fotos de capturas.",
    years: (value) => `${value} años`,
  },
  fr: {
    profile: "Profil",
    fallbackBio: "Voici la page d'un pêcheur passionné. Il n'a pas encore ajouté de bio, mais ses prises parlent pour lui.",
    catches: "Prises",
    trips: "Sorties",
    follow: "Suivre",
    experience: "Expérience",
    prefers: "Préfère",
    favoriteWater: "Plan d'eau favori",
    recentCatches: "Prises récentes",
    emptyCatches: "Cet utilisateur n'a pas encore publié de photos de prises.",
    years: (value) => `${value} ans`,
  },
  pt: {
    profile: "Perfil",
    fallbackBio: "Esta é a página de um pescador entusiasta. Ainda não adicionou bio, mas as capturas falam por si.",
    catches: "Capturas",
    trips: "Viagens",
    follow: "Seguir",
    experience: "Experiência",
    prefers: "Prefere",
    favoriteWater: "Água favorita",
    recentCatches: "Capturas recentes",
    emptyCatches: "Este usuário ainda não enviou fotos de capturas.",
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
  const { handle } = await params;

  const user = await prisma.user.findUnique({
    where: { handle },
    include: {
      _count: {
        select: {
          catches: true,
          trips: true,
        },
      },
      catches: {
        include: { place: true },
        orderBy: { createdAt: "desc" },
        take: 3,
      },
    },
  });

  if (!user) {
    notFound();
  }

  return (
    <div className="flex h-full flex-col pb-24 pt-safe sm:pt-6">
      <header className="relative z-10 mb-4 flex items-center justify-between px-4">
        <Link href="/profile" className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur transition-colors hover:bg-white/20">
          <ArrowLeft size={20} />
        </Link>
        <div className="font-semibold text-text-main">{t.profile}</div>
        <div className="w-10" />
      </header>

      <div className="relative -mt-16 sm:mt-0">
        <div className="h-48 w-full overflow-hidden bg-[linear-gradient(135deg,#0b1520,#17324a)] sm:rounded-t-[34px]">
          {user.bannerPath ? (
            <img src={withBasePath(user.bannerPath)} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="h-full w-full bg-[radial-gradient(ellipse_at_top_right,rgba(103,232,178,0.3),transparent_60%),linear-gradient(180deg,transparent,#000000_90%)]" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-black/20 to-transparent" />
        </div>

        <div className="relative z-10 -mt-12 px-5 text-center">
          {user.avatarPath ? (
            <img src={withBasePath(user.avatarPath)} alt={user.name} className="mx-auto h-24 w-24 rounded-full border-4 border-background bg-surface object-cover shadow-2xl" />
          ) : (
            <div className={`mx-auto flex h-24 w-24 items-center justify-center rounded-full border-4 border-background bg-gradient-to-br ${user.avatarGradient} text-3xl font-bold text-slate-950 shadow-2xl`}>
              {user.name.slice(0, 1)}
            </div>
          )}

          <h1 className="mt-4 font-display text-2xl font-bold text-text-main">{user.name}</h1>
          <p className="text-[15px] font-medium text-primary">@{user.handle}</p>

          <div className="mx-auto mt-4 max-w-[280px] whitespace-pre-wrap text-center text-[14px] leading-relaxed text-text-muted">
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
            {user.city ? (
              <div className="rounded-[16px] border border-white/5 bg-white/5 px-4 py-2 text-center shadow-lg backdrop-blur-md">
                <div className="flex h-[30px] items-center justify-center text-[20px] text-white">
                  <MapPin size={18} />
                </div>
                <div className="mt-0.5 max-w-[75px] truncate px-1 text-[10px] uppercase tracking-wider">{user.city}</div>
              </div>
            ) : null}
          </div>

          <div className="mt-6">
            <button className="inline-flex w-full items-center justify-center gap-2 rounded-[20px] bg-primary px-8 py-3.5 text-[15px] font-bold text-black shadow-[0_8px_24px_rgba(103,232,178,0.24)] transition-transform hover:bg-primary-strong active:scale-95 sm:w-auto">
              <UserPlus size={18} />
              {t.follow}
            </button>
          </div>

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

      <div className="mt-8 px-4">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-white">
          <Fish size={18} className="text-primary" />
          {t.recentCatches}
        </h2>

        {user.catches.length > 0 ? (
          <div className="grid grid-cols-3 gap-2">
            {user.catches.map((catchItem) => (
              <div key={catchItem.id} className="group relative aspect-square overflow-hidden rounded-[16px] border border-white/5 bg-surface shadow-lg">
                <img src={withBasePath(catchItem.imagePath)} alt="" className="h-full w-full object-cover transition-transform group-hover:scale-110" />
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-[24px] border border-white/10 bg-white/5 py-10 text-center text-[13px] text-text-muted shadow-inner backdrop-blur-md">
            {t.emptyCatches}
          </div>
        )}
      </div>
    </div>
  );
}

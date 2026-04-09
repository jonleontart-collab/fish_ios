import Link from "next/link";
import { ArrowLeft, CalendarDays, ShoppingBag, Trophy, Users } from "lucide-react";

import { CatchCard } from "@/components/CatchCard";
import { FriendsDrawer } from "@/components/FriendsDrawer";
import { InventoryManager } from "@/components/InventoryManager";
import { LogoutButton } from "@/components/LogoutButton";
import { ProfileEditor } from "@/components/ProfileEditor";
import { TripReportCard } from "@/components/TripReportCard";
import { withBasePath } from "@/lib/app-paths";
import { shoppingStatusLabel } from "@/lib/format";
import { type TranslationMap } from "@/lib/i18n";
import { getServerLanguage } from "@/lib/i18n-server";
import { getProfilePageData } from "@/lib/queries";

export const dynamic = "force-dynamic";

const translations: TranslationMap<{
  back: string;
  fallbackBio: string;
  catches: string;
  trips: string;
  friends: string;
  profileActions: string;
  anglerPassport: string;
  experience: string;
  homeWater: string;
  style: string;
  emptyField: string;
  shoppingList: string;
  tripLabel: string;
  emptyShopping: string;
  myCatches: string;
  latestPosts: string;
  add: string;
  noPosts: string;
  myTrips: string;
  planAndReports: string;
  allTrips: string;
  noTrips: string;
  years: (value: number) => string;
  noPhoto: string;
  logout: string;
}> = {
  ru: {
    back: "Назад на главную",
    fallbackBio: "Добавьте пару слов о себе, чтобы другие рыбаки быстрее понимали, как вы ловите и что публикуете.",
    catches: "Уловы",
    trips: "Поездки",
    friends: "Друзья",
    profileActions: "Профиль",
    anglerPassport: "О профиле",
    experience: "Опыт",
    homeWater: "Основная акватория",
    style: "Стиль ловли",
    emptyField: "Еще не заполнено",
    shoppingList: "Покупки к поездкам",
    tripLabel: "Поездка",
    emptyShopping: "Список покупок пуст. В планировщике можно собрать покупки под конкретные поездки.",
    myCatches: "Лента профиля",
    latestPosts: "Публикации",
    add: "Добавить",
    noPosts: "Публикаций пока нет. Добавь улов или отчет о поездке, и профиль оживет.",
    myTrips: "Мои поездки",
    planAndReports: "Поездки и отчеты",
    allTrips: "Все поездки",
    noTrips: "Пока нет поездок. Запланируй выезд, добавь цели и потом опубликуй отчет в ленту.",
    years: (value) => `${value} лет`,
    noPhoto: "Нет фото",
    logout: "Выйти",
  },
  en: {
    back: "Back home",
    fallbackBio: "Add a few words about yourself so other anglers can quickly understand your style and feed.",
    catches: "Catches",
    trips: "Trips",
    friends: "Friends",
    profileActions: "Profile",
    anglerPassport: "About",
    experience: "Experience",
    homeWater: "Home water",
    style: "Fishing style",
    emptyField: "Not filled yet",
    shoppingList: "Trip shopping list",
    tripLabel: "Trip",
    emptyShopping: "Your shopping list is empty. Use the planner to collect purchases for specific trips.",
    myCatches: "Profile feed",
    latestPosts: "Posts",
    add: "Add",
    noPosts: "No posts yet. Add a catch or a trip report to bring this profile to life.",
    myTrips: "My trips",
    planAndReports: "Trips and reports",
    allTrips: "All trips",
    noTrips: "No trips yet. Plan one, add goals, and publish the report later.",
    years: (value) => `${value} years`,
    noPhoto: "No photo",
    logout: "Log out",
  },
  es: {
    back: "Volver al inicio",
    fallbackBio: "Añade unas palabras sobre ti para que otros pescadores entiendan tu estilo y tu feed.",
    catches: "Capturas",
    trips: "Salidas",
    friends: "Amigos",
    profileActions: "Perfil",
    anglerPassport: "Acerca del perfil",
    experience: "Experiencia",
    homeWater: "Agua principal",
    style: "Estilo de pesca",
    emptyField: "Aún no completado",
    shoppingList: "Compras para salidas",
    tripLabel: "Salida",
    emptyShopping: "La lista de compras está vacía. Usa el planificador para preparar compras por salida.",
    myCatches: "Feed del perfil",
    latestPosts: "Publicaciones",
    add: "Añadir",
    noPosts: "Todavía no hay publicaciones. Añade una captura o un reporte para dar vida al perfil.",
    myTrips: "Mis salidas",
    planAndReports: "Salidas y reportes",
    allTrips: "Todas las salidas",
    noTrips: "Aún no hay salidas. Planifica una, añade objetivos y publica el reporte después.",
    years: (value) => `${value} años`,
    noPhoto: "Sin foto",
    logout: "Salir",
  },
  fr: {
    back: "Retour à l'accueil",
    fallbackBio: "Ajoutez quelques mots sur vous pour que d'autres pêcheurs comprennent votre style et votre feed.",
    catches: "Prises",
    trips: "Sorties",
    friends: "Amis",
    profileActions: "Profil",
    anglerPassport: "À propos",
    experience: "Expérience",
    homeWater: "Plan d'eau principal",
    style: "Style de pêche",
    emptyField: "Pas encore renseigné",
    shoppingList: "Achats pour les sorties",
    tripLabel: "Sortie",
    emptyShopping: "La liste d'achats est vide. Utilisez le planificateur pour préparer les sorties.",
    myCatches: "Feed du profil",
    latestPosts: "Publications",
    add: "Ajouter",
    noPosts: "Aucune publication pour le moment. Ajoutez une prise ou un rapport pour animer le profil.",
    myTrips: "Mes sorties",
    planAndReports: "Sorties et rapports",
    allTrips: "Toutes les sorties",
    noTrips: "Aucune sortie pour le moment. Planifiez-en une, ajoutez des objectifs et publiez le rapport ensuite.",
    years: (value) => `${value} ans`,
    noPhoto: "Sans photo",
    logout: "Déconnexion",
  },
  pt: {
    back: "Voltar ao início",
    fallbackBio: "Adicione algumas palavras sobre você para que outros pescadores entendam seu estilo e seu feed.",
    catches: "Capturas",
    trips: "Viagens",
    friends: "Amigos",
    profileActions: "Perfil",
    anglerPassport: "Sobre",
    experience: "Experiência",
    homeWater: "Água principal",
    style: "Estilo de pesca",
    emptyField: "Ainda não preenchido",
    shoppingList: "Compras para viagens",
    tripLabel: "Viagem",
    emptyShopping: "A lista de compras está vazia. Use o planejador para montar compras por viagem.",
    myCatches: "Feed do perfil",
    latestPosts: "Publicações",
    add: "Adicionar",
    noPosts: "Ainda não há publicações. Adicione uma captura ou um relatório para dar vida ao perfil.",
    myTrips: "Minhas viagens",
    planAndReports: "Viagens e relatórios",
    allTrips: "Todas as viagens",
    noTrips: "Ainda não há viagens. Planeje uma, defina objetivos e publique o relatório depois.",
    years: (value) => `${value} anos`,
    noPhoto: "Sem foto",
    logout: "Sair",
  },
};

export default async function ProfilePage() {
  const lang = await getServerLanguage();
  const t = translations[lang];
  const profile = await getProfilePageData();

  return (
    <div className="space-y-5 px-4 pb-8 pt-safe">
      <div className="flex items-center justify-between gap-3">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-text-muted">
          <ArrowLeft size={16} />
          {t.back}
        </Link>
        <LogoutButton label={t.logout} />
      </div>

      <div className="relative mb-6 -mt-2 sm:mt-0">
        <div className="h-48 w-full overflow-hidden rounded-[28px] bg-[linear-gradient(135deg,#0b1520,#17324a)]">
          {profile.user.bannerPath ? (
            <img src={withBasePath(profile.user.bannerPath)} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="h-full w-full bg-[radial-gradient(ellipse_at_top_right,rgba(103,232,178,0.3),transparent_60%),linear-gradient(180deg,transparent,#000000_90%)]" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-black/20 to-transparent" />
        </div>

        <div className="relative z-10 -mt-12 px-5 text-center">
          {profile.user.avatarPath ? (
            <img src={withBasePath(profile.user.avatarPath)} alt={profile.user.name} className="mx-auto h-28 w-28 rounded-full border-4 border-background bg-surface object-cover shadow-2xl" />
          ) : (
            <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-full border-4 border-background border-dashed bg-black/20 text-sm font-semibold text-text-muted shadow-2xl">
              {t.noPhoto}
            </div>
          )}

          <h1 className="mt-4 font-display text-[26px] font-bold text-white">{profile.user.name}</h1>
          <p className="text-[15px] font-bold text-primary">@{profile.user.handle}</p>

          <div className="mx-auto mt-4 max-w-[300px] whitespace-pre-wrap text-center text-[14px] font-medium leading-relaxed text-text-muted">
            {profile.user.bio || t.fallbackBio}
          </div>

          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <div className="min-w-[90px] flex-1 rounded-[20px] border border-white/5 bg-white/5 p-3 shadow-xl backdrop-blur-md">
              <div className="mb-1 flex items-center justify-center gap-2 text-[11px] font-bold uppercase tracking-wider text-text-muted">
                <Trophy size={14} className="text-primary" /> {t.catches}
              </div>
              <div className="text-[24px] font-bold leading-none text-white">{profile.stats.catches}</div>
            </div>

            <div className="min-w-[90px] flex-1 rounded-[20px] border border-white/5 bg-white/5 p-3 shadow-xl backdrop-blur-md">
              <div className="mb-1 flex items-center justify-center gap-2 text-[11px] font-bold uppercase tracking-wider text-text-muted">
                <CalendarDays size={14} className="text-accent" /> {t.trips}
              </div>
              <div className="text-[24px] font-bold leading-none text-white">{profile.stats.trips}</div>
            </div>

            <FriendsDrawer title={t.friends} subtitle={t.profileActions} friends={profile.friends}>
              <button
                type="button"
                className="min-w-[90px] flex-1 rounded-[20px] border border-white/5 bg-white/5 p-3 shadow-xl transition hover:bg-white/10"
              >
                <div className="mb-1 flex items-center justify-center gap-2 text-[11px] font-bold uppercase tracking-wider text-text-muted">
                  <Users size={14} className="text-primary" /> {t.friends}
                </div>
                <div className="flex items-center justify-center gap-2">
                  <div className="text-[24px] font-bold leading-none text-white">{profile.stats.friends}</div>
                  {profile.friends.length > 0 ? (
                    <div className="flex -space-x-2">
                      {profile.friends.slice(0, 2).map((friend) =>
                        friend.avatarPath ? (
                          <img key={friend.id} src={withBasePath(friend.avatarPath)} alt="" className="h-6 w-6 rounded-full border border-background bg-zinc-800 object-cover" />
                        ) : (
                          <div key={friend.id} className={`flex h-6 w-6 items-center justify-center rounded-full border border-background bg-gradient-to-br ${friend.avatarGradient} text-[10px] font-bold text-slate-950`}>
                            {friend.name.slice(0, 1).toUpperCase()}
                          </div>
                        ),
                      )}
                    </div>
                  ) : null}
                </div>
              </button>
            </FriendsDrawer>
          </div>

          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <ProfileEditor user={profile.user} />
            <Link
              href="/add"
              className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/6 px-4 py-3 text-sm font-semibold text-text-main transition hover:bg-white/10"
            >
              {t.add}
            </Link>
          </div>
        </div>
      </div>

      <section className="glass-panel rounded-[30px] border border-border-subtle p-4">
        <div className="text-sm text-text-muted">{t.anglerPassport}</div>
        <div className="mt-4 grid gap-3">
          <div className="rounded-[22px] border border-border-subtle bg-white/4 p-4">
            <div className="text-sm text-text-muted">{t.experience}</div>
            <div className="mt-1 text-lg font-semibold text-text-main">
              {profile.user.experienceYears ? t.years(profile.user.experienceYears) : t.emptyField}
            </div>
          </div>
          <div className="rounded-[22px] border border-border-subtle bg-white/4 p-4">
            <div className="text-sm text-text-muted">{t.homeWater}</div>
            <div className="mt-1 text-lg font-semibold text-text-main">{profile.user.homeWater ?? t.emptyField}</div>
          </div>
          <div className="rounded-[22px] border border-border-subtle bg-white/4 p-4">
            <div className="text-sm text-text-muted">{t.style}</div>
            <div className="mt-1 text-lg font-semibold text-text-main">{profile.user.preferredStyles ?? t.emptyField}</div>
          </div>
        </div>
      </section>

      <InventoryManager items={profile.inventoryItems} />

      <section className="glass-panel rounded-[30px] border border-border-subtle p-4">
        <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-text-main">
          <ShoppingBag size={16} className="text-primary" />
          {t.shoppingList}
        </div>
        <div className="space-y-3">
          {profile.shoppingItems.length > 0 ? (
            profile.shoppingItems.map((item) => (
              <div key={item.id} className="rounded-[22px] border border-border-subtle bg-white/4 p-4">
                <div className="font-semibold text-text-main">{item.title}</div>
                <div className="mt-1 text-sm text-text-muted">
                  {shoppingStatusLabel(item.status, lang)}, {item.quantity} pcs
                </div>
                {item.trip ? <div className="mt-1 text-xs text-text-soft">{t.tripLabel}: {item.trip.title}</div> : null}
                {item.notes ? <div className="mt-2 text-sm leading-6 text-text-soft">{item.notes}</div> : null}
              </div>
            ))
          ) : (
            <div className="rounded-[22px] border border-dashed border-border-subtle px-4 py-5 text-sm text-text-muted">
              {t.emptyShopping}
            </div>
          )}
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-text-muted">{t.myCatches}</div>
            <h2 className="font-display text-2xl font-semibold text-text-main">{t.latestPosts}</h2>
          </div>
          <Link href="/add" className="text-sm font-semibold text-primary">
            {t.add}
          </Link>
        </div>
        <div className="space-y-4">
          {profile.catches.length > 0 ? (
            profile.catches.map((catchItem) => <CatchCard key={catchItem.id} catchItem={catchItem} showUser={false} />)
          ) : (
            <div className="glass-panel rounded-[28px] border border-dashed border-border-subtle p-5 text-sm text-text-muted">
              {t.noPosts}
            </div>
          )}
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-text-muted">{t.myTrips}</div>
            <h2 className="font-display text-2xl font-semibold text-text-main">{t.planAndReports}</h2>
          </div>
          <Link href="/trips" className="text-sm font-semibold text-primary">
            {t.allTrips}
          </Link>
        </div>
        <div className="space-y-4">
          {profile.trips.length > 0 ? (
            profile.trips.slice(0, 3).map((trip) => (
              <TripReportCard
                key={trip.id}
                trip={{
                  ...trip,
                  user: profile.user,
                }}
              />
            ))
          ) : (
            <div className="glass-panel rounded-[28px] border border-dashed border-border-subtle p-5 text-sm text-text-muted">
              {t.noTrips}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

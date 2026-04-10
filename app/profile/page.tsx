import type { CSSProperties } from "react";
import Link from "next/link";
import { ArrowLeft, CalendarDays, Trophy } from "lucide-react";

import { CatchCard } from "@/components/CatchCard";
import { FriendsPanel } from "@/components/FriendsPanel";
import { FriendRequestsPanel } from "@/components/FriendRequestsPanel";
import { InventoryManager } from "@/components/InventoryManager";
import { LogoutButton } from "@/components/LogoutButton";
import { ProfileEditor } from "@/components/ProfileEditor";
import { ProfileInventoryShowcase } from "@/components/ProfileInventoryShowcase";
import { SectionHeader } from "@/components/SectionHeader";
import { TripReportCard } from "@/components/TripReportCard";
import { UserAvatar } from "@/components/UserAvatar";
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
  friendsSubtitle: string;
  friendsEmptyTitle: string;
  friendsEmptyDescription: string;
  openFriends: string;
  about: string;
  experience: string;
  homeWater: string;
  style: string;
  emptyField: string;
  shopping: string;
  tripLabel: string;
  emptyShopping: string;
  posts: string;
  add: string;
  noPosts: string;
  tripsTitle: string;
  allTrips: string;
  noTrips: string;
  gearTitle: string;
  gearEmpty: string;
  years: (value: number) => string;
  logout: string;
}> = {
  ru: {
    back: "Назад на главную",
    fallbackBio: "Добавь пару слов о себе, чтобы другие рыбаки сразу понимали твой стиль и что ты публикуешь.",
    catches: "Уловы",
    trips: "Поездки",
    friends: "Друзья",
    friendsSubtitle: "Твой круг общения",
    friendsEmptyTitle: "Пока без друзей",
    friendsEmptyDescription: "Добавляй людей из профилей, и они появятся здесь.",
    openFriends: "Все",
    about: "Профиль",
    experience: "Опыт",
    homeWater: "Основная акватория",
    style: "Стиль ловли",
    emptyField: "Еще не заполнено",
    shopping: "Покупки",
    tripLabel: "Поездка",
    emptyShopping: "Список покупок пуст. В планировщике можно собрать покупки под конкретные поездки.",
    posts: "Улов",
    add: "Добавить",
    noPosts: "Публикаций пока нет. Добавь улов или отчет о поездке, и профиль оживет.",
    tripsTitle: "Поездки",
    allTrips: "Все поездки",
    noTrips: "Пока нет поездок. Запланируй выезд, добавь цели и потом опубликуй отчет в ленту.",
    gearTitle: "Снаряжение",
    gearEmpty: "Пока нет добавленных снастей. Заполни инвентарь, чтобы профиль выглядел живым и полезным.",
    years: (value) => `${value} лет`,
    logout: "Выйти",
  },
  en: {
    back: "Back home",
    fallbackBio: "Add a few words about yourself so other anglers can quickly understand your style and feed.",
    catches: "Catches",
    trips: "Trips",
    friends: "Friends",
    friendsSubtitle: "Your circle",
    friendsEmptyTitle: "No friends yet",
    friendsEmptyDescription: "Add people from profiles and they will appear here.",
    openFriends: "All",
    about: "Profile",
    experience: "Experience",
    homeWater: "Home water",
    style: "Fishing style",
    emptyField: "Not filled yet",
    shopping: "Shopping",
    tripLabel: "Trip",
    emptyShopping: "Your shopping list is empty. Use the planner to collect purchases for specific trips.",
    posts: "Posts",
    add: "Add",
    noPosts: "No posts yet. Add a catch or a trip report to bring this profile to life.",
    tripsTitle: "Trips",
    allTrips: "All trips",
    noTrips: "No trips yet. Plan one, add goals, and publish the report later.",
    gearTitle: "Gear",
    gearEmpty: "No tackle added yet. Fill your inventory to make the profile more useful.",
    years: (value) => `${value} years`,
    logout: "Log out",
  },
  es: {
    back: "Volver al inicio",
    fallbackBio: "Añade unas palabras sobre ti para que otros pescadores entiendan tu estilo y tu feed.",
    catches: "Capturas",
    trips: "Salidas",
    friends: "Amigos",
    friendsSubtitle: "Tu círculo",
    friendsEmptyTitle: "Aún no hay amigos",
    friendsEmptyDescription: "Añade gente desde los perfiles y aparecerán aquí.",
    openFriends: "Todos",
    about: "Perfil",
    experience: "Experiencia",
    homeWater: "Agua principal",
    style: "Estilo de pesca",
    emptyField: "Aún no completado",
    shopping: "Compras",
    tripLabel: "Salida",
    emptyShopping: "La lista de compras está vacía. Usa el planificador para preparar compras por salida.",
    posts: "Publicaciones",
    add: "Añadir",
    noPosts: "Todavía no hay publicaciones. Añade una captura o un reporte para dar vida al perfil.",
    tripsTitle: "Salidas",
    allTrips: "Todas las salidas",
    noTrips: "Aún no hay salidas. Planifica una, añade objetivos y publica el reporte después.",
    gearTitle: "Equipo",
    gearEmpty: "Todavía no hay equipo añadido. Completa el inventario para dar más vida al perfil.",
    years: (value) => `${value} años`,
    logout: "Salir",
  },
  fr: {
    back: "Retour à l'accueil",
    fallbackBio: "Ajoutez quelques mots sur vous pour que d'autres pêcheurs comprennent votre style et votre feed.",
    catches: "Prises",
    trips: "Sorties",
    friends: "Amis",
    friendsSubtitle: "Votre cercle",
    friendsEmptyTitle: "Pas encore d'amis",
    friendsEmptyDescription: "Ajoutez des personnes depuis les profils et elles apparaîtront ici.",
    openFriends: "Tout",
    about: "Profil",
    experience: "Expérience",
    homeWater: "Plan d'eau principal",
    style: "Style de pêche",
    emptyField: "Pas encore renseigné",
    shopping: "Achats",
    tripLabel: "Sortie",
    emptyShopping: "La liste d'achats est vide. Utilisez le planificateur pour préparer les sorties.",
    posts: "Publications",
    add: "Ajouter",
    noPosts: "Aucune publication pour le moment. Ajoutez une prise ou un rapport pour animer le profil.",
    tripsTitle: "Sorties",
    allTrips: "Toutes les sorties",
    noTrips: "Aucune sortie pour le moment. Planifiez-en une, ajoutez des objectifs et publiez le rapport ensuite.",
    gearTitle: "Équipement",
    gearEmpty: "Aucun matériel ajouté pour le moment. Remplissez l'inventaire pour enrichir le profil.",
    years: (value) => `${value} ans`,
    logout: "Déconnexion",
  },
  pt: {
    back: "Voltar ao início",
    fallbackBio: "Adicione algumas palavras sobre você para que outros pescadores entendam seu estilo e seu feed.",
    catches: "Capturas",
    trips: "Viagens",
    friends: "Amigos",
    friendsSubtitle: "Seu círculo",
    friendsEmptyTitle: "Ainda sem amigos",
    friendsEmptyDescription: "Adicione pessoas pelos perfis e elas aparecerão aqui.",
    openFriends: "Todos",
    about: "Perfil",
    experience: "Experiência",
    homeWater: "Água principal",
    style: "Estilo de pesca",
    emptyField: "Ainda não preenchido",
    shopping: "Compras",
    tripLabel: "Viagem",
    emptyShopping: "A lista de compras está vazia. Use o planejador para montar compras por viagem.",
    posts: "Publicações",
    add: "Adicionar",
    noPosts: "Ainda não há publicações. Adicione uma captura ou um relatório para dar vida ao perfil.",
    tripsTitle: "Viagens",
    allTrips: "Todas as viagens",
    noTrips: "Ainda não há viagens. Planeje uma, defina objetivos e publique o relatório depois.",
    gearTitle: "Equipamentos",
    gearEmpty: "Ainda não há equipamento cadastrado. Preencha o inventário para enriquecer o perfil.",
    years: (value) => `${value} anos`,
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
          <UserAvatar
            name={profile.user.name}
            avatarPath={profile.user.avatarPath}
            className="mx-auto h-28 w-28 border-4 border-background shadow-2xl"
            fallbackClassName="border-dashed bg-black/20"
            iconSize={28}
          />

          <h1 className="mt-4 font-display text-[26px] font-bold text-white">{profile.user.name}</h1>
          <p className="text-[15px] font-bold text-primary">@{profile.user.handle}</p>

          <div className="mx-auto mt-4 max-w-[300px] whitespace-pre-wrap text-center text-[14px] font-medium leading-relaxed text-text-muted">
            {profile.user.bio || t.fallbackBio}
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <div className="rounded-[20px] border border-white/5 bg-white/5 p-4 shadow-xl backdrop-blur-md">
              <div className="flex items-center justify-center gap-2 text-sm text-text-muted">
                <Trophy size={14} className="text-primary" />
                {t.catches}
              </div>
              <div className="mt-2 text-[28px] font-bold leading-none text-white">{profile.stats.catches}</div>
            </div>

            <div className="rounded-[20px] border border-white/5 bg-white/5 p-4 shadow-xl backdrop-blur-md">
              <div className="flex items-center justify-center gap-2 text-sm text-text-muted">
                <CalendarDays size={14} className="text-accent" />
                {t.trips}
              </div>
              <div className="mt-2 text-[28px] font-bold leading-none text-white">{profile.stats.trips}</div>
            </div>
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

      <FriendRequestsPanel initialRequests={profile.friendRequests} />

      <FriendsPanel
        title={t.friends}
        subtitle={t.friendsSubtitle}
        emptyTitle={t.friendsEmptyTitle}
        emptyDescription={t.friendsEmptyDescription}
        openLabel={t.openFriends}
        friends={profile.friends}
      />

      <section className="glass-panel panel-scene rounded-[30px] border border-border-subtle p-4" style={{ "--panel-scene-image": `url('${withBasePath("/modal-backgrounds/profile-panel-bg.png")}')` } as CSSProperties}>
        <SectionHeader title={t.about} />
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

      <ProfileInventoryShowcase
        title={t.gearTitle}
        emptyLabel={t.gearEmpty}
        items={profile.inventoryItems.slice(0, 4)}
        action={
          <span className="inline-flex items-center gap-2 rounded-full bg-white/8 px-3 py-2 text-sm font-semibold text-text-main">
            {profile.inventoryItems.length}
          </span>
        }
      />

      <InventoryManager items={profile.inventoryItems} />

      <section className="glass-panel panel-scene rounded-[30px] border border-border-subtle p-4" style={{ "--panel-scene-image": `url('${withBasePath("/modal-backgrounds/profile-panel-bg.png")}')` } as CSSProperties}>
        <SectionHeader title={t.shopping} />
        <div className="mt-4 space-y-3">
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
        <SectionHeader
          title={t.posts}
          action={
            <Link
              href="/add"
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/6 px-3.5 py-2 text-sm font-semibold text-text-main transition hover:bg-white/10"
            >
              {t.add}
            </Link>
          }
        />
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
        <SectionHeader
          title={t.tripsTitle}
          action={
            <Link
              href="/trips"
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/6 px-3.5 py-2 text-sm font-semibold text-text-main transition hover:bg-white/10"
            >
              {t.allTrips}
            </Link>
          }
        />
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

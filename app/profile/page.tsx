import Link from "next/link";
import { ArrowLeft, CalendarDays, Trophy, Users } from "lucide-react";

import { CatchCard } from "@/components/CatchCard";
import { FriendsDrawer } from "@/components/FriendsDrawer";
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
  profileActions: string;
  about: string;
  experience: string;
  homeWater: string;
  style: string;
  emptyField: string;
  shoppingList: string;
  tripLabel: string;
  emptyShopping: string;
  latestPosts: string;
  add: string;
  noPosts: string;
  planAndReports: string;
  allTrips: string;
  noTrips: string;
  gear: string;
  gearLabel: string;
  gearEmpty: string;
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
    about: "О профиле",
    experience: "Опыт",
    homeWater: "Основная акватория",
    style: "Стиль ловли",
    emptyField: "Еще не заполнено",
    shoppingList: "Покупки к поездкам",
    tripLabel: "Поездка",
    emptyShopping: "Список покупок пуст. В планировщике можно собрать покупки под конкретные поездки.",
    latestPosts: "Публикации",
    add: "Добавить",
    noPosts: "Публикаций пока нет. Добавь улов или отчет о поездке, и профиль оживет.",
    planAndReports: "Поездки и отчеты",
    allTrips: "Все поездки",
    noTrips: "Пока нет поездок. Запланируй выезд, добавь цели и потом опубликуй отчет в ленту.",
    gear: "Инвентарь",
    gearLabel: "Снасти и экипировка",
    gearEmpty: "Пока нет добавленных снастей. Заполни инвентарь, чтобы профиль выглядел живым и полезным.",
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
    about: "About",
    experience: "Experience",
    homeWater: "Home water",
    style: "Fishing style",
    emptyField: "Not filled yet",
    shoppingList: "Trip shopping list",
    tripLabel: "Trip",
    emptyShopping: "Your shopping list is empty. Use the planner to collect purchases for specific trips.",
    latestPosts: "Posts",
    add: "Add",
    noPosts: "No posts yet. Add a catch or a trip report to bring this profile to life.",
    planAndReports: "Trips and reports",
    allTrips: "All trips",
    noTrips: "No trips yet. Plan one, add goals, and publish the report later.",
    gear: "Inventory",
    gearLabel: "Tackle and gear",
    gearEmpty: "No tackle added yet. Fill your inventory to make the profile more useful.",
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
    about: "Acerca del perfil",
    experience: "Experiencia",
    homeWater: "Agua principal",
    style: "Estilo de pesca",
    emptyField: "Aún no completado",
    shoppingList: "Compras para salidas",
    tripLabel: "Salida",
    emptyShopping: "La lista de compras está vacía. Usa el planificador para preparar compras por salida.",
    latestPosts: "Publicaciones",
    add: "Añadir",
    noPosts: "Todavía no hay publicaciones. Añade una captura o un reporte para dar vida al perfil.",
    planAndReports: "Salidas y reportes",
    allTrips: "Todas las salidas",
    noTrips: "Aún no hay salidas. Planifica una, añade objetivos y publica el reporte después.",
    gear: "Inventario",
    gearLabel: "Equipo y aparejos",
    gearEmpty: "Todavía no hay equipo añadido. Completa el inventario para dar más vida al perfil.",
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
    about: "À propos",
    experience: "Expérience",
    homeWater: "Plan d'eau principal",
    style: "Style de pêche",
    emptyField: "Pas encore renseigné",
    shoppingList: "Achats pour les sorties",
    tripLabel: "Sortie",
    emptyShopping: "La liste d'achats est vide. Utilisez le planificateur pour préparer les sorties.",
    latestPosts: "Publications",
    add: "Ajouter",
    noPosts: "Aucune publication pour le moment. Ajoutez une prise ou un rapport pour animer le profil.",
    planAndReports: "Sorties et rapports",
    allTrips: "Toutes les sorties",
    noTrips: "Aucune sortie pour le moment. Planifiez-en une, ajoutez des objectifs et publiez le rapport ensuite.",
    gear: "Inventaire",
    gearLabel: "Matériel et équipement",
    gearEmpty: "Aucun matériel ajouté pour le moment. Remplissez votre inventaire pour enrichir le profil.",
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
    about: "Sobre",
    experience: "Experiência",
    homeWater: "Água principal",
    style: "Estilo de pesca",
    emptyField: "Ainda não preenchido",
    shoppingList: "Compras para viagens",
    tripLabel: "Viagem",
    emptyShopping: "A lista de compras está vazia. Use o planejador para montar compras por viagem.",
    latestPosts: "Publicações",
    add: "Adicionar",
    noPosts: "Ainda não há publicações. Adicione uma captura ou um relatório para dar vida ao perfil.",
    planAndReports: "Viagens e relatórios",
    allTrips: "Todas as viagens",
    noTrips: "Ainda não há viagens. Planeje uma, defina objetivos e publique o relatório depois.",
    gear: "Inventário",
    gearLabel: "Equipamentos e apetrechos",
    gearEmpty: "Ainda não há equipamento cadastrado. Preencha o inventário para enriquecer o perfil.",
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
                        <UserAvatar
                          key={friend.id}
                          name={friend.name}
                          avatarPath={friend.avatarPath}
                          className="h-6 w-6 border border-background"
                          fallbackClassName="bg-white/8"
                          iconSize={11}
                        />,
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
        <SectionHeader eyebrow={t.about} />
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
        title={t.gearLabel}
        subtitle={t.gear}
        emptyLabel={t.gearEmpty}
        items={profile.inventoryItems.slice(0, 4)}
        action={
          <span className="inline-flex items-center gap-2 rounded-full bg-white/6 px-3 py-2 text-sm font-semibold text-text-muted">
            {profile.inventoryItems.length}
          </span>
        }
      />

      <InventoryManager items={profile.inventoryItems} />

      <section className="glass-panel rounded-[30px] border border-border-subtle p-4">
        <SectionHeader eyebrow={t.shoppingList} />
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
          eyebrow={t.catches}
          action={
            <Link href="/add" className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/6 px-3.5 py-2 text-sm font-semibold text-text-main transition hover:bg-white/10">
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
          eyebrow={t.trips}
          action={
            <Link href="/trips" className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/6 px-3.5 py-2 text-sm font-semibold text-text-main transition hover:bg-white/10">
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

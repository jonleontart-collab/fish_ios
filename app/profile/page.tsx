import Link from "next/link";
import { ArrowLeft, CalendarDays, ShoppingBag, Trophy } from "lucide-react";

import { CatchCard } from "@/components/CatchCard";
import { InventoryManager } from "@/components/InventoryManager";
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
}> = {
  ru: {
    back: "Назад на главную",
    fallbackBio: "Добавьте пару слов о себе, чтобы другие рыбаки могли найти единомышленников.",
    catches: "Уловы",
    trips: "Выезды",
    friends: "Друзья",
    anglerPassport: "Паспорт рыбака",
    experience: "Опыт",
    homeWater: "Основная акватория",
    style: "Стиль ловли",
    emptyField: "Еще не заполнен",
    shoppingList: "Что в списке покупок",
    tripLabel: "Поездка",
    emptyShopping: "Список покупок пуст. В планировщике можно собрать покупки под конкретные поездки.",
    myCatches: "Мои уловы",
    latestPosts: "Последние публикации",
    add: "Добавить",
    noPosts: "Публикаций пока нет. Добавь улов или отчет о поездке, и профиль оживет.",
    myTrips: "Мои поездки",
    planAndReports: "План и отчеты",
    allTrips: "Все поездки",
    noTrips: "Пока нет поездок. Запланируй выезд, добавь цели и потом опубликуй отчет в ленту.",
    years: (value) => `${value} лет`,
  },
  en: {
    back: "Back home",
    fallbackBio: "Add a few words about yourself so other anglers can find you.",
    catches: "Catches",
    trips: "Trips",
    friends: "Friends",
    anglerPassport: "Angler passport",
    experience: "Experience",
    homeWater: "Home water",
    style: "Fishing style",
    emptyField: "Not filled yet",
    shoppingList: "Shopping list",
    tripLabel: "Trip",
    emptyShopping: "Your shopping list is empty. Use the planner to collect purchases for specific trips.",
    myCatches: "My catches",
    latestPosts: "Latest posts",
    add: "Add",
    noPosts: "No posts yet. Add a catch or a trip report to bring this profile to life.",
    myTrips: "My trips",
    planAndReports: "Plans and reports",
    allTrips: "All trips",
    noTrips: "No trips yet. Plan one, add goals, and publish the report later.",
    years: (value) => `${value} years`,
  },
  es: {
    back: "Volver al inicio",
    fallbackBio: "Añade unas palabras sobre ti para que otros pescadores puedan encontrarte.",
    catches: "Capturas",
    trips: "Salidas",
    friends: "Amigos",
    anglerPassport: "Pasaporte del pescador",
    experience: "Experiencia",
    homeWater: "Agua principal",
    style: "Estilo de pesca",
    emptyField: "Aún no completado",
    shoppingList: "Lista de compras",
    tripLabel: "Salida",
    emptyShopping: "La lista de compras está vacía. Usa el planificador para preparar compras por salida.",
    myCatches: "Mis capturas",
    latestPosts: "Últimas publicaciones",
    add: "Añadir",
    noPosts: "Todavía no hay publicaciones. Añade una captura o un reporte para dar vida al perfil.",
    myTrips: "Mis salidas",
    planAndReports: "Plan y reportes",
    allTrips: "Todas las salidas",
    noTrips: "Aún no hay salidas. Planifica una, añade objetivos y publica el reporte después.",
    years: (value) => `${value} años`,
  },
  fr: {
    back: "Retour à l'accueil",
    fallbackBio: "Ajoutez quelques mots sur vous pour que d'autres pêcheurs puissent vous trouver.",
    catches: "Prises",
    trips: "Sorties",
    friends: "Amis",
    anglerPassport: "Passeport du pêcheur",
    experience: "Expérience",
    homeWater: "Plan d'eau principal",
    style: "Style de pêche",
    emptyField: "Pas encore renseigné",
    shoppingList: "Liste d'achats",
    tripLabel: "Sortie",
    emptyShopping: "La liste d'achats est vide. Utilisez le planificateur pour préparer les sorties.",
    myCatches: "Mes prises",
    latestPosts: "Dernières publications",
    add: "Ajouter",
    noPosts: "Aucune publication pour le moment. Ajoutez une prise ou un rapport pour animer le profil.",
    myTrips: "Mes sorties",
    planAndReports: "Plan et rapports",
    allTrips: "Toutes les sorties",
    noTrips: "Aucune sortie pour le moment. Planifiez-en une, ajoutez des objectifs et publiez le rapport ensuite.",
    years: (value) => `${value} ans`,
  },
  pt: {
    back: "Voltar ao início",
    fallbackBio: "Adicione algumas palavras sobre você para que outros pescadores possam encontrá-lo.",
    catches: "Capturas",
    trips: "Viagens",
    friends: "Amigos",
    anglerPassport: "Passaporte do pescador",
    experience: "Experiência",
    homeWater: "Água principal",
    style: "Estilo de pesca",
    emptyField: "Ainda não preenchido",
    shoppingList: "Lista de compras",
    tripLabel: "Viagem",
    emptyShopping: "A lista de compras está vazia. Use o planejador para montar compras por viagem.",
    myCatches: "Minhas capturas",
    latestPosts: "Últimas publicações",
    add: "Adicionar",
    noPosts: "Ainda não há publicações. Adicione uma captura ou um relatório para dar vida ao perfil.",
    myTrips: "Minhas viagens",
    planAndReports: "Plano e relatórios",
    allTrips: "Todas as viagens",
    noTrips: "Ainda não há viagens. Planeje uma, defina objetivos e publique o relatório depois.",
    years: (value) => `${value} anos`,
  },
};

export default async function ProfilePage() {
  const lang = await getServerLanguage();
  const t = translations[lang];
  const profile = await getProfilePageData();

  return (
    <div className="space-y-5 px-4 pb-8 pt-safe">
      <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-text-muted">
        <ArrowLeft size={16} />
        {t.back}
      </Link>

      <div className="relative mb-6 -mt-4 sm:mt-0">
        <div className="h-48 w-full overflow-hidden rounded-b-[24px] bg-[linear-gradient(135deg,#0b1520,#17324a)] sm:rounded-t-[34px]">
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
            <div className={`mx-auto flex h-28 w-28 items-center justify-center rounded-full border-4 border-background bg-gradient-to-br ${profile.user.avatarGradient} text-3xl font-bold text-slate-950 shadow-2xl`}>
              {profile.user.name.slice(0, 1)}
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

            <Link href="/friends" className="min-w-[90px] flex-1 rounded-[20px] border border-white/5 bg-white/5 p-3 shadow-xl transition hover:bg-white/10">
              <div className="mb-1 flex items-center justify-center gap-2 text-[11px] font-bold uppercase tracking-wider text-text-muted">
                <span className="h-2 w-2 rounded-full bg-primary" /> {t.friends}
              </div>
              <div className="flex items-center justify-center gap-2">
                <div className="text-[24px] font-bold leading-none text-white">{profile.stats.friends}</div>
                {profile.friends.length > 0 ? (
                  <div className="flex -space-x-2">
                    {profile.friends.slice(0, 2).map((friend, index) => (
                      <img key={index} src={withBasePath(friend.avatarPath || "")} alt="" className="h-6 w-6 rounded-full border border-background bg-zinc-800 object-cover" />
                    ))}
                  </div>
                ) : null}
              </div>
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

      <ProfileEditor user={profile.user} />
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
                  {shoppingStatusLabel(item.status, lang)} · {item.quantity} pcs
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

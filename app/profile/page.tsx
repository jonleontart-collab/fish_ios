import Link from "next/link";
import {
  ArrowLeft,
  Backpack,
  CalendarDays,
  Camera,
  MessageCircle,
  ShoppingBag,
  Trophy,
} from "lucide-react";
import { CatchCard } from "@/components/CatchCard";
import { InventoryManager } from "@/components/InventoryManager";
import { ProfileEditor } from "@/components/ProfileEditor";
import { TripReportCard } from "@/components/TripReportCard";
import { shoppingStatusLabel } from "@/lib/format";
import { getProfilePageData } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const profile = await getProfilePageData();

  return (
    <div className="space-y-5 px-4 pb-8 pt-safe">
      <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-text-muted">
        <ArrowLeft size={16} />
        Назад на главную
      </Link>

      <div className="relative -mt-4 sm:mt-0 mb-6">
        {/* Banner */}
        <div className="h-48 w-full bg-[linear-gradient(135deg,#0b1520,#17324a)] sm:rounded-t-[34px] overflow-hidden rounded-b-[24px]">
           {profile.user.bannerPath ? (
              <img src={profile.user.bannerPath} alt="" className="object-cover w-full h-full" />
           ) : (
              <div className="w-full h-full bg-[radial-gradient(ellipse_at_top_right,rgba(103,232,178,0.3),transparent_60%),linear-gradient(180deg,transparent,#000000_90%)]" />
           )}
           <div className="absolute inset-0 bg-gradient-to-t from-background via-black/20 to-transparent" />
        </div>

        {/* Profile Info */}
        <div className="px-5 -mt-12 relative z-10 text-center">
            {profile.user.avatarPath ? (
               <img src={profile.user.avatarPath} alt={profile.user.name} className="h-28 w-28 rounded-full border-4 border-background bg-surface object-cover mx-auto shadow-2xl" />
            ) : (
               <div className={`mx-auto flex h-28 w-28 items-center justify-center rounded-full border-4 border-background bg-gradient-to-br ${profile.user.avatarGradient} text-3xl font-bold text-slate-950 shadow-2xl`}>
                 {profile.user.name.slice(0, 1)}
               </div>
            )}
            
            <h1 className="mt-4 font-display text-[26px] font-bold text-white">{profile.user.name}</h1>
            <p className="text-primary font-bold text-[15px]">@{profile.user.handle}</p>
            
            <div className="mt-4 text-[14px] text-text-muted max-w-[300px] mx-auto text-center leading-relaxed whitespace-pre-wrap font-medium">
               {profile.user.bio || "Добавьте пару слов о себе, чтобы другие рыбаки могли найти единомышленников."}
            </div>
            
            <div className="mt-6 flex flex-wrap justify-center gap-3">
               <div className="flex-1 min-w-[90px] bg-white/5 backdrop-blur-md rounded-[20px] p-3 border border-white/5 shadow-xl">
                  <div className="flex items-center justify-center gap-2 text-text-muted mb-1 text-[11px] font-bold uppercase tracking-wider">
                     <Trophy size={14} className="text-primary" /> Уловы
                  </div>
                  <div className="text-[24px] font-bold text-white leading-none">{profile.stats.catches}</div>
               </div>
               
               <div className="flex-1 min-w-[90px] bg-white/5 backdrop-blur-md rounded-[20px] p-3 border border-white/5 shadow-xl">
                  <div className="flex items-center justify-center gap-2 text-text-muted mb-1 text-[11px] font-bold uppercase tracking-wider">
                     <CalendarDays size={14} className="text-accent" /> Выезды
                  </div>
                  <div className="text-[24px] font-bold text-white leading-none">{profile.stats.trips}</div>
               </div>

               <Link href="/friends" className="flex-1 min-w-[90px] bg-white/5 backdrop-blur-md rounded-[20px] p-3 border border-white/5 shadow-xl hover:bg-white/10 transition">
                  <div className="flex items-center justify-center gap-2 text-text-muted mb-1 text-[11px] font-bold uppercase tracking-wider">
                     <span className="w-2 h-2 rounded-full bg-primary" /> Друзья
                  </div>
                  <div className="flex items-center justify-center gap-2">
                     <div className="text-[24px] font-bold text-white leading-none">{profile.stats.friends}</div>
                     {profile.friends.length > 0 && (
                        <div className="flex -space-x-2">
                           {profile.friends.slice(0, 2).map((f, i) => (
                              <img key={i} src={f.avatarPath || ""} alt="" className="w-6 h-6 rounded-full border border-background bg-zinc-800 object-cover" />
                           ))}
                        </div>
                     )}
                  </div>
               </Link>
            </div>
        </div>
      </div>

      <section className="glass-panel rounded-[30px] border border-border-subtle p-4">
        <div className="text-sm text-text-muted">Паспорт рыбака</div>
        <div className="mt-4 grid gap-3">
          <div className="rounded-[22px] border border-border-subtle bg-white/4 p-4">
            <div className="text-sm text-text-muted">Опыт</div>
            <div className="mt-1 text-lg font-semibold text-text-main">
              {profile.user.experienceYears ? `${profile.user.experienceYears} лет` : "Еще не заполнен"}
            </div>
          </div>
          <div className="rounded-[22px] border border-border-subtle bg-white/4 p-4">
            <div className="text-sm text-text-muted">Основная акватория</div>
            <div className="mt-1 text-lg font-semibold text-text-main">
              {profile.user.homeWater ?? "Еще не заполнена"}
            </div>
          </div>
          <div className="rounded-[22px] border border-border-subtle bg-white/4 p-4">
            <div className="text-sm text-text-muted">Стиль ловли</div>
            <div className="mt-1 text-lg font-semibold text-text-main">
              {profile.user.preferredStyles ?? "Еще не заполнен"}
            </div>
          </div>
        </div>
      </section>

      <ProfileEditor user={profile.user} />

      <InventoryManager items={profile.inventoryItems} />

      <section className="glass-panel rounded-[30px] border border-border-subtle p-4">
        <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-text-main">
          <ShoppingBag size={16} className="text-primary" />
          Что в списке покупок
        </div>
        <div className="space-y-3">
          {profile.shoppingItems.length > 0 ? (
            profile.shoppingItems.map((item) => (
              <div
                key={item.id}
                className="rounded-[22px] border border-border-subtle bg-white/4 p-4"
              >
                <div className="font-semibold text-text-main">{item.title}</div>
                <div className="mt-1 text-sm text-text-muted">
                  {shoppingStatusLabel(item.status)} · {item.quantity} шт.
                </div>
                {item.trip ? <div className="mt-1 text-xs text-text-soft">Поездка: {item.trip.title}</div> : null}
                {item.notes ? <div className="mt-2 text-sm leading-6 text-text-soft">{item.notes}</div> : null}
              </div>
            ))
          ) : (
            <div className="rounded-[22px] border border-dashed border-border-subtle px-4 py-5 text-sm text-text-muted">
              Список покупок пуст. В планировщике можно собрать покупки под конкретные поездки.
            </div>
          )}
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-text-muted">Мои уловы</div>
            <h2 className="font-display text-2xl font-semibold text-text-main">Последние публикации</h2>
          </div>
          <Link href="/add" className="text-sm font-semibold text-primary">
            Добавить
          </Link>
        </div>
        <div className="space-y-4">
          {profile.catches.length > 0 ? (
            profile.catches.map((catchItem) => (
              <CatchCard key={catchItem.id} catchItem={catchItem} showUser={false} />
            ))
          ) : (
            <div className="glass-panel rounded-[28px] border border-dashed border-border-subtle p-5 text-sm text-text-muted">
              Публикаций пока нет. Добавь улов или отчет о поездке, и профиль оживет.
            </div>
          )}
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-text-muted">Мои поездки</div>
            <h2 className="font-display text-2xl font-semibold text-text-main">План и отчеты</h2>
          </div>
          <Link href="/trips" className="text-sm font-semibold text-primary">
            Все поездки
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
              Пока нет поездок. Запланируй выезд, добавь цели и потом опубликуй отчет в ленту.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

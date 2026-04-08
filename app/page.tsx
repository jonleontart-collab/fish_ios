import Image from "next/image";
import Link from "next/link";
import { CalendarDays, Compass, Plus } from "lucide-react";
import { CatchCard } from "@/components/CatchCard";
import { HomeHero } from "@/components/HomeHero";
import { formatDateTime } from "@/lib/format";
import { getDashboardData } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function Home() {
  const dashboard = await getDashboardData();
  const nextTrip = dashboard.upcomingTrips[0];

  return (
    <div className="pb-24 pt-safe sm:pt-6">
      {/* Top Header */}
      <header className="flex items-center justify-between px-4 sm:px-0 py-3 mb-2">
         <h1 className="font-display text-2xl font-bold text-text-main tracking-tight">FishFlow</h1>
         <Link href="/profile" className="shrink-0 group">
           {dashboard.user.avatarPath ? (
             <Image
               src={dashboard.user.avatarPath}
               alt={dashboard.user.name}
               width={44}
               height={44}
               className="h-11 w-11 rounded-full object-cover ring-2 ring-transparent group-hover:ring-primary/50 transition-all"
             />
           ) : (
             <div
               className={`flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br ${dashboard.user.avatarGradient} ring-2 ring-transparent group-hover:ring-primary/50 transition-all`}
             >
               <span className="font-display text-[15px] font-semibold text-slate-950">
                 {dashboard.user.name.slice(0, 1)}
               </span>
             </div>
           )}
         </Link>
      </header>

      {/* Hero Weather/Stats */}
      <div className="px-4 sm:px-0">
        <HomeHero
          userName={dashboard.user.name}
          savedPlacesCount={dashboard.stats.placesCount}
          pendingShoppingCount={dashboard.stats.pendingShoppingCount}
          upcomingTripsCount={dashboard.stats.upcomingTripsCount}
        />
      </div>

      {/* Quick Bento Actions */}
      <div className="px-4 sm:px-0 mt-5">
        <div className="grid grid-cols-2 gap-3">
           <Link href="/explore" className="bento-card p-4 transition-transform active:scale-95 group">
              <Compass className="text-primary mb-2.5" size={24} />
              <div className="font-semibold text-text-main group-hover:text-primary transition-colors">Карта мест</div>
              <div className="text-xs text-text-muted mt-1 leading-relaxed">
                 {dashboard.nearbyPlaces.length > 0 ? `${dashboard.nearbyPlaces.length} точек рядом` : "Новые места"}
              </div>
           </Link>

           <Link href="/trips" className="bento-card p-4 relative overflow-hidden transition-transform active:scale-95 group">
              <CalendarDays className="text-accent mb-2.5 relative z-10" size={24} />
              <div className="font-semibold text-text-main relative z-10 group-hover:text-accent transition-colors">Выезды</div>
              <div className="text-xs text-text-muted mt-1 relative z-10 leading-relaxed truncate">
                 {nextTrip ? formatDateTime(nextTrip.startAt) : "Спланировать"}
              </div>
              {/* Decoration */}
              <div className="absolute right-[-0.5rem] bottom-[-1rem] text-accent/5 pointer-events-none">
                 <CalendarDays size={80} strokeWidth={1} />
              </div>
           </Link>
        </div>
        
        <Link href="/add" className="bento-card p-4 mt-3 flex items-center justify-center gap-2 bg-primary/10 hover:bg-primary/15 transition-colors border-primary/20 text-primary">
          <Plus size={20} />
          <span className="font-semibold">Добавить улов</span>
        </Link>
      </div>

      {/* Feed Divider Area */}
      <div className="px-4 sm:px-0 mt-8 mb-4 flex items-center justify-between">
         <h2 className="font-display text-xl font-bold text-text-main">Лента активности</h2>
      </div>

      {/* News Feed (Facebook style) */}
      <div className="sm:space-y-6">
         {dashboard.recentCatches.length > 0 ? (
            dashboard.recentCatches.map((catchItem) => (
               <CatchCard key={catchItem.id} catchItem={catchItem} />
            ))
         ) : (
            <div className="px-4 sm:px-0">
               <div className="bento-card border-dashed p-6 text-center">
                 <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Compass className="text-text-muted" size={24} />
                 </div>
                 <div className="font-semibold text-text-main mb-1">Лента пока пуста</div>
                 <p className="text-sm text-text-muted max-w-[250px] mx-auto">
                   Подпишись на других рыбаков или добавь свой первый улов.
                 </p>
               </div>
            </div>
         )}
      </div>
    </div>
  );
}

import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, UserPlus, MapPin, Fish } from "lucide-react";
import { withBasePath } from "@/lib/app-paths";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;
  
  const user = await prisma.user.findUnique({
    where: { handle },
    include: {
      _count: {
        select: {
          catches: true,
          trips: true,
        }
      },
      catches: {
        include: { place: true },
        orderBy: { createdAt: "desc" },
        take: 3
      }
    }
  });

  if (!user) {
    notFound();
  }

  return (
    <div className="pb-24 pt-safe sm:pt-6 h-full flex flex-col">
      <header className="px-4 mb-4 flex items-center justify-between z-10 relative">
         <Link href="/profile" className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-black/40 backdrop-blur text-white hover:bg-white/20 transition-colors">
            <ArrowLeft size={20} />
         </Link>
         <div className="font-semibold text-text-main">Профиль</div>
         <div className="w-10"></div>
      </header>

      <div className="relative -mt-16 sm:mt-0">
        {/* Banner */}
        <div className="h-48 w-full bg-[linear-gradient(135deg,#0b1520,#17324a)] sm:rounded-t-[34px] overflow-hidden">
           {user.bannerPath ? (
              <img src={withBasePath(user.bannerPath)} alt="" className="object-cover w-full h-full" />
           ) : (
              <div className="w-full h-full bg-[radial-gradient(ellipse_at_top_right,rgba(103,232,178,0.3),transparent_60%),linear-gradient(180deg,transparent,#000000_90%)]" />
           )}
           <div className="absolute inset-0 bg-gradient-to-t from-background via-black/20 to-transparent" />
        </div>

        {/* Profile Info */}
        <div className="px-5 -mt-12 relative z-10 text-center">
            {user.avatarPath ? (
               <img src={withBasePath(user.avatarPath)} alt={user.name} className="h-24 w-24 rounded-full border-4 border-background bg-surface object-cover mx-auto shadow-2xl" />
            ) : (
               <div className={`mx-auto flex h-24 w-24 items-center justify-center rounded-full border-4 border-background bg-gradient-to-br ${user.avatarGradient} text-3xl font-bold text-slate-950 shadow-2xl`}>
                 {user.name.slice(0, 1)}
               </div>
            )}
            
            <h1 className="mt-4 font-display text-2xl font-bold text-text-main">{user.name}</h1>
            <p className="text-primary font-medium text-[15px]">@{user.handle}</p>
            
            <div className="mt-4 text-[14px] text-text-muted max-w-[280px] mx-auto text-center leading-relaxed whitespace-pre-wrap">
               {user.bio || "Это страница рыбака-энтузиаста. О себе пока ничего не добавил, но уловы говорят сами за себя."}
            </div>
            
            <div className="mt-5 flex items-center justify-center gap-4 text-sm font-semibold text-text-muted">
               <div className="text-center bg-white/5 backdrop-blur-md px-4 py-2 rounded-[16px] border border-white/5 shadow-lg">
                  <div className="text-[20px] text-white font-display font-bold">{user._count.catches}</div>
                  <div className="text-[10px] uppercase tracking-wider mt-0.5">Уловов</div>
               </div>
               <div className="text-center bg-white/5 backdrop-blur-md px-4 py-2 rounded-[16px] border border-white/5 shadow-lg">
                  <div className="text-[20px] text-white font-display font-bold">{user._count.trips}</div>
                  <div className="text-[10px] uppercase tracking-wider mt-0.5">Поездок</div>
               </div>
               {user.city && (
                  <div className="text-center bg-white/5 backdrop-blur-md px-4 py-2 rounded-[16px] border border-white/5 shadow-lg">
                     <div className="text-[20px] text-white flex items-center justify-center h-[30px]"><MapPin size={18} /></div>
                     <div className="text-[10px] uppercase tracking-wider mt-0.5 px-1 truncate max-w-[75px]">{user.city}</div>
                  </div>
               )}
            </div>
            
            <div className="mt-6">
               <button className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-[20px] bg-primary px-8 py-3.5 text-[15px] font-bold text-black transition-transform active:scale-95 shadow-[0_8px_24px_rgba(103,232,178,0.24)] hover:bg-primary-strong">
                  <UserPlus size={18} />
                  Подписаться
               </button>
            </div>
            
            {(user.experienceYears || user.preferredStyles || user.homeWater) && (
               <div className="mt-6 p-4 rounded-[20px] bg-white/5 border border-white/5 text-left grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-[340px] mx-auto shadow-inner">
                 {user.experienceYears && (
                   <div>
                     <div className="text-[10px] text-text-muted uppercase tracking-wider font-bold">Опыт ловли</div>
                     <div className="text-[14px] text-white font-medium mt-0.5">{user.experienceYears} {user.experienceYears > 4 ? 'лет' : 'года'}</div>
                   </div>
                 )}
                 {user.preferredStyles && (
                   <div>
                     <div className="text-[10px] text-text-muted uppercase tracking-wider font-bold">Предпочитает</div>
                     <div className="text-[14px] text-white font-medium mt-0.5">{user.preferredStyles}</div>
                   </div>
                 )}
                 {user.homeWater && (
                   <div className="sm:col-span-2">
                     <div className="text-[10px] text-text-muted uppercase tracking-wider font-bold">Любимый водоем</div>
                     <div className="text-[14px] text-white font-medium mt-0.5">{user.homeWater}</div>
                   </div>
                 )}
               </div>
            )}
        </div>
      </div>

      <div className="mt-8 px-4">
         <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Fish size={18} className="text-primary" />
            Недавние уловы
         </h2>
         
         {user.catches.length > 0 ? (
            <div className="grid grid-cols-3 gap-2">
               {user.catches.map((catchItem) => (
                  <div key={catchItem.id} className="aspect-square relative rounded-[16px] overflow-hidden bg-surface group border border-white/5 shadow-lg">
                     <img src={withBasePath(catchItem.imagePath)} alt="" className="object-cover w-full h-full group-hover:scale-110 transition-transform" />
                  </div>
               ))}
            </div>
         ) : (
            <div className="text-center py-10 text-[13px] text-text-muted bg-white/5 backdrop-blur-md rounded-[24px] border border-white/10 shadow-inner">
               Пользователь пока не загружал фото уловов.
            </div>
         )}
      </div>
    </div>
  );
}

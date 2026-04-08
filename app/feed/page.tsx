import Image from "next/image";
import Link from "next/link";
import { CatchCard } from "@/components/CatchCard";
import { TripReportCard } from "@/components/TripReportCard";
import { getFeedPageData } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function FeedPage() {
  const { user, catches, tripReports, feedItems } = await getFeedPageData();
  const trophyCount = catches.filter((item) => item.weightKg && item.weightKg >= 4).length;

  return (
    <div className="space-y-5 px-4 pb-8 pt-safe">
      <header className="space-y-3">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-text-muted">Лента</p>
            <h1 className="font-display text-[30px] font-semibold tracking-tight text-text-main">
              Сообщество, отчеты и реальные обсуждения
            </h1>
          </div>
          <Link href="/profile" className="text-sm font-semibold text-primary">
            @{user?.handle}
          </Link>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="glass-panel rounded-[24px] border border-border-subtle p-4">
            <div className="text-sm text-text-muted">Постов</div>
            <div className="mt-2 font-display text-2xl font-semibold text-text-main">{feedItems.length}</div>
          </div>
          <div className="glass-panel rounded-[24px] border border-border-subtle p-4">
            <div className="text-sm text-text-muted">Трофеев</div>
            <div className="mt-2 font-display text-2xl font-semibold text-text-main">{trophyCount}</div>
          </div>
          <div className="glass-panel rounded-[24px] border border-border-subtle p-4">
            <div className="text-sm text-text-muted">Отчетов</div>
            <div className="mt-2 font-display text-2xl font-semibold text-text-main">{tripReports.length}</div>
          </div>
        </div>
      </header>

      {feedItems.length > 0 ? (
        <div className="space-y-4">
          {feedItems.map((item) =>
            item.type === "catch" ? (
              <CatchCard key={item.catchItem.id} catchItem={item.catchItem} />
            ) : (
              <TripReportCard key={item.tripItem.id} trip={item.tripItem} />
            ),
          )}
        </div>
      ) : (
        <div className="glass-panel flex flex-col items-center gap-4 rounded-[30px] border border-border-subtle p-6 text-center">
          <Image
            src="/graphics/empty-catches-lure.png"
            alt="Пока нет публикаций"
            width={220}
            height={220}
            className="h-auto w-[180px]"
          />
          <div className="space-y-1">
            <div className="font-semibold text-text-main">Лента пока пустая</div>
            <p className="text-sm leading-6 text-text-muted">
              Опубликуй улов, добавь точку на карту или заверши поездку отчетом. Комментарии теперь живут внутри
              самого поста, как в нормальной соцсети.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

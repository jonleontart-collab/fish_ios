import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { TripPlanner } from "@/components/TripPlanner";
import { getTripsPageData } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function TripsPage() {
  const data = await getTripsPageData();

  return (
    <div className="space-y-5 px-4 pb-8 pt-safe">
      <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-text-muted">
        <ArrowLeft size={16} />
        Назад на главную
      </Link>

      <header className="space-y-2">
        <p className="text-sm text-text-muted">Планировщик</p>
        <h1 className="font-display text-[30px] font-semibold tracking-tight text-text-main">
          Поездки, покупки и отчет после рыбалки
        </h1>
      </header>

      <TripPlanner
        placeOptions={data.placeOptions}
        trips={data.trips}
        shoppingItems={data.shoppingItems}
        inventoryItems={data.inventoryItems}
      />
    </div>
  );
}

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { TripPlanner } from "@/components/TripPlanner";
import { type TranslationMap } from "@/lib/i18n";
import { getServerLanguage } from "@/lib/i18n-server";
import { getTripsPageData } from "@/lib/queries";

export const dynamic = "force-dynamic";

const translations: TranslationMap<{
  back: string;
  section: string;
  title: string;
}> = {
  ru: {
    back: "Назад на главную",
    section: "Планировщик",
    title: "Поездки, покупки и отчет после рыбалки",
  },
  en: {
    back: "Back home",
    section: "Planner",
    title: "Trips, shopping, and the report after fishing",
  },
  es: {
    back: "Volver al inicio",
    section: "Planificador",
    title: "Salidas, compras y reporte después de la pesca",
  },
  fr: {
    back: "Retour à l'accueil",
    section: "Planificateur",
    title: "Sorties, achats et rapport après la pêche",
  },
  pt: {
    back: "Voltar ao início",
    section: "Planejador",
    title: "Viagens, compras e relatório após a pesca",
  },
};

export default async function TripsPage() {
  const lang = await getServerLanguage();
  const t = translations[lang];
  const data = await getTripsPageData();

  return (
    <div className="space-y-5 px-4 pb-8 pt-safe">
      <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-text-muted">
        <ArrowLeft size={16} />
        {t.back}
      </Link>

      <header className="pr-bell-safe space-y-2">
        <h1 className="font-display text-[30px] font-semibold tracking-tight text-text-main">{t.title}</h1>
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

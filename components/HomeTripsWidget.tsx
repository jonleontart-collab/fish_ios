import type { CSSProperties } from "react";
import Link from "next/link";
import { CalendarDays, ChevronRight, MapPin } from "lucide-react";

import { SectionHeader } from "@/components/SectionHeader";
import { withBasePath } from "@/lib/app-paths";
import { formatDateTime, tripStatusLabel } from "@/lib/format";
import { type LanguageCode, type TranslationMap } from "@/lib/i18n";

type UpcomingTrip = {
  id: string;
  title: string;
  startAt: Date;
  status: "PLANNED" | "CONFIRMED" | "COMPLETED";
  place: {
    name: string;
    city: string;
  };
};

const translations: TranslationMap<{
  section: string;
  title: string;
  empty: string;
  openAll: string;
}> = {
  ru: {
    section: "Выезды",
    title: "Ближайшие выезды",
    empty: "Пока нет запланированных выездов. Открой планировщик и добавь первый.",
    openAll: "Планировщик",
  },
  en: {
    section: "Trips",
    title: "Upcoming trips",
    empty: "No trips planned yet. Open the planner and add your first one.",
    openAll: "Planner",
  },
  es: {
    section: "Salidas",
    title: "Próximas salidas",
    empty: "Todavía no hay salidas planeadas. Abre el planificador y añade la primera.",
    openAll: "Planificador",
  },
  fr: {
    section: "Sorties",
    title: "Sorties à venir",
    empty: "Aucune sortie prévue pour le moment. Ouvre le planificateur et ajoute la première.",
    openAll: "Planificateur",
  },
  pt: {
    section: "Viagens",
    title: "Próximas viagens",
    empty: "Ainda não há viagens planejadas. Abra o planejador e adicione a primeira.",
    openAll: "Planejador",
  },
};

export function HomeTripsWidget({
  lang,
  trips,
}: {
  lang: LanguageCode;
  trips: UpcomingTrip[];
}) {
  const t = translations[lang];
  const sceneStyle = {
    "--panel-scene-image": `url('${withBasePath("/graphics/place-river-backwater.png")}')`,
  } as CSSProperties;

  return (
    <section className="glass-panel panel-scene rounded-[30px] border border-border-subtle p-4" style={sceneStyle}>
      <SectionHeader
        title={t.section}
        action={
          <Link
            href="/trips"
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/6 px-3.5 py-2 text-sm font-semibold text-text-main transition hover:bg-white/10"
          >
            <span>{t.openAll}</span>
            <ChevronRight size={15} className="text-primary" />
          </Link>
        }
      />

      {trips.length > 0 ? (
        <div className="mt-4 space-y-3">
          {trips.slice(0, 3).map((trip) => (
            <Link
              key={trip.id}
              href="/trips"
              className="flex items-center justify-between gap-3 rounded-[22px] border border-border-subtle bg-white/4 px-4 py-4 transition hover:bg-white/8"
            >
              <div className="min-w-0">
                <div className="mb-1 inline-flex rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary">
                  {tripStatusLabel(trip.status, lang)}
                </div>
                <div className="truncate text-base font-semibold text-text-main">{trip.title}</div>
                <div className="mt-1 flex items-center gap-2 text-sm text-text-muted">
                  <CalendarDays size={14} />
                  <span>{formatDateTime(trip.startAt, lang)}</span>
                </div>
                <div className="mt-1 flex items-center gap-2 text-sm text-text-soft">
                  <MapPin size={14} />
                  <span className="truncate">
                    {trip.place.name}
                    {trip.place.city ? `, ${trip.place.city}` : ""}
                  </span>
                </div>
              </div>
              <ChevronRight size={18} className="shrink-0 text-text-soft" />
            </Link>
          ))}
        </div>
      ) : (
        <div className="mt-4 rounded-[22px] border border-dashed border-border-subtle px-4 py-5 text-sm text-text-muted">
          {t.empty}
        </div>
      )}
    </section>
  );
}

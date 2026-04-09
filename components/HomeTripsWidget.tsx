import Link from "next/link";
import { CalendarDays, ChevronRight, MapPin } from "lucide-react";

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
    title: "Ближайшие поездки",
    empty: "Пока нет запланированных выездов. Открой планировщик и добавь первый.",
    openAll: "Открыть планировщик",
  },
  en: {
    section: "Trips",
    title: "Upcoming trips",
    empty: "No trips planned yet. Open the planner and add your first one.",
    openAll: "Open planner",
  },
  es: {
    section: "Salidas",
    title: "Próximas salidas",
    empty: "Todavía no hay salidas planeadas. Abre el planificador y añade la primera.",
    openAll: "Abrir planificador",
  },
  fr: {
    section: "Sorties",
    title: "Sorties à venir",
    empty: "Aucune sortie prévue pour le moment. Ouvre le planificateur et ajoute la première.",
    openAll: "Ouvrir le planificateur",
  },
  pt: {
    section: "Viagens",
    title: "Próximas viagens",
    empty: "Ainda não há viagens planejadas. Abra o planejador e adicione a primeira.",
    openAll: "Abrir planejador",
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

  return (
    <section className="glass-panel rounded-[30px] border border-border-subtle p-4">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <div className="text-sm text-text-muted">{t.section}</div>
          <h2 className="font-display text-2xl font-semibold text-text-main">{t.title}</h2>
        </div>
        <Link href="/trips" className="text-sm font-semibold text-primary">
          {t.openAll}
        </Link>
      </div>

      {trips.length > 0 ? (
        <div className="space-y-3">
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
        <div className="rounded-[22px] border border-dashed border-border-subtle px-4 py-5 text-sm text-text-muted">
          {t.empty}
        </div>
      )}
    </section>
  );
}

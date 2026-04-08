import Image from "next/image";
import { CalendarDays, MapPin, Route } from "lucide-react";
import { formatDateTime, tripStatusLabel } from "@/lib/format";

type TripReportCardProps = {
  trip: {
    id: string;
    title: string;
    summary: string | null;
    notes: string | null;
    goals: string | null;
    reportImagePath: string | null;
    publishedAt: Date | null;
    startAt: Date;
    endAt: Date | null;
    status: "PLANNED" | "CONFIRMED" | "COMPLETED";
    user: {
      name: string;
      handle: string;
      avatarGradient: string;
    };
    place: {
      name: string;
      city: string;
      displayImage: string | null;
      fishSpeciesList: string[];
    };
  };
};

export function TripReportCard({ trip }: TripReportCardProps) {
  const image = trip.reportImagePath ?? trip.place.displayImage;

  return (
    <article className="glass-panel overflow-hidden rounded-[28px] border border-border-subtle">
      <div className="relative aspect-[1.2] overflow-hidden bg-[linear-gradient(135deg,#0c1b2a,#163247)]">
        {image ? (
          <Image
            src={image}
            alt={trip.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 380px"
          />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
        <div className="absolute inset-x-0 top-0 flex items-center justify-between p-4">
          <span className="rounded-full border border-white/12 bg-black/24 px-3 py-1 text-[11px] font-semibold text-text-main backdrop-blur">
            Поездка
          </span>
          <span className="rounded-full border border-primary/20 bg-primary/12 px-3 py-1 text-[11px] font-semibold text-primary">
            {tripStatusLabel(trip.status)}
          </span>
        </div>
        <div className="absolute inset-x-0 bottom-0 p-4">
          <div className="text-sm text-text-muted">@{trip.user.handle}</div>
          <h3 className="mt-2 text-2xl font-semibold text-text-main">{trip.title}</h3>
          <div className="mt-2 flex flex-wrap gap-2 text-[12px] text-text-muted">
            <span className="inline-flex items-center gap-1">
              <MapPin size={14} />
              {trip.place.name}
            </span>
            <span className="inline-flex items-center gap-1">
              <CalendarDays size={14} />
              {formatDateTime(trip.startAt)}
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-4 p-4">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br ${trip.user.avatarGradient}`}
          >
            <span className="font-display text-sm font-semibold text-slate-950">{trip.user.name.slice(0, 1)}</span>
          </div>
          <div>
            <div className="font-semibold text-text-main">{trip.user.name}</div>
            <div className="text-sm text-text-muted">{trip.place.city}</div>
          </div>
        </div>

        <div className="rounded-[22px] bg-white/4 p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-text-main">
            <Route size={16} className="text-primary" />
            После поездки
          </div>
          <p className="mt-2 text-[15px] leading-6 text-text-main">
            {trip.summary ?? trip.notes ?? "Отчет пока не заполнен."}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {trip.place.fishSpeciesList.slice(0, 3).map((species) => (
            <span key={species} className="rounded-full bg-white/6 px-3 py-1 text-[11px] font-medium text-text-main">
              {species}
            </span>
          ))}
        </div>
      </div>
    </article>
  );
}

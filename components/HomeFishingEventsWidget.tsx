"use client";

import type { CSSProperties } from "react";
import { useEffect, useState } from "react";
import { CalendarDays, ChevronRight, ExternalLink, Loader2, MapPin, Sparkles } from "lucide-react";
import { Drawer } from "vaul";

import { SectionHeader } from "@/components/SectionHeader";
import { useLanguage } from "@/components/LanguageProvider";
import { useLocation } from "@/components/LocationProvider";
import { apiPath, withBasePath } from "@/lib/app-paths";
import { type FishingEvent } from "@/lib/fishing-events";
import { formatShortDate } from "@/lib/format";
import { type TranslationMap } from "@/lib/i18n";

const translations: TranslationMap<{
  section: string;
  title: string;
  loading: string;
  resolving: string;
  empty: string;
  openAll: string;
  allEvents: string;
  openSource: string;
  fallback: string;
}> = {
  ru: {
    section: "События",
    title: "События рядом",
    loading: "Загружаем ближайшие события...",
    resolving: "Сначала определим страну и город по геолокации или IP.",
    empty: "Пока не удалось собрать события. Попробуй обновить локацию чуть позже.",
    openAll: "Календарь",
    allEvents: "Календарь событий",
    openSource: "Открыть источник",
    fallback: "Рядом",
  },
  en: {
    section: "Events",
    title: "Events nearby",
    loading: "Loading nearby events...",
    resolving: "First we need your country and city from geolocation or IP.",
    empty: "Could not collect events yet. Try refreshing your location later.",
    openAll: "Calendar",
    allEvents: "Event calendar",
    openSource: "Open source",
    fallback: "Nearby",
  },
  es: {
    section: "Eventos",
    title: "Eventos cerca",
    loading: "Cargando eventos cercanos...",
    resolving: "Primero necesitamos tu país y ciudad por geolocalización o IP.",
    empty: "Todavía no se pudieron obtener eventos. Intenta actualizar la ubicación más tarde.",
    openAll: "Calendario",
    allEvents: "Calendario de eventos",
    openSource: "Abrir fuente",
    fallback: "Cerca",
  },
  fr: {
    section: "Événements",
    title: "Événements proches",
    loading: "Chargement des événements proches...",
    resolving: "Nous devons d'abord déterminer votre pays et votre ville via la géolocalisation ou l'IP.",
    empty: "Impossible de récupérer les événements pour le moment. Réessayez plus tard.",
    openAll: "Calendrier",
    allEvents: "Calendrier des événements",
    openSource: "Ouvrir la source",
    fallback: "À proximité",
  },
  pt: {
    section: "Eventos",
    title: "Eventos por perto",
    loading: "Carregando eventos próximos...",
    resolving: "Primeiro precisamos do seu país e cidade pela geolocalização ou IP.",
    empty: "Ainda não foi possível obter os eventos. Tente atualizar a localização mais tarde.",
    openAll: "Calendário",
    allEvents: "Calendário de eventos",
    openSource: "Abrir fonte",
    fallback: "Por perto",
  },
};

function EventRow({
  event,
  lang,
  openSource,
}: {
  event: FishingEvent;
  lang: keyof typeof translations;
  openSource: string;
}) {
  const badgeLabel = event.source === "fallback" ? translations[lang].fallback : "Live";

  const content = (
    <div className="flex items-center justify-between gap-3 rounded-[22px] border border-border-subtle bg-white/4 px-4 py-4 transition hover:bg-white/8">
      <div className="min-w-0">
        <div className="mb-1 inline-flex items-center gap-2 rounded-full bg-accent/10 px-2.5 py-1 text-[11px] font-semibold text-accent">
          <Sparkles size={12} />
          {badgeLabel}
        </div>
        <div className="truncate text-base font-semibold text-text-main">{event.title}</div>
        <div className="mt-1 flex items-center gap-2 text-sm text-text-muted">
          <CalendarDays size={14} />
          <span>
            {formatShortDate(new Date(event.startsAt), lang)}
            {event.endsAt ? ` - ${formatShortDate(new Date(event.endsAt), lang)}` : ""}
          </span>
        </div>
        <div className="mt-1 flex items-center gap-2 text-sm text-text-soft">
          <MapPin size={14} />
          <span className="truncate">
            {[event.city, event.country].filter(Boolean).join(", ")}
            {event.venue ? `, ${event.venue}` : ""}
          </span>
        </div>
      </div>
      {event.sourceUrl ? (
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/6 text-text-main">
          <ExternalLink size={16} />
        </div>
      ) : (
        <ChevronRight size={18} className="shrink-0 text-text-soft" />
      )}
    </div>
  );

  if (!event.sourceUrl) {
    return content;
  }

  return (
    <a href={event.sourceUrl} target="_blank" rel="noreferrer" aria-label={openSource}>
      {content}
    </a>
  );
}

export function HomeFishingEventsWidget() {
  const { lang } = useLanguage();
  const { location } = useLocation();
  const t = translations[lang];
  const [events, setEvents] = useState<FishingEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!location?.country) {
      return;
    }

    const currentLocation = location;
    let cancelled = false;

    async function loadEvents() {
      setLoading(true);

      try {
        const response = await fetch(apiPath("/api/events"), {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            country: currentLocation.country,
            city: currentLocation.city,
            lang,
          }),
        });

        if (!response.ok) {
          throw new Error("events failed");
        }

        const payload = (await response.json()) as { events: FishingEvent[] };

        if (!cancelled) {
          setEvents(payload.events ?? []);
        }
      } catch {
        if (!cancelled) {
          setEvents([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadEvents();

    return () => {
      cancelled = true;
    };
  }, [lang, location]);

  const previewEvents = events.slice(0, 3);
  const sceneStyle = {
    "--panel-scene-image": `url('${withBasePath("/graphics/place-clear-lake.png")}')`,
  } as CSSProperties;

  return (
    <>
      <section className="glass-panel panel-scene rounded-[30px] border border-border-subtle p-4" style={sceneStyle}>
        <SectionHeader
          title={t.section}
          action={
            events.length > 0 ? (
              <button
                type="button"
                onClick={() => setOpen(true)}
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/6 px-3.5 py-2 text-sm font-semibold text-text-main transition hover:bg-white/10"
              >
                <span>{t.openAll}</span>
                <ChevronRight size={15} className="text-primary" />
              </button>
            ) : null
          }
        />

        {!location?.country ? (
          <div className="mt-4 rounded-[22px] border border-dashed border-border-subtle px-4 py-5 text-sm text-text-muted">
            {t.resolving}
          </div>
        ) : loading ? (
          <div className="mt-4 flex items-center gap-3 rounded-[22px] border border-border-subtle bg-white/4 px-4 py-5 text-sm text-text-muted">
            <Loader2 size={16} className="animate-spin" />
            <span>{t.loading}</span>
          </div>
        ) : previewEvents.length > 0 ? (
          <div className="mt-4 space-y-3">
            {previewEvents.map((event) => (
              <EventRow key={event.id} event={event} lang={lang} openSource={t.openSource} />
            ))}
          </div>
        ) : (
          <div className="mt-4 rounded-[22px] border border-dashed border-border-subtle px-4 py-5 text-sm text-text-muted">
            {t.empty}
          </div>
        )}
      </section>

      <Drawer.Root open={open} onOpenChange={setOpen}>
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 z-[1000] bg-black/80 backdrop-blur-md" />
          <Drawer.Content
            className="fixed bottom-0 left-0 right-0 z-[1001] mx-auto mt-24 flex max-h-[90vh] max-w-md flex-col rounded-t-[36px] border-t border-white/10 bg-[#0c1218] outline-none"
            style={{
              backgroundImage: `linear-gradient(180deg, rgba(5, 9, 15, 0.76), rgba(5, 9, 15, 0.96)), url('${withBasePath("/modal-backgrounds/notification-center-bg.png")}')`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <div className="hide-scrollbar flex-1 overflow-y-auto">
              <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/5 bg-[#0c1218]/90 px-6 py-5 backdrop-blur-xl">
                <div>
                  <div className="text-sm text-text-muted">{t.section}</div>
                  <h2 className="text-lg font-bold text-white">{t.allEvents}</h2>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-full bg-white/6 px-3 py-2 text-sm font-semibold text-text-main"
                >
                  OK
                </button>
              </div>

              <div className="space-y-3 p-4 pb-10">
                {events.map((event) => (
                  <EventRow key={event.id} event={event} lang={lang} openSource={t.openSource} />
                ))}
              </div>
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    </>
  );
}

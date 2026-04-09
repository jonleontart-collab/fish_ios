'use client';

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Circle, MapContainer, Marker, Polyline, TileLayer, useMap, useMapEvents, ZoomControl } from "react-leaflet";
import { Crosshair } from "lucide-react";

import { useLanguage } from "@/components/LanguageProvider";
import { useLocation } from "@/components/LocationProvider";
import type { TranslationMap } from "@/lib/i18n";

type MapPlace = {
  slug: string;
  name: string;
  latitude: number;
  longitude: number;
  type: "WILD" | "PAYED" | "CLUB" | "SHOP" | "EVENT_SOS";
  fishSpeciesList: string[];
  rating: number;
  distanceKm: number | null;
};

const translations: TranslationMap<{
  resolving: string;
  routeReady: string;
  tapMarker: string;
  geolocationError: string;
}> = {
  ru: {
    resolving: "Определяем позицию...",
    routeReady: "Маршрут построен. Загружаем данные для офлайна...",
    tapMarker: "Нажми на маркер, чтобы посмотреть подробности точки.",
    geolocationError: "Не удалось определить местоположение.",
  },
  en: {
    resolving: "Resolving your position...",
    routeReady: "Route is ready. Loading offline data...",
    tapMarker: "Tap a marker to see place details.",
    geolocationError: "Could not resolve your location.",
  },
  es: {
    resolving: "Determinando tu posición...",
    routeReady: "Ruta lista. Cargando datos para uso offline...",
    tapMarker: "Pulsa un marcador para ver los detalles del lugar.",
    geolocationError: "No se pudo determinar tu ubicación.",
  },
  fr: {
    resolving: "Localisation en cours...",
    routeReady: "L'itinéraire est prêt. Chargement des données hors ligne...",
    tapMarker: "Touchez un marqueur pour voir les détails du spot.",
    geolocationError: "Impossible de déterminer votre position.",
  },
  pt: {
    resolving: "Determinando sua posição...",
    routeReady: "Rota pronta. Carregando dados offline...",
    tapMarker: "Toque em um marcador para ver os detalhes do local.",
    geolocationError: "Não foi possível determinar sua localização.",
  },
};

function getMarkerIcon(type: MapPlace["type"]) {
  let color = "#67E8B2";
  if (type === "SHOP") color = "#FFBA6B";
  if (type === "EVENT_SOS") color = "#FB7185";

  return L.divIcon({
    className: "fishflow-marker",
    iconSize: [34, 48],
    iconAnchor: [17, 46],
    popupAnchor: [0, -40],
    html: `
      <svg width="34" height="48" viewBox="0 0 34 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M17 45C17 45 31 29.25 31 18C31 10.268 24.732 4 17 4C9.26801 4 3 10.268 3 18C3 29.25 17 45 17 45Z" fill="${color}" fill-opacity="0.95"/>
        <circle cx="17" cy="18" r="6.5" fill="#07111C"/>
        <circle cx="17" cy="18" r="10.5" stroke="rgba(255,255,255,0.36)"/>
      </svg>
      ${type === "EVENT_SOS" ? `<div style="position:absolute;top:0;left:0;width:34px;height:34px;border-radius:50%;border:2px solid ${color};animation:ping 1.5s cubic-bezier(0,0,0.2,1) infinite;z-index:-1;"></div>` : ""}
    `,
  });
}

const userMarkerIcon = L.divIcon({
  className: "fishflow-user-marker",
  iconSize: [22, 22],
  iconAnchor: [11, 11],
  html: `
    <span style="
      display:block;
      width:22px;
      height:22px;
      border-radius:999px;
      background:#7cb6ff;
      border:3px solid rgba(255,255,255,0.92);
      box-shadow:0 0 0 6px rgba(124,182,255,0.18);
    "></span>
  `,
});

function MapViewportController({
  places,
  focusUserRequest,
  routeTo,
}: {
  places: MapPlace[];
  focusUserRequest: number;
  routeTo?: { latitude: number; longitude: number } | null;
}) {
  const map = useMap();
  const { location } = useLocation();
  const initializedToUser = useRef(false);

  useEffect(() => {
    if (focusUserRequest > 0 && location) {
      map.flyTo([location.latitude, location.longitude], 12, { duration: 1.1 });
      return;
    }

    if (routeTo && location) {
      map.fitBounds(
        [
          [location.latitude, location.longitude],
          [routeTo.latitude, routeTo.longitude],
        ],
        { padding: [50, 50] },
      );
      return;
    }

    const points: [number, number][] = places.map((place) => [place.latitude, place.longitude]);
    if (location) {
      points.push([location.latitude, location.longitude]);
    }

    if (points.length === 0) {
      map.setView([55.751244, 37.618423], 9);
      return;
    }

    if (!initializedToUser.current) {
      initializedToUser.current = true;
    }

    if (points.length === 1) {
      map.setView(points[0], 11);
      return;
    }

    map.fitBounds(points, {
      padding: [32, 32],
    });
  }, [focusUserRequest, location, map, places, routeTo]);

  return null;
}

function MapViewportReporter({
  onViewportChange,
}: {
  onViewportChange?: ((center: { latitude: number; longitude: number }) => void) | undefined;
}) {
  useMapEvents({
    moveend(event) {
      if (!onViewportChange) {
        return;
      }

      const center = event.target.getCenter();
      onViewportChange({
        latitude: center.lat,
        longitude: center.lng,
      });
    },
  });

  return null;
}

export default function ClientMap({
  places,
  onPlaceSelect,
  routeTo,
  onViewportChange,
}: {
  places: MapPlace[];
  onPlaceSelect?: (place: MapPlace) => void;
  routeTo?: { latitude: number; longitude: number } | null;
  onViewportChange?: (center: { latitude: number; longitude: number }) => void;
}) {
  const { lang } = useLanguage();
  const { location, status, error, refreshLocation } = useLocation();
  const t = translations[lang];
  const center = places.length > 0 ? [places[0].latitude, places[0].longitude] : [55.751244, 37.618423];
  const helperText =
    status === "resolving"
      ? t.resolving
      : error || (routeTo ? t.routeReady : t.tapMarker);

  return (
    <div className="map-shell relative h-full w-full overflow-hidden border border-[rgba(255,255,255,0.02)]">
      <div className="pointer-events-none absolute left-4 top-4 z-[500] max-w-[72%] rounded-2xl bg-surface-strong px-3 py-2 text-[12px] font-medium text-text-muted shadow-lg backdrop-blur">
        {helperText || t.geolocationError}
      </div>

      <button
        type="button"
        onClick={refreshLocation}
        className="absolute bottom-6 right-4 z-[500] flex h-12 w-12 items-center justify-center rounded-full border border-[rgba(255,255,255,0.06)] bg-surface-strong text-text-main shadow-xl backdrop-blur transition-transform active:scale-95"
      >
        <Crosshair size={20} className="text-primary" />
      </button>

      <MapContainer center={center as [number, number]} zoom={9} scrollWheelZoom={false} zoomControl={false} className="absolute inset-0 z-0 h-full w-full bg-background">
        <ZoomControl position="bottomright" />
        <MapViewportController places={places} focusUserRequest={0} routeTo={routeTo} />
        <MapViewportReporter onViewportChange={onViewportChange} />

        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution=""
        />

        {location ? (
          <>
            <Circle
              center={[location.latitude, location.longitude]}
              radius={50}
              pathOptions={{
                color: "#7cb6ff",
                fillColor: "#7cb6ff",
                fillOpacity: 0.12,
                weight: 1,
              }}
            />
            <Marker position={[location.latitude, location.longitude]} icon={userMarkerIcon} />

            {routeTo ? (
              <Polyline
                pathOptions={{ color: "#67e8b2", weight: 3, dashArray: "10, 10" }}
                positions={[
                  [location.latitude, location.longitude],
                  [routeTo.latitude, routeTo.longitude],
                ]}
              />
            ) : null}
          </>
        ) : null}

        {places.map((place) => (
          <Marker
            key={place.slug}
            position={[place.latitude, place.longitude]}
            icon={getMarkerIcon(place.type)}
            eventHandlers={{
              click: () => onPlaceSelect?.(place),
            }}
          />
        ))}
      </MapContainer>
    </div>
  );
}

'use client';

import {
  createContext,
  startTransition,
  useEffect,
  useEffectEvent,
  useContext,
  useState,
} from "react";
import { LOCATION_STORAGE_KEY, parseStoredLocation, type ViewerLocation } from "@/lib/location";

type LocationContextValue = {
  location: ViewerLocation | null;
  status: "idle" | "resolving" | "ready" | "error";
  error: string;
  refreshLocation: () => void;
};

const LocationContext = createContext<LocationContextValue | null>(null);

function saveLocation(location: ViewerLocation) {
  localStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(location));
}

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useState<ViewerLocation | null>(null);
  const [status, setStatus] = useState<LocationContextValue["status"]>("idle");
  const [error, setError] = useState("");
  const [refreshTick, setRefreshTick] = useState(0);

  const applyLocation = useEffectEvent((nextLocation: ViewerLocation) => {
    setLocation(nextLocation);
    setStatus("ready");
    setError("");
    saveLocation(nextLocation);
  });

  const resolveFromIp = useEffectEvent(async () => {
    try {
      const response = await fetch("/api/location/resolve", {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("ip lookup failed");
      }

      const payload = (await response.json()) as Omit<ViewerLocation, "resolvedAt">;
      applyLocation({
        ...payload,
        source: "ip",
        resolvedAt: new Date().toISOString(),
      });
    } catch {
      setStatus("error");
      setError("Не удалось определить местоположение.");
    }
  });

  useEffect(() => {
    const stored = parseStoredLocation(localStorage.getItem(LOCATION_STORAGE_KEY));
    if (stored) {
      setLocation(stored);
      setStatus("ready");
    }

    let cancelled = false;
    setStatus("resolving");

    if (typeof navigator === "undefined" || !("geolocation" in navigator)) {
      void resolveFromIp();
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        if (cancelled) {
          return;
        }
        
        let city: string | undefined;
        let region: string | undefined;
        let country: string | undefined;
        
        try {
           const res = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${position.coords.latitude}&longitude=${position.coords.longitude}&localityLanguage=ru`);
           if (res.ok) {
              const data = await res.json();
              city = data.city || data.locality;
              region = data.principalSubdivision;
              country = data.countryName;
           }
        } catch {
           // ignore
        }

        applyLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          city,
          region,
          country,
          source: "geolocation",
          resolvedAt: new Date().toISOString(),
        });
      },
      () => {
        if (cancelled) {
          return;
        }

        void resolveFromIp();
      },
      {
        enableHighAccuracy: true,
        timeout: 9000,
        maximumAge: 60_000,
      },
    );

    return () => {
      cancelled = true;
    };
  }, [refreshTick]);

  const value: LocationContextValue = {
    location,
    status,
    error,
    refreshLocation: () => {
      startTransition(() => {
        setRefreshTick((current) => current + 1);
      });
    },
  };

  return <LocationContext value={value}>{children}</LocationContext>;
}

export function useLocation() {
  const context = useContext(LocationContext);

  if (!context) {
    throw new Error("useLocation must be used inside LocationProvider.");
  }

  return context;
}

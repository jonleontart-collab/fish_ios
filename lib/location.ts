export const LOCATION_STORAGE_KEY = "fishflow-location";

export type ViewerLocationSource = "geolocation" | "ip" | "manual";

export type ViewerLocation = {
  latitude: number;
  longitude: number;
  city?: string | null;
  region?: string | null;
  country?: string | null;
  source: ViewerLocationSource;
  resolvedAt: string;
};

export function isViewerLocation(value: unknown): value is ViewerLocation {
  if (!value || typeof value !== "object") {
    return false;
  }

  const input = value as Partial<ViewerLocation>;
  return (
    typeof input.latitude === "number" &&
    Number.isFinite(input.latitude) &&
    typeof input.longitude === "number" &&
    Number.isFinite(input.longitude) &&
    typeof input.source === "string" &&
    typeof input.resolvedAt === "string"
  );
}

export function parseStoredLocation(value: string | null) {
  if (!value) {
    return null;
  }

  try {
    const parsed = JSON.parse(value);
    return isViewerLocation(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

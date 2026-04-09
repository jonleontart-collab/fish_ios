import { z } from "zod";

import { normalizeLanguage, type LanguageCode } from "@/lib/i18n";

const ipWhoIsSchema = z.object({
  success: z.boolean().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  city: z.string().nullable().optional(),
  region: z.string().nullable().optional(),
  country: z.string().nullable().optional(),
});

const ipApiSchema = z.object({
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  city: z.string().nullable().optional(),
  region: z.string().nullable().optional(),
  country_name: z.string().nullable().optional(),
  error: z.boolean().optional(),
});

const ipApiComSchema = z.object({
  status: z.string().optional(),
  message: z.string().optional(),
  lat: z.number().optional(),
  lon: z.number().optional(),
  city: z.string().nullable().optional(),
  regionName: z.string().nullable().optional(),
  country: z.string().nullable().optional(),
});

const geoJsSchema = z.object({
  latitude: z.string().optional(),
  longitude: z.string().optional(),
  city: z.string().nullable().optional(),
  region: z.string().nullable().optional(),
  country: z.string().nullable().optional(),
});

const errors: Record<LanguageCode, string> = {
  ru: "Не удалось определить местоположение по IP.",
  en: "Could not resolve your location by IP.",
  es: "No se pudo determinar la ubicación por IP.",
  fr: "Impossible de déterminer la position via l'IP.",
  pt: "Não foi possível determinar a localização pelo IP.",
};

function parseForwardedIp(value: string | null) {
  return value?.split(",")[0]?.trim() || null;
}

function getRequestLanguage(request: Request) {
  return normalizeLanguage(new URL(request.url).searchParams.get("lang"));
}

function getRequestIp(request: Request) {
  const headers = request.headers;
  const ip =
    parseForwardedIp(headers.get("x-forwarded-for")) ||
    headers.get("x-real-ip") ||
    headers.get("cf-connecting-ip") ||
    new URL(request.url).searchParams.get("ip");

  if (!ip || ip === "::1" || ip === "127.0.0.1") {
    return null;
  }

  return ip;
}

async function fetchJson(url: string) {
  const response = await fetch(url, {
    cache: "no-store",
    headers: {
      Accept: "application/json",
      "User-Agent": "FishFlow/1.0",
    },
    signal: AbortSignal.timeout(5000),
  });

  if (!response.ok) {
    throw new Error(`IP lookup failed with ${response.status}`);
  }

  return response.json();
}

async function resolveViaIpWhoIs(ip: string | null) {
  const endpoint = ip ? `https://ipwho.is/${ip}` : "https://ipwho.is/";
  const parsed = ipWhoIsSchema.parse(await fetchJson(endpoint));

  if (typeof parsed.latitude !== "number" || typeof parsed.longitude !== "number") {
    throw new Error("Missing coordinates from ipwho.is");
  }

  return {
    latitude: parsed.latitude,
    longitude: parsed.longitude,
    city: parsed.city ?? null,
    region: parsed.region ?? null,
    country: parsed.country ?? null,
  };
}

async function resolveViaIpApi(ip: string | null) {
  const endpoint = ip ? `https://ipapi.co/${ip}/json/` : "https://ipapi.co/json/";
  const parsed = ipApiSchema.parse(await fetchJson(endpoint));

  if (parsed.error || typeof parsed.latitude !== "number" || typeof parsed.longitude !== "number") {
    throw new Error("Missing coordinates from ipapi");
  }

  return {
    latitude: parsed.latitude,
    longitude: parsed.longitude,
    city: parsed.city ?? null,
    region: parsed.region ?? null,
    country: parsed.country_name ?? null,
  };
}

async function resolveViaIpApiCom(ip: string | null) {
  const endpoint = ip
    ? `http://ip-api.com/json/${ip}?fields=status,message,country,regionName,city,lat,lon`
    : "http://ip-api.com/json/?fields=status,message,country,regionName,city,lat,lon";
  const parsed = ipApiComSchema.parse(await fetchJson(endpoint));

  if (parsed.status !== "success" || typeof parsed.lat !== "number" || typeof parsed.lon !== "number") {
    throw new Error(parsed.message || "Missing coordinates from ip-api.com");
  }

  return {
    latitude: parsed.lat,
    longitude: parsed.lon,
    city: parsed.city ?? null,
    region: parsed.regionName ?? null,
    country: parsed.country ?? null,
  };
}

async function resolveViaGeoJs(ip: string | null) {
  const endpoint = ip ? `https://get.geojs.io/v1/ip/geo/${ip}.json` : "https://get.geojs.io/v1/ip/geo.json";
  const parsed = geoJsSchema.parse(await fetchJson(endpoint));
  const latitude = parsed.latitude ? Number(parsed.latitude) : NaN;
  const longitude = parsed.longitude ? Number(parsed.longitude) : NaN;

  if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
    throw new Error("Missing coordinates from geojs");
  }

  return {
    latitude,
    longitude,
    city: parsed.city ?? null,
    region: parsed.region ?? null,
    country: parsed.country ?? null,
  };
}

export async function GET(request: Request) {
  const headers = request.headers;
  const edgeLatitude = headers.get("x-vercel-ip-latitude");
  const edgeLongitude = headers.get("x-vercel-ip-longitude");

  if (edgeLatitude && edgeLongitude) {
    return Response.json({
      latitude: Number(edgeLatitude),
      longitude: Number(edgeLongitude),
      city: headers.get("x-vercel-ip-city"),
      region: headers.get("x-vercel-ip-country-region"),
      country: headers.get("x-vercel-ip-country"),
      source: "ip",
    });
  }

  const ip = getRequestIp(request);
  const providers = [resolveViaIpWhoIs, resolveViaIpApi, resolveViaIpApiCom, resolveViaGeoJs];

  for (const provider of providers) {
    try {
      const result = await provider(ip);
      return Response.json({
        ...result,
        source: "ip",
      });
    } catch {
      // Try the next provider.
    }
  }

  const lang = getRequestLanguage(request);
  return Response.json(
    {
      error: errors[lang],
    },
    { status: 502 },
  );
}

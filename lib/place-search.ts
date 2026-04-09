import { z } from "zod";

import { type Coordinates, distanceKmBetween } from "@/lib/geo";
import { logger } from "@/lib/logger";
import { prisma } from "@/lib/prisma";
import { createPlaceSlug } from "@/lib/slug";

export const PLACE_SEARCH_RADIUS_KM = 200;

const APIFY_ACTOR_ID = "compass~crawler-google-places";
const DEFAULT_AREA_SEARCH_STRINGS = [
  "fishing lake",
  "fishing club",
  "fishing base",
  "fishing tackle shop",
];
const DEFAULT_AMENITIES = ["Parking", "Access", "Photos"];
const DEFAULT_BEST_MONTHS = ["April", "May", "September"];
const DEFAULT_FISH_SPECIES = ["Pike", "Perch", "Carp"];

const searchIntentSchema = z.object({
  searchText: z.string().trim().min(2).max(120),
  locationQuery: z.string().trim().min(2).max(120).nullable().optional(),
  fishSpecies: z.array(z.string().trim().min(2).max(30)).max(4).optional(),
  placeKinds: z.array(z.enum(["WILD", "PAYED", "CLUB", "SHOP"])).max(4).optional(),
});

type RawApifyItem = Record<string, unknown>;

export type SearchIntent = {
  rawQuery: string;
  searchText: string;
  locationQuery: string | null;
  fishSpecies: string[];
  placeKinds: Array<"WILD" | "PAYED" | "CLUB" | "SHOP">;
};

export type DiscoveredPlaceCandidate = {
  name: string;
  shortDescription: string;
  description: string;
  type: "WILD" | "PAYED" | "CLUB" | "SHOP";
  city: string;
  region: string;
  latitude: number;
  longitude: number;
  rating: number;
  depthMeters: number | null;
  fishSpecies: string[];
  amenities: string[];
  bestMonths: string[];
  coverImage: string | null;
  sourceUrl: string | null;
  aiSummary: string | null;
};

function extractResponseText(data: unknown) {
  const candidate = (data as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> })
    ?.candidates?.[0];

  return (
    candidate?.content?.parts
      ?.map((part) => part.text ?? "")
      .join("")
      .trim() ?? ""
  );
}

function extractJsonPayload(rawText: string) {
  if (!rawText) {
    return null;
  }

  const fenced = rawText.match(/```json\s*([\s\S]*?)```/i) ?? rawText.match(/```\s*([\s\S]*?)```/i);
  if (fenced?.[1]) {
    return fenced[1].trim();
  }

  const objectStart = rawText.indexOf("{");
  const objectEnd = rawText.lastIndexOf("}");
  if (objectStart >= 0 && objectEnd > objectStart) {
    return rawText.slice(objectStart, objectEnd + 1);
  }

  return rawText.trim();
}

function buildViewerLocationLabel(input: {
  city?: string | null;
  region?: string | null;
  country?: string | null;
}) {
  return [input.city, input.region, input.country].filter(Boolean).join(", ");
}

function uniqueValues(values: Array<string | null | undefined>) {
  return [...new Set(values.map((value) => value?.trim()).filter(Boolean) as string[])];
}

function parseNumber(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const normalized = Number(value);
    return Number.isFinite(normalized) ? normalized : null;
  }

  return null;
}

function pickString(...values: unknown[]) {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return null;
}

function arrayOfStrings(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .map((item) => {
        if (typeof item === "string") {
          return item.trim();
        }

        if (item && typeof item === "object") {
          return pickString(
            (item as { name?: unknown }).name,
            (item as { title?: unknown }).title,
            (item as { text?: unknown }).text,
          );
        }

        return null;
      })
      .filter(Boolean) as string[];
  }

  if (typeof value === "string" && value.trim()) {
    return value
      .split(/[|,/]/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

function extractCoordinates(item: RawApifyItem) {
  const nestedLocation = item.location as
    | {
        lat?: unknown;
        lng?: unknown;
        latitude?: unknown;
        longitude?: unknown;
      }
    | undefined;
  const gpsCoordinates = item.gpsCoordinates as
    | {
        latitude?: unknown;
        longitude?: unknown;
        lat?: unknown;
        lng?: unknown;
      }
    | undefined;
  const coordinates = item.coordinates as
    | {
        lat?: unknown;
        lng?: unknown;
        latitude?: unknown;
        longitude?: unknown;
      }
    | undefined;

  const latitude =
    parseNumber(item.latitude) ??
    parseNumber(nestedLocation?.lat) ??
    parseNumber(nestedLocation?.latitude) ??
    parseNumber(gpsCoordinates?.latitude) ??
    parseNumber(gpsCoordinates?.lat) ??
    parseNumber(coordinates?.latitude) ??
    parseNumber(coordinates?.lat);
  const longitude =
    parseNumber(item.longitude) ??
    parseNumber(nestedLocation?.lng) ??
    parseNumber(nestedLocation?.longitude) ??
    parseNumber(gpsCoordinates?.longitude) ??
    parseNumber(gpsCoordinates?.lng) ??
    parseNumber(coordinates?.longitude) ??
    parseNumber(coordinates?.lng);

  if (latitude === null || longitude === null) {
    return null;
  }

  return { latitude, longitude };
}

function inferPlaceType(
  title: string,
  categories: string[],
  placeKinds: Array<"WILD" | "PAYED" | "CLUB" | "SHOP">,
) {
  const haystack = `${title} ${categories.join(" ")}`.toLowerCase();

  if (placeKinds.length === 1) {
    return placeKinds[0];
  }

  if (
    /(shop|store|tackle|bait|рыболов|снаст|outdoor shop|boat dealer)/i.test(haystack)
  ) {
    return "SHOP";
  }

  if (/(club|resort|camp|base|lodge|база|клуб)/i.test(haystack)) {
    return "CLUB";
  }

  if (/(paid|private lake|commercial fishery|fee fishing|плат)/i.test(haystack)) {
    return "PAYED";
  }

  return "WILD";
}

function inferLocationParts(
  item: RawApifyItem,
  fallbackLocation: string | null,
  viewer: { city?: string | null; region?: string | null },
) {
  const address = pickString(item.address, item.fullAddress, item.streetAddress);
  const city =
    pickString(item.city, item.addressLocality, item.locality, item.municipality) ??
    (address?.split(",").map((part) => part.trim()).at(-3) ?? null) ??
    viewer.city ??
    (fallbackLocation?.split(",").map((part) => part.trim())[0] ?? null) ??
    "Unknown area";
  const region =
    pickString(item.region, item.state, item.county, item.addressRegion) ??
    (address?.split(",").map((part) => part.trim()).at(-2) ?? null) ??
    viewer.region ??
    (fallbackLocation?.split(",").map((part) => part.trim())[1] ?? null) ??
    city;

  return { city, region };
}

function extractSearchSpecies(query: string, normalizedSpecies: string[]) {
  const lowerQuery = query.toLowerCase();
  const matches = uniqueValues([
    ...normalizedSpecies,
    /(pike|щук)/i.test(lowerQuery) ? "Pike" : null,
    /(zander|walleye|судак)/i.test(lowerQuery) ? "Zander" : null,
    /(perch|окун)/i.test(lowerQuery) ? "Perch" : null,
    /(carp|карп|амур)/i.test(lowerQuery) ? "Carp" : null,
    /(catfish|сом)/i.test(lowerQuery) ? "Catfish" : null,
    /(trout|форел)/i.test(lowerQuery) ? "Trout" : null,
  ]);

  return matches.length > 0 ? matches : DEFAULT_FISH_SPECIES;
}

function buildShortDescription(type: DiscoveredPlaceCandidate["type"], name: string, city: string) {
  if (type === "SHOP") {
    return `Fishing tackle spot in ${city} with quick access to gear and local intel.`;
  }

  if (type === "CLUB") {
    return `Managed fishing venue near ${city} for repeatable sessions and cleaner access.`;
  }

  if (type === "PAYED") {
    return `Paid water near ${city} suited for planned sessions and steadier fishing.`;
  }

  return `Wild fishing area near ${city} with flexible shore access and active local traffic.`;
}

function buildDescription(type: DiscoveredPlaceCandidate["type"], name: string, city: string, categories: string[]) {
  const categoryText = categories.length > 0 ? ` Categories: ${categories.join(", ")}.` : "";

  if (type === "SHOP") {
    return `${name} is a practical stop in ${city} for tackle, bait, and local recommendations before a trip.${categoryText}`;
  }

  if (type === "CLUB") {
    return `${name} looks like a managed fishing venue in ${city} with clearer access, supporting facilities, and structured sessions.${categoryText}`;
  }

  if (type === "PAYED") {
    return `${name} looks like a commercial or paid fishing venue in ${city} that can provide more predictable conditions for a planned outing.${categoryText}`;
  }

  return `${name} appears to be a real local fishing area in ${city}. It is suited for map discovery, route planning, and checking nearby activity.${categoryText}`;
}

function buildAmenities(type: DiscoveredPlaceCandidate["type"], categories: string[]) {
  const keywordAmenities = uniqueValues([
    /(parking|car park)/i.test(categories.join(" ")) ? "Parking" : null,
    /(boat|marina|dock|pier)/i.test(categories.join(" ")) ? "Dock" : null,
    /(camp|base|resort|cafe)/i.test(categories.join(" ")) ? "Facilities" : null,
  ]);

  if (keywordAmenities.length > 0) {
    return keywordAmenities;
  }

  if (type === "SHOP") {
    return ["Tackle", "Bait", "Local advice"];
  }

  return DEFAULT_AMENITIES;
}

function buildBestMonths(query: string) {
  const lowerQuery = query.toLowerCase();

  if (/(winter|зим)/i.test(lowerQuery)) {
    return ["December", "January", "February"];
  }

  if (/(summer|лет)/i.test(lowerQuery)) {
    return ["June", "July", "August"];
  }

  return DEFAULT_BEST_MONTHS;
}

function buildAreaSearchStrings(query: string, placeKinds: Array<"WILD" | "PAYED" | "CLUB" | "SHOP">) {
  if (!query.trim()) {
    return DEFAULT_AREA_SEARCH_STRINGS;
  }

  const terms = [
    query,
    placeKinds.includes("SHOP") ? `${query} fishing tackle shop` : `${query} fishing spot`,
    placeKinds.includes("CLUB") || placeKinds.includes("PAYED") ? `${query} fishing club` : `${query} fishing lake`,
  ];

  return uniqueValues(terms).slice(0, 4);
}

function mapApifyItemToPlaceCandidate(
  item: RawApifyItem,
  input: {
    rawQuery: string;
    fishSpecies: string[];
    placeKinds: Array<"WILD" | "PAYED" | "CLUB" | "SHOP">;
    fallbackLocation: string | null;
    viewer: { city?: string | null; region?: string | null };
  },
) {
  const title = pickString(item.title, item.name, item.placeName);
  const coordinates = extractCoordinates(item);

  if (!title || !coordinates) {
    return null;
  }

  const categories = uniqueValues([
    ...arrayOfStrings(item.categories),
    pickString(item.categoryName, item.category, item.primaryCategory),
  ]);
  const type = inferPlaceType(title, categories, input.placeKinds);
  const { city, region } = inferLocationParts(item, input.fallbackLocation, input.viewer);
  const imageCandidates = arrayOfStrings(item.imageUrls);
  const imageUrl = pickString(imageCandidates[0], item.image, item.thumbnailUrl);
  const sourceUrl = pickString(item.url, item.placeUrl, item.locationUrl, item.website);
  const rating = Math.max(0, Math.min(5, parseNumber(item.totalScore) ?? parseNumber(item.rating) ?? 4.2));

  return {
    name: title,
    shortDescription: buildShortDescription(type, title, city),
    description: buildDescription(type, title, city, categories),
    type,
    city,
    region,
    latitude: coordinates.latitude,
    longitude: coordinates.longitude,
    rating: Number(rating.toFixed(1)),
    depthMeters: null,
    fishSpecies: extractSearchSpecies(input.rawQuery, input.fishSpecies),
    amenities: buildAmenities(type, categories),
    bestMonths: buildBestMonths(input.rawQuery),
    coverImage: imageUrl,
    sourceUrl,
    aiSummary: null,
  } satisfies DiscoveredPlaceCandidate;
}

export async function normalizePlaceSearchIntent(input: {
  query: string;
  city?: string | null;
  region?: string | null;
  country?: string | null;
}): Promise<SearchIntent> {
  const rawQuery = input.query.trim();
  const fallbackLocation = buildViewerLocationLabel(input) || null;
  const fallback: SearchIntent = {
    rawQuery,
    searchText: rawQuery,
    locationQuery: fallbackLocation,
    fishSpecies: extractSearchSpecies(rawQuery, []),
    placeKinds: [],
  };

  const apiKey = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_SEARCH_MODEL || process.env.GEMINI_MODEL || "gemini-2.5-flash-lite";

  if (!apiKey) {
    return fallback;
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text:
                    "You normalize fishing map searches. Return JSON only. " +
                    'Schema: {"searchText":"","locationQuery":null,"fishSpecies":[],"placeKinds":[]}. ' +
                    "searchText must be short and suitable for Google Places search. " +
                    "locationQuery must contain the place/region/city to search in, or null when not present. " +
                    "placeKinds can contain WILD, PAYED, CLUB, SHOP. " +
                    "Do not invent coordinates. Keep fishSpecies and placeKinds empty when not stated.",
                },
                {
                  text: JSON.stringify({
                    viewerLocation: {
                      city: input.city ?? null,
                      region: input.region ?? null,
                      country: input.country ?? null,
                    },
                    query: rawQuery,
                  }),
                },
              ],
            },
          ],
          generationConfig: {
            responseMimeType: "application/json",
            responseJsonSchema: {
              type: "object",
              properties: {
                searchText: { type: "string" },
                locationQuery: { type: ["string", "null"] },
                fishSpecies: {
                  type: "array",
                  items: { type: "string" },
                },
                placeKinds: {
                  type: "array",
                  items: {
                    type: "string",
                    enum: ["WILD", "PAYED", "CLUB", "SHOP"],
                  },
                },
              },
              required: ["searchText"],
            },
          },
        }),
      },
    );

    if (!response.ok) {
      throw new Error(`Gemini search normalization failed with ${response.status}`);
    }

    const rawText = extractResponseText(await response.json());
    const jsonPayload = extractJsonPayload(rawText);
    if (!jsonPayload) {
      return fallback;
    }

    const parsed = searchIntentSchema.parse(JSON.parse(jsonPayload));

    return {
      rawQuery,
      searchText: parsed.searchText,
      locationQuery: parsed.locationQuery ?? fallbackLocation,
      fishSpecies: extractSearchSpecies(rawQuery, parsed.fishSpecies ?? []),
      placeKinds: parsed.placeKinds ?? [],
    };
  } catch (error) {
    logger.warn("Place search", "Gemini normalization fallback", error);
    return fallback;
  }
}

export async function searchPlacesViaApify(input: {
  query: string;
  center: Coordinates;
  radiusKm?: number;
  viewerCity?: string | null;
  viewerRegion?: string | null;
  viewerCountry?: string | null;
}): Promise<DiscoveredPlaceCandidate[]> {
  const token = process.env.APIFY_API_TOKEN;
  const trimmedQuery = input.query.trim();

  if (!token) {
    logger.warn("Place search", "APIFY_API_TOKEN is missing");
    return [];
  }

  const radiusKm = input.radiusKm ?? PLACE_SEARCH_RADIUS_KM;
  const intent = trimmedQuery
    ? await normalizePlaceSearchIntent({
        query: trimmedQuery,
        city: input.viewerCity,
        region: input.viewerRegion,
        country: input.viewerCountry,
      })
    : null;
  const locationQuery =
    intent?.locationQuery ?? buildViewerLocationLabel({
      city: input.viewerCity,
      region: input.viewerRegion,
      country: input.viewerCountry,
    });
  const payload = {
    searchStringsArray: buildAreaSearchStrings(intent?.searchText ?? "", intent?.placeKinds ?? []),
    locationQuery: intent?.locationQuery || undefined,
    customGeolocation:
      intent?.locationQuery
        ? undefined
        : {
            type: "Point",
            coordinates: [input.center.longitude, input.center.latitude],
            radiusKm,
          },
    maxCrawledPlacesPerSearch: 6,
    language: "ru",
    maxImages: 3,
    maxReviews: 0,
    scrapePlaceDetails: true,
    scrapePlaceImages: true,
    scrapePlaceReviews: false,
  };

  logger.info("Place search", "Apify request", {
    payload,
    query: trimmedQuery,
    radiusKm,
  });

  try {
    const response = await fetch(
      `https://api.apify.com/v2/acts/${APIFY_ACTOR_ID}/run-sync-get-dataset-items?token=${token}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Apify place search failed with ${response.status}: ${errorText}`);
    }

    const items = (await response.json()) as RawApifyItem[];
    const mapped = items
      .map((item) =>
        mapApifyItemToPlaceCandidate(item, {
          rawQuery: trimmedQuery,
          fishSpecies: intent?.fishSpecies ?? DEFAULT_FISH_SPECIES,
          placeKinds: intent?.placeKinds ?? [],
          fallbackLocation: locationQuery,
          viewer: {
            city: input.viewerCity,
            region: input.viewerRegion,
          },
        }),
      )
      .filter(Boolean) as DiscoveredPlaceCandidate[];

    return mapped.filter((candidate, index, array) => {
      return array.findIndex((item) => item.name === candidate.name && item.latitude === candidate.latitude && item.longitude === candidate.longitude) === index;
    });
  } catch (error) {
    logger.error("Place search", "Apify search failed", error);
    return [];
  }
}

function averageCoordinates(places: Array<{ latitude: number; longitude: number }>, fallback: Coordinates) {
  if (places.length === 0) {
    return fallback;
  }

  const total = places.reduce(
    (acc, place) => ({
      latitude: acc.latitude + place.latitude,
      longitude: acc.longitude + place.longitude,
    }),
    { latitude: 0, longitude: 0 },
  );

  return {
    latitude: total.latitude / places.length,
    longitude: total.longitude / places.length,
  };
}

export function getSearchAnchor(input: {
  viewer: Coordinates;
  areaCenter?: Coordinates | null;
  candidates: Array<{ latitude: number; longitude: number }>;
}) {
  if (input.candidates.length > 0) {
    return averageCoordinates(input.candidates, input.areaCenter ?? input.viewer);
  }

  return input.areaCenter ?? input.viewer;
}

export async function upsertDiscoveredPlaces(input: {
  places: DiscoveredPlaceCandidate[];
  distanceOrigin: Coordinates;
}) {
  const saved = [];

  for (const place of input.places) {
    const slug = createPlaceSlug(place.name, place.latitude, place.longitude);
    const existing =
      (place.sourceUrl
        ? await prisma.place.findFirst({
            where: { sourceUrl: place.sourceUrl },
          })
        : null) ??
      (await prisma.place.findUnique({
        where: { slug },
      }));

    const payload = {
      slug,
      name: place.name,
      shortDescription: place.shortDescription,
      description: place.description,
      type: place.type,
      city: place.city,
      region: place.region,
      latitude: place.latitude,
      longitude: place.longitude,
      distanceKm: distanceKmBetween(input.distanceOrigin, {
        latitude: place.latitude,
        longitude: place.longitude,
      }),
      rating: place.rating,
      depthMeters: place.depthMeters,
      fishSpecies: place.fishSpecies.join("|"),
      amenities: place.amenities.join("|"),
      bestMonths: place.bestMonths.join("|"),
      coverImage: place.coverImage,
      source: "DISCOVERED" as const,
      sourceUrl: place.sourceUrl,
      aiSummary: place.aiSummary,
    };

    const record = existing
      ? await prisma.place.update({
          where: { id: existing.id },
          data: payload,
        })
      : await prisma.place.create({
          data: payload,
        });

    saved.push(record);
  }

  return saved;
}

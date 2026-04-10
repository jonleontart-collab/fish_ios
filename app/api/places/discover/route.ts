import { z } from "zod";

import { splitPipeList } from "@/lib/format";
import { distanceKmBetween } from "@/lib/geo";
import { logger } from "@/lib/logger";
import {
  getSearchAnchor,
  PLACE_SEARCH_RADIUS_KM,
  searchPlacesViaApify,
  upsertDiscoveredPlaces,
} from "@/lib/place-search";
import { prisma } from "@/lib/prisma";

const discoverSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  city: z.string().trim().nullable().optional(),
  region: z.string().trim().nullable().optional(),
  country: z.string().trim().nullable().optional(),
  query: z.string().trim().max(140).nullable().optional(),
  areaLatitude: z.number().min(-90).max(90).nullable().optional(),
  areaLongitude: z.number().min(-180).max(180).nullable().optional(),
  radiusKm: z.number().min(20).max(300).nullable().optional(),
});

type DbPlace = {
  id: string;
  slug: string;
  name: string;
  city: string;
  region: string;
  shortDescription: string;
  description: string;
  type: "WILD" | "PAYED" | "CLUB" | "SHOP" | "EVENT_SOS";
  distanceKm: number | null;
  rating: number;
  depthMeters: number | null;
  coverImage: string | null;
  source: "SEEDED" | "GEMINI" | "DISCOVERED" | "USER";
  sourceUrl: string | null;
  fishSpecies: string;
  amenities: string;
  bestMonths: string;
  latitude: number;
  longitude: number;
  createdBy: {
    id: string;
    name: string;
    handle: string;
  } | null;
  photos: Array<{ imagePath: string }>;
  _count: {
    catches: number;
    photos: number;
  };
};

function mapPlaceForClient(place: DbPlace, latitude: number, longitude: number) {
  return {
    ...place,
    displayImage: place.photos[0]?.imagePath ?? place.coverImage,
    distanceKm: distanceKmBetween(
      { latitude, longitude },
      { latitude: place.latitude, longitude: place.longitude },
    ),
    fishSpeciesList: splitPipeList(place.fishSpecies),
    amenitiesList: splitPipeList(place.amenities),
    bestMonthsList: splitPipeList(place.bestMonths),
  };
}

function matchesQuery(
  place: {
    name: string;
    city: string;
    region: string;
    shortDescription: string;
    description: string;
    sourceUrl: string | null;
  },
  query: string,
) {
  if (!query) {
    return true;
  }

  const normalizedQuery = query.toLowerCase();
  const haystack = [
    place.name,
    place.city,
    place.region,
    place.shortDescription,
    place.description,
    place.sourceUrl ?? "",
  ]
    .join(" ")
    .toLowerCase();

  return haystack.includes(normalizedQuery);
}

export async function POST(request: Request) {
  let stage = "request";

  try {
    const payload = await request.json();
    const parsed = discoverSchema.safeParse(payload);

    if (!parsed.success) {
      return Response.json({ error: "Некорректные координаты для поиска мест." }, { status: 400 });
    }

    const {
      latitude,
      longitude,
      city,
      region,
      country,
      query: rawQuery,
      areaLatitude,
      areaLongitude,
      radiusKm: requestedRadius,
    } = parsed.data;
    const query = rawQuery?.trim() ?? "";
    const radiusKm = requestedRadius ?? PLACE_SEARCH_RADIUS_KM;
    const viewerCenter = { latitude, longitude };
    const areaCenter =
      typeof areaLatitude === "number" && typeof areaLongitude === "number"
        ? { latitude: areaLatitude, longitude: areaLongitude }
        : viewerCenter;

    logger.info("Discover API", "incoming", {
      latitude,
      longitude,
      city,
      region,
      country,
      query,
      areaCenter,
      radiusKm,
    });

    stage = "parser";
    const parserDiscovered = await searchPlacesViaApify({
      query,
      center: areaCenter,
      radiusKm,
      viewerCity: city,
      viewerRegion: region,
      viewerCountry: country,
    });

    if (parserDiscovered.length > 0) {
      stage = "save";
      await upsertDiscoveredPlaces({
        places: parserDiscovered,
        distanceOrigin: areaCenter,
      });
    }

    stage = "database";
    const places = await prisma.place.findMany({
      where: {
        source: {
          not: "SEEDED",
        },
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            handle: true,
          },
        },
        photos: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
        _count: {
          select: {
            catches: true,
            photos: true,
          },
        },
      },
    });

    const localMatches = query ? places.filter((place) => matchesQuery(place, query)) : [];

    stage = "response";
    const searchAnchor = getSearchAnchor({
      viewer: viewerCenter,
      areaCenter,
      candidates: [...parserDiscovered, ...localMatches],
    });
    const matchedSlugs = new Set(
      localMatches.map((place) => place.slug).concat(
        parserDiscovered.map((place) => place.name.toLowerCase()),
      ),
    );

    const nearbyPlaces = places
      .map((place) => mapPlaceForClient(place, searchAnchor.latitude, searchAnchor.longitude))
      .filter((place) => {
        if (place.distanceKm > radiusKm) {
          return false;
        }

        if (!query) {
          return true;
        }

        return matchesQuery(place, query) || matchedSlugs.has(place.slug) || matchedSlugs.has(place.name.toLowerCase());
      })
      .sort((left, right) => {
        if (left.distanceKm !== right.distanceKm) {
          return left.distanceKm - right.distanceKm;
        }

        return right.rating - left.rating;
      })
      .slice(0, 40);

    logger.info("Discover API", "result", {
      query,
      discoveredCount: parserDiscovered.length,
      nearbyCount: nearbyPlaces.length,
      searchAnchor,
      sample: nearbyPlaces.slice(0, 3).map((place) => ({
        name: place.name,
        source: place.source,
        distanceKm: place.distanceKm,
      })),
    });

    return Response.json({
      places: nearbyPlaces,
      discovered: parserDiscovered.length,
      radiusKm,
      searchAnchor,
    });
  } catch (error) {
    logger.error("Discover API", `failed at ${stage}`, error);

    const errorMap: Record<string, string> = {
      parser: "Парсер мест временно не ответил.",
      save: "Места нашли, но не удалось сохранить их в базе.",
      database: "Места нашли, но база не отдала список для карты.",
      response: "Места нашли, но не удалось собрать ответ для карты.",
      request: "Поиск мест временно не завершился.",
    };

    return Response.json(
      {
        error: errorMap[stage] ?? "Поиск мест временно не завершился.",
        details: error instanceof Error ? error.message : undefined,
      },
      { status: 500 },
    );
  }
}

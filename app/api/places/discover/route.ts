import { z } from "zod";
import { discoverNearbyPlaces } from "@/lib/ai";
import { distanceKmBetween } from "@/lib/geo";
import { prisma } from "@/lib/prisma";
import { createPlaceSlug } from "@/lib/slug";
import { splitPipeList } from "@/lib/format";
import { enrichPlacesInBackground } from "@/lib/apify";
import { logger } from "@/lib/logger";

const discoverSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  city: z.string().trim().nullable().optional(),
  region: z.string().trim().nullable().optional(),
  country: z.string().trim().nullable().optional(),
});

function mapPlaceForClient(
  place: {
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
    source: "SEEDED" | "GEMINI" | "USER";
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
  },
  latitude: number,
  longitude: number,
) {
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

export async function POST(request: Request) {
  const payload = await request.json();
  const parsed = discoverSchema.safeParse(payload);

  if (!parsed.success) {
    return Response.json({ error: "Некорректные координаты для поиска мест." }, { status: 400 });
  }

  const { latitude, longitude, city, region, country } = parsed.data;
  logger.info("Discover API", "incoming", {
    latitude,
    longitude,
    city,
    region,
    country,
  });

  const discovered = await discoverNearbyPlaces({
    latitude,
    longitude,
    city,
    region,
    country,
  });

  const newOrUpdatedPlaces = [];

  for (const item of discovered) {
    const slug = createPlaceSlug(item.name, item.latitude, item.longitude);
    const existing =
      (item.sourceUrl
        ? await prisma.place.findFirst({
            where: { sourceUrl: item.sourceUrl },
          })
        : null) ??
      (await prisma.place.findUnique({
        where: { slug },
      }));

    if (existing) {
      const updated = await prisma.place.update({
        where: { id: existing.id },
        data: {
          slug,
          name: item.name,
          shortDescription: item.shortDescription,
          description: item.description,
          type: item.type,
          city: item.city,
          region: item.region,
          latitude: item.latitude,
          longitude: item.longitude,
          distanceKm: distanceKmBetween(
            { latitude, longitude },
            { latitude: item.latitude, longitude: item.longitude },
          ),
          rating: item.rating,
          depthMeters: item.depthMeters,
          fishSpecies: item.fishSpecies.join("|"),
          amenities: item.amenities.join("|"),
          bestMonths: item.bestMonths.join("|"),
          coverImage: item.imageUrl,
          source: "GEMINI",
          sourceUrl: item.sourceUrl,
          aiSummary: item.aiSummary,
        },
      });
      newOrUpdatedPlaces.push(updated);
      continue;
    }

    const created = await prisma.place.create({
      data: {
        slug,
        name: item.name,
        shortDescription: item.shortDescription,
        description: item.description,
        type: item.type,
        city: item.city,
        region: item.region,
        latitude: item.latitude,
        longitude: item.longitude,
        distanceKm: distanceKmBetween(
          { latitude, longitude },
          { latitude: item.latitude, longitude: item.longitude },
        ),
        rating: item.rating,
        depthMeters: item.depthMeters,
        fishSpecies: item.fishSpecies.join("|"),
        amenities: item.amenities.join("|"),
        bestMonths: item.bestMonths.join("|"),
        coverImage: item.imageUrl,
        source: "GEMINI",
        sourceUrl: item.sourceUrl,
        aiSummary: item.aiSummary,
      },
    });
    newOrUpdatedPlaces.push(created);
  }

  const placesToEnrich = newOrUpdatedPlaces.filter((p) => !p.coverImage && p.source === "GEMINI");
  
  // Repair logic: Also find existing places in the area that are missing images
  const existingMissingImages = await prisma.place.findMany({
    where: {
      source: "GEMINI",
      coverImage: null,
      latitude: { gte: latitude - 1, lte: latitude + 1 },
      longitude: { gte: longitude - 1, lte: longitude + 1 },
      id: { notIn: newOrUpdatedPlaces.map(p => p.id) }
    },
    take: 5
  });

  const allToEnrich = [...placesToEnrich, ...existingMissingImages];

  if (allToEnrich.length > 0) {
    logger.info("Discover API", `Performing synchronous enrichment for ${allToEnrich.length} places (${placesToEnrich.length} new, ${existingMissingImages.length} existing)...`);
    try {
      await enrichPlacesInBackground(allToEnrich);
      logger.info("Discover API", "Enrichment completed successfully.");
    } catch (err) {
      logger.error("Apify", "Apify Enrichment Error", err);
    }
  }

  const places = await prisma.place.findMany({
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

  const nearbyPlaces = places
    .map((place) => mapPlaceForClient(place, latitude, longitude))
    .filter((place) => place.distanceKm <= 160)
    .sort((left, right) => {
      if (left.distanceKm !== right.distanceKm) {
        return left.distanceKm - right.distanceKm;
      }

      return right.rating - left.rating;
    })
    .slice(0, 30);

  logger.info("Discover API", "result", {
    discoveredCount: discovered.length,
    nearbyCount: nearbyPlaces.length,
    sample: nearbyPlaces.slice(0, 3).map((place) => ({
      name: place.name,
      source: place.source,
      distanceKm: place.distanceKm,
    })),
  });

  return Response.json({
    places: nearbyPlaces,
    discovered: discovered.length,
  });
}

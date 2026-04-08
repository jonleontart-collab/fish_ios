import { z } from "zod";
import { getCurrentUser } from "@/lib/queries";
import { prisma } from "@/lib/prisma";
import { saveImageFile } from "@/lib/storage";
import { createPlaceSlug } from "@/lib/slug";
import { distanceKmBetween } from "@/lib/geo";

const createPlaceSchema = z.object({
  name: z.string().trim().min(3).max(140),
  shortDescription: z.string().trim().min(10).max(140),
  description: z.string().trim().min(20).max(500),
  type: z.enum(["WILD", "PAYED", "CLUB"]),
  city: z.string().trim().min(2).max(80),
  region: z.string().trim().min(2).max(120),
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
  fishSpecies: z.string().trim().min(2).max(200),
  amenities: z.string().trim().min(2).max(200),
  bestMonths: z.string().trim().min(2).max(120),
  viewerLatitude: z.coerce.number().min(-90).max(90).optional(),
  viewerLongitude: z.coerce.number().min(-180).max(180).optional(),
});

function normalizePipeList(value: string) {
  return value
    .split(/[,\n|]/)
    .map((item) => item.trim())
    .filter(Boolean)
    .join("|");
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const parsed = createPlaceSchema.safeParse({
    name: formData.get("name"),
    shortDescription: formData.get("shortDescription"),
    description: formData.get("description"),
    type: formData.get("type"),
    city: formData.get("city"),
    region: formData.get("region"),
    latitude: formData.get("latitude"),
    longitude: formData.get("longitude"),
    fishSpecies: formData.get("fishSpecies"),
    amenities: formData.get("amenities"),
    bestMonths: formData.get("bestMonths"),
    viewerLatitude: formData.get("viewerLatitude"),
    viewerLongitude: formData.get("viewerLongitude"),
  });

  if (!parsed.success) {
    return Response.json(
      { error: parsed.error.issues[0]?.message ?? "Некорректные данные новой точки." },
      { status: 400 },
    );
  }

  const user = await getCurrentUser();
  if (!user) {
    return Response.json({ error: "Пользователь не найден." }, { status: 500 });
  }

  const image = formData.get("image");
  const storedImage =
    image instanceof File && image.size > 0 ? await saveImageFile(image) : null;

  const slug = createPlaceSlug(parsed.data.name, parsed.data.latitude, parsed.data.longitude);

  const created = await prisma.place.create({
    data: {
      slug,
      name: parsed.data.name,
      shortDescription: parsed.data.shortDescription,
      description: parsed.data.description,
      type: parsed.data.type,
      city: parsed.data.city,
      region: parsed.data.region,
      latitude: parsed.data.latitude,
      longitude: parsed.data.longitude,
      distanceKm:
        typeof parsed.data.viewerLatitude === "number" && typeof parsed.data.viewerLongitude === "number"
          ? distanceKmBetween(
              { latitude: parsed.data.viewerLatitude, longitude: parsed.data.viewerLongitude },
              { latitude: parsed.data.latitude, longitude: parsed.data.longitude },
            )
          : null,
      rating: 0,
      depthMeters: null,
      fishSpecies: normalizePipeList(parsed.data.fishSpecies),
      amenities: normalizePipeList(parsed.data.amenities),
      bestMonths: normalizePipeList(parsed.data.bestMonths),
      coverImage: storedImage?.publicPath ?? null,
      source: "USER",
      createdByUserId: user.id,
    },
    select: {
      id: true,
      slug: true,
      name: true,
    },
  });

  if (storedImage) {
    await prisma.placePhoto.create({
      data: {
        placeId: created.id,
        userId: user.id,
        imagePath: storedImage.publicPath,
        caption: "Фото новой пользовательской точки",
      },
    });
  }

  return Response.json(created, { status: 201 });
}

import { z } from "zod";

import { MAX_CATCH_MEDIA_ITEMS, MAX_UPLOAD_SIZE_BYTES } from "@/lib/constants";
import { getCurrentUser } from "@/lib/queries";
import { prisma } from "@/lib/prisma";
import { saveMediaFile } from "@/lib/storage";

const createCatchSchema = z.object({
  species: z.string().trim().min(2).max(80),
  placeId: z.string().trim().min(1),
  lengthCm: z
    .string()
    .trim()
    .optional()
    .transform((value) => (value ? Number(value) : null))
    .refine((value) => value === null || (Number.isFinite(value) && value >= 5 && value <= 250), {
      message: "Некорректная длина.",
    }),
  weightKg: z
    .string()
    .trim()
    .optional()
    .transform((value) => (value ? Number(value.replace(",", ".")) : null))
    .refine((value) => value === null || (Number.isFinite(value) && value >= 0.1 && value <= 200), {
      message: "Некорректный вес.",
    }),
  bait: z.string().trim().max(80).optional(),
  note: z.string().trim().max(400).optional(),
  recognizedSpecies: z.string().trim().max(80).optional(),
  recognizedLengthCm: z
    .string()
    .trim()
    .optional()
    .transform((value) => (value ? Number(value) : null)),
  aiConfidence: z
    .string()
    .trim()
    .optional()
    .transform((value) => (value ? Number(value) : null)),
});

function getCatchMediaType(file: File) {
  if (file.type.startsWith("image/")) {
    return "IMAGE" as const;
  }

  if (file.type.startsWith("video/")) {
    return "VIDEO" as const;
  }

  return null;
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const legacyImage = formData.get("image");
  const submittedMedia = [
    ...formData.getAll("media"),
    ...(legacyImage instanceof File && legacyImage.size > 0 ? [legacyImage] : []),
  ].filter((value): value is File => value instanceof File && value.size > 0);

  if (submittedMedia.length === 0) {
    return Response.json({ error: "Нужно добавить хотя бы одно фото или видео." }, { status: 400 });
  }

  if (submittedMedia.length > MAX_CATCH_MEDIA_ITEMS) {
    return Response.json({ error: `Можно добавить не больше ${MAX_CATCH_MEDIA_ITEMS} файлов.` }, { status: 400 });
  }

  for (const file of submittedMedia) {
    if (file.size > MAX_UPLOAD_SIZE_BYTES) {
      return Response.json({ error: "Файл слишком большой." }, { status: 400 });
    }

    if (!getCatchMediaType(file)) {
      return Response.json({ error: "Поддерживаются только фото и видео." }, { status: 400 });
    }
  }

  const parsed = createCatchSchema.safeParse({
    species: formData.get("species"),
    placeId: formData.get("placeId"),
    lengthCm: formData.get("lengthCm"),
    weightKg: formData.get("weightKg"),
    bait: formData.get("bait"),
    note: formData.get("note"),
    recognizedSpecies: formData.get("recognizedSpecies"),
    recognizedLengthCm: formData.get("recognizedLengthCm"),
    aiConfidence: formData.get("aiConfidence"),
  });

  if (!parsed.success) {
    return Response.json(
      {
        error: parsed.error.issues[0]?.message ?? "Некорректные данные формы.",
      },
      { status: 400 },
    );
  }

  const user = await getCurrentUser();
  if (!user) {
    return Response.json({ error: "Пользователь не найден." }, { status: 500 });
  }

  const place = await prisma.place.findUnique({
    where: { id: parsed.data.placeId },
  });

  if (!place) {
    return Response.json({ error: "Место не найдено." }, { status: 404 });
  }

  const storedMedia = await Promise.all(
    submittedMedia.map(async (file, index) => ({
      ...(await saveMediaFile(file)),
      mediaType: getCatchMediaType(file)!,
      sortOrder: index,
    })),
  );

  const coverMedia = storedMedia[0];

  const created = await prisma.catch.create({
    data: {
      userId: user.id,
      placeId: place.id,
      species: parsed.data.species,
      weightKg: parsed.data.weightKg,
      lengthCm: parsed.data.lengthCm,
      bait: parsed.data.bait || null,
      note: parsed.data.note || null,
      imagePath: coverMedia.publicPath,
      recognizedSpecies: parsed.data.recognizedSpecies || null,
      recognizedLengthCm: parsed.data.recognizedLengthCm,
      aiConfidence: parsed.data.aiConfidence,
      isFeatured: (parsed.data.weightKg ?? 0) >= 4 || (parsed.data.lengthCm ?? 0) >= 75,
      media: {
        create: storedMedia.map((item) => ({
          mediaPath: item.publicPath,
          mediaType: item.mediaType,
          sortOrder: item.sortOrder,
        })),
      },
    },
    select: { id: true },
  });

  return Response.json(created, { status: 201 });
}

import { z } from "zod";
import { getCurrentUser } from "@/lib/queries";
import { prisma } from "@/lib/prisma";
import { saveImageFile } from "@/lib/storage";

const captionSchema = z.object({
  caption: z.string().trim().max(180).optional(),
});

export async function POST(
  request: Request,
  context: {
    params: Promise<{ placeId: string }>;
  },
) {
  const { placeId } = await context.params;
  const user = await getCurrentUser();

  if (!user) {
    return Response.json({ error: "Пользователь не найден." }, { status: 500 });
  }

  const place = await prisma.place.findUnique({
    where: { id: placeId },
    select: { id: true, coverImage: true },
  });

  if (!place) {
    return Response.json({ error: "Точка не найдена." }, { status: 404 });
  }

  const formData = await request.formData();
  const image = formData.get("image");
  if (!(image instanceof File)) {
    return Response.json({ error: "Нужно выбрать фотографию." }, { status: 400 });
  }

  const captionParsed = captionSchema.safeParse({
    caption: formData.get("caption"),
  });

  if (!captionParsed.success) {
    return Response.json({ error: "Некорректная подпись к фото." }, { status: 400 });
  }

  const stored = await saveImageFile(image);

  await prisma.placePhoto.create({
    data: {
      placeId,
      userId: user.id,
      imagePath: stored.publicPath,
      caption: captionParsed.data.caption || null,
    },
  });

  if (!place.coverImage) {
    await prisma.place.update({
      where: { id: placeId },
      data: { coverImage: stored.publicPath },
    });
  }

  return Response.json({ imagePath: stored.publicPath }, { status: 201 });
}

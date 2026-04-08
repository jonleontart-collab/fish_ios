import { z } from "zod";
import { getCurrentUser } from "@/lib/queries";
import { prisma } from "@/lib/prisma";
import { saveImageFile } from "@/lib/storage";

const profileSchema = z.object({
  name: z.string().trim().min(2).max(80),
  bio: z.string().trim().max(280).optional(),
  city: z.string().trim().max(80).optional(),
  experienceYears: z.preprocess(
    (value) => {
      if (value === "" || value === null || value === undefined) {
        return undefined;
      }

      return Number(value);
    },
    z.number().int().min(0).max(80).optional(),
  ),
  preferredStyles: z.string().trim().max(180).optional(),
  homeWater: z.string().trim().max(120).optional(),
});

export async function PATCH(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return Response.json({ error: "Пользователь не найден." }, { status: 500 });
  }

  const formData = await request.formData();
  const parsed = profileSchema.safeParse({
    name: formData.get("name"),
    bio: formData.get("bio"),
    city: formData.get("city"),
    experienceYears: formData.get("experienceYears"),
    preferredStyles: formData.get("preferredStyles"),
    homeWater: formData.get("homeWater"),
  });

  if (!parsed.success) {
    return Response.json(
      { error: parsed.error.issues[0]?.message ?? "Некорректные данные профиля." },
      { status: 400 },
    );
  }

  const avatar = formData.get("avatar");
  const banner = formData.get("banner");
  const avatarFile = avatar instanceof File && avatar.size > 0 ? await saveImageFile(avatar) : null;
  const bannerFile = banner instanceof File && banner.size > 0 ? await saveImageFile(banner) : null;

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: {
      name: parsed.data.name,
      bio: parsed.data.bio || null,
      city: parsed.data.city || null,
      experienceYears: parsed.data.experienceYears ?? null,
      preferredStyles: parsed.data.preferredStyles || null,
      homeWater: parsed.data.homeWater || null,
      avatarPath: avatarFile?.publicPath ?? undefined,
      bannerPath: bannerFile?.publicPath ?? undefined,
    },
    select: {
      id: true,
      name: true,
      handle: true,
      bio: true,
      city: true,
      experienceYears: true,
      preferredStyles: true,
      homeWater: true,
      avatarGradient: true,
      avatarPath: true,
      bannerPath: true,
    },
  });

  return Response.json(updated);
}

import { cookies } from "next/headers";
import { z } from "zod";

import { getLanguageCookieOptions } from "@/lib/auth-cookies";
import { LANGUAGE_COOKIE_NAME, normalizeLanguage } from "@/lib/i18n";
import { getCurrentUser } from "@/lib/queries";
import { prisma } from "@/lib/prisma";
import { saveImageFile } from "@/lib/storage";

const profileSchema = z.object({
  name: z.string().trim().min(2).max(80),
  preferredLanguage: z.string().trim().min(2).max(10).optional(),
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
  showInventory: z.enum(["true", "false"]).optional(),
});

export async function PATCH(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return Response.json({ error: "Пользователь не найден." }, { status: 500 });
  }

  const formData = await request.formData();
  const parsed = profileSchema.safeParse({
    name: formData.get("name"),
    preferredLanguage: formData.get("preferredLanguage"),
    bio: formData.get("bio"),
    city: formData.get("city"),
    experienceYears: formData.get("experienceYears"),
    preferredStyles: formData.get("preferredStyles"),
    homeWater: formData.get("homeWater"),
    showInventory: formData.get("showInventory"),
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
  const preferredLanguage = normalizeLanguage(parsed.data.preferredLanguage);

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: {
      name: parsed.data.name,
      preferredLanguage,
      bio: parsed.data.bio || null,
      city: parsed.data.city || null,
      experienceYears: parsed.data.experienceYears ?? null,
      preferredStyles: parsed.data.preferredStyles || null,
      homeWater: parsed.data.homeWater || null,
      showInventory: parsed.data.showInventory === "true",
      avatarPath: avatarFile?.publicPath ?? undefined,
      bannerPath: bannerFile?.publicPath ?? undefined,
    },
    select: {
      id: true,
      name: true,
      handle: true,
      preferredLanguage: true,
      bio: true,
      city: true,
      experienceYears: true,
      preferredStyles: true,
      homeWater: true,
      showInventory: true,
      avatarGradient: true,
      avatarPath: true,
      bannerPath: true,
    },
  });

  const cookieStore = await cookies();
  cookieStore.set(LANGUAGE_COOKIE_NAME, preferredLanguage, getLanguageCookieOptions(request));

  return Response.json(updated);
}

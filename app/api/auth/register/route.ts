import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { hashPassword } from "@/lib/auth";
import { APP_COOKIE_PATH } from "@/lib/app-paths";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slug";

const DEFAULT_AVATAR_GRADIENT = "from-[#69f0ae] via-[#4fd1c5] to-[#4c6fff]";

type RegisterPayload = {
  firstName?: string;
  lastName?: string;
  handle?: string;
  birthDate?: string;
  password?: string;
  lang?: string;
};

export async function POST(req: Request) {
  try {
    const { firstName, lastName, handle, birthDate, password, lang = "ru" } =
      (await req.json()) as RegisterPayload;

    const safeFirstName = firstName?.trim() ?? "";
    const safeLastName = lastName?.trim() ?? "";
    const safeHandle = slugify(handle?.trim() ?? "");
    const safePassword = password?.trim() ?? "";

    if (!safeFirstName || !safeLastName || !safeHandle || !birthDate || !safePassword) {
      return NextResponse.json({ error: "Все поля регистрации обязательны." }, { status: 400 });
    }

    if (safePassword.length < 6) {
      return NextResponse.json({ error: "Пароль должен быть не короче 6 символов." }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { handle: safeHandle },
      select: { id: true },
    });

    if (existingUser) {
      return NextResponse.json({ error: "Этот никнейм уже занят." }, { status: 409 });
    }

    const parsedBirthDate = new Date(birthDate);
    if (Number.isNaN(parsedBirthDate.getTime())) {
      return NextResponse.json({ error: "Некорректная дата рождения." }, { status: 400 });
    }

    const user = await prisma.user.create({
      data: {
        name: `${safeFirstName} ${safeLastName}`.trim(),
        firstName: safeFirstName,
        lastName: safeLastName,
        handle: safeHandle,
        birthDate: parsedBirthDate,
        passwordHash: hashPassword(safePassword),
        avatarGradient: DEFAULT_AVATAR_GRADIENT,
        avatarPath: "/images/vatar-2.jpg",
      },
    });

    const cookieStore = await cookies();
    cookieStore.set("fishflow_uid", user.id, {
      path: APP_COOKIE_PATH,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 365,
    });
    cookieStore.set("googtrans", `/ru/${lang}`, { path: "/" });

    return NextResponse.json({ user });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Не удалось создать пользователя." }, { status: 500 });
  }
}

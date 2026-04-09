import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { verifyPassword } from "@/lib/auth";
import { APP_COOKIE_PATH } from "@/lib/app-paths";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slug";

type LoginPayload = {
  handle?: string;
  password?: string;
  lang?: string;
};

export async function POST(req: Request) {
  try {
    const { handle, password, lang = "ru" } = (await req.json()) as LoginPayload;
    const safeHandle = slugify(handle?.trim() ?? "");
    const safePassword = password?.trim() ?? "";

    if (!safeHandle || !safePassword) {
      return NextResponse.json({ error: "Укажи никнейм и пароль." }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { handle: safeHandle },
    });

    if (!user?.passwordHash || !verifyPassword(safePassword, user.passwordHash)) {
      return NextResponse.json({ error: "Неверный никнейм или пароль." }, { status: 401 });
    }

    const cookieStore = await cookies();
    cookieStore.set("fishflow_uid", user.id, {
      path: APP_COOKIE_PATH,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 365,
    });
    cookieStore.set("googtrans", `/ru/${lang}`, { path: "/" });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Не удалось выполнить вход." }, { status: 500 });
  }
}

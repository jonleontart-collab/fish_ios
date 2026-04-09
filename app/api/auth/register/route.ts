import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slug";

const DEFAULT_AVATAR_GRADIENT = "from-[#69f0ae] via-[#4fd1c5] to-[#4c6fff]";

export async function POST(req: Request) {
  try {
    const { name, lang } = await req.json();

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const randomAvatar = "/images/vatar-2.jpg";
    const baseHandle = slugify(name);
    const randomSuffix = Math.floor(Math.random() * 10000);
    const handle = `${baseHandle}-${randomSuffix}`;

    const user = await prisma.user.create({
      data: {
        handle,
        name,
        avatarGradient: DEFAULT_AVATAR_GRADIENT,
        avatarPath: randomAvatar,
      },
    });

    const cookieStore = await cookies();
    cookieStore.set("fishflow_uid", user.id, {
      path: "/",
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 365,
    });

    cookieStore.set("googtrans", `/ru/${lang}`, { path: "/", domain: "188.137.178.42" });
    cookieStore.set("googtrans", `/ru/${lang}`, { path: "/" });

    return NextResponse.json({ user });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
  }
}

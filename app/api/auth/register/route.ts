import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { slugify } from "@/lib/slug";

export async function POST(req: Request) {
  try {
    const { name, lang } = await req.json();

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    // Determine avatar
    const randomAvatar = `/images/vatar-2.jpg`; // Fallback to a seeded image or maybe blank
    
    // Create new unique user
    const baseHandle = slugify(name);
    const randomSuffix = Math.floor(Math.random() * 10000);
    const handle = `${baseHandle}-${randomSuffix}`;

    const user = await prisma.user.create({
      data: {
        handle,
        name,
        avatarPath: randomAvatar,
      },
    });

    const cookieStore = await cookies();
    cookieStore.set("fishflow_uid", user.id, { path: "/", secure: process.env.NODE_ENV === "production", sameSite: "lax", maxAge: 60 * 60 * 24 * 365 });

    // Set Translation Cookie
    cookieStore.set("googtrans", `/ru/${lang}`, { path: "/", domain: "188.137.178.42" }); // Specifically for exact domain or empty
    cookieStore.set("googtrans", `/ru/${lang}`, { path: "/" });

    return NextResponse.json({ user });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
  }
}

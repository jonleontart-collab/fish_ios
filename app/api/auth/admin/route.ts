import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const secret = url.searchParams.get("secret");

    // "Admin" secret code
    if (secret !== "alex2026") {
      return NextResponse.json({ error: "Access Denied" }, { status: 403 });
    }

    // Get the first created user (Alexander)
    const admin = await prisma.user.findFirst({
      orderBy: { createdAt: "asc" },
    });

    if (!admin) {
      return NextResponse.json({ error: "Admin not found" }, { status: 404 });
    }

    const cookieStore = await cookies();
    cookieStore.set("fishflow_uid", admin.id, { 
      path: "/", 
      secure: process.env.NODE_ENV === "production", 
      sameSite: "lax", 
      maxAge: 60 * 60 * 24 * 365 
    });

    cookieStore.set("googtrans", "/ru/ru", { path: "/" });

    // Redirect to home page
    return NextResponse.redirect(new URL("/", req.url));
  } catch (error) {
    return NextResponse.json({ error: "Auth failed" }, { status: 500 });
  }
}

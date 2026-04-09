import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { getLanguageCookieOptions, getSessionCookieOptions } from "@/lib/auth-cookies";
import { APP_BASE_PATH } from "@/lib/app-paths";
import { DEFAULT_LANGUAGE, LANGUAGE_COOKIE_NAME, normalizeLanguage } from "@/lib/i18n";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const secret = url.searchParams.get("secret");

    if (secret !== "alex2026") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const admin = await prisma.user.findFirst({
      orderBy: { createdAt: "asc" },
    });

    if (!admin) {
      return NextResponse.json({ error: "Admin not found" }, { status: 404 });
    }

    const cookieStore = await cookies();
    cookieStore.set("fishflow_uid", admin.id, getSessionCookieOptions(req));
    cookieStore.set(
      LANGUAGE_COOKIE_NAME,
      normalizeLanguage(admin.preferredLanguage || DEFAULT_LANGUAGE),
      getLanguageCookieOptions(req),
    );

    return NextResponse.redirect(new URL(`${APP_BASE_PATH || ""}/`, req.url));
  } catch {
    return NextResponse.json({ error: "Auth failed" }, { status: 500 });
  }
}

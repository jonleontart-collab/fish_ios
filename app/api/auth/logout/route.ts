import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { APP_COOKIE_PATH } from "@/lib/app-paths";
import { LANGUAGE_COOKIE_NAME } from "@/lib/i18n";

export async function POST() {
  const cookieStore = await cookies();

  cookieStore.set("fishflow_uid", "", {
    path: APP_COOKIE_PATH,
    maxAge: 0,
    httpOnly: true,
    sameSite: "lax",
  });

  cookieStore.set(LANGUAGE_COOKIE_NAME, "", {
    path: "/",
    maxAge: 0,
    sameSite: "lax",
  });

  return NextResponse.json({ ok: true });
}

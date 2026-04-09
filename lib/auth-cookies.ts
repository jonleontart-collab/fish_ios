import { APP_COOKIE_PATH } from "@/lib/app-paths";

export function shouldUseSecureCookies(request: Request) {
  const forwardedProto = request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim();

  if (forwardedProto) {
    return forwardedProto === "https";
  }

  try {
    return new URL(request.url).protocol === "https:";
  } catch {
    return false;
  }
}

export function getSessionCookieOptions(request: Request) {
  return {
    path: APP_COOKIE_PATH,
    secure: shouldUseSecureCookies(request),
    sameSite: "lax" as const,
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 365,
  };
}

export function getLanguageCookieOptions(request: Request) {
  return {
    path: "/",
    secure: shouldUseSecureCookies(request),
    sameSite: "lax" as const,
    maxAge: 60 * 60 * 24 * 365,
  };
}

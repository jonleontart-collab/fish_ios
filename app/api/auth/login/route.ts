import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { verifyPassword } from "@/lib/auth";
import { getLanguageCookieOptions, getSessionCookieOptions } from "@/lib/auth-cookies";
import { LANGUAGE_COOKIE_NAME, normalizeLanguage, type LanguageCode } from "@/lib/i18n";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slug";
import { ensureSupportUser } from "@/lib/support";

type LoginPayload = {
  handle?: string;
  password?: string;
  lang?: string;
};

const errors: Record<LanguageCode, Record<"missing" | "invalid" | "generic", string>> = {
  ru: {
    missing: "Укажи никнейм и пароль.",
    invalid: "Неверный никнейм или пароль.",
    generic: "Не удалось выполнить вход.",
  },
  en: {
    missing: "Enter your nickname and password.",
    invalid: "Incorrect nickname or password.",
    generic: "Sign-in failed.",
  },
  es: {
    missing: "Introduce tu apodo y contraseña.",
    invalid: "Apodo o contraseña incorrectos.",
    generic: "No se pudo iniciar sesión.",
  },
  fr: {
    missing: "Saisissez votre pseudo et votre mot de passe.",
    invalid: "Pseudo ou mot de passe incorrect.",
    generic: "La connexion a échoué.",
  },
  pt: {
    missing: "Informe seu apelido e senha.",
    invalid: "Apelido ou senha incorretos.",
    generic: "Não foi possível entrar.",
  },
};

export async function POST(req: Request) {
  const cookieStore = await cookies();

  try {
    const { handle, password, lang } = (await req.json()) as LoginPayload;
    const requestedLanguage = normalizeLanguage(lang);
    const safeHandle = slugify(handle?.trim() ?? "");
    const safePassword = password?.trim() ?? "";

    if (!safeHandle || !safePassword) {
      return NextResponse.json({ error: errors[requestedLanguage].missing }, { status: 400 });
    }

    if (safeHandle === "fishflow-support") {
      await ensureSupportUser();
    }

    const user = await prisma.user.findUnique({
      where: { handle: safeHandle },
    });

    if (!user?.passwordHash || !verifyPassword(safePassword, user.passwordHash)) {
      return NextResponse.json({ error: errors[requestedLanguage].invalid }, { status: 401 });
    }

    const language = normalizeLanguage(user.preferredLanguage || requestedLanguage);
    cookieStore.set("fishflow_uid", user.id, getSessionCookieOptions(req));
    cookieStore.set(LANGUAGE_COOKIE_NAME, language, getLanguageCookieOptions(req));

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    const language = normalizeLanguage(cookieStore.get(LANGUAGE_COOKIE_NAME)?.value);
    return NextResponse.json({ error: errors[language].generic }, { status: 500 });
  }
}

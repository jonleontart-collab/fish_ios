import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { hashPassword } from "@/lib/auth";
import { getLanguageCookieOptions, getSessionCookieOptions } from "@/lib/auth-cookies";
import { LANGUAGE_COOKIE_NAME, normalizeLanguage, type LanguageCode } from "@/lib/i18n";
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

const errors: Record<
  LanguageCode,
  Record<"missing" | "passwordShort" | "taken" | "birthDate" | "generic", string>
> = {
  ru: {
    missing: "Все поля регистрации обязательны.",
    passwordShort: "Пароль должен быть не короче 6 символов.",
    taken: "Этот никнейм уже занят.",
    birthDate: "Некорректная дата рождения.",
    generic: "Не удалось создать пользователя.",
  },
  en: {
    missing: "All registration fields are required.",
    passwordShort: "Password must be at least 6 characters long.",
    taken: "This nickname is already taken.",
    birthDate: "Invalid birth date.",
    generic: "Could not create the user.",
  },
  es: {
    missing: "Todos los campos de registro son obligatorios.",
    passwordShort: "La contraseña debe tener al menos 6 caracteres.",
    taken: "Este apodo ya está ocupado.",
    birthDate: "Fecha de nacimiento no válida.",
    generic: "No se pudo crear el usuario.",
  },
  fr: {
    missing: "Tous les champs d'inscription sont obligatoires.",
    passwordShort: "Le mot de passe doit contenir au moins 6 caractères.",
    taken: "Ce pseudo est déjà pris.",
    birthDate: "Date de naissance invalide.",
    generic: "Impossible de créer l'utilisateur.",
  },
  pt: {
    missing: "Todos os campos de cadastro são obrigatórios.",
    passwordShort: "A senha deve ter pelo menos 6 caracteres.",
    taken: "Este apelido já está em uso.",
    birthDate: "Data de nascimento inválida.",
    generic: "Não foi possível criar o usuário.",
  },
};

export async function POST(req: Request) {
  const cookieStore = await cookies();

  try {
    const { firstName, lastName, handle, birthDate, password, lang } = (await req.json()) as RegisterPayload;
    const language = normalizeLanguage(lang);
    const safeFirstName = firstName?.trim() ?? "";
    const safeLastName = lastName?.trim() ?? "";
    const safeHandle = slugify(handle?.trim() ?? "");
    const safePassword = password?.trim() ?? "";

    if (!safeFirstName || !safeLastName || !safeHandle || !birthDate || !safePassword) {
      return NextResponse.json({ error: errors[language].missing }, { status: 400 });
    }

    if (safePassword.length < 6) {
      return NextResponse.json({ error: errors[language].passwordShort }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { handle: safeHandle },
      select: { id: true },
    });

    if (existingUser) {
      return NextResponse.json({ error: errors[language].taken }, { status: 409 });
    }

    const parsedBirthDate = new Date(birthDate);

    if (Number.isNaN(parsedBirthDate.getTime())) {
      return NextResponse.json({ error: errors[language].birthDate }, { status: 400 });
    }

    const user = await prisma.user.create({
      data: {
        name: `${safeFirstName} ${safeLastName}`.trim(),
        firstName: safeFirstName,
        lastName: safeLastName,
        handle: safeHandle,
        birthDate: parsedBirthDate,
        preferredLanguage: language,
        passwordHash: hashPassword(safePassword),
        avatarGradient: DEFAULT_AVATAR_GRADIENT,
        avatarPath: "/images/vatar-2.jpg",
      },
    });

    cookieStore.set("fishflow_uid", user.id, getSessionCookieOptions(req));
    cookieStore.set(LANGUAGE_COOKIE_NAME, language, getLanguageCookieOptions(req));

    return NextResponse.json({ user });
  } catch (error) {
    console.error(error);
    const language = normalizeLanguage(cookieStore.get(LANGUAGE_COOKIE_NAME)?.value);
    return NextResponse.json({ error: errors[language].generic }, { status: 500 });
  }
}

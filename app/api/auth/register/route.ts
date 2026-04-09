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
  acceptedTerms?: boolean;
  lang?: string;
};

const errors: Record<
  LanguageCode,
  Record<"missing" | "passwordShort" | "taken" | "birthDate" | "terms" | "generic", string>
> = {
  ru: {
    missing: "Все поля регистрации обязательны.",
    passwordShort: "Пароль должен быть не короче 6 символов.",
    taken: "Этот никнейм уже занят.",
    birthDate: "Укажи реальную дату рождения. Будущая дата недопустима, минимальный возраст — 13 лет.",
    terms: "Нужно принять условия сервиса и политику данных.",
    generic: "Не удалось создать пользователя.",
  },
  en: {
    missing: "All registration fields are required.",
    passwordShort: "Password must be at least 6 characters long.",
    taken: "This nickname is already taken.",
    birthDate: "Use a real birth date. It cannot be in the future and the minimum age is 13.",
    terms: "You must accept the Terms and Privacy Notice.",
    generic: "Could not create the user.",
  },
  es: {
    missing: "Todos los campos de registro son obligatorios.",
    passwordShort: "La contraseña debe tener al menos 6 caracteres.",
    taken: "Este apodo ya está ocupado.",
    birthDate: "Usa una fecha de nacimiento real. No puede estar en el futuro y la edad mínima es 13 años.",
    terms: "Debes aceptar los Términos y la política de datos.",
    generic: "No se pudo crear el usuario.",
  },
  fr: {
    missing: "Tous les champs d'inscription sont obligatoires.",
    passwordShort: "Le mot de passe doit contenir au moins 6 caractères.",
    taken: "Ce pseudo est déjà pris.",
    birthDate: "Utilisez une vraie date de naissance. Elle ne peut pas être future et l’âge minimum est 13 ans.",
    terms: "Vous devez accepter les Conditions et la notice de confidentialité.",
    generic: "Impossible de créer l'utilisateur.",
  },
  pt: {
    missing: "Todos os campos de cadastro são obrigatórios.",
    passwordShort: "A senha deve ter pelo menos 6 caracteres.",
    taken: "Este apelido já está em uso.",
    birthDate: "Use uma data de nascimento real. Ela não pode estar no futuro e a idade mínima é 13 anos.",
    terms: "Você precisa aceitar os Termos e o aviso de privacidade.",
    generic: "Não foi possível criar o usuário.",
  },
};

function getAgeInYears(birthDate: Date, now: Date) {
  let years = now.getUTCFullYear() - birthDate.getUTCFullYear();
  const monthDiff = now.getUTCMonth() - birthDate.getUTCMonth();

  if (monthDiff < 0 || (monthDiff === 0 && now.getUTCDate() < birthDate.getUTCDate())) {
    years -= 1;
  }

  return years;
}

export async function POST(req: Request) {
  const cookieStore = await cookies();

  try {
    const { firstName, lastName, handle, birthDate, password, acceptedTerms, lang } =
      (await req.json()) as RegisterPayload;
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

    if (!acceptedTerms) {
      return NextResponse.json({ error: errors[language].terms }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { handle: safeHandle },
      select: { id: true },
    });

    if (existingUser) {
      return NextResponse.json({ error: errors[language].taken }, { status: 409 });
    }

    const parsedBirthDate = new Date(birthDate);
    const now = new Date();

    if (
      Number.isNaN(parsedBirthDate.getTime()) ||
      parsedBirthDate > now ||
      getAgeInYears(parsedBirthDate, now) < 13
    ) {
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
        avatarPath: null,
        acceptedTermsAt: now,
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

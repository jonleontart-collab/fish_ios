export const supportedLanguages = ["ru", "en", "es", "fr", "pt"] as const;

export type LanguageCode = (typeof supportedLanguages)[number];

export type TranslationMap<T> = Record<LanguageCode, T>;

export const DEFAULT_LANGUAGE: LanguageCode = "ru";
export const LANGUAGE_COOKIE_NAME = "fishflow_lang";

export const languageOptions = [
  { code: "ru", label: "Русский" },
  { code: "en", label: "English" },
  { code: "es", label: "Español" },
  { code: "fr", label: "Français" },
  { code: "pt", label: "Português" },
] as const satisfies ReadonlyArray<{ code: LanguageCode; label: string }>;

export function normalizeLanguage(value?: string | null): LanguageCode {
  if (!value) {
    return DEFAULT_LANGUAGE;
  }

  const normalized = value.toLowerCase().trim();
  const base = normalized.split("-")[0];

  if (supportedLanguages.includes(base as LanguageCode)) {
    return base as LanguageCode;
  }

  return DEFAULT_LANGUAGE;
}

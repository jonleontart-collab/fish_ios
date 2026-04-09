"use client";

import { createContext, startTransition, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  DEFAULT_LANGUAGE,
  LANGUAGE_COOKIE_NAME,
  type LanguageCode,
  languageOptions,
  normalizeLanguage,
} from "@/lib/i18n";

type LanguageContextValue = {
  lang: LanguageCode;
  setLanguage: (nextLanguage: string, options?: { refresh?: boolean }) => void;
  languages: typeof languageOptions;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

function writeLanguageCookie(lang: LanguageCode) {
  const secure = typeof window !== "undefined" && window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${LANGUAGE_COOKIE_NAME}=${lang}; path=/; max-age=31536000; samesite=lax${secure}`;
}

export function LanguageProvider({
  children,
  initialLanguage = DEFAULT_LANGUAGE,
}: {
  children: React.ReactNode;
  initialLanguage?: LanguageCode;
}) {
  const router = useRouter();
  const [lang, setLang] = useState<LanguageCode>(initialLanguage);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  function setLanguage(nextLanguage: string, options?: { refresh?: boolean }) {
    const normalized = normalizeLanguage(nextLanguage);
    setLang(normalized);
    writeLanguageCookie(normalized);

    if (options?.refresh === false) {
      return;
    }

    startTransition(() => {
      router.refresh();
    });
  }

  return (
    <LanguageContext.Provider
      value={{
        lang,
        setLanguage,
        languages: languageOptions,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error("useLanguage must be used inside LanguageProvider.");
  }

  return context;
}

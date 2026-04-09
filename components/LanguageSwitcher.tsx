"use client";

import { Check, ChevronDown, Globe } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { useLanguage } from "@/components/LanguageProvider";

const translations = {
  ru: {
    label: "Язык",
    placeholder: "Выбери язык",
  },
  en: {
    label: "Language",
    placeholder: "Choose language",
  },
  es: {
    label: "Idioma",
    placeholder: "Elige idioma",
  },
  fr: {
    label: "Langue",
    placeholder: "Choisir la langue",
  },
  pt: {
    label: "Idioma",
    placeholder: "Escolha o idioma",
  },
} as const;

export function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const { lang, languages, setLanguage } = useLanguage();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const t = translations[lang];
  const selected = languages.find((item) => item.code === lang) ?? languages[0];

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className={`flex items-center justify-between gap-3 rounded-[20px] border border-white/10 bg-[rgba(10,17,25,0.9)] text-left text-white shadow-[0_16px_40px_rgba(0,0,0,0.28)] backdrop-blur-xl transition hover:border-primary/40 hover:bg-[rgba(10,17,25,0.96)] ${
          compact ? "h-12 min-w-[150px] px-4" : "h-14 w-full px-4"
        }`}
      >
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/12 text-primary">
            <Globe size={16} />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-medium text-[#7f91a6]">{compact ? t.label : t.placeholder}</div>
            <div className="truncate text-sm font-semibold text-white">{selected.label}</div>
          </div>
        </div>
        <ChevronDown size={18} className={`text-[#8ba1b8] transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open ? (
        <div className="absolute right-0 top-[calc(100%+10px)] z-40 min-w-full overflow-hidden rounded-[22px] border border-white/10 bg-[#09111a] shadow-[0_22px_60px_rgba(0,0,0,0.5)]">
          <div className="border-b border-white/6 px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#7f91a6]">
            {t.label}
          </div>
          <div className="p-2">
            {languages.map((language) => (
              <button
                key={language.code}
                type="button"
                onClick={() => {
                  setLanguage(language.code);
                  setOpen(false);
                }}
                className={`flex w-full items-center justify-between rounded-[16px] px-4 py-3 text-sm font-medium transition ${
                  lang === language.code
                    ? "bg-primary/14 text-primary"
                    : "text-[#d3dbe4] hover:bg-white/6 hover:text-white"
                }`}
              >
                <span>{language.label}</span>
                {lang === language.code ? <Check size={16} /> : null}
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

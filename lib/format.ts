import { format, formatDistanceToNowStrict, isToday, isYesterday } from "date-fns";
import { enUS, es, fr, ptBR, ru } from "date-fns/locale";

import { DEFAULT_LANGUAGE, type LanguageCode } from "@/lib/i18n";

const dateLocales = {
  ru,
  en: enUS,
  es,
  fr,
  pt: ptBR,
} as const;

const weightMissing: Record<LanguageCode, string> = {
  ru: "Вес не указан",
  en: "Weight not specified",
  es: "Peso no indicado",
  fr: "Poids non indiqué",
  pt: "Peso não informado",
};

const lengthMissing: Record<LanguageCode, string> = {
  ru: "Размер не указан",
  en: "Length not specified",
  es: "Tamaño no indicado",
  fr: "Taille non indiquée",
  pt: "Tamanho não informado",
};

const units = {
  kg: {
    ru: "кг",
    en: "kg",
    es: "kg",
    fr: "kg",
    pt: "kg",
  },
  cm: {
    ru: "см",
    en: "cm",
    es: "cm",
    fr: "cm",
    pt: "cm",
  },
} as const;

const placeTypeLabels: Record<LanguageCode, Record<"WILD" | "PAYED" | "CLUB" | "SHOP" | "EVENT_SOS", string>> = {
  ru: {
    WILD: "Дикий",
    PAYED: "Платный",
    CLUB: "Клубный",
    SHOP: "Магазин",
    EVENT_SOS: "Сигнал о помощи",
  },
  en: {
    WILD: "Wild",
    PAYED: "Paid",
    CLUB: "Club",
    SHOP: "Shop",
    EVENT_SOS: "SOS",
  },
  es: {
    WILD: "Salvaje",
    PAYED: "De pago",
    CLUB: "Club",
    SHOP: "Tienda",
    EVENT_SOS: "SOS",
  },
  fr: {
    WILD: "Sauvage",
    PAYED: "Payant",
    CLUB: "Club",
    SHOP: "Magasin",
    EVENT_SOS: "SOS",
  },
  pt: {
    WILD: "Selvagem",
    PAYED: "Pago",
    CLUB: "Clube",
    SHOP: "Loja",
    EVENT_SOS: "SOS",
  },
};

const tripStatusLabels: Record<LanguageCode, Record<"PLANNED" | "CONFIRMED" | "COMPLETED", string>> = {
  ru: {
    PLANNED: "Запланирована",
    CONFIRMED: "Подтверждена",
    COMPLETED: "Завершена",
  },
  en: {
    PLANNED: "Planned",
    CONFIRMED: "Confirmed",
    COMPLETED: "Completed",
  },
  es: {
    PLANNED: "Planificado",
    CONFIRMED: "Confirmado",
    COMPLETED: "Completado",
  },
  fr: {
    PLANNED: "Prévu",
    CONFIRMED: "Confirmé",
    COMPLETED: "Terminé",
  },
  pt: {
    PLANNED: "Planejada",
    CONFIRMED: "Confirmada",
    COMPLETED: "Concluída",
  },
};

const shoppingStatusLabels: Record<LanguageCode, Record<"PLANNED" | "BOUGHT", string>> = {
  ru: {
    PLANNED: "Нужно купить",
    BOUGHT: "Куплено",
  },
  en: {
    PLANNED: "To buy",
    BOUGHT: "Bought",
  },
  es: {
    PLANNED: "Por comprar",
    BOUGHT: "Comprado",
  },
  fr: {
    PLANNED: "À acheter",
    BOUGHT: "Acheté",
  },
  pt: {
    PLANNED: "Para comprar",
    BOUGHT: "Comprado",
  },
};

const chatVisibilityLabels: Record<LanguageCode, Record<"OPEN" | "PRIVATE", string>> = {
  ru: {
    OPEN: "Открытый",
    PRIVATE: "Приватный",
  },
  en: {
    OPEN: "Open",
    PRIVATE: "Private",
  },
  es: {
    OPEN: "Abierto",
    PRIVATE: "Privado",
  },
  fr: {
    OPEN: "Ouvert",
    PRIVATE: "Privé",
  },
  pt: {
    OPEN: "Aberto",
    PRIVATE: "Privado",
  },
};

const placeSourceLabels: Record<LanguageCode, Record<"SEEDED" | "GEMINI" | "USER", string>> = {
  ru: {
    SEEDED: "База",
    GEMINI: "Подборка",
    USER: "Точка сообщества",
  },
  en: {
    SEEDED: "Base",
    GEMINI: "Curated",
    USER: "Community spot",
  },
  es: {
    SEEDED: "Base",
    GEMINI: "Selección",
    USER: "Lugar de la comunidad",
  },
  fr: {
    SEEDED: "Base",
    GEMINI: "Sélection",
    USER: "Spot communauté",
  },
  pt: {
    SEEDED: "Base",
    GEMINI: "Seleção",
    USER: "Ponto da comunidade",
  },
};

function getDateLocale(lang: LanguageCode) {
  return dateLocales[lang] ?? dateLocales[DEFAULT_LANGUAGE];
}

export function splitPipeList(value: string) {
  return value
    .split("|")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function formatFeedDate(date: Date, lang: LanguageCode = DEFAULT_LANGUAGE) {
  const locale = getDateLocale(lang);

  if (isToday(date) || isYesterday(date)) {
    return formatDistanceToNowStrict(date, { addSuffix: true, locale });
  }

  return format(date, lang === "en" ? "MMM d, HH:mm" : "d MMMM, HH:mm", { locale });
}

export function formatShortDate(date: Date, lang: LanguageCode = DEFAULT_LANGUAGE) {
  return format(date, lang === "en" ? "MMM d" : "d MMM", { locale: getDateLocale(lang) });
}

export function formatDateTime(date: Date, lang: LanguageCode = DEFAULT_LANGUAGE) {
  return format(date, lang === "en" ? "MMM d, HH:mm" : "d MMMM, HH:mm", { locale: getDateLocale(lang) });
}

export function formatTime(date: Date, lang: LanguageCode = DEFAULT_LANGUAGE) {
  return format(date, "HH:mm", { locale: getDateLocale(lang) });
}

export function formatWeight(value?: number | null, lang: LanguageCode = DEFAULT_LANGUAGE) {
  if (!value) {
    return weightMissing[lang];
  }

  return `${value.toFixed(value >= 10 ? 0 : 1)} ${units.kg[lang]}`;
}

export function formatLength(value?: number | null, lang: LanguageCode = DEFAULT_LANGUAGE) {
  if (!value) {
    return lengthMissing[lang];
  }

  return `${value} ${units.cm[lang]}`;
}

export function placeTypeLabel(type: "WILD" | "PAYED" | "CLUB" | "SHOP" | "EVENT_SOS", lang: LanguageCode = DEFAULT_LANGUAGE) {
  return placeTypeLabels[lang][type] ?? type;
}

export function tripStatusLabel(status: "PLANNED" | "CONFIRMED" | "COMPLETED", lang: LanguageCode = DEFAULT_LANGUAGE) {
  return tripStatusLabels[lang][status] ?? status;
}

export function shoppingStatusLabel(status: "PLANNED" | "BOUGHT", lang: LanguageCode = DEFAULT_LANGUAGE) {
  return shoppingStatusLabels[lang][status];
}

export function chatVisibilityLabel(visibility: "OPEN" | "PRIVATE", lang: LanguageCode = DEFAULT_LANGUAGE) {
  return chatVisibilityLabels[lang][visibility];
}

export function placeSourceLabel(source: "SEEDED" | "GEMINI" | "USER", lang: LanguageCode = DEFAULT_LANGUAGE) {
  return placeSourceLabels[lang][source];
}

import { format, formatDistanceToNowStrict, isToday, isYesterday } from "date-fns";
import { ru } from "date-fns/locale";

export function splitPipeList(value: string) {
  return value
    .split("|")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function formatFeedDate(date: Date) {
  if (isToday(date) || isYesterday(date)) {
    return formatDistanceToNowStrict(date, { addSuffix: true, locale: ru });
  }

  return format(date, "d MMMM, HH:mm", { locale: ru });
}

export function formatShortDate(date: Date) {
  return format(date, "d MMM", { locale: ru });
}

export function formatDateTime(date: Date) {
  return format(date, "d MMMM, HH:mm", { locale: ru });
}

export function formatTime(date: Date) {
  return format(date, "HH:mm", { locale: ru });
}

export function formatWeight(value?: number | null) {
  if (!value) {
    return "Вес не указан";
  }

  return `${value.toFixed(value >= 10 ? 0 : 1)} кг`;
}

export function formatLength(value?: number | null) {
  if (!value) {
    return "Размер не указан";
  }

  return `${value} см`;
}

export function placeTypeLabel(type: "WILD" | "PAYED" | "CLUB" | "SHOP" | "EVENT_SOS") {
  switch (type) {
    case "WILD":
      return "Дикий";
    case "PAYED":
      return "Платный";
    case "CLUB":
      return "Клубный";
    case "SHOP":
      return "Магазин";
    case "EVENT_SOS":
      return "Сигнал о помощи";
    default:
      return type;
  }
}

export function tripStatusLabel(status: "PLANNED" | "CONFIRMED" | "COMPLETED") {
  switch (status) {
    case "PLANNED":
      return "Запланирована";
    case "CONFIRMED":
      return "Подтверждена";
    case "COMPLETED":
      return "Завершена";
    default:
      return status;
  }
}

export function shoppingStatusLabel(status: "PLANNED" | "BOUGHT") {
  return status === "BOUGHT" ? "Куплено" : "Нужно купить";
}

export function chatVisibilityLabel(visibility: "OPEN" | "PRIVATE") {
  return visibility === "OPEN" ? "Открытый" : "Приватный";
}

export function placeSourceLabel(source: "SEEDED" | "GEMINI" | "USER") {
  switch (source) {
    case "GEMINI":
      return "Подборка";
    case "USER":
      return "Точка сообщества";
    default:
      return "База";
  }
}

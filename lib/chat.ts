import { DEFAULT_LANGUAGE, type LanguageCode } from "@/lib/i18n";

type ChatMemberLike = {
  userId: string;
  user: {
    name: string;
    handle: string;
    avatarPath?: string | null;
    avatarGradient?: string;
  };
};

type ChatLike = {
  title: string;
  visibility: "OPEN" | "PRIVATE";
  members?: ChatMemberLike[];
};

type MessageLike = {
  body: string;
  mediaType?: "IMAGE" | "VIDEO" | null;
};

const messageMediaLabels: Record<LanguageCode, { image: string; video: string }> = {
  ru: { image: "Фото", video: "Видео" },
  en: { image: "Photo", video: "Video" },
  es: { image: "Foto", video: "Video" },
  fr: { image: "Photo", video: "Video" },
  pt: { image: "Foto", video: "Video" },
};

export function getChatCounterpart(chat: ChatLike, currentUserId: string) {
  if (chat.visibility !== "PRIVATE" || !chat.members?.length) {
    return null;
  }

  return chat.members.find((member) => member.userId !== currentUserId)?.user ?? null;
}

export function getChatDisplayTitle(chat: ChatLike, currentUserId: string) {
  return getChatCounterpart(chat, currentUserId)?.name ?? chat.title;
}

export function getChatDisplayDescription(chat: ChatLike, currentUserId: string) {
  const counterpart = getChatCounterpart(chat, currentUserId);

  if (!counterpart) {
    return null;
  }

  return `@${counterpart.handle}`;
}

export function getMessagePreviewText(message: MessageLike | null | undefined, lang: LanguageCode = DEFAULT_LANGUAGE) {
  if (!message) {
    return "";
  }

  if (message.body.trim()) {
    return message.body;
  }

  if (message.mediaType === "IMAGE") {
    return messageMediaLabels[lang].image;
  }

  if (message.mediaType === "VIDEO") {
    return messageMediaLabels[lang].video;
  }

  return "";
}

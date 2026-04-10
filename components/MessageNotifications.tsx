"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

import { useLanguage } from "@/components/LanguageProvider";
import { useSound } from "@/components/SoundProvider";
import { useToast } from "@/components/ToastProvider";
import { apiPath } from "@/lib/app-paths";
import { getChatDisplayTitle, getMessagePreviewText } from "@/lib/chat";
import { markNotificationsSeen } from "@/lib/notification-state";

type InboxChat = {
  id: string;
  slug: string;
  title: string;
  visibility: "OPEN" | "PRIVATE";
  isSystem: boolean;
  members: Array<{
    userId: string;
    user: {
      id: string;
      name: string;
      handle: string;
      avatarPath: string | null;
      avatarGradient: string;
      isSupport: boolean;
    };
  }>;
  messages: Array<{
    id: string;
    body: string;
    mediaType: "IMAGE" | "VIDEO" | null;
    user: {
      id: string;
      name: string;
      handle: string;
    };
  }>;
};

function getActiveChatSlug(pathname: string | null) {
  if (!pathname) {
    return null;
  }

  const segments = pathname.split("/").filter(Boolean);
  const chatsIndex = segments.lastIndexOf("chats");

  if (chatsIndex === -1) {
    return null;
  }

  return segments[chatsIndex + 1] ?? null;
}

export function MessageNotifications({ currentUserId }: { currentUserId: string }) {
  const pathname = usePathname();
  const { pushToast } = useToast();
  const { playMessage } = useSound();
  const { lang } = useLanguage();
  const knownMessagesRef = useRef<Record<string, string>>({});
  const initializedRef = useRef(false);

  useEffect(() => {
    let cancelled = false;

    async function pollChats() {
      if (cancelled) {
        return;
      }

      if (typeof document !== "undefined" && document.visibilityState !== "visible") {
        return;
      }

      try {
        const response = await fetch(apiPath("/api/chats"), {
          cache: "no-store",
        });

        if (!response.ok) {
          return;
        }

        const payload = (await response.json()) as { chats: InboxChat[] };
        const nextKnownMessages: Record<string, string> = {};

        for (const chat of payload.chats ?? []) {
          const latestMessage = chat.messages[0];

          if (!latestMessage) {
            continue;
          }

          nextKnownMessages[chat.id] = latestMessage.id;

          if (!initializedRef.current) {
            continue;
          }

          if (knownMessagesRef.current[chat.id] === latestMessage.id) {
            continue;
          }

          if (latestMessage.user.id === currentUserId) {
            continue;
          }

          if (getActiveChatSlug(pathname) === chat.slug) {
            markNotificationsSeen(currentUserId, {
              chats: [{ chatId: chat.id, messageId: latestMessage.id }],
            });
            continue;
          }

          playMessage();
          pushToast({
            tone: "info",
            title: getChatDisplayTitle(chat, currentUserId),
            description: `${latestMessage.user.name}: ${getMessagePreviewText(latestMessage, lang)}`,
          });
        }

        knownMessagesRef.current = nextKnownMessages;
        initializedRef.current = true;
      } catch {
        // Keep silent if polling fails.
      }
    }

    void pollChats();

    const interval = setInterval(() => {
      void pollChats();
    }, 6000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [currentUserId, lang, pathname, playMessage, pushToast]);

  return null;
}

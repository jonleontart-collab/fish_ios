"use client";

import { useEffect, useEffectEvent, useRef, useState } from "react";
import Link from "next/link";

import { ChatComposer } from "@/components/ChatComposer";
import { useLanguage } from "@/components/LanguageProvider";
import { UserAvatar } from "@/components/UserAvatar";
import { apiPath, withBasePath } from "@/lib/app-paths";
import { formatFeedDate } from "@/lib/format";

type ChatMessage = {
  id: string;
  chatId: string;
  userId: string;
  body: string;
  mediaPath: string | null;
  mediaType: "IMAGE" | "VIDEO" | null;
  createdAt: Date | string;
  user: {
    id: string;
    name: string;
    handle: string;
    avatarPath: string | null;
    avatarGradient: string;
  };
};

export function ChatThreadClient({
  chatId,
  currentUserId,
  initialMessages,
}: {
  chatId: string;
  currentUserId: string;
  initialMessages: ChatMessage[];
}) {
  const { lang } = useLanguage();
  const [messages, setMessages] = useState(initialMessages);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const loadMessages = useEffectEvent(async () => {
    try {
      const response = await fetch(apiPath(`/api/chats/${chatId}/messages`), {
        cache: "no-store",
      });

      if (!response.ok) {
        return;
      }

      const payload = (await response.json()) as { messages: ChatMessage[] };
      setMessages(payload.messages ?? []);
    } catch {
      // Keep current thread state if polling fails.
    }
  });

  useEffect(() => {
    const interval = setInterval(() => {
      void loadMessages();
    }, 4000);

    return () => clearInterval(interval);
  }, [chatId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length]);

  return (
    <div className="space-y-5">
      <div className="space-y-4">
        {messages.map((message) => {
          const own = message.userId === currentUserId;

          return (
            <div key={message.id} className={`flex ${own ? "justify-end" : "justify-start"}`}>
              {!own ? (
                <Link
                  href={`/profile/${message.user.handle}`}
                  className="mr-2 mt-auto flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-surface-strong text-[10px] font-bold text-white"
                >
                  <UserAvatar
                    name={message.user.name}
                    avatarPath={message.user.avatarPath}
                    className="h-full w-full"
                    fallbackClassName="border-0 bg-white/8"
                    iconSize={14}
                  />
                </Link>
              ) : null}
              <div
                className={`max-w-[82%] rounded-[24px] px-4 py-3 shadow-lg ${
                  own
                    ? "rounded-br-[8px] bg-gradient-to-br from-primary to-primary-strong text-background"
                    : "glass-panel rounded-bl-[8px] border-white/10 text-text-main"
                }`}
              >
                {!own ? (
                  <div className="mb-1 text-xs font-semibold text-primary">
                    <Link href={`/profile/${message.user.handle}`}>{message.user.name}</Link>
                  </div>
                ) : null}

                {message.body ? <div className="text-[15px] leading-relaxed">{message.body}</div> : null}

                {message.mediaPath ? (
                  <div className={message.body ? "mt-3" : ""}>
                    {message.mediaType === "VIDEO" ? (
                      <video
                        src={withBasePath(message.mediaPath)}
                        controls
                        playsInline
                        className="max-h-[320px] w-full rounded-[18px] bg-black"
                      />
                    ) : (
                      <img
                        src={withBasePath(message.mediaPath)}
                        alt=""
                        className="max-h-[320px] w-full rounded-[18px] object-cover"
                      />
                    )}
                  </div>
                ) : null}

                <div className={`mt-1.5 text-right text-[10px] font-medium ${own ? "text-background/60" : "text-text-soft"}`}>
                  {formatFeedDate(new Date(message.createdAt), lang)}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <ChatComposer
        chatId={chatId}
        onMessageSent={(message) => {
          setMessages((current) => [...current, message]);
        }}
      />
    </div>
  );
}

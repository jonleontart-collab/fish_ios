"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, Check, Loader2, MessageSquareText, UserRoundX, Users, X } from "lucide-react";
import { Drawer } from "vaul";

import { useLanguage } from "@/components/LanguageProvider";
import { UserAvatar } from "@/components/UserAvatar";
import { useToast } from "@/components/ToastProvider";
import { apiPath, withBasePath } from "@/lib/app-paths";
import { getChatDisplayTitle, getMessagePreviewText } from "@/lib/chat";
import {
  markNotificationsSeen,
  readNotificationSeenState,
  subscribeToNotificationState,
  type NotificationSeenState,
} from "@/lib/notification-state";

type NotificationRequest = {
  id: string;
  createdAt: string | Date;
  user: {
    id: string;
    name: string;
    handle: string;
    city?: string | null;
    avatarPath?: string | null;
    avatarGradient: string;
  };
};

type NotificationChat = {
  id: string;
  slug: string;
  title: string;
  visibility: "OPEN" | "PRIVATE";
  members: Array<{
    userId: string;
    user: {
      id: string;
      name: string;
      handle: string;
      avatarPath: string | null;
      avatarGradient: string;
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

export function NotificationCenter({ currentUserId }: { currentUserId: string }) {
  const router = useRouter();
  const { lang } = useLanguage();
  const { pushToast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [actionKey, setActionKey] = useState("");
  const [friendRequests, setFriendRequests] = useState<NotificationRequest[]>([]);
  const [chats, setChats] = useState<NotificationChat[]>([]);
  const [drawerChats, setDrawerChats] = useState<NotificationChat[]>([]);
  const [seenState, setSeenState] = useState<NotificationSeenState>({
    chats: {},
    requests: {},
  });

  const unreadChats = chats.filter((chat) => {
    const latestMessage = chat.messages[0];
    return latestMessage && latestMessage.user.id !== currentUserId && seenState.chats[chat.id] !== latestMessage.id;
  });
  const unseenRequestCount = friendRequests.filter((request) => !seenState.requests[request.id]).length;
  const notificationCount = open ? 0 : unseenRequestCount + unreadChats.length;

  async function loadNotifications() {
    setLoading(true);

    try {
      const response = await fetch(apiPath("/api/notifications"), {
        cache: "no-store",
      });

      if (!response.ok) {
        return;
      }

      const payload = (await response.json()) as {
        friendRequests: NotificationRequest[];
        chats: NotificationChat[];
      };

      setFriendRequests(payload.friendRequests ?? []);
      setChats(payload.chats ?? []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    setSeenState(readNotificationSeenState(currentUserId));
    return subscribeToNotificationState(currentUserId, setSeenState);
  }, [currentUserId]);

  useEffect(() => {
    void loadNotifications();

    const interval = setInterval(() => {
      void loadNotifications();
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  function handleOpenChange(nextOpen: boolean) {
    if (nextOpen) {
      setDrawerChats(unreadChats);
      setOpen(true);
      return;
    }

    if (open) {
      setSeenState(
        markNotificationsSeen(currentUserId, {
          chats: drawerChats
            .map((chat) => {
              const latestMessage = chat.messages[0];

              if (!latestMessage) {
                return null;
              }

              return {
                chatId: chat.id,
                messageId: latestMessage.id,
              };
            })
            .filter((entry): entry is { chatId: string; messageId: string } => Boolean(entry)),
          requestIds: friendRequests.filter((request) => !seenState.requests[request.id]).map((request) => request.id),
        }),
      );
    }

    setDrawerChats([]);
    setOpen(false);
  }

  async function handleRequest(handle: string, action: "accept" | "decline") {
    const key = `${handle}:${action}`;
    if (actionKey) {
      return;
    }

    setActionKey(key);

    try {
      const response = await fetch(apiPath(`/api/users/${handle}/friend`), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action }),
      });

      if (!response.ok) {
        throw new Error("request action failed");
      }

      setFriendRequests((current) => current.filter((request) => request.user.handle !== handle));
      router.refresh();
      pushToast({
        tone: "success",
        title: action === "accept" ? "Запрос принят" : "Запрос отклонён",
      });
    } catch {
      pushToast({
        tone: "error",
        title: "Не удалось обработать запрос",
      });
    } finally {
      setActionKey("");
    }
  }

  return (
    <Drawer.Root open={open} onOpenChange={handleOpenChange}>
      <div className="pointer-events-none fixed inset-x-0 top-safe z-[1200] mx-auto flex w-full max-w-md justify-end px-4">
        <Drawer.Trigger asChild>
          <button
            type="button"
            className="pointer-events-auto relative inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-black/45 text-white shadow-[0_14px_36px_rgba(0,0,0,0.35)] backdrop-blur-xl transition hover:bg-black/60"
            aria-label="Notifications"
          >
            <Bell size={18} />
            {notificationCount > 0 ? (
              <span className="absolute -right-1 -top-1 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-slate-950">
                {notificationCount > 9 ? "9+" : notificationCount}
              </span>
            ) : null}
          </button>
        </Drawer.Trigger>
      </div>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-[1250] bg-black/72 backdrop-blur-md" />
        <Drawer.Content
          className="fixed bottom-0 left-0 right-0 z-[1251] mx-auto mt-24 flex max-h-[90vh] max-w-md flex-col overflow-hidden rounded-t-[36px] border-t border-white/10 bg-[#09111a] outline-none"
          style={{
            backgroundImage: `linear-gradient(180deg, rgba(5, 9, 15, 0.82), rgba(5, 9, 15, 0.96)), url('${withBasePath("/modal-backgrounds/notification-center-bg.png")}')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="hide-scrollbar flex-1 overflow-y-auto">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/5 bg-[#09111a]/90 px-6 py-5 backdrop-blur-xl">
              <div>
                <div className="text-sm text-text-muted">Уведомления</div>
                <h2 className="text-lg font-bold text-white">Запросы и чаты</h2>
              </div>
              <Drawer.Close asChild>
                <button
                  type="button"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white/6 text-text-muted transition hover:text-white"
                >
                  <X size={16} />
                </button>
              </Drawer.Close>
            </div>

            <div className="space-y-6 p-4 pb-10">
              <section className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-white">
                  <Users size={16} className="text-primary" />
                  Запросы в друзья
                </div>
                {friendRequests.length > 0 ? (
                  friendRequests.map((request) => (
                    <div
                      key={request.id}
                      className="rounded-[24px] border border-white/8 bg-black/24 px-4 py-4 backdrop-blur-xl"
                    >
                      <div className="flex items-center gap-3">
                        <UserAvatar
                          name={request.user.name}
                          avatarPath={request.user.avatarPath}
                          className="h-12 w-12"
                          fallbackClassName="border border-white/10 bg-white/8"
                          iconSize={18}
                        />
                        <div className="min-w-0 flex-1">
                          <div className="truncate font-semibold text-white">{request.user.name}</div>
                          <div className="truncate text-sm text-text-muted">@{request.user.handle}</div>
                        </div>
                      </div>
                      <div className="mt-3 flex gap-2">
                        <button
                          type="button"
                          onClick={() => void handleRequest(request.user.handle, "accept")}
                          disabled={Boolean(actionKey)}
                          className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-primary px-4 py-3 text-sm font-semibold text-background transition hover:bg-primary-strong disabled:opacity-60"
                        >
                          {actionKey === `${request.user.handle}:accept` ? (
                            <Loader2 size={16} className="animate-spin" />
                          ) : (
                            <Check size={16} />
                          )}
                          Принять
                        </button>
                        <button
                          type="button"
                          onClick={() => void handleRequest(request.user.handle, "decline")}
                          disabled={Boolean(actionKey)}
                          className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-white/10 bg-white/6 px-4 py-3 text-sm font-semibold text-text-main transition hover:bg-white/10 disabled:opacity-60"
                        >
                          {actionKey === `${request.user.handle}:decline` ? (
                            <Loader2 size={16} className="animate-spin" />
                          ) : (
                            <UserRoundX size={16} />
                          )}
                          Отклонить
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-[24px] border border-dashed border-white/10 bg-black/20 px-5 py-6 text-sm text-text-muted">
                    Пока нет входящих запросов.
                  </div>
                )}
              </section>

              <section className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-white">
                  <MessageSquareText size={16} className="text-accent" />
                  Новое в чатах
                </div>
                {loading && drawerChats.length === 0 ? (
                  <div className="rounded-[24px] border border-dashed border-white/10 bg-black/20 px-5 py-6 text-sm text-text-muted">
                    Загружаем уведомления...
                  </div>
                ) : drawerChats.length > 0 ? (
                  drawerChats.map((chat) => {
                    const latestMessage = chat.messages[0];

                    return (
                      <Link
                        key={chat.id}
                        href={`/chats/${chat.slug}`}
                        onClick={() => setOpen(false)}
                        className="block rounded-[24px] border border-white/8 bg-black/24 px-4 py-4 backdrop-blur-xl transition hover:bg-black/30"
                      >
                        <div className="font-semibold text-white">{getChatDisplayTitle(chat, currentUserId)}</div>
                        <div className="mt-1 text-sm text-text-muted">
                          {latestMessage
                            ? `${latestMessage.user.name}: ${getMessagePreviewText(latestMessage, lang)}`
                            : "Сообщений пока нет"}
                        </div>
                      </Link>
                    );
                  })
                ) : (
                  <div className="rounded-[24px] border border-dashed border-white/10 bg-black/20 px-5 py-6 text-sm text-text-muted">
                    Пока нет новых событий по чатам.
                  </div>
                )}
              </section>
            </div>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}

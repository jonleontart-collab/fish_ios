"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2, UserRoundX, Users } from "lucide-react";

import { useToast } from "@/components/ToastProvider";
import { UserAvatar } from "@/components/UserAvatar";
import { apiPath } from "@/lib/app-paths";

type FriendRequestItem = {
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

export function FriendRequestsPanel({ initialRequests }: { initialRequests: FriendRequestItem[] }) {
  const router = useRouter();
  const { pushToast } = useToast();
  const [requests, setRequests] = useState(initialRequests);
  const [actionKey, setActionKey] = useState("");

  if (requests.length === 0) {
    return null;
  }

  async function handleRequest(handle: string, action: "accept" | "decline") {
    if (actionKey) {
      return;
    }

    const key = `${handle}:${action}`;
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
        throw new Error("request failed");
      }

      setRequests((current) => current.filter((request) => request.user.handle !== handle));
      router.refresh();
      pushToast({
        tone: "success",
        title: action === "accept" ? "Запрос принят" : "Запрос отклонен",
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
    <section className="glass-panel rounded-[30px] border border-border-subtle p-4">
      <div className="mb-4 flex items-center gap-2 text-[20px] font-semibold tracking-tight text-white">
        <Users size={18} className="text-primary" />
        Запросы в друзья
      </div>
      <div className="space-y-3">
        {requests.map((request) => (
          <div
            key={request.id}
            className="rounded-[22px] border border-white/8 bg-black/22 p-4"
          >
            <div className="flex items-center gap-3">
              <UserAvatar
                name={request.user.name}
                avatarPath={request.user.avatarPath}
                className="h-12 w-12 border border-white/10"
                fallbackClassName="bg-white/8"
                iconSize={18}
              />
              <div className="min-w-0 flex-1">
                <div className="truncate font-semibold text-white">{request.user.name}</div>
                <div className="truncate text-sm text-text-muted">
                  @{request.user.handle}
                  {request.user.city ? `, ${request.user.city}` : ""}
                </div>
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
        ))}
      </div>
    </section>
  );
}

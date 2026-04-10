"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2, UserCheck, UserPlus, UserRoundX } from "lucide-react";

import { useToast } from "@/components/ToastProvider";
import { apiPath } from "@/lib/app-paths";
import type { FriendRelationship } from "@/lib/social";

export function FriendToggleButton({
  handle,
  initialRelationship,
  className = "",
}: {
  handle: string;
  initialRelationship: FriendRelationship;
  className?: string;
}) {
  const router = useRouter();
  const { pushToast } = useToast();
  const [relationship, setRelationship] = useState(initialRelationship);
  const [pending, setPending] = useState(false);
  const [secondaryPending, setSecondaryPending] = useState(false);

  async function sendAction(action: "request" | "cancel" | "remove" | "accept" | "decline", secondary = false) {
    if (pending || secondaryPending) {
      return;
    }

    if (secondary) {
      setSecondaryPending(true);
    } else {
      setPending(true);
    }

    try {
      const response = await fetch(apiPath(`/api/users/${handle}/friend`), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action }),
      });

      if (!response.ok) {
        throw new Error("friend action failed");
      }

      const payload = (await response.json()) as { relationship: FriendRelationship };
      setRelationship(payload.relationship);
      router.refresh();

      const successTitle =
        action === "request"
          ? "Запрос отправлен"
          : action === "accept"
            ? "Запрос принят"
            : action === "decline"
              ? "Запрос отклонен"
              : action === "remove"
                ? "Пользователь удален из друзей"
                : "Запрос отменен";

      pushToast({
        tone: "success",
        title: successTitle,
      });
    } catch {
      pushToast({
        tone: "error",
        title: "Не удалось обновить дружбу",
        description: "Сервис не успел сохранить изменение.",
      });
    } finally {
      if (secondary) {
        setSecondaryPending(false);
      } else {
        setPending(false);
      }
    }
  }

  if (relationship === "incoming") {
    return (
      <div className={`flex flex-wrap items-center justify-center gap-3 ${className}`.trim()}>
        <button
          type="button"
          onClick={() => void sendAction("accept")}
          disabled={pending || secondaryPending}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-4 py-3 text-sm font-semibold text-background transition hover:bg-primary-strong disabled:opacity-60"
        >
          {pending ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
          <span>Принять</span>
        </button>
        <button
          type="button"
          onClick={() => void sendAction("decline", true)}
          disabled={pending || secondaryPending}
          className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/6 px-4 py-3 text-sm font-semibold text-text-main transition hover:bg-white/10 disabled:opacity-60"
        >
          {secondaryPending ? <Loader2 size={16} className="animate-spin" /> : <UserRoundX size={16} />}
          <span>Отклонить</span>
        </button>
      </div>
    );
  }

  const action =
    relationship === "accepted"
      ? "remove"
      : relationship === "outgoing"
        ? "cancel"
        : "request";

  const label =
    relationship === "accepted"
      ? "В друзьях"
      : relationship === "outgoing"
        ? "Запрос отправлен"
        : "Добавить в друзья";

  const icon = pending ? (
    <Loader2 size={16} className="animate-spin" />
  ) : relationship === "accepted" ? (
    <UserCheck size={16} className="text-primary" />
  ) : (
    <UserPlus size={16} />
  );

  return (
    <button
      type="button"
      onClick={() => void sendAction(action)}
      disabled={pending}
      className={`inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/6 px-4 py-3 text-sm font-semibold text-text-main transition hover:bg-white/10 disabled:opacity-60 ${className}`.trim()}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

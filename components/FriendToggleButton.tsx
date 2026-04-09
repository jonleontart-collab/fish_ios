"use client";

import { useState } from "react";
import { Loader2, UserCheck, UserPlus } from "lucide-react";

import { apiPath } from "@/lib/app-paths";
import { useToast } from "@/components/ToastProvider";

export function FriendToggleButton({
  handle,
  initialIsFriend,
  className = "",
}: {
  handle: string;
  initialIsFriend: boolean;
  className?: string;
}) {
  const { pushToast } = useToast();
  const [isFriend, setIsFriend] = useState(initialIsFriend);
  const [pending, setPending] = useState(false);

  async function handleToggle() {
    if (pending) {
      return;
    }

    setPending(true);

    try {
      const response = await fetch(apiPath(`/api/users/${handle}/friend`), {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("friend toggle failed");
      }

      const payload = (await response.json()) as { isFriend: boolean };
      setIsFriend(payload.isFriend);
      pushToast({
        tone: "success",
        title: payload.isFriend ? "Пользователь добавлен в друзья" : "Пользователь убран из друзей",
      });
    } catch {
      pushToast({
        tone: "error",
        title: "Не удалось обновить друзей",
        description: "Сервис не успел сохранить изменение.",
      });
    } finally {
      setPending(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={pending}
      className={`inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/6 px-4 py-3 text-sm font-semibold text-text-main transition hover:bg-white/10 disabled:opacity-60 ${className}`}
    >
      {pending ? (
        <Loader2 size={16} className="animate-spin" />
      ) : isFriend ? (
        <UserCheck size={16} className="text-primary" />
      ) : (
        <UserPlus size={16} />
      )}
      <span>{isFriend ? "В друзьях" : "Добавить в друзья"}</span>
    </button>
  );
}

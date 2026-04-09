"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, MessageCircle } from "lucide-react";

import { apiPath } from "@/lib/app-paths";
import { useToast } from "@/components/ToastProvider";

export function DirectChatButton({
  handle,
  label = "Написать",
  className = "",
}: {
  handle: string;
  label?: string;
  className?: string;
}) {
  const router = useRouter();
  const { pushToast } = useToast();
  const [pending, setPending] = useState(false);

  async function handleStartChat() {
    if (pending) {
      return;
    }

    setPending(true);

    try {
      const response = await fetch(apiPath(`/api/users/${handle}/direct-chat`), {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("direct chat failed");
      }

      const payload = (await response.json()) as { slug: string };
      router.push(`/chats/${payload.slug}`);
      router.refresh();
    } catch {
      pushToast({
        tone: "error",
        title: "Не удалось открыть чат",
        description: "Попробуй еще раз через пару секунд.",
      });
    } finally {
      setPending(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleStartChat}
      disabled={pending}
      className={`inline-flex items-center justify-center gap-2 rounded-full bg-primary px-4 py-3 text-sm font-semibold text-background transition hover:bg-primary-strong disabled:opacity-60 ${className}`}
    >
      {pending ? <Loader2 size={16} className="animate-spin" /> : <MessageCircle size={16} />}
      <span>{label}</span>
    </button>
  );
}

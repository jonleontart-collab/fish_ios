'use client';

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, LogIn } from "lucide-react";

export function JoinChatButton({ chatId }: { chatId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  async function handleJoin() {
    const response = await fetch(`/api/chats/${chatId}/join`, {
      method: "POST",
    });

    if (!response.ok) {
      return;
    }

    const payload = (await response.json()) as { slug: string };
    startTransition(() => {
      router.push(`/chats/${payload.slug}`);
      router.refresh();
    });
  }

  return (
    <button
      type="button"
      onClick={handleJoin}
      disabled={isPending}
      className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-3 text-sm font-semibold text-background disabled:cursor-not-allowed disabled:opacity-60"
    >
      {isPending ? <Loader2 size={16} className="animate-spin" /> : <LogIn size={16} />}
      <span>{isPending ? "Входим" : "Вступить"}</span>
    </button>
  );
}

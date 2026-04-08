'use client';

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, SendHorizontal } from "lucide-react";

export function ChatComposer({ chatId }: { chatId: string }) {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const [, startTransition] = useTransition();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmed = body.trim();
    if (!trimmed) {
      return;
    }

    setSending(true);
    setError("");

    try {
      const response = await fetch(`/api/chats/${chatId}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ body: trimmed }),
      });

      if (!response.ok) {
        throw new Error("send failed");
      }

      setBody("");
      startTransition(() => {
        router.refresh();
      });
    } catch {
      setError("Сообщение не ушло. Повтори отправку.");
    } finally {
      setSending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="glass-panel rounded-[22px] border border-border-subtle p-3">
        <textarea
          value={body}
          onChange={(event) => setBody(event.target.value)}
          rows={3}
          placeholder="Сообщение в чат"
          className="w-full resize-none bg-transparent text-sm text-text-main placeholder:text-text-soft focus:outline-none"
        />
      </div>

      {error ? <div className="text-sm text-danger">{error}</div> : null}

      <button
        type="submit"
        disabled={sending || body.trim().length === 0}
        className="flex w-full items-center justify-center gap-2 rounded-[18px] bg-primary px-4 py-3 font-semibold text-background disabled:cursor-not-allowed disabled:opacity-60"
      >
        {sending ? <Loader2 size={18} className="animate-spin" /> : <SendHorizontal size={18} />}
        <span>{sending ? "Отправляем..." : "Отправить"}</span>
      </button>
    </form>
  );
}

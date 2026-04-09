'use client';

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, SendHorizontal } from "lucide-react";

import { useLanguage } from "@/components/LanguageProvider";
import { apiPath } from "@/lib/app-paths";
import type { TranslationMap } from "@/lib/i18n";

const translations: TranslationMap<{
  sendError: string;
  placeholder: string;
  sending: string;
  send: string;
}> = {
  ru: {
    sendError: "Сообщение не ушло. Повтори отправку.",
    placeholder: "Сообщение в чат",
    sending: "Отправляем...",
    send: "Отправить",
  },
  en: {
    sendError: "Message was not sent. Try again.",
    placeholder: "Message",
    sending: "Sending...",
    send: "Send",
  },
  es: {
    sendError: "El mensaje no se envió. Inténtalo de nuevo.",
    placeholder: "Mensaje",
    sending: "Enviando...",
    send: "Enviar",
  },
  fr: {
    sendError: "Le message n'a pas été envoyé. Réessayez.",
    placeholder: "Message",
    sending: "Envoi...",
    send: "Envoyer",
  },
  pt: {
    sendError: "A mensagem não foi enviada. Tente de novo.",
    placeholder: "Mensagem",
    sending: "Enviando...",
    send: "Enviar",
  },
};

export function ChatComposer({ chatId }: { chatId: string }) {
  const router = useRouter();
  const { lang } = useLanguage();
  const t = translations[lang];
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
      const response = await fetch(apiPath(`/api/chats/${chatId}/messages`), {
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
      setError(t.sendError);
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
          placeholder={t.placeholder}
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
        <span>{sending ? t.sending : t.send}</span>
      </button>
    </form>
  );
}

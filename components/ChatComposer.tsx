'use client';

import { useEffect, useState } from "react";
import { ImagePlus, Loader2, SendHorizontal, X } from "lucide-react";

import { useLanguage } from "@/components/LanguageProvider";
import { useToast } from "@/components/ToastProvider";
import { apiPath, withBasePath } from "@/lib/app-paths";
import type { TranslationMap } from "@/lib/i18n";

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

const translations: TranslationMap<{
  sendError: string;
  placeholder: string;
  sending: string;
  send: string;
  addMedia: string;
  removeMedia: string;
  mediaReady: string;
}> = {
  ru: {
    sendError: "Сообщение не отправилось. Повтори попытку.",
    placeholder: "Сообщение в чат",
    sending: "Отправляем...",
    send: "Отправить",
    addMedia: "Фото или видео",
    removeMedia: "Убрать файл",
    mediaReady: "Файл прикреплен",
  },
  en: {
    sendError: "Message was not sent. Try again.",
    placeholder: "Message",
    sending: "Sending...",
    send: "Send",
    addMedia: "Photo or video",
    removeMedia: "Remove file",
    mediaReady: "File attached",
  },
  es: {
    sendError: "El mensaje no se envió. Inténtalo de nuevo.",
    placeholder: "Mensaje",
    sending: "Enviando...",
    send: "Enviar",
    addMedia: "Foto o video",
    removeMedia: "Quitar archivo",
    mediaReady: "Archivo adjunto",
  },
  fr: {
    sendError: "Le message n'a pas été envoyé. Réessayez.",
    placeholder: "Message",
    sending: "Envoi...",
    send: "Envoyer",
    addMedia: "Photo ou vidéo",
    removeMedia: "Retirer le fichier",
    mediaReady: "Fichier joint",
  },
  pt: {
    sendError: "A mensagem não foi enviada. Tente de novo.",
    placeholder: "Mensagem",
    sending: "Enviando...",
    send: "Enviar",
    addMedia: "Foto ou vídeo",
    removeMedia: "Remover arquivo",
    mediaReady: "Arquivo anexado",
  },
};

export function ChatComposer({
  chatId,
  onMessageSent,
}: {
  chatId: string;
  onMessageSent?: (message: ChatMessage) => void;
}) {
  const { lang } = useLanguage();
  const { pushToast } = useToast();
  const t = translations[lang];
  const [body, setBody] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const [media, setMedia] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);

  useEffect(() => {
    if (!media) {
      setMediaPreview(null);
      return;
    }

    const objectUrl = URL.createObjectURL(media);
    setMediaPreview(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [media]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmed = body.trim();

    if (!trimmed && !media) {
      return;
    }

    setSending(true);
    setError("");

    try {
      const payload = new FormData();
      payload.append("body", trimmed);

      if (media) {
        payload.append("media", media);
      }

      const response = await fetch(apiPath(`/api/chats/${chatId}/messages`), {
        method: "POST",
        body: payload,
      });

      if (!response.ok) {
        throw new Error("send failed");
      }

      const message = (await response.json()) as ChatMessage;
      setBody("");
      setMedia(null);
      onMessageSent?.(message);
    } catch {
      setError(t.sendError);
      pushToast({
        tone: "error",
        title: "Сообщение не отправлено",
        description: t.sendError,
      });
    } finally {
      setSending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div
        className="overflow-hidden rounded-[28px] border border-border-subtle p-3"
        style={{
          backgroundImage: `linear-gradient(180deg, rgba(7, 13, 20, 0.92), rgba(7, 13, 20, 0.98)), url('${withBasePath("/modal-backgrounds/chat-sheet-bg.png")}')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {mediaPreview ? (
          <div className="mb-3 overflow-hidden rounded-[20px] border border-white/8 bg-black/30">
            {media?.type.startsWith("video/") ? (
              <video src={mediaPreview} controls className="max-h-[260px] w-full bg-black" />
            ) : (
              <img src={mediaPreview} alt="" className="max-h-[260px] w-full object-cover" />
            )}
          </div>
        ) : null}

        <textarea
          value={body}
          onChange={(event) => setBody(event.target.value)}
          rows={3}
          placeholder={t.placeholder}
          className="w-full resize-none bg-transparent text-sm text-text-main placeholder:text-text-soft focus:outline-none"
        />

        <div className="mt-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-white/10 bg-white/6 px-3 py-2 text-xs font-semibold text-text-main transition hover:bg-white/10">
              <ImagePlus size={14} />
              <span>{t.addMedia}</span>
              <input
                type="file"
                accept="image/*,video/*"
                className="hidden"
                onChange={(event) => setMedia(event.target.files?.[0] ?? null)}
              />
            </label>

            {media ? (
              <button
                type="button"
                onClick={() => setMedia(null)}
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/6 px-3 py-2 text-xs font-semibold text-text-muted transition hover:bg-white/10 hover:text-white"
              >
                <X size={14} />
                <span>{t.removeMedia}</span>
              </button>
            ) : null}
          </div>

          {media ? <div className="text-xs font-medium text-primary">{t.mediaReady}</div> : null}
        </div>
      </div>

      {error ? <div className="text-sm text-danger">{error}</div> : null}

      <button
        type="submit"
        disabled={sending || (!body.trim() && !media)}
        className="flex w-full items-center justify-center gap-2 rounded-[18px] bg-primary px-4 py-3 font-semibold text-background disabled:cursor-not-allowed disabled:opacity-60"
      >
        {sending ? <Loader2 size={18} className="animate-spin" /> : <SendHorizontal size={18} />}
        <span>{sending ? t.sending : t.send}</span>
      </button>
    </form>
  );
}

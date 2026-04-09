'use client';

import { useState, useTransition } from "react";
import Link from "next/link";
import { Loader2, MessageCircle, Send } from "lucide-react";
import { useRouter } from "next/navigation";

import { useLanguage } from "@/components/LanguageProvider";
import { UserAvatar } from "@/components/UserAvatar";
import { apiPath } from "@/lib/app-paths";
import { formatShortDate } from "@/lib/format";
import type { TranslationMap } from "@/lib/i18n";

type CommentItem = {
  id: string;
  body: string;
  createdAt: Date | string;
  user: {
    id: string;
    name: string;
    handle: string;
    avatarGradient: string;
    avatarPath?: string | null;
  };
};

const translations: TranslationMap<{
  title: (count: number) => string;
  empty: string;
  placeholder: string;
  error: string;
}> = {
  ru: {
    title: (count) => `Комментарии (${count})`,
    empty: "Никто еще не оставил комментарий. Будьте первым!",
    placeholder: "Оставить комментарий...",
    error: "Ошибка сети.",
  },
  en: {
    title: (count) => `Comments (${count})`,
    empty: "No one has left a comment yet. Be the first.",
    placeholder: "Write a comment...",
    error: "Network error.",
  },
  es: {
    title: (count) => `Comentarios (${count})`,
    empty: "Aún no hay comentarios. Sé el primero.",
    placeholder: "Escribe un comentario...",
    error: "Error de red.",
  },
  fr: {
    title: (count) => `Commentaires (${count})`,
    empty: "Aucun commentaire pour le moment. Soyez le premier.",
    placeholder: "Laisser un commentaire...",
    error: "Erreur réseau.",
  },
  pt: {
    title: (count) => `Comentários (${count})`,
    empty: "Ainda não há comentários. Seja o primeiro.",
    placeholder: "Deixe um comentário...",
    error: "Erro de rede.",
  },
};

export function CatchComments({
  catchId,
  comments,
}: {
  catchId: string;
  comments: CommentItem[];
}) {
  const router = useRouter();
  const { lang } = useLanguage();
  const t = translations[lang];
  const [body, setBody] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  async function handleSubmit() {
    if (!body.trim()) {
      return;
    }

    setError("");

    try {
      const response = await fetch(apiPath(`/api/catches/${catchId}/comments`), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: body.trim() }),
      });

      if (!response.ok) {
        throw new Error("comment failed");
      }

      setBody("");
      startTransition(() => {
        router.refresh();
      });
    } catch {
      setError(t.error);
    }
  }

  return (
    <div className="w-full">
      <div className="border-b border-white/5 bg-surface-soft/30 px-5 py-4">
        <h3 className="flex items-center gap-2 text-[16px] font-bold text-white">
          <MessageCircle size={18} />
          {t.title(comments.length)}
        </h3>
      </div>

      <div className="divide-y divide-white/5">
        {comments.length > 0 ? (
          comments.map((comment) => (
            <div key={comment.id} className="flex gap-3 px-5 py-4 transition-colors hover:bg-white/[0.02]">
              <Link href={`/profile/${comment.user.handle}`} className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-surface-strong text-sm font-bold text-white">
                <UserAvatar
                  name={comment.user.name}
                  avatarPath={comment.user.avatarPath}
                  className="h-full w-full"
                  fallbackClassName="border-0 bg-white/8"
                  iconSize={16}
                />
              </Link>
              <div className="min-w-0 flex-1 pt-0.5">
                <div className="flex items-baseline justify-between gap-2">
                  <Link href={`/profile/${comment.user.handle}`} className="truncate text-[14px] font-bold text-white hover:underline">
                    {comment.user.name}
                  </Link>
                  <span suppressHydrationWarning className="shrink-0 text-[12px] text-text-muted">
                    {formatShortDate(new Date(comment.createdAt), lang)}
                  </span>
                </div>
                <p className="mt-1 text-[14px] leading-[1.4] text-white/80">{comment.body}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center px-5 py-10 text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white/5 text-white/30">
              <MessageCircle size={24} />
            </div>
            <p className="text-[14px] text-text-muted">{t.empty}</p>
          </div>
        )}
      </div>

      <div className="mt-2 p-4 sm:p-5">
        <div className="relative">
          <textarea
            value={body}
            onChange={(event) => setBody(event.target.value)}
            rows={1}
            placeholder={t.placeholder}
            className="hide-scrollbar w-full resize-none rounded-[20px] border border-white/10 bg-surface-soft px-4 py-3.5 pr-12 text-[14px] text-white placeholder:text-text-muted transition-all focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/50"
            style={{ minHeight: "52px", maxHeight: "120px" }}
          />
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isPending || !body.trim()}
            className="absolute bottom-2 right-2 flex aspect-square items-center justify-center rounded-full bg-primary text-black transition-colors disabled:bg-white/10 disabled:text-text-muted disabled:opacity-50"
          >
            {isPending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} className="mr-0.5 mt-0.5" />}
          </button>
        </div>
        {error ? <div className="mt-2 px-1 text-[13px] text-danger">{error}</div> : null}
      </div>
    </div>
  );
}

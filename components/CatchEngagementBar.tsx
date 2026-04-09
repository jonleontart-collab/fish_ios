'use client';

import Link from "next/link";
import { useState, useTransition } from "react";
import { Heart, MessageCircle } from "lucide-react";

import { useLanguage } from "@/components/LanguageProvider";
import { apiPath } from "@/lib/app-paths";
import type { TranslationMap } from "@/lib/i18n";

const translations: TranslationMap<{
  unlike: string;
  like: string;
  comments: string;
  error: string;
  likesOne: string;
  likesMany: string;
}> = {
  ru: {
    unlike: "Убрать лайк",
    like: "Поставить лайк",
    comments: "Комментарии",
    error: "Ошибка.",
    likesOne: "отметка «Нравится»",
    likesMany: "отметок «Нравится»",
  },
  en: {
    unlike: "Remove like",
    like: "Like",
    comments: "Comments",
    error: "Error.",
    likesOne: "like",
    likesMany: "likes",
  },
  es: {
    unlike: "Quitar me gusta",
    like: "Me gusta",
    comments: "Comentarios",
    error: "Error.",
    likesOne: "me gusta",
    likesMany: "me gusta",
  },
  fr: {
    unlike: "Retirer le like",
    like: "Aimer",
    comments: "Commentaires",
    error: "Erreur.",
    likesOne: "mention J'aime",
    likesMany: "mentions J'aime",
  },
  pt: {
    unlike: "Remover curtida",
    like: "Curtir",
    comments: "Comentários",
    error: "Erro.",
    likesOne: "curtida",
    likesMany: "curtidas",
  },
};

export function CatchEngagementBar({
  catchId,
  initialLikesCount,
  initialCommentsCount,
  initiallyLiked,
}: {
  catchId: string;
  initialLikesCount: number;
  initialCommentsCount: number;
  initiallyLiked: boolean;
}) {
  const { lang } = useLanguage();
  const t = translations[lang];
  const [liked, setLiked] = useState(initiallyLiked);
  const [likesCount, setLikesCount] = useState(initialLikesCount);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  async function handleToggleLike() {
    const previousLiked = liked;
    const previousCount = likesCount;

    setLiked(!previousLiked);
    setLikesCount(previousLiked ? Math.max(0, previousCount - 1) : previousCount + 1);
    setError("");

    try {
      const response = await fetch(apiPath(`/api/catches/${catchId}/likes`), {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("like failed");
      }

      const payload = (await response.json()) as { liked: boolean; likesCount: number };
      startTransition(() => {
        setLiked(payload.liked);
        setLikesCount(payload.likesCount);
      });
    } catch {
      setLiked(previousLiked);
      setLikesCount(previousCount);
      setError(t.error);
    }
  }

  const likesLabel = likesCount === 1 ? t.likesOne : t.likesMany;

  return (
    <div className="mb-1 flex flex-col gap-1.5 px-4 pt-2 sm:px-5">
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={handleToggleLike}
          disabled={isPending}
          className={`flex items-center gap-1.5 text-[15px] font-bold transition-all disabled:opacity-50 hover:scale-105 active:scale-95 ${
            liked ? "text-primary" : "text-white hover:text-white/80"
          }`}
          aria-label={liked ? t.unlike : t.like}
        >
          <Heart size={26} className={liked ? "fill-current" : ""} strokeWidth={liked ? 2 : 1.5} />
        </button>

        <Link
          href={`/feed/${catchId}`}
          className="flex items-center gap-1.5 text-[15px] font-bold text-white transition-all hover:scale-105 hover:opacity-80 active:scale-95"
          aria-label={t.comments}
        >
          <MessageCircle size={26} strokeWidth={1.5} />
        </Link>
      </div>

      {likesCount > 0 ? (
        <div className="mt-1 text-[14px] font-bold text-white">
          {likesCount} {likesLabel}
        </div>
      ) : null}

      {initialCommentsCount > 0 ? (
        <div className="text-[12px] text-text-soft">
          {initialCommentsCount} {t.comments.toLowerCase()}
        </div>
      ) : null}

      {error ? <div className="mt-1 text-[12px] text-danger">{error}</div> : null}
    </div>
  );
}

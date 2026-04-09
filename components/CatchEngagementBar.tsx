'use client';

import Link from "next/link";
import { useState, useTransition } from "react";
import { Heart, MessageCircle, Repeat2 } from "lucide-react";

import { useLanguage } from "@/components/LanguageProvider";
import { useToast } from "@/components/ToastProvider";
import { apiPath } from "@/lib/app-paths";
import type { TranslationMap } from "@/lib/i18n";

const translations: TranslationMap<{
  unlike: string;
  like: string;
  comments: string;
  repost: string;
  unRepost: string;
  error: string;
  likesOne: string;
  likesMany: string;
  repostsOne: string;
  repostsMany: string;
}> = {
  ru: {
    unlike: "Убрать лайк",
    like: "Поставить лайк",
    comments: "Комментарии",
    repost: "Поделиться",
    unRepost: "Убрать репост",
    error: "Ошибка.",
    likesOne: "лайк",
    likesMany: "лайков",
    repostsOne: "репост",
    repostsMany: "репостов",
  },
  en: {
    unlike: "Remove like",
    like: "Like",
    comments: "Comments",
    repost: "Repost",
    unRepost: "Remove repost",
    error: "Error.",
    likesOne: "like",
    likesMany: "likes",
    repostsOne: "repost",
    repostsMany: "reposts",
  },
  es: {
    unlike: "Quitar me gusta",
    like: "Me gusta",
    comments: "Comentarios",
    repost: "Compartir",
    unRepost: "Quitar repost",
    error: "Error.",
    likesOne: "me gusta",
    likesMany: "me gusta",
    repostsOne: "repost",
    repostsMany: "reposts",
  },
  fr: {
    unlike: "Retirer le like",
    like: "Aimer",
    comments: "Commentaires",
    repost: "Partager",
    unRepost: "Retirer le repost",
    error: "Erreur.",
    likesOne: "like",
    likesMany: "likes",
    repostsOne: "repost",
    repostsMany: "reposts",
  },
  pt: {
    unlike: "Remover curtida",
    like: "Curtir",
    comments: "Comentários",
    repost: "Compartilhar",
    unRepost: "Remover repost",
    error: "Erro.",
    likesOne: "curtida",
    likesMany: "curtidas",
    repostsOne: "repost",
    repostsMany: "reposts",
  },
};

export function CatchEngagementBar({
  catchId,
  initialLikesCount,
  initialCommentsCount,
  initiallyLiked,
  initialRepostsCount,
  initiallyReposted,
}: {
  catchId: string;
  initialLikesCount: number;
  initialCommentsCount: number;
  initiallyLiked: boolean;
  initialRepostsCount: number;
  initiallyReposted: boolean;
}) {
  const { lang } = useLanguage();
  const { pushToast } = useToast();
  const t = translations[lang];
  const [liked, setLiked] = useState(initiallyLiked);
  const [likesCount, setLikesCount] = useState(initialLikesCount);
  const [reposted, setReposted] = useState(initiallyReposted);
  const [repostsCount, setRepostsCount] = useState(initialRepostsCount);
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

  async function handleToggleRepost() {
    const previousReposted = reposted;
    const previousCount = repostsCount;

    setReposted(!previousReposted);
    setRepostsCount(previousReposted ? Math.max(0, previousCount - 1) : previousCount + 1);
    setError("");

    try {
      const response = await fetch(apiPath(`/api/catches/${catchId}/reposts`), {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("repost failed");
      }

      const payload = (await response.json()) as { reposted: boolean; repostsCount: number };
      startTransition(() => {
        setReposted(payload.reposted);
        setRepostsCount(payload.repostsCount);
      });

      pushToast({
        tone: "success",
        title: payload.reposted ? "Запись добавлена в репосты" : "Репост убран",
      });
    } catch {
      setReposted(previousReposted);
      setRepostsCount(previousCount);
      setError(t.error);
      pushToast({
        tone: "error",
        title: "Не удалось обновить репост",
      });
    }
  }

  const likesLabel = likesCount === 1 ? t.likesOne : t.likesMany;
  const repostsLabel = repostsCount === 1 ? t.repostsOne : t.repostsMany;

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

        <button
          type="button"
          onClick={handleToggleRepost}
          disabled={isPending}
          className={`flex items-center gap-1.5 text-[15px] font-bold transition-all disabled:opacity-50 hover:scale-105 active:scale-95 ${
            reposted ? "text-accent" : "text-white hover:text-white/80"
          }`}
          aria-label={reposted ? t.unRepost : t.repost}
        >
          <Repeat2 size={24} strokeWidth={1.9} />
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

      {repostsCount > 0 ? (
        <div className="text-[12px] text-text-soft">
          {repostsCount} {repostsLabel}
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

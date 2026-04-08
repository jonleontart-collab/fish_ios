'use client';

import Link from "next/link";
import { useState, useTransition } from "react";
import { Heart, MessageCircle } from "lucide-react";

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
      const response = await fetch(`/api/catches/${catchId}/likes`, {
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
      setError("Ошибка.");
    }
  }

  return (
    <div className="flex flex-col gap-1.5 pt-2 mb-1 px-4 sm:px-5">
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={handleToggleLike}
          disabled={isPending}
          className={`flex items-center gap-1.5 text-[15px] font-bold transition-all disabled:opacity-50 hover:scale-105 active:scale-95 ${
            liked ? "text-primary" : "text-white hover:text-white/80"
          }`}
          aria-label={liked ? "Убрать лайк" : "Поставить лайк"}
        >
          <Heart size={26} className={liked ? "fill-current" : ""} strokeWidth={liked ? 2 : 1.5} />
        </button>

        <Link
          href={`/feed/${catchId}`}
          className="flex items-center gap-1.5 text-[15px] font-bold text-white hover:opacity-80 transition-all hover:scale-105 active:scale-95"
          aria-label="Комментарии"
        >
          <MessageCircle size={26} strokeWidth={1.5} />
        </Link>
      </div>

      {likesCount > 0 && (
        <div className="text-[14px] font-bold text-white mt-1">
          {likesCount} {likesCount === 1 ? 'отметка' : 'отметок'} «Нравится»
        </div>
      )}
      
      {error && <div className="text-[12px] text-danger mt-1">{error}</div>}
    </div>
  );
}

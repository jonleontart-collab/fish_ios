'use client';

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, MessageCircle, Send } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

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

export function CatchComments({
  catchId,
  comments,
}: {
  catchId: string;
  comments: CommentItem[];
}) {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  async function handleSubmit() {
    if (!body.trim()) return;
    setError("");

    try {
      const response = await fetch(`/api/catches/${catchId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: body.trim() }),
      });

      if (!response.ok) throw new Error("Comment failed");

      setBody("");
      startTransition(() => {
        router.refresh();
      });
    } catch {
      setError("Ошибка сети.");
    }
  }

  return (
    <div className="w-full">
      <div className="px-5 py-4 border-b border-white/5 bg-surface-soft/30">
        <h3 className="font-bold text-[16px] text-white flex items-center gap-2">
          <MessageCircle size={18} />
          Комментарии ({comments.length})
        </h3>
      </div>

      <div className="divide-y divide-white/5">
        {comments.length > 0 ? (
          comments.map((comment) => (
            <div key={comment.id} className="px-5 py-4 flex gap-3 hover:bg-white/[0.02] transition-colors">
              <Link href={`/profile/${comment.user.handle}`} className="shrink-0 w-10 h-10 rounded-full overflow-hidden bg-surface-strong border border-white/10 flex items-center justify-center text-white font-bold text-sm">
                {comment.user.avatarPath ? (
                  <Image src={comment.user.avatarPath} alt={comment.user.name} width={40} height={40} className="object-cover w-full h-full" />
                ) : (
                  <div className={`w-full h-full flex items-center justify-center bg-gradient-to-br ${comment.user.avatarGradient}`}>
                    {comment.user.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </Link>
              <div className="flex-1 min-w-0 pt-0.5">
                <div className="flex items-baseline justify-between gap-2">
                   <Link href={`/profile/${comment.user.handle}`} className="font-bold text-[14px] text-white hover:underline truncate">
                     {comment.user.name}
                   </Link>
                   <span suppressHydrationWarning className="text-[12px] text-text-muted shrink-0">
                     {new Date(comment.createdAt).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}
                   </span>
                </div>
                <p className="mt-1 text-[14px] leading-[1.4] text-white/80">{comment.body}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="px-5 py-10 text-center flex flex-col items-center">
             <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-3 text-white/30">
               <MessageCircle size={24} />
             </div>
             <p className="text-[14px] text-text-muted">Никто еще не оставил комментарий.<br/>Будьте первым!</p>
          </div>
        )}
      </div>

      <div className="p-4 sm:p-5 mt-2">
        <div className="relative">
          <textarea
            value={body}
            onChange={(event) => setBody(event.target.value)}
            rows={1}
            placeholder="Оставить комментарий..."
            className="w-full resize-none rounded-[20px] border border-white/10 bg-surface-soft px-4 py-3.5 pr-12 text-[14px] text-white placeholder:text-text-muted focus:border-primary/50 focus:ring-1 focus:ring-primary/50 focus:outline-none transition-all hide-scrollbar"
            style={{ minHeight: '52px', maxHeight: '120px' }}
          />
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isPending || !body.trim()}
            className="absolute right-2 top-2 bottom-2 aspect-square flex items-center justify-center rounded-full bg-primary text-black disabled:opacity-50 disabled:bg-white/10 disabled:text-text-muted transition-colors"
          >
            {isPending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} className="mr-0.5 mt-0.5" />}
          </button>
        </div>
        {error && <div className="mt-2 text-[13px] text-danger px-1">{error}</div>}
      </div>
    </div>
  );
}

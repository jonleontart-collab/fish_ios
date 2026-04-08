'use client';

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Camera, Loader2 } from "lucide-react";

export function PlacePhotoUploader({ placeId }: { placeId: string }) {
  const router = useRouter();
  const [caption, setCaption] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  async function handleUpload() {
    if (!file) {
      setError("Сначала выбери фотографию.");
      return;
    }

    setError("");

    try {
      const payload = new FormData();
      payload.append("image", file);
      payload.append("caption", caption.trim());

      const response = await fetch(`/api/places/${placeId}/photos`, {
        method: "POST",
        body: payload,
      });

      if (!response.ok) {
        throw new Error("upload failed");
      }

      setCaption("");
      setFile(null);
      startTransition(() => {
        router.refresh();
      });
    } catch {
      setError("Не удалось прикрепить фото к точке.");
    }
  }

  return (
    <div className="space-y-3 rounded-[24px] border border-border-subtle bg-white/3 p-4">
      <div className="flex items-center gap-2 text-sm font-semibold text-text-main">
        <Camera size={16} className="text-primary" />
        Добавить фото к месту
      </div>
      <input
        type="file"
        accept="image/*"
        onChange={(event) => setFile(event.target.files?.[0] ?? null)}
        className="block w-full text-sm text-text-main"
      />
      <input
        value={caption}
        onChange={(event) => setCaption(event.target.value)}
        placeholder="Подпись к фотографии"
        className="w-full rounded-[18px] border border-border-subtle bg-surface-soft px-4 py-3 text-sm text-text-main placeholder:text-text-soft focus:border-primary/30 focus:outline-none"
      />
      {error ? <div className="text-sm text-danger">{error}</div> : null}
      <button
        type="button"
        onClick={handleUpload}
        disabled={isPending || !file}
        className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-3 text-sm font-semibold text-background disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? <Loader2 size={16} className="animate-spin" /> : <Camera size={16} />}
        <span>{isPending ? "Загружаем" : "Прикрепить фото"}</span>
      </button>
    </div>
  );
}

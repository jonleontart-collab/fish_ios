'use client';

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Camera, Loader2 } from "lucide-react";

import { useLanguage } from "@/components/LanguageProvider";
import { apiPath } from "@/lib/app-paths";
import type { TranslationMap } from "@/lib/i18n";

const translations: TranslationMap<{
  select: string;
  uploadError: string;
  title: string;
  caption: string;
  uploading: string;
  upload: string;
}> = {
  ru: {
    select: "Сначала выбери фотографию.",
    uploadError: "Не удалось прикрепить фото к точке.",
    title: "Добавить фото к месту",
    caption: "Подпись к фотографии",
    uploading: "Загружаем",
    upload: "Прикрепить фото",
  },
  en: {
    select: "Select a photo first.",
    uploadError: "Could not attach the photo to this place.",
    title: "Add a place photo",
    caption: "Photo caption",
    uploading: "Uploading",
    upload: "Attach photo",
  },
  es: {
    select: "Primero selecciona una foto.",
    uploadError: "No se pudo adjuntar la foto al lugar.",
    title: "Añadir foto del lugar",
    caption: "Texto de la foto",
    uploading: "Subiendo",
    upload: "Adjuntar foto",
  },
  fr: {
    select: "Choisissez d'abord une photo.",
    uploadError: "Impossible d'ajouter la photo à ce lieu.",
    title: "Ajouter une photo du spot",
    caption: "Légende de la photo",
    uploading: "Envoi",
    upload: "Ajouter la photo",
  },
  pt: {
    select: "Selecione uma foto primeiro.",
    uploadError: "Não foi possível anexar a foto ao local.",
    title: "Adicionar foto do local",
    caption: "Legenda da foto",
    uploading: "Enviando",
    upload: "Anexar foto",
  },
};

export function PlacePhotoUploader({ placeId }: { placeId: string }) {
  const router = useRouter();
  const { lang } = useLanguage();
  const t = translations[lang];
  const [caption, setCaption] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  async function handleUpload() {
    if (!file) {
      setError(t.select);
      return;
    }

    setError("");

    try {
      const payload = new FormData();
      payload.append("image", file);
      payload.append("caption", caption.trim());

      const response = await fetch(apiPath(`/api/places/${placeId}/photos`), {
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
      setError(t.uploadError);
    }
  }

  return (
    <div className="space-y-3 rounded-[24px] border border-border-subtle bg-white/3 p-4">
      <div className="flex items-center gap-2 text-sm font-semibold text-text-main">
        <Camera size={16} className="text-primary" />
        {t.title}
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
        placeholder={t.caption}
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
        <span>{isPending ? t.uploading : t.upload}</span>
      </button>
    </div>
  );
}

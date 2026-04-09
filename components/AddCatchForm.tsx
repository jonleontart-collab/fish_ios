'use client';

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Bot,
  CheckCircle2,
  ImagePlus,
  Loader2,
  PlayCircle,
  TriangleAlert,
  UploadCloud,
  X,
} from "lucide-react";

import { useLanguage } from "@/components/LanguageProvider";
import { apiPath } from "@/lib/app-paths";
import { MAX_CATCH_MEDIA_ITEMS } from "@/lib/constants";
import type { TranslationMap } from "@/lib/i18n";

type PlaceOption = {
  id: string;
  slug: string;
  name: string;
  city: string;
};

type RecognitionPayload = {
  species: string | null;
  lengthCm: number | null;
  weightKg: number | null;
  baitSuggestion: string | null;
  caption: string | null;
  confidence: number;
  source: "gemini" | "fallback";
  note?: string;
};

const translations: TranslationMap<{
  section: string;
  title: string;
  pickPhoto: string;
  pickPhotoDescription: string;
  addMore: string;
  mediaLimit: string;
  analyze: string;
  analyzing: string;
  assistant: string;
  manualSpecies: string;
  species: string;
  place: string;
  length: string;
  weight: string;
  bait: string;
  note: string;
  publish: string;
  publishing: string;
  photoRequired: string;
  speciesRequired: string;
  placeRequired: string;
  mediaMissing: string;
  aiError: string;
  publishError: string;
  recognitionNoImage: string;
}> = {
  ru: {
    section: "Добавить улов",
    title: "Фото, видео, размеры и короткая история сессии",
    pickPhoto: "Добавь фото или видео улова",
    pickPhotoDescription: "Можно загрузить до 10 файлов. Первая картинка пойдет на обложку поста.",
    addMore: "Добавить еще",
    mediaLimit: "До 10 файлов в одном посте",
    analyze: "Определить вид и размер",
    analyzing: "ИИ анализирует фото",
    assistant: "ИИ-помощник",
    manualSpecies: "Нужно уточнить вид вручную",
    species: "Вид рыбы",
    place: "Место",
    length: "Длина, см",
    weight: "Вес, кг",
    bait: "Приманка или оснастка",
    note: "Заметка к публикации",
    publish: "Опубликовать в ленте",
    publishing: "Публикуем улов",
    photoRequired: "Сначала выбери фото улова.",
    speciesRequired: "Укажи вид рыбы.",
    placeRequired: "Выбери место.",
    mediaMissing: "Нужно загрузить хотя бы одно фото или видео.",
    aiError: "Не удалось получить ответ ИИ. Заполни поля вручную и продолжай.",
    publishError: "Публикация не удалась. Проверь поля и повтори.",
    recognitionNoImage: "Для анализа нужно хотя бы одно фото. Видео можно оставить для самого поста.",
  },
  en: {
    section: "Add catch",
    title: "Photos, video, measurements, and a quick trip story",
    pickPhoto: "Add catch photos or video",
    pickPhotoDescription: "You can upload up to 10 files. The first image becomes the cover of the post.",
    addMore: "Add more",
    mediaLimit: "Up to 10 files in one post",
    analyze: "Detect species and size",
    analyzing: "AI is analyzing the photo",
    assistant: "AI assistant",
    manualSpecies: "Specify the species manually",
    species: "Fish species",
    place: "Place",
    length: "Length, cm",
    weight: "Weight, kg",
    bait: "Bait or rig",
    note: "Post note",
    publish: "Publish to feed",
    publishing: "Publishing catch",
    photoRequired: "Choose a catch photo first.",
    speciesRequired: "Specify the fish species.",
    placeRequired: "Choose a place.",
    mediaMissing: "You need to upload at least one photo or video.",
    aiError: "Could not get an AI response. Fill in the fields manually and continue.",
    publishError: "Could not publish the post. Check the fields and try again.",
    recognitionNoImage: "AI recognition needs at least one photo. You can still keep video in the post.",
  },
  es: {
    section: "Añadir captura",
    title: "Fotos, video, medidas y una historia rápida de la salida",
    pickPhoto: "Añade fotos o video de la captura",
    pickPhotoDescription: "Puedes subir hasta 10 archivos. La primera imagen será la portada del post.",
    addMore: "Añadir más",
    mediaLimit: "Hasta 10 archivos en una publicación",
    analyze: "Detectar especie y tamaño",
    analyzing: "La IA está analizando la foto",
    assistant: "Asistente IA",
    manualSpecies: "Debes indicar la especie manualmente",
    species: "Especie",
    place: "Lugar",
    length: "Longitud, cm",
    weight: "Peso, kg",
    bait: "Cebo o montaje",
    note: "Nota para la publicación",
    publish: "Publicar en el feed",
    publishing: "Publicando captura",
    photoRequired: "Primero elige una foto de la captura.",
    speciesRequired: "Indica la especie del pez.",
    placeRequired: "Elige un lugar.",
    mediaMissing: "Debes subir al menos una foto o un video.",
    aiError: "No se pudo obtener respuesta de la IA. Completa los campos manualmente y continúa.",
    publishError: "La publicación falló. Revisa los campos y vuelve a intentarlo.",
    recognitionNoImage: "El análisis necesita al menos una foto. El video puede quedarse en la publicación.",
  },
  fr: {
    section: "Ajouter une prise",
    title: "Photos, vidéo, mesures et résumé rapide de la session",
    pickPhoto: "Ajouter des photos ou une vidéo",
    pickPhotoDescription: "Vous pouvez téléverser jusqu’à 10 fichiers. La première image devient la couverture du post.",
    addMore: "Ajouter plus",
    mediaLimit: "Jusqu’à 10 fichiers dans un post",
    analyze: "Détecter l'espèce et la taille",
    analyzing: "L'IA analyse la photo",
    assistant: "Assistant IA",
    manualSpecies: "L'espèce doit être précisée manuellement",
    species: "Espèce",
    place: "Lieu",
    length: "Longueur, cm",
    weight: "Poids, kg",
    bait: "Appât ou montage",
    note: "Note de publication",
    publish: "Publier dans le feed",
    publishing: "Publication de la prise",
    photoRequired: "Choisissez d'abord une photo de la prise.",
    speciesRequired: "Indiquez l'espèce du poisson.",
    placeRequired: "Choisissez un lieu.",
    mediaMissing: "Vous devez envoyer au moins une photo ou une vidéo.",
    aiError: "Impossible d'obtenir une réponse de l'IA. Remplissez les champs manuellement et continuez.",
    publishError: "La publication a échoué. Vérifiez les champs et réessayez.",
    recognitionNoImage: "L’analyse a besoin d’au moins une photo. La vidéo peut rester dans le post.",
  },
  pt: {
    section: "Adicionar captura",
    title: "Fotos, vídeo, medidas e um resumo rápido da pescaria",
    pickPhoto: "Adicione fotos ou vídeo da captura",
    pickPhotoDescription: "Você pode enviar até 10 arquivos. A primeira imagem vira a capa do post.",
    addMore: "Adicionar mais",
    mediaLimit: "Até 10 arquivos em um post",
    analyze: "Detectar espécie e tamanho",
    analyzing: "A IA está analisando a foto",
    assistant: "Assistente IA",
    manualSpecies: "É preciso informar a espécie manualmente",
    species: "Espécie",
    place: "Local",
    length: "Comprimento, cm",
    weight: "Peso, kg",
    bait: "Isca ou montagem",
    note: "Nota da publicação",
    publish: "Publicar no feed",
    publishing: "Publicando captura",
    photoRequired: "Escolha primeiro uma foto da captura.",
    speciesRequired: "Informe a espécie do peixe.",
    placeRequired: "Escolha um local.",
    mediaMissing: "É necessário enviar pelo menos uma foto ou um vídeo.",
    aiError: "Não foi possível obter resposta da IA. Preencha os campos manualmente e continue.",
    publishError: "A publicação falhou. Verifique os campos e tente novamente.",
    recognitionNoImage: "A análise precisa de pelo menos uma foto. O vídeo pode continuar no post.",
  },
};

export function AddCatchForm({ places }: { places: PlaceOption[] }) {
  const router = useRouter();
  const { lang } = useLanguage();
  const t = translations[lang];
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [recognition, setRecognition] = useState<RecognitionPayload | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState("");
  const [, startTransition] = useTransition();
  const [form, setForm] = useState({
    species: "",
    placeId: places[0]?.id ?? "",
    lengthCm: "",
    weightKg: "",
    bait: "",
    note: "",
  });

  useEffect(() => {
    const urls = mediaFiles.map((file) => URL.createObjectURL(file));
    setPreviewUrls(urls);

    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [mediaFiles]);

  const recognitionImage = useMemo(
    () => mediaFiles.find((file) => file.type.startsWith("image/")) ?? null,
    [mediaFiles],
  );

  function updateField(name: keyof typeof form, value: string) {
    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function handleFilesSelection(files: FileList | null) {
    if (!files?.length) {
      return;
    }

    const nextFiles = Array.from(files)
      .filter((file) => file.type.startsWith("image/") || file.type.startsWith("video/"))
      .slice(0, MAX_CATCH_MEDIA_ITEMS);

    setMediaFiles((current) => [...current, ...nextFiles].slice(0, MAX_CATCH_MEDIA_ITEMS));
    setRecognition(null);
    setError("");
  }

  function removeMedia(index: number) {
    setMediaFiles((current) => current.filter((_, currentIndex) => currentIndex !== index));
    setRecognition(null);
  }

  async function handleRecognize() {
    if (!recognitionImage) {
      setError(mediaFiles.length > 0 ? t.recognitionNoImage : t.photoRequired);
      return;
    }

    setLoadingAi(true);
    setError("");

    try {
      const data = new FormData();
      data.append("image", recognitionImage);

      const response = await fetch(apiPath("/api/recognize"), {
        method: "POST",
        body: data,
      });

      if (!response.ok) {
        throw new Error("ai failed");
      }

      const result = (await response.json()) as RecognitionPayload;
      setRecognition(result);
      setForm((current) => ({
        ...current,
        species: current.species || result.species || "",
        lengthCm: current.lengthCm || (result.lengthCm ? String(result.lengthCm) : ""),
        weightKg: current.weightKg || (result.weightKg ? String(result.weightKg) : ""),
        bait: current.bait || result.baitSuggestion || "",
        note: current.note || result.caption || "",
      }));
    } catch {
      setError(t.aiError);
    } finally {
      setLoadingAi(false);
    }
  }

  async function handlePublish() {
    if (mediaFiles.length === 0) {
      setError(t.mediaMissing);
      return;
    }

    if (!form.species.trim()) {
      setError(t.speciesRequired);
      return;
    }

    if (!form.placeId) {
      setError(t.placeRequired);
      return;
    }

    setPublishing(true);
    setError("");

    try {
      const payload = new FormData();
      for (const file of mediaFiles) {
        payload.append("media", file);
      }

      payload.append("species", form.species.trim());
      payload.append("placeId", form.placeId);
      payload.append("lengthCm", form.lengthCm);
      payload.append("weightKg", form.weightKg);
      payload.append("bait", form.bait.trim());
      payload.append("note", form.note.trim());
      payload.append("recognizedSpecies", recognition?.species ?? "");
      payload.append("recognizedLengthCm", recognition?.lengthCm ? String(recognition.lengthCm) : "");
      payload.append("aiConfidence", recognition ? String(recognition.confidence) : "");

      const response = await fetch(apiPath("/api/catches"), {
        method: "POST",
        body: payload,
      });

      if (!response.ok) {
        throw new Error("publish failed");
      }

      startTransition(() => {
        router.push("/feed");
        router.refresh();
      });
    } catch {
      setError(t.publishError);
    } finally {
      setPublishing(false);
    }
  }

  return (
    <div className="space-y-5 px-4 pb-8 pt-safe">
      <header className="space-y-2">
        <p className="text-sm text-text-muted">{t.section}</p>
        <h1 className="font-display text-[30px] font-semibold tracking-tight text-text-main">{t.title}</h1>
      </header>

      <section className="glass-panel rounded-[30px] border border-border-subtle p-4">
        <div className="space-y-3">
          {mediaFiles.length > 0 ? (
            <>
              <div className="relative overflow-hidden rounded-[26px] border border-white/8 bg-black/30">
                {mediaFiles[0]?.type.startsWith("video/") ? (
                  <video src={previewUrls[0]} controls className="aspect-square w-full bg-black object-cover" />
                ) : (
                  <img src={previewUrls[0]} alt={t.pickPhoto} className="aspect-square w-full object-cover" />
                )}
              </div>

              <div className="grid grid-cols-4 gap-3">
                {mediaFiles.map((file, index) => (
                  <div key={`${file.name}-${index}`} className="relative overflow-hidden rounded-[18px] border border-white/8 bg-black/30">
                    {file.type.startsWith("video/") ? (
                      <div className="relative aspect-square">
                        <video src={previewUrls[index]} className="h-full w-full object-cover" />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                          <PlayCircle size={26} className="text-white" />
                        </div>
                      </div>
                    ) : (
                      <img src={previewUrls[index]} alt="" className="aspect-square h-full w-full object-cover" />
                    )}

                    <button
                      type="button"
                      onClick={() => removeMedia(index)}
                      className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <label className="group relative flex aspect-square cursor-pointer items-center justify-center overflow-hidden rounded-[26px] border border-dashed border-white/14 bg-surface-soft">
              <input
                type="file"
                accept="image/*,video/*"
                multiple
                className="hidden"
                onChange={(event) => handleFilesSelection(event.target.files)}
              />

              <div className="flex flex-col items-center gap-4 px-8 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/12 text-primary">
                  <UploadCloud size={30} />
                </div>
                <div className="space-y-1">
                  <div className="font-semibold text-text-main">{t.pickPhoto}</div>
                  <p className="text-sm text-text-muted">{t.pickPhotoDescription}</p>
                </div>
              </div>

              <div className="pointer-events-none absolute inset-0 ring-1 ring-transparent transition group-hover:ring-primary/25" />
            </label>
          )}

          <div className="flex items-center justify-between gap-3">
            <div className="text-xs font-medium text-text-muted">{t.mediaLimit}</div>
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-white/10 bg-white/6 px-3 py-2 text-xs font-semibold text-text-main transition hover:bg-white/10">
              <ImagePlus size={14} />
              <span>{t.addMore}</span>
              <input
                type="file"
                accept="image/*,video/*"
                multiple
                className="hidden"
                onChange={(event) => handleFilesSelection(event.target.files)}
              />
            </label>
          </div>
        </div>

        {mediaFiles.length > 0 ? (
          <button
            onClick={handleRecognize}
            disabled={loadingAi || !recognitionImage}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-[20px] border border-primary/20 bg-primary/12 px-4 py-4 font-semibold text-primary disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loadingAi ? <Loader2 size={18} className="animate-spin" /> : <Bot size={18} />}
            <span>{loadingAi ? t.analyzing : t.analyze}</span>
          </button>
        ) : null}
      </section>

      {recognition ? (
        <section className="glass-panel rounded-[28px] border border-border-subtle p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 text-sm text-text-muted">
                <CheckCircle2 size={16} className="text-primary" />
                {t.assistant}
              </div>
              <div className="mt-2 text-xl font-semibold text-text-main">
                {recognition.species ?? t.manualSpecies}
              </div>
            </div>
            <div className="rounded-full bg-white/6 px-3 py-2 text-right">
              <div className="text-sm font-semibold text-text-main">{recognition.confidence}%</div>
              <div className="text-[11px] text-text-muted">{recognition.source === "gemini" ? "Gemini" : "Fallback"}</div>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {recognition.lengthCm ? (
              <span className="rounded-full bg-white/6 px-3 py-1 text-xs font-medium text-text-main">
                {recognition.lengthCm} cm
              </span>
            ) : null}
            {recognition.weightKg ? (
              <span className="rounded-full bg-white/6 px-3 py-1 text-xs font-medium text-text-main">
                {recognition.weightKg} kg
              </span>
            ) : null}
            {recognition.baitSuggestion ? (
              <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                {recognition.baitSuggestion}
              </span>
            ) : null}
          </div>

          {recognition.note ? (
            <div className="mt-3 flex items-start gap-2 rounded-[18px] bg-warning/10 p-3 text-sm text-warning">
              <TriangleAlert size={16} className="mt-0.5 shrink-0" />
              <span>{recognition.note}</span>
            </div>
          ) : null}
        </section>
      ) : null}

      <section className="glass-panel rounded-[28px] border border-border-subtle p-4">
        <div className="grid gap-4">
          <label className="grid gap-2">
            <span className="text-sm font-medium text-text-muted">{t.species}</span>
            <input
              value={form.species}
              onChange={(event) => updateField("species", event.target.value)}
              placeholder={t.species}
              className="rounded-[18px] border border-border-subtle bg-surface-soft px-4 py-3 text-text-main placeholder:text-text-soft focus:border-primary/30 focus:outline-none"
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-medium text-text-muted">{t.place}</span>
            <select
              value={form.placeId}
              onChange={(event) => updateField("placeId", event.target.value)}
              className="rounded-[18px] border border-border-subtle bg-surface-soft px-4 py-3 text-text-main focus:border-primary/30 focus:outline-none"
            >
              {places.map((place) => (
                <option key={place.id} value={place.id} className="bg-background text-text-main">
                  {place.name} · {place.city}
                </option>
              ))}
            </select>
          </label>

          <div className="grid grid-cols-2 gap-4">
            <label className="grid gap-2">
              <span className="text-sm font-medium text-text-muted">{t.length}</span>
              <input
                value={form.lengthCm}
                onChange={(event) => updateField("lengthCm", event.target.value)}
                inputMode="numeric"
                className="rounded-[18px] border border-border-subtle bg-surface-soft px-4 py-3 text-text-main placeholder:text-text-soft focus:border-primary/30 focus:outline-none"
              />
            </label>
            <label className="grid gap-2">
              <span className="text-sm font-medium text-text-muted">{t.weight}</span>
              <input
                value={form.weightKg}
                onChange={(event) => updateField("weightKg", event.target.value)}
                inputMode="decimal"
                className="rounded-[18px] border border-border-subtle bg-surface-soft px-4 py-3 text-text-main placeholder:text-text-soft focus:border-primary/30 focus:outline-none"
              />
            </label>
          </div>

          <label className="grid gap-2">
            <span className="text-sm font-medium text-text-muted">{t.bait}</span>
            <input
              value={form.bait}
              onChange={(event) => updateField("bait", event.target.value)}
              placeholder={t.bait}
              className="rounded-[18px] border border-border-subtle bg-surface-soft px-4 py-3 text-text-main placeholder:text-text-soft focus:border-primary/30 focus:outline-none"
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-medium text-text-muted">{t.note}</span>
            <textarea
              value={form.note}
              onChange={(event) => updateField("note", event.target.value)}
              rows={4}
              placeholder={t.note}
              className="rounded-[18px] border border-border-subtle bg-surface-soft px-4 py-3 text-text-main placeholder:text-text-soft focus:border-primary/30 focus:outline-none"
            />
          </label>
        </div>
      </section>

      {error ? <div className="text-sm text-danger">{error}</div> : null}

      <button
        onClick={handlePublish}
        disabled={publishing}
        className="flex w-full items-center justify-center gap-2 rounded-[20px] bg-primary px-4 py-4 font-semibold text-background shadow-[0_16px_36px_rgba(103,232,178,0.22)] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {publishing ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle2 size={18} />}
        <span>{publishing ? t.publishing : t.publish}</span>
      </button>
    </div>
  );
}

'use client';

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Bot, CheckCircle2, Loader2, TriangleAlert, UploadCloud } from "lucide-react";

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

export function AddCatchForm({ places }: { places: PlaceOption[] }) {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
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
    if (!file) {
      setPreviewUrl(null);
      return;
    }

    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [file]);

  function updateField(name: keyof typeof form, value: string) {
    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function handleRecognize() {
    if (!file) {
      setError("Сначала выбери фото улова.");
      return;
    }

    setLoadingAi(true);
    setError("");

    try {
      const data = new FormData();
      data.append("image", file);

      const response = await fetch("/api/recognize", {
        method: "POST",
        body: data,
      });

      if (!response.ok) {
        throw new Error("AI failed");
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
      setError("Не удалось получить ответ ИИ. Заполни поля вручную и продолжай.");
    } finally {
      setLoadingAi(false);
    }
  }

  async function handlePublish() {
    if (!file) {
      setError("Нужно загрузить фотографию.");
      return;
    }

    if (!form.species.trim()) {
      setError("Укажи вид рыбы.");
      return;
    }

    if (!form.placeId) {
      setError("Выбери место.");
      return;
    }

    setPublishing(true);
    setError("");

    try {
      const payload = new FormData();
      payload.append("image", file);
      payload.append("species", form.species.trim());
      payload.append("placeId", form.placeId);
      payload.append("lengthCm", form.lengthCm);
      payload.append("weightKg", form.weightKg);
      payload.append("bait", form.bait.trim());
      payload.append("note", form.note.trim());
      payload.append("recognizedSpecies", recognition?.species ?? "");
      payload.append("recognizedLengthCm", recognition?.lengthCm ? String(recognition.lengthCm) : "");
      payload.append("aiConfidence", recognition ? String(recognition.confidence) : "");

      const response = await fetch("/api/catches", {
        method: "POST",
        body: payload,
      });

      if (!response.ok) {
        throw new Error("Publish failed");
      }

      startTransition(() => {
        router.push("/feed");
        router.refresh();
      });
    } catch {
      setError("Публикация не удалась. Проверь поля и повтори.");
    } finally {
      setPublishing(false);
    }
  }

  return (
    <div className="space-y-5 px-4 pb-8 pt-safe">
      <header className="space-y-2">
        <p className="text-sm text-text-muted">Добавить улов</p>
        <h1 className="font-display text-[30px] font-semibold tracking-tight text-text-main">
          Сохрани фото, замер и контекст сессии
        </h1>
      </header>

      <section className="glass-panel rounded-[30px] border border-border-subtle p-4">
        <label className="group relative flex aspect-square cursor-pointer items-center justify-center overflow-hidden rounded-[26px] border border-dashed border-white/14 bg-surface-soft">
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(event) => {
              const nextFile = event.target.files?.[0] ?? null;
              setFile(nextFile);
              setRecognition(null);
              setError("");
            }}
          />

          {previewUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={previewUrl} alt="Предпросмотр улова" className="h-full w-full object-cover" />
          ) : (
            <div className="flex flex-col items-center gap-4 px-8 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/12 text-primary">
                <UploadCloud size={30} />
              </div>
              <div className="space-y-1">
                <div className="font-semibold text-text-main">Добавь фото улова</div>
                <p className="text-sm text-text-muted">
                  Камера или галерея. Файл нужен для ИИ и публикации в ленте.
                </p>
              </div>
            </div>
          )}

          <div className="pointer-events-none absolute inset-0 ring-1 ring-transparent transition group-hover:ring-primary/25" />
        </label>

        {file ? (
          <button
            onClick={handleRecognize}
            disabled={loadingAi}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-[20px] border border-primary/20 bg-primary/12 px-4 py-4 font-semibold text-primary disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loadingAi ? <Loader2 size={18} className="animate-spin" /> : <Bot size={18} />}
            <span>{loadingAi ? "ИИ анализирует фото" : "Определить вид и размер"}</span>
          </button>
        ) : null}
      </section>

      {recognition ? (
        <section className="glass-panel rounded-[28px] border border-border-subtle p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 text-sm text-text-muted">
                <CheckCircle2 size={16} className="text-primary" />
                ИИ-помощник
              </div>
              <div className="mt-2 text-xl font-semibold text-text-main">
                {recognition.species ?? "Нужно уточнить вид вручную"}
              </div>
            </div>
            <div className="rounded-full bg-white/6 px-3 py-2 text-right">
              <div className="text-sm font-semibold text-text-main">{recognition.confidence}%</div>
              <div className="text-[11px] text-text-muted">
                {recognition.source === "gemini" ? "Gemini" : "Fallback"}
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {recognition.lengthCm ? (
              <span className="rounded-full bg-white/6 px-3 py-1 text-xs font-medium text-text-main">
                {recognition.lengthCm} см
              </span>
            ) : null}
            {recognition.weightKg ? (
              <span className="rounded-full bg-white/6 px-3 py-1 text-xs font-medium text-text-main">
                {recognition.weightKg} кг
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
            <span className="text-sm font-medium text-text-muted">Вид рыбы</span>
            <input
              value={form.species}
              onChange={(event) => updateField("species", event.target.value)}
              placeholder="Например, щука"
              className="rounded-[18px] border border-border-subtle bg-surface-soft px-4 py-3 text-text-main placeholder:text-text-soft focus:border-primary/30 focus:outline-none"
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-medium text-text-muted">Место</span>
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
              <span className="text-sm font-medium text-text-muted">Длина, см</span>
              <input
                value={form.lengthCm}
                onChange={(event) => updateField("lengthCm", event.target.value)}
                inputMode="numeric"
                className="rounded-[18px] border border-border-subtle bg-surface-soft px-4 py-3 text-text-main placeholder:text-text-soft focus:border-primary/30 focus:outline-none"
              />
            </label>
            <label className="grid gap-2">
              <span className="text-sm font-medium text-text-muted">Вес, кг</span>
              <input
                value={form.weightKg}
                onChange={(event) => updateField("weightKg", event.target.value)}
                inputMode="decimal"
                className="rounded-[18px] border border-border-subtle bg-surface-soft px-4 py-3 text-text-main placeholder:text-text-soft focus:border-primary/30 focus:outline-none"
              />
            </label>
          </div>

          <label className="grid gap-2">
            <span className="text-sm font-medium text-text-muted">Приманка или оснастка</span>
            <input
              value={form.bait}
              onChange={(event) => updateField("bait", event.target.value)}
              placeholder="Воблер 110, джиг 18 г, кукуруза..."
              className="rounded-[18px] border border-border-subtle bg-surface-soft px-4 py-3 text-text-main placeholder:text-text-soft focus:border-primary/30 focus:outline-none"
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-medium text-text-muted">Заметка к публикации</span>
            <textarea
              value={form.note}
              onChange={(event) => updateField("note", event.target.value)}
              rows={4}
              placeholder="Что сработало, какая была проводка, как вела себя рыба..."
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
        <span>{publishing ? "Публикуем улов" : "Опубликовать в ленте"}</span>
      </button>
    </div>
  );
}

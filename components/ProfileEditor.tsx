'use client';

import { useState, useTransition, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Loader2, Save, Upload } from "lucide-react";

type ProfileEditorProps = {
  user: {
    name: string;
    handle: string;
    bio: string | null;
    city: string | null;
    experienceYears: number | null;
    preferredStyles: string | null;
    homeWater: string | null;
    avatarGradient: string;
    avatarPath: string | null;
    bannerPath: string | null;
  };
};

export function ProfileEditor({ user }: ProfileEditorProps) {
  const router = useRouter();
  const [form, setForm] = useState({
    name: user.name,
    bio: user.bio ?? "",
    city: user.city ?? "",
    experienceYears: user.experienceYears ? String(user.experienceYears) : "",
    preferredStyles: user.preferredStyles ?? "",
    homeWater: user.homeWater ?? "",
    avatar: null as File | null,
    banner: null as File | null,
  });
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);

  useEffect(() => {
    if (form.avatar) {
      const url = URL.createObjectURL(form.avatar);
      setAvatarPreview(url);
      return () => URL.revokeObjectURL(url);
    }
    setAvatarPreview(null);
  }, [form.avatar]);

  useEffect(() => {
    if (form.banner) {
      const url = URL.createObjectURL(form.banner);
      setBannerPreview(url);
      return () => URL.revokeObjectURL(url);
    }
    setBannerPreview(null);
  }, [form.banner]);

  async function handleSave() {
    setError("");

    try {
      const payload = new FormData();
      payload.append("name", form.name.trim());
      payload.append("bio", form.bio.trim());
      payload.append("city", form.city.trim());
      payload.append("experienceYears", form.experienceYears.trim());
      payload.append("preferredStyles", form.preferredStyles.trim());
      payload.append("homeWater", form.homeWater.trim());

      if (form.avatar) {
        payload.append("avatar", form.avatar);
      }

      if (form.banner) {
        payload.append("banner", form.banner);
      }

      const response = await fetch("/api/users/me", {
        method: "PATCH",
        body: payload,
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(data?.error ?? "save failed");
      }

      startTransition(() => {
        router.refresh();
      });
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Не удалось сохранить профиль.");
    }
  }

  return (
    <section className="glass-panel rounded-[30px] border border-border-subtle p-4">
      <div className="mb-4 text-sm text-text-muted">Редактирование профиля</div>

      <div className="mb-4 text-sm font-semibold text-text-muted px-2">Внешний вид (кликни чтобы изменить)</div>

      <label className="relative mb-6 block overflow-hidden rounded-[24px] border border-[rgba(255,255,255,0.06)] bg-[linear-gradient(135deg,#0b1520,#17324a)] cursor-pointer group">
        {(bannerPreview || user.bannerPath) ? (
          <Image
            src={bannerPreview || user.bannerPath || ""}
            alt="Баннер профиля"
            width={800}
            height={300}
            className="h-32 w-full object-cover transition-transform group-hover:scale-105"
            unoptimized={!!bannerPreview}
          />
        ) : (
          <div className="h-32 w-full bg-[radial-gradient(circle_at_top_right,rgba(103,232,178,0.32),transparent_35%),linear-gradient(135deg,#08131f,#183449)] transition-opacity group-hover:opacity-80" />
        )}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="flex items-center gap-2 bg-black/60 backdrop-blur rounded-full px-4 py-2 text-sm font-semibold text-white">
            <Upload size={16} /> Обновить баннер
          </div>
        </div>
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(event) => setForm((current) => ({ ...current, banner: event.target.files?.[0] ?? null }))}
        />
      </label>

      <div className="mb-6 flex items-center gap-4">
        <label className="relative cursor-pointer group rounded-full">
          {(avatarPreview || user.avatarPath) ? (
            <Image
              src={avatarPreview || user.avatarPath || ""}
              alt={user.name}
              width={76}
              height={76}
              className="h-[76px] w-[76px] rounded-full object-cover border-2 border-surface-strong shadow-lg"
              unoptimized={!!avatarPreview}
            />
          ) : (
            <div
              className={`flex h-[76px] w-[76px] items-center justify-center rounded-full border-2 border-surface-strong shadow-lg bg-gradient-to-br ${user.avatarGradient}`}
            >
              <span className="font-display text-[26px] font-bold text-slate-950">{user.name.slice(0, 1)}</span>
            </div>
          )}
          <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <Upload size={18} className="text-white" />
          </div>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(event) => setForm((current) => ({ ...current, avatar: event.target.files?.[0] ?? null }))}
          />
        </label>
        <div>
          <div className="text-xl font-bold text-text-main tracking-tight">{user.name}</div>
          <div className="text-[15px] text-primary font-medium">@{user.handle}</div>
        </div>
      </div>

      <div className="mb-6 h-px w-full bg-[rgba(255,255,255,0.06)]" />

      <div className="grid gap-4">
        <input
          value={form.name}
          onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
          placeholder="Имя"
          className="rounded-[18px] border border-border-subtle bg-surface-soft px-4 py-3 text-text-main placeholder:text-text-soft focus:border-primary/30 focus:outline-none"
        />
        <div className="grid grid-cols-2 gap-4">
          <input
            value={form.city}
            onChange={(event) => setForm((current) => ({ ...current, city: event.target.value }))}
            placeholder="Город"
            className="rounded-[18px] border border-border-subtle bg-surface-soft px-4 py-3 text-text-main placeholder:text-text-soft focus:border-primary/30 focus:outline-none"
          />
          <input
            value={form.experienceYears}
            onChange={(event) => setForm((current) => ({ ...current, experienceYears: event.target.value }))}
            placeholder="Стаж, лет"
            inputMode="numeric"
            className="rounded-[18px] border border-border-subtle bg-surface-soft px-4 py-3 text-text-main placeholder:text-text-soft focus:border-primary/30 focus:outline-none"
          />
        </div>
        <input
          value={form.homeWater}
          onChange={(event) => setForm((current) => ({ ...current, homeWater: event.target.value }))}
          placeholder="Основная акватория или регион"
          className="rounded-[18px] border border-border-subtle bg-surface-soft px-4 py-3 text-text-main placeholder:text-text-soft focus:border-primary/30 focus:outline-none"
        />
        <input
          value={form.preferredStyles}
          onChange={(event) => setForm((current) => ({ ...current, preferredStyles: event.target.value }))}
          placeholder="Стили ловли: спиннинг, фидер, лодка"
          className="rounded-[18px] border border-border-subtle bg-surface-soft px-4 py-3 text-text-main placeholder:text-text-soft focus:border-primary/30 focus:outline-none"
        />
        <textarea
          value={form.bio}
          onChange={(event) => setForm((current) => ({ ...current, bio: event.target.value }))}
          rows={4}
          placeholder="Коротко о себе, стиле ловли и том, чем делишься в ленте"
          className="rounded-[18px] border border-border-subtle bg-surface-soft px-4 py-3 text-text-main placeholder:text-text-soft focus:border-primary/30 focus:outline-none"
        />

      </div>

      {error ? <div className="mt-4 text-sm text-danger">{error}</div> : null}

      <button
        type="button"
        onClick={handleSave}
        disabled={isPending || !form.name.trim()}
        className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary px-4 py-3 text-sm font-semibold text-background disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
        <span>{isPending ? "Сохраняем" : "Сохранить профиль"}</span>
      </button>
    </section>
  );
}

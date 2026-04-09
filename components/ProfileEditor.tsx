'use client';

import { useEffect, useState, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Loader2, Save, Upload } from "lucide-react";

import { useLanguage } from "@/components/LanguageProvider";
import { apiPath, withBasePath } from "@/lib/app-paths";
import { languageOptions, type TranslationMap } from "@/lib/i18n";

type ProfileEditorProps = {
  user: {
    name: string;
    handle: string;
    preferredLanguage: string;
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

const translations: TranslationMap<{
  section: string;
  appearance: string;
  interfaceLanguage: string;
  bannerAlt: string;
  updateBanner: string;
  name: string;
  city: string;
  experienceYears: string;
  homeWater: string;
  preferredStyles: string;
  bio: string;
  saveError: string;
  saving: string;
  save: string;
}> = {
  ru: {
    section: "Редактирование профиля",
    appearance: "Внешний вид",
    interfaceLanguage: "Язык интерфейса",
    bannerAlt: "Баннер профиля",
    updateBanner: "Обновить баннер",
    name: "Имя",
    city: "Город",
    experienceYears: "Стаж, лет",
    homeWater: "Основная акватория или регион",
    preferredStyles: "Стили ловли: спиннинг, фидер, лодка",
    bio: "Коротко о себе, стиле ловли и том, чем делишься в ленте",
    saveError: "Не удалось сохранить профиль.",
    saving: "Сохраняем",
    save: "Сохранить профиль",
  },
  en: {
    section: "Edit profile",
    appearance: "Appearance",
    interfaceLanguage: "Interface language",
    bannerAlt: "Profile banner",
    updateBanner: "Update banner",
    name: "Name",
    city: "City",
    experienceYears: "Experience, years",
    homeWater: "Home water or region",
    preferredStyles: "Fishing styles: spinning, feeder, boat",
    bio: "A short note about yourself, your style, and what you share in the feed",
    saveError: "Could not save the profile.",
    saving: "Saving",
    save: "Save profile",
  },
  es: {
    section: "Editar perfil",
    appearance: "Apariencia",
    interfaceLanguage: "Idioma de la interfaz",
    bannerAlt: "Banner del perfil",
    updateBanner: "Actualizar banner",
    name: "Nombre",
    city: "Ciudad",
    experienceYears: "Experiencia, años",
    homeWater: "Zona principal o región",
    preferredStyles: "Estilos: spinning, feeder, barco",
    bio: "Cuéntanos brevemente sobre ti, tu estilo y lo que compartes en el feed",
    saveError: "No se pudo guardar el perfil.",
    saving: "Guardando",
    save: "Guardar perfil",
  },
  fr: {
    section: "Modifier le profil",
    appearance: "Apparence",
    interfaceLanguage: "Langue de l'interface",
    bannerAlt: "Bannière du profil",
    updateBanner: "Mettre à jour la bannière",
    name: "Nom",
    city: "Ville",
    experienceYears: "Expérience, années",
    homeWater: "Plan d'eau principal ou région",
    preferredStyles: "Styles: spinning, feeder, bateau",
    bio: "Quelques mots sur vous, votre style et ce que vous partagez dans le feed",
    saveError: "Impossible d'enregistrer le profil.",
    saving: "Enregistrement",
    save: "Enregistrer le profil",
  },
  pt: {
    section: "Editar perfil",
    appearance: "Aparência",
    interfaceLanguage: "Idioma da interface",
    bannerAlt: "Banner do perfil",
    updateBanner: "Atualizar banner",
    name: "Nome",
    city: "Cidade",
    experienceYears: "Experiência, anos",
    homeWater: "Água principal ou região",
    preferredStyles: "Estilos: spinning, feeder, barco",
    bio: "Fale brevemente sobre você, seu estilo e o que compartilha no feed",
    saveError: "Não foi possível salvar o perfil.",
    saving: "Salvando",
    save: "Salvar perfil",
  },
};

export function ProfileEditor({ user }: ProfileEditorProps) {
  const router = useRouter();
  const { lang, setLanguage } = useLanguage();
  const t = translations[lang];
  const [form, setForm] = useState({
    name: user.name,
    preferredLanguage: user.preferredLanguage,
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
    if (!form.avatar) {
      setAvatarPreview(null);
      return;
    }

    const url = URL.createObjectURL(form.avatar);
    setAvatarPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [form.avatar]);

  useEffect(() => {
    if (!form.banner) {
      setBannerPreview(null);
      return;
    }

    const url = URL.createObjectURL(form.banner);
    setBannerPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [form.banner]);

  async function handleSave() {
    setError("");

    try {
      const payload = new FormData();
      payload.append("name", form.name.trim());
      payload.append("preferredLanguage", form.preferredLanguage);
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

      const response = await fetch(apiPath("/api/users/me"), {
        method: "PATCH",
        body: payload,
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(data?.error ?? "save failed");
      }

      setLanguage(form.preferredLanguage, { refresh: false });
      startTransition(() => {
        router.refresh();
      });
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : t.saveError);
    }
  }

  return (
    <section className="glass-panel rounded-[30px] border border-border-subtle p-4">
      <div className="mb-4 text-sm text-text-muted">{t.section}</div>
      <div className="mb-4 px-2 text-sm font-semibold text-text-muted">{t.appearance}</div>

      <label className="group relative mb-6 block cursor-pointer overflow-hidden rounded-[24px] border border-[rgba(255,255,255,0.06)] bg-[linear-gradient(135deg,#0b1520,#17324a)]">
        {bannerPreview || user.bannerPath ? (
          <Image
            src={bannerPreview || withBasePath(user.bannerPath || "")}
            alt={t.bannerAlt}
            width={800}
            height={300}
            className="h-32 w-full object-cover transition-transform group-hover:scale-105"
            unoptimized={Boolean(bannerPreview)}
          />
        ) : (
          <div className="h-32 w-full bg-[radial-gradient(circle_at_top_right,rgba(103,232,178,0.32),transparent_35%),linear-gradient(135deg,#08131f,#183449)] transition-opacity group-hover:opacity-80" />
        )}
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
          <div className="flex items-center gap-2 rounded-full bg-black/60 px-4 py-2 text-sm font-semibold text-white backdrop-blur">
            <Upload size={16} /> {t.updateBanner}
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
        <label className="group relative cursor-pointer rounded-full">
          {avatarPreview || user.avatarPath ? (
            <Image
              src={avatarPreview || withBasePath(user.avatarPath || "")}
              alt={user.name}
              width={76}
              height={76}
              className="h-[76px] w-[76px] rounded-full border-2 border-surface-strong object-cover shadow-lg"
              unoptimized={Boolean(avatarPreview)}
            />
          ) : (
            <div className={`flex h-[76px] w-[76px] items-center justify-center rounded-full border-2 border-surface-strong bg-gradient-to-br ${user.avatarGradient} shadow-lg`}>
              <span className="font-display text-[26px] font-bold text-slate-950">{user.name.slice(0, 1)}</span>
            </div>
          )}
          <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
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
          <div className="text-xl font-bold tracking-tight text-text-main">{user.name}</div>
          <div className="text-[15px] font-medium text-primary">@{user.handle}</div>
        </div>
      </div>

      <div className="mb-6 h-px w-full bg-[rgba(255,255,255,0.06)]" />

      <div className="grid gap-4">
        <div className="rounded-[18px] border border-border-subtle bg-surface-soft px-4 py-3">
          <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-text-muted">
            {t.interfaceLanguage}
          </div>
          <select
            value={form.preferredLanguage}
            onChange={(event) => setForm((current) => ({ ...current, preferredLanguage: event.target.value }))}
            className="w-full bg-transparent text-text-main focus:outline-none"
          >
            {languageOptions.map((option) => (
              <option key={option.code} value={option.code} className="bg-background text-text-main">
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <input
          value={form.name}
          onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
          placeholder={t.name}
          className="rounded-[18px] border border-border-subtle bg-surface-soft px-4 py-3 text-text-main placeholder:text-text-soft focus:border-primary/30 focus:outline-none"
        />
        <div className="grid grid-cols-2 gap-4">
          <input
            value={form.city}
            onChange={(event) => setForm((current) => ({ ...current, city: event.target.value }))}
            placeholder={t.city}
            className="rounded-[18px] border border-border-subtle bg-surface-soft px-4 py-3 text-text-main placeholder:text-text-soft focus:border-primary/30 focus:outline-none"
          />
          <input
            value={form.experienceYears}
            onChange={(event) => setForm((current) => ({ ...current, experienceYears: event.target.value }))}
            placeholder={t.experienceYears}
            inputMode="numeric"
            className="rounded-[18px] border border-border-subtle bg-surface-soft px-4 py-3 text-text-main placeholder:text-text-soft focus:border-primary/30 focus:outline-none"
          />
        </div>
        <input
          value={form.homeWater}
          onChange={(event) => setForm((current) => ({ ...current, homeWater: event.target.value }))}
          placeholder={t.homeWater}
          className="rounded-[18px] border border-border-subtle bg-surface-soft px-4 py-3 text-text-main placeholder:text-text-soft focus:border-primary/30 focus:outline-none"
        />
        <input
          value={form.preferredStyles}
          onChange={(event) => setForm((current) => ({ ...current, preferredStyles: event.target.value }))}
          placeholder={t.preferredStyles}
          className="rounded-[18px] border border-border-subtle bg-surface-soft px-4 py-3 text-text-main placeholder:text-text-soft focus:border-primary/30 focus:outline-none"
        />
        <textarea
          value={form.bio}
          onChange={(event) => setForm((current) => ({ ...current, bio: event.target.value }))}
          rows={4}
          placeholder={t.bio}
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
        <span>{isPending ? t.saving : t.save}</span>
      </button>
    </section>
  );
}

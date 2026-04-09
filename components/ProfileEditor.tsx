'use client';

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Drawer } from "vaul";
import { Loader2, Pencil, Save, Upload, X } from "lucide-react";

import { useLanguage } from "@/components/LanguageProvider";
import { useToast } from "@/components/ToastProvider";
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
  open: string;
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
  saveSuccess: string;
  saving: string;
  save: string;
  noPhoto: string;
}> = {
  ru: {
    open: "Редактировать профиль",
    section: "Редактирование профиля",
    appearance: "Внешний вид",
    interfaceLanguage: "Язык интерфейса",
    bannerAlt: "Баннер профиля",
    updateBanner: "Обновить баннер",
    name: "Имя",
    city: "Город",
    experienceYears: "Стаж, лет",
    homeWater: "Основная акватория или регион",
    preferredStyles: "Стили ловли",
    bio: "Коротко о себе, стиле ловли и том, чем делишься в ленте",
    saveError: "Не удалось сохранить профиль.",
    saveSuccess: "Профиль обновлен",
    saving: "Сохраняем",
    save: "Сохранить профиль",
    noPhoto: "Нет фото",
  },
  en: {
    open: "Edit profile",
    section: "Edit profile",
    appearance: "Appearance",
    interfaceLanguage: "Interface language",
    bannerAlt: "Profile banner",
    updateBanner: "Update banner",
    name: "Name",
    city: "City",
    experienceYears: "Experience, years",
    homeWater: "Home water or region",
    preferredStyles: "Fishing styles",
    bio: "A short note about yourself, your style, and what you share in the feed",
    saveError: "Could not save the profile.",
    saveSuccess: "Profile updated",
    saving: "Saving",
    save: "Save profile",
    noPhoto: "No photo",
  },
  es: {
    open: "Editar perfil",
    section: "Editar perfil",
    appearance: "Apariencia",
    interfaceLanguage: "Idioma de la interfaz",
    bannerAlt: "Banner del perfil",
    updateBanner: "Actualizar banner",
    name: "Nombre",
    city: "Ciudad",
    experienceYears: "Experiencia, años",
    homeWater: "Zona principal o región",
    preferredStyles: "Estilos de pesca",
    bio: "Cuéntanos brevemente sobre ti, tu estilo y lo que compartes en el feed",
    saveError: "No se pudo guardar el perfil.",
    saveSuccess: "Perfil actualizado",
    saving: "Guardando",
    save: "Guardar perfil",
    noPhoto: "Sin foto",
  },
  fr: {
    open: "Modifier le profil",
    section: "Modifier le profil",
    appearance: "Apparence",
    interfaceLanguage: "Langue de l'interface",
    bannerAlt: "Bannière du profil",
    updateBanner: "Mettre à jour la bannière",
    name: "Nom",
    city: "Ville",
    experienceYears: "Expérience, années",
    homeWater: "Plan d'eau principal ou région",
    preferredStyles: "Styles de pêche",
    bio: "Quelques mots sur vous, votre style et ce que vous partagez dans le feed",
    saveError: "Impossible d'enregistrer le profil.",
    saveSuccess: "Profil mis à jour",
    saving: "Enregistrement",
    save: "Enregistrer le profil",
    noPhoto: "Sans photo",
  },
  pt: {
    open: "Editar perfil",
    section: "Editar perfil",
    appearance: "Aparência",
    interfaceLanguage: "Idioma da interface",
    bannerAlt: "Banner do perfil",
    updateBanner: "Atualizar banner",
    name: "Nome",
    city: "Cidade",
    experienceYears: "Experiência, anos",
    homeWater: "Água principal ou região",
    preferredStyles: "Estilos de pesca",
    bio: "Fale brevemente sobre você, seu estilo e o que compartilha no feed",
    saveError: "Não foi possível salvar o perfil.",
    saveSuccess: "Perfil atualizado",
    saving: "Salvando",
    save: "Salvar perfil",
    noPhoto: "Sem foto",
  },
};

export function ProfileEditor({ user }: ProfileEditorProps) {
  const router = useRouter();
  const { lang, setLanguage } = useLanguage();
  const { pushToast } = useToast();
  const t = translations[lang];
  const [open, setOpen] = useState(false);
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
  const [pending, setPending] = useState(false);
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
    if (pending) {
      return;
    }

    setError("");
    setPending(true);

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
        throw new Error(data?.error ?? t.saveError);
      }

      setLanguage(form.preferredLanguage, { refresh: false });
      pushToast({
        tone: "success",
        title: t.saveSuccess,
      });
      setOpen(false);
      router.refresh();
    } catch (saveError) {
      const nextError = saveError instanceof Error ? saveError.message : t.saveError;
      setError(nextError);
      pushToast({
        tone: "error",
        title: t.saveError,
        description: nextError,
      });
    } finally {
      setPending(false);
    }
  }

  return (
    <Drawer.Root open={open} onOpenChange={setOpen}>
      <Drawer.Trigger asChild>
        <button
          type="button"
          className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-4 py-3 text-sm font-semibold text-background shadow-[0_8px_24px_rgba(103,232,178,0.24)] transition hover:bg-primary-strong"
        >
          <Pencil size={16} />
          <span>{t.open}</span>
        </button>
      </Drawer.Trigger>

      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-[1000] bg-black/80 backdrop-blur-md" />
        <Drawer.Content
          className="fixed bottom-0 left-0 right-0 z-[1001] mx-auto mt-24 flex max-h-[92vh] max-w-md flex-col overflow-hidden rounded-t-[36px] border-t border-white/10 bg-[#07111c] outline-none"
          style={{
            backgroundImage: `linear-gradient(180deg, rgba(5, 9, 15, 0.82), rgba(5, 9, 15, 0.98)), url('${withBasePath("/modal-backgrounds/profile-panel-bg.png")}')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="hide-scrollbar flex-1 overflow-y-auto p-5 pb-safe">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xl font-bold text-text-main">
                <Pencil size={20} className="text-primary" />
                {t.section}
              </div>
              <Drawer.Close asChild>
                <button
                  type="button"
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-soft text-text-muted"
                >
                  <X size={16} />
                </button>
              </Drawer.Close>
            </div>

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
                  <div className="flex h-[76px] w-[76px] items-center justify-center rounded-full border-2 border-dashed border-white/10 bg-black/20 text-center text-[11px] font-semibold text-text-muted shadow-lg">
                    {t.noPhoto}
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
              disabled={pending || !form.name.trim()}
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-4 py-3 text-sm font-semibold text-background disabled:cursor-not-allowed disabled:opacity-60"
            >
              {pending ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              <span>{pending ? t.saving : t.save}</span>
            </button>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}

'use client';

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Drawer } from "vaul";
import { Loader2, MessagesSquare, Plus, X } from "lucide-react";

import { useLanguage } from "@/components/LanguageProvider";
import { useToast } from "@/components/ToastProvider";
import { apiPath, withBasePath } from "@/lib/app-paths";
import type { TranslationMap } from "@/lib/i18n";

const translations: TranslationMap<{
  title: string;
  chatName: string;
  chatDescription: string;
  open: string;
  private: string;
  region: string;
  invite: string;
  creating: string;
  create: string;
  genericError: string;
}> = {
  ru: {
    title: "Новый чат",
    chatName: "Название чата",
    chatDescription: "О чем чат и зачем он нужен",
    open: "Открытый",
    private: "Приватный",
    region: "Регион",
    invite: "Пригласить рыбаков",
    creating: "Создаем...",
    create: "Создать чат",
    genericError: "Не удалось создать чат.",
  },
  en: {
    title: "New chat",
    chatName: "Chat title",
    chatDescription: "What this chat is about",
    open: "Open",
    private: "Private",
    region: "Region",
    invite: "Invite anglers",
    creating: "Creating...",
    create: "Create chat",
    genericError: "Could not create the chat.",
  },
  es: {
    title: "Nuevo chat",
    chatName: "Nombre del chat",
    chatDescription: "De qué trata este chat",
    open: "Abierto",
    private: "Privado",
    region: "Región",
    invite: "Invitar pescadores",
    creating: "Creando...",
    create: "Crear chat",
    genericError: "No se pudo crear el chat.",
  },
  fr: {
    title: "Nouveau chat",
    chatName: "Nom du chat",
    chatDescription: "De quoi parle ce chat",
    open: "Ouvert",
    private: "Privé",
    region: "Région",
    invite: "Inviter des pêcheurs",
    creating: "Création...",
    create: "Créer le chat",
    genericError: "Impossible de créer le chat.",
  },
  pt: {
    title: "Novo chat",
    chatName: "Nome do chat",
    chatDescription: "Sobre o que é este chat",
    open: "Aberto",
    private: "Privado",
    region: "Região",
    invite: "Convidar pescadores",
    creating: "Criando...",
    create: "Criar chat",
    genericError: "Não foi possível criar o chat.",
  },
};

export function CreateChatForm() {
  const router = useRouter();
  const { lang } = useLanguage();
  const { pushToast } = useToast();
  const t = translations[lang];
  const [form, setForm] = useState({
    title: "",
    description: "",
    visibility: "OPEN" as "OPEN" | "PRIVATE",
    locationLabel: "",
    inviteHandles: "",
  });
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  async function handleCreateChat() {
    setError("");

    try {
      const response = await fetch(apiPath("/api/chats"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: form.title.trim(),
          description: form.description.trim(),
          visibility: form.visibility,
          locationLabel: form.locationLabel.trim(),
          inviteHandles: form.inviteHandles
            .split(/[,\s]+/)
            .map((item) => item.trim().replace(/^@/, ""))
            .filter(Boolean),
        }),
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(data?.error ?? t.genericError);
      }

      const created = (await response.json()) as { slug: string };
      setForm({
        title: "",
        description: "",
        visibility: "OPEN",
        locationLabel: "",
        inviteHandles: "",
      });
      setOpen(false);
      pushToast({
        tone: "success",
        title: "Чат создан",
      });
      startTransition(() => {
        router.push(`/chats/${created.slug}`);
        router.refresh();
      });
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : t.genericError);
      pushToast({
        tone: "error",
        title: "Не удалось создать чат",
      });
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-24 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-background shadow-[0_10px_30px_rgba(103,232,178,0.35)] transition-transform active:scale-95"
      >
        <MessagesSquare size={24} />
      </button>

      <Drawer.Root open={open} onOpenChange={setOpen}>
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 z-[1000] bg-black/60 backdrop-blur-sm" />
          <Drawer.Content
            className="fixed bottom-0 left-0 right-0 z-[1001] mx-auto mt-24 flex max-h-[90vh] max-w-md flex-col rounded-t-[32px] border-t border-[rgba(255,255,255,0.05)] bg-surface-strong outline-none"
            style={{
              backgroundImage: `linear-gradient(180deg, rgba(5, 9, 15, 0.82), rgba(5, 9, 15, 0.98)), url('${withBasePath("/modal-backgrounds/chat-sheet-bg.png")}')`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <div className="hide-scrollbar flex-1 overflow-y-auto rounded-t-[32px] p-5 pb-safe">
              <div className="mx-auto mb-6 h-1.5 w-12 flex-shrink-0 rounded-full bg-[rgba(255,255,255,0.2)]" />

              <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xl font-bold text-text-main">
                  <MessagesSquare size={22} className="text-primary" />
                  {t.title}
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-soft text-text-muted"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="grid gap-4">
                <input
                  value={form.title}
                  onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
                  placeholder={t.chatName}
                  className="rounded-[20px] border border-[rgba(255,255,255,0.06)] bg-surface px-4 py-4 text-[15px] font-medium text-text-main placeholder:text-text-soft transition-all focus:border-primary/40 focus:outline-none focus:ring-4 focus:ring-primary/10"
                />
                <textarea
                  value={form.description}
                  onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                  rows={3}
                  placeholder={t.chatDescription}
                  className="rounded-[20px] border border-[rgba(255,255,255,0.06)] bg-surface px-4 py-4 text-[15px] text-text-main placeholder:text-text-soft transition-all focus:border-primary/40 focus:outline-none focus:ring-4 focus:ring-primary/10"
                />

                <div className="grid grid-cols-2 gap-3">
                  <select
                    value={form.visibility}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, visibility: event.target.value as "OPEN" | "PRIVATE" }))
                    }
                    className="appearance-none rounded-[20px] border border-[rgba(255,255,255,0.06)] bg-surface px-4 py-4 text-[15px] text-text-main transition-all focus:border-primary/40 focus:outline-none focus:ring-4 focus:ring-primary/10"
                  >
                    <option value="OPEN">{t.open}</option>
                    <option value="PRIVATE">{t.private}</option>
                  </select>
                  <input
                    value={form.locationLabel}
                    onChange={(event) => setForm((current) => ({ ...current, locationLabel: event.target.value }))}
                    placeholder={t.region}
                    className="rounded-[20px] border border-[rgba(255,255,255,0.06)] bg-surface px-4 py-4 text-[15px] text-text-main placeholder:text-text-soft transition-all focus:border-primary/40 focus:outline-none focus:ring-4 focus:ring-primary/10"
                  />
                </div>

                <div>
                  <div className="mb-2 px-1 text-xs font-semibold uppercase tracking-wider text-text-muted">{t.invite}</div>
                  <input
                    value={form.inviteHandles}
                    onChange={(event) => setForm((current) => ({ ...current, inviteHandles: event.target.value }))}
                    placeholder="@handle1, @handle2"
                    className="w-full rounded-[20px] border border-[rgba(255,255,255,0.06)] bg-surface px-4 py-4 text-[15px] text-text-main placeholder:text-text-soft transition-all focus:border-primary/40 focus:outline-none focus:ring-4 focus:ring-primary/10"
                  />
                </div>
              </div>

              {error ? <div className="mt-4 rounded-xl bg-danger/10 p-3 text-sm font-medium text-danger">{error}</div> : null}

              <button
                type="button"
                onClick={handleCreateChat}
                disabled={isPending || !form.title.trim()}
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-[22px] bg-primary px-4 py-4 text-[16px] font-bold text-background shadow-[0_8px_24px_rgba(103,232,178,0.24)] transition-transform active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none"
              >
                {isPending ? <Loader2 size={20} className="animate-spin" /> : <Plus size={20} />}
                <span>{isPending ? t.creating : t.create}</span>
              </button>
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    </>
  );
}

'use client';

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, MessagesSquare, Plus, X } from "lucide-react";
import { Drawer } from "vaul";
import { apiPath } from "@/lib/app-paths";

export function CreateChatForm() {
  const router = useRouter();
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
        throw new Error(data?.error ?? "create failed");
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
      startTransition(() => {
        router.push(`/chats/${created.slug}`);
        router.refresh();
      });
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : "Не удалось создать чат.");
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
          <Drawer.Content className="fixed bottom-0 left-0 right-0 z-[1001] mx-auto mt-24 flex max-h-[90vh] max-w-md flex-col rounded-t-[32px] border-t border-[rgba(255,255,255,0.05)] bg-surface-strong outline-none">
            <div className="flex-1 overflow-y-auto rounded-t-[32px] p-5 pb-safe hide-scrollbar">
              <div className="mx-auto mb-6 h-1.5 w-12 flex-shrink-0 rounded-full bg-[rgba(255,255,255,0.2)]" />
              
              <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xl font-bold text-text-main">
                  <MessagesSquare size={22} className="text-primary" />
                  Новый чат
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
                  placeholder="Название чата (например, Спиннингисты)"
                  className="rounded-[20px] border border-[rgba(255,255,255,0.06)] bg-surface px-4 py-4 text-[15px] font-medium text-text-main placeholder:text-text-soft focus:border-primary/40 focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all"
                />
                <textarea
                  value={form.description}
                  onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                  rows={3}
                  placeholder="Что обсуждаете, как часто пишете и чем чат полезен"
                  className="rounded-[20px] border border-[rgba(255,255,255,0.06)] bg-surface px-4 py-4 text-[15px] text-text-main placeholder:text-text-soft focus:border-primary/40 focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all"
                />
                
                <div className="grid grid-cols-2 gap-3">
                  <select
                    value={form.visibility}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, visibility: event.target.value as "OPEN" | "PRIVATE" }))
                    }
                    className="rounded-[20px] border border-[rgba(255,255,255,0.06)] bg-surface px-4 py-4 text-[15px] text-text-main focus:border-primary/40 focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all appearance-none"
                  >
                    <option value="OPEN">Открытый</option>
                    <option value="PRIVATE">Приватный</option>
                  </select>
                  <input
                    value={form.locationLabel}
                    onChange={(event) => setForm((current) => ({ ...current, locationLabel: event.target.value }))}
                    placeholder="Регион"
                    className="rounded-[20px] border border-[rgba(255,255,255,0.06)] bg-surface px-4 py-4 text-[15px] text-text-main placeholder:text-text-soft focus:border-primary/40 focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all"
                  />
                </div>
                
                <div>
                  <div className="mb-2 text-xs font-semibold text-text-muted px-1 uppercase tracking-wider">Пригласить рыбаков</div>
                  <input
                    value={form.inviteHandles}
                    onChange={(event) => setForm((current) => ({ ...current, inviteHandles: event.target.value }))}
                    placeholder="@handle1, @handle2"
                    className="w-full rounded-[20px] border border-[rgba(255,255,255,0.06)] bg-surface px-4 py-4 text-[15px] text-text-main placeholder:text-text-soft focus:border-primary/40 focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all"
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
                <span>{isPending ? "Создаем..." : "Создать чат"}</span>
              </button>
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    </>
  );
}

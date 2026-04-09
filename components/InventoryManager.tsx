'use client';

import { useRef, useState, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Backpack, Camera, Loader2, Plus, Trash2, X } from "lucide-react";
import { apiPath, withBasePath } from "@/lib/app-paths";

type InventoryItem = {
  id: string;
  name: string;
  category: string;
  quantity: number;
  notes: string | null;
  imagePath: string | null;
};

export function InventoryManager({ items }: { items: InventoryItem[] }) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [form, setForm] = useState<{
    name: string;
    category: string;
    quantity: number;
    notes: string;
    image: File | null;
    preview: string | null;
  }>({
    name: "",
    category: "",
    quantity: 1,
    notes: "",
    image: null,
    preview: null,
  });
  
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (form.preview) {
      URL.revokeObjectURL(form.preview);
    }

    setForm((current) => ({
      ...current,
      image: file,
      preview: URL.createObjectURL(file),
    }));
  }

  function handleClearImage() {
    if (form.preview) {
      URL.revokeObjectURL(form.preview);
    }
    setForm((current) => ({
      ...current,
      image: null,
      preview: null,
    }));
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  async function handleCreate() {
    setError("");

    try {
      const formData = new FormData();
      formData.append("name", form.name.trim());
      formData.append("category", form.category.trim());
      formData.append("quantity", form.quantity.toString());
      formData.append("notes", form.notes.trim());
      if (form.image) {
        formData.append("image", form.image);
      }

      const response = await fetch(apiPath("/api/users/me/inventory"), {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(payload?.error ?? "create failed");
      }

      if (form.preview) {
         URL.revokeObjectURL(form.preview);
      }

      setForm({
        name: "",
        category: "",
        quantity: 1,
        notes: "",
        image: null,
        preview: null,
      });
      if (fileInputRef.current) {
         fileInputRef.current.value = "";
      }
      
      startTransition(() => {
        router.refresh();
      });
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : "Не удалось добавить предмет.");
    }
  }

  async function handleDelete(itemId: string) {
    setError("");

    const response = await fetch(apiPath(`/api/users/me/inventory/${itemId}`), {
      method: "DELETE",
    });

    if (!response.ok) {
      setError("Не удалось удалить предмет.");
      return;
    }

    startTransition(() => {
      router.refresh();
    });
  }

  return (
    <section className="glass-panel rounded-[30px] border border-border-subtle p-4">
      <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-text-main">
        <Backpack size={16} className="text-primary" />
        Инвентарь
      </div>

      <div className="grid gap-3 rounded-[24px] border border-border-subtle bg-white/4 p-4">
        <input
          value={form.name}
          onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
          placeholder="Что есть в снаряжении"
          className="rounded-[18px] border border-border-subtle bg-surface-soft px-4 py-3 text-text-main placeholder:text-text-soft focus:border-primary/30 focus:outline-none"
        />
        <div className="grid grid-cols-[1fr_96px] gap-3">
          <input
            value={form.category}
            onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))}
            placeholder="Категория"
            className="rounded-[18px] border border-border-subtle bg-surface-soft px-4 py-3 text-text-main placeholder:text-text-soft focus:border-primary/30 focus:outline-none"
          />
          <input
            type="number"
            min={1}
            max={20}
            value={form.quantity}
            onChange={(event) =>
              setForm((current) => ({ ...current, quantity: Number(event.target.value || 1) }))
            }
            className="rounded-[18px] border border-border-subtle bg-surface-soft px-4 py-3 text-text-main focus:border-primary/30 focus:outline-none"
          />
        </div>
        <div className="flex items-start gap-4">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="group relative flex h-[58px] w-[58px] shrink-0 flex-col items-center justify-center overflow-hidden rounded-[16px] border border-dashed border-border-subtle bg-surface-soft text-text-muted hover:border-primary/50 hover:bg-white/10 hover:text-text-main transition-all"
          >
            {form.preview ? (
               <Image src={withBasePath(form.preview)} alt="Preview" fill className="object-cover" />
            ) : (
               <Camera size={20} className="mb-0.5 group-hover:scale-110 transition-transform" />
            )}
          </button>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={handleFileChange}
          />

          {form.preview && (
            <button
               type="button"
               onClick={handleClearImage}
               className="absolute top-6 left-6 z-10 p-1 bg-black/60 rounded-full text-white hover:bg-danger/80"
            >
               <X size={14} />
            </button>
          )}

          <textarea
            value={form.notes}
            onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))}
            rows={2}
            placeholder="Комментарий: состояние, длина, тест, роль"
            className="flex-1 rounded-[18px] border border-border-subtle bg-surface-soft px-4 py-3 text-text-main placeholder:text-text-soft focus:border-primary/30 focus:outline-none resize-none"
          />
        </div>
        
        <button
          type="button"
          onClick={handleCreate}
          disabled={isPending || !form.name.trim() || !form.category.trim()}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-4 py-3 text-sm font-semibold text-background disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
          <span>{isPending ? "Добавляем" : "Добавить в инвентарь"}</span>
        </button>
      </div>

      {error ? <div className="mt-3 text-sm text-danger">{error}</div> : null}

      <div className="mt-4 space-y-3">
        {items.length > 0 ? (
          items.map((item) => (
            <div
              key={item.id}
              className="flex items-start justify-between gap-3 rounded-[22px] border border-border-subtle bg-white/4 p-4"
            >
              <div className="flex gap-4">
                 {item.imagePath ? (
                    <div className="h-14 w-14 shrink-0 rounded-[12px] bg-surface overflow-hidden relative">
                       <Image src={withBasePath(item.imagePath)} alt={item.name} fill className="object-cover" />
                    </div>
                 ) : (
                    <div className="h-14 w-14 shrink-0 rounded-[12px] bg-black/20 flex flex-col items-center justify-center border border-white/5">
                       <Backpack size={18} className="text-white/20" />
                    </div>
                 )}
                 <div>
                   <div className="font-semibold text-text-main">{item.name}</div>
                   <div className="mt-0.5 flex gap-2 text-xs text-text-muted">
                     <span className="bg-white/5 px-2 py-0.5 rounded-md">{item.category}</span>
                     <span className="bg-white/5 px-2 py-0.5 rounded-md">{item.quantity} шт.</span>
                   </div>
                   {item.notes ? <div className="mt-2 text-sm leading-6 text-text-soft">{item.notes}</div> : null}
                 </div>
              </div>
              <button
                type="button"
                onClick={() => void handleDelete(item.id)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border-subtle bg-white/4 text-text-muted transition hover:border-danger/30 hover:text-danger"
                aria-label="Удалить предмет"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))
        ) : (
          <div className="rounded-[22px] border border-dashed border-border-subtle px-4 py-5 text-sm text-text-muted">
            Пока нет списка снастей. Добавь то, что реально лежит в машине, лодке или рюкзаке.
          </div>
        )}
      </div>
    </section>
  );
}

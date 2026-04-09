'use client';

import { useRef, useState, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Backpack, Camera, Loader2, Plus, Trash2, X } from "lucide-react";

import { useLanguage } from "@/components/LanguageProvider";
import { apiPath, withBasePath } from "@/lib/app-paths";
import type { TranslationMap } from "@/lib/i18n";

type InventoryItem = {
  id: string;
  name: string;
  category: string;
  quantity: number;
  notes: string | null;
  imagePath: string | null;
};

const translations: TranslationMap<{
  title: string;
  itemName: string;
  category: string;
  notes: string;
  addError: string;
  deleteError: string;
  add: string;
  adding: string;
  quantityUnit: string;
  delete: string;
  empty: string;
}> = {
  ru: {
    title: "Инвентарь",
    itemName: "Что есть в снаряжении",
    category: "Категория",
    notes: "Комментарий: состояние, длина, тест, роль",
    addError: "Не удалось добавить предмет.",
    deleteError: "Не удалось удалить предмет.",
    add: "Добавить в инвентарь",
    adding: "Добавляем",
    quantityUnit: "шт.",
    delete: "Удалить предмет",
    empty: "Пока нет списка снастей. Добавь то, что реально лежит в машине, лодке или рюкзаке.",
  },
  en: {
    title: "Inventory",
    itemName: "What you have in your gear",
    category: "Category",
    notes: "Notes: condition, length, test, role",
    addError: "Could not add the item.",
    deleteError: "Could not remove the item.",
    add: "Add to inventory",
    adding: "Adding",
    quantityUnit: "pcs",
    delete: "Delete item",
    empty: "No tackle list yet. Add what you actually keep in the car, boat, or backpack.",
  },
  es: {
    title: "Inventario",
    itemName: "Qué tienes en el equipo",
    category: "Categoría",
    notes: "Comentario: estado, longitud, prueba, función",
    addError: "No se pudo añadir el artículo.",
    deleteError: "No se pudo eliminar el artículo.",
    add: "Añadir al inventario",
    adding: "Añadiendo",
    quantityUnit: "uds.",
    delete: "Eliminar artículo",
    empty: "Todavía no hay lista de equipo. Añade lo que realmente llevas en el coche, barco o mochila.",
  },
  fr: {
    title: "Inventaire",
    itemName: "Ce qu'il y a dans votre matériel",
    category: "Catégorie",
    notes: "Commentaire : état, longueur, test, rôle",
    addError: "Impossible d'ajouter l'objet.",
    deleteError: "Impossible de supprimer l'objet.",
    add: "Ajouter à l'inventaire",
    adding: "Ajout",
    quantityUnit: "pcs",
    delete: "Supprimer l'objet",
    empty: "Aucune liste de matériel pour le moment. Ajoutez ce que vous avez vraiment dans la voiture, le bateau ou le sac.",
  },
  pt: {
    title: "Inventário",
    itemName: "O que há no equipamento",
    category: "Categoria",
    notes: "Comentário: estado, comprimento, teste, função",
    addError: "Não foi possível adicionar o item.",
    deleteError: "Não foi possível remover o item.",
    add: "Adicionar ao inventário",
    adding: "Adicionando",
    quantityUnit: "un.",
    delete: "Excluir item",
    empty: "Ainda não há lista de equipamentos. Adicione o que realmente fica no carro, barco ou mochila.",
  },
};

export function InventoryManager({ items }: { items: InventoryItem[] }) {
  const router = useRouter();
  const { lang } = useLanguage();
  const t = translations[lang];
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

    if (!file) {
      return;
    }

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
      setError(createError instanceof Error ? createError.message : t.addError);
    }
  }

  async function handleDelete(itemId: string) {
    setError("");

    const response = await fetch(apiPath(`/api/users/me/inventory/${itemId}`), {
      method: "DELETE",
    });

    if (!response.ok) {
      setError(t.deleteError);
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
        {t.title}
      </div>

      <div className="grid gap-3 rounded-[24px] border border-border-subtle bg-white/4 p-4">
        <input
          value={form.name}
          onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
          placeholder={t.itemName}
          className="rounded-[18px] border border-border-subtle bg-surface-soft px-4 py-3 text-text-main placeholder:text-text-soft focus:border-primary/30 focus:outline-none"
        />
        <div className="grid grid-cols-[1fr_96px] gap-3">
          <input
            value={form.category}
            onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))}
            placeholder={t.category}
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
            className="group relative flex h-[58px] w-[58px] shrink-0 flex-col items-center justify-center overflow-hidden rounded-[16px] border border-dashed border-border-subtle bg-surface-soft text-text-muted transition-all hover:border-primary/50 hover:bg-white/10 hover:text-text-main"
          >
            {form.preview ? (
              <Image src={form.preview} alt="Preview" fill className="object-cover" unoptimized />
            ) : (
              <Camera size={20} className="mb-0.5 transition-transform group-hover:scale-110" />
            )}
          </button>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={handleFileChange}
          />

          {form.preview ? (
            <button
              type="button"
              onClick={handleClearImage}
              className="absolute left-6 top-6 z-10 rounded-full bg-black/60 p-1 text-white hover:bg-danger/80"
            >
              <X size={14} />
            </button>
          ) : null}

          <textarea
            value={form.notes}
            onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))}
            rows={2}
            placeholder={t.notes}
            className="flex-1 resize-none rounded-[18px] border border-border-subtle bg-surface-soft px-4 py-3 text-text-main placeholder:text-text-soft focus:border-primary/30 focus:outline-none"
          />
        </div>

        <button
          type="button"
          onClick={handleCreate}
          disabled={isPending || !form.name.trim() || !form.category.trim()}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-4 py-3 text-sm font-semibold text-background disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
          <span>{isPending ? t.adding : t.add}</span>
        </button>
      </div>

      {error ? <div className="mt-3 text-sm text-danger">{error}</div> : null}

      <div className="mt-4 space-y-3">
        {items.length > 0 ? (
          items.map((item) => (
            <div key={item.id} className="flex items-start justify-between gap-3 rounded-[22px] border border-border-subtle bg-white/4 p-4">
              <div className="flex gap-4">
                {item.imagePath ? (
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-[12px] bg-surface">
                    <Image src={withBasePath(item.imagePath)} alt={item.name} fill className="object-cover" />
                  </div>
                ) : (
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[12px] border border-white/5 bg-black/20">
                    <Backpack size={18} className="text-white/20" />
                  </div>
                )}
                <div>
                  <div className="font-semibold text-text-main">{item.name}</div>
                  <div className="mt-0.5 flex gap-2 text-xs text-text-muted">
                    <span className="rounded-md bg-white/5 px-2 py-0.5">{item.category}</span>
                    <span className="rounded-md bg-white/5 px-2 py-0.5">
                      {item.quantity} {t.quantityUnit}
                    </span>
                  </div>
                  {item.notes ? <div className="mt-2 text-sm leading-6 text-text-soft">{item.notes}</div> : null}
                </div>
              </div>
              <button
                type="button"
                onClick={() => void handleDelete(item.id)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border-subtle bg-white/4 text-text-muted transition hover:border-danger/30 hover:text-danger"
                aria-label={t.delete}
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))
        ) : (
          <div className="rounded-[22px] border border-dashed border-border-subtle px-4 py-5 text-sm text-text-muted">
            {t.empty}
          </div>
        )}
      </div>
    </section>
  );
}

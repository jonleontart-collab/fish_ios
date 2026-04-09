"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Loader2,
  ShoppingBag,
  Trash2,
} from "lucide-react";

import { useLanguage } from "@/components/LanguageProvider";
import { apiPath } from "@/lib/app-paths";
import { formatDateTime, shoppingStatusLabel, tripStatusLabel } from "@/lib/format";
import type { TranslationMap } from "@/lib/i18n";

type PlaceOption = {
  id: string;
  slug: string;
  name: string;
  city: string;
  source: "SEEDED" | "GEMINI" | "USER";
};

type TripItem = {
  id: string;
  title: string;
  notes: string | null;
  goals: string | null;
  summary: string | null;
  reportImagePath: string | null;
  startAt: Date;
  endAt: Date | null;
  status: "PLANNED" | "CONFIRMED" | "COMPLETED";
  publishedAt: Date | null;
  place: {
    name: string;
    city: string;
    displayImage: string | null;
  };
};

type ShoppingItem = {
  id: string;
  title: string;
  notes: string | null;
  quantity: number;
  status: "PLANNED" | "BOUGHT";
  trip: {
    id: string;
    title: string;
  } | null;
};

type InventoryItem = {
  id: string;
  name: string;
  category: string;
  quantity: number;
};

const translations: TranslationMap<{
  createTripError: string;
  updateTripError: string;
  tripGoals: string;
  tripNotes: string;
  tripSummary: string;
  tripReportPhoto: string;
  publishTrip: string;
  savingTrip: string;
  saveTrip: string;
  createShoppingError: string;
  updateShoppingError: string;
  deleteShoppingError: string;
  statsTrips: string;
  statsShopping: string;
  statsGear: string;
  newTrip: string;
  tripTitle: string;
  tripGoalsShort: string;
  tripNotesShort: string;
  creatingTrip: string;
  createTrip: string;
  noPlaces: string;
  openMap: string;
  shoppingSection: string;
  shoppingTitle: string;
  shoppingLinkNone: string;
  shoppingNotes: string;
  addingShopping: string;
  addShopping: string;
  shoppingTrip: string;
  shoppingDelete: string;
  shoppingBought: string;
  shoppingRestore: string;
  shoppingEmpty: string;
  yourTrips: string;
  plannerTitle: string;
  plannerMeta: (completed: number, inventory: number) => string;
  tripsEmpty: string;
  quantitySuffix: string;
}> = {
  ru: {
    createTripError: "Не удалось создать поездку.",
    updateTripError: "Не удалось обновить поездку.",
    tripGoals: "Цели этой поездки",
    tripNotes: "План, логистика и заметки до выезда",
    tripSummary: "Что получилось после поездки и что можно опубликовать в ленту",
    tripReportPhoto: "Фото для отчета",
    publishTrip: "Опубликовать отчет в общей ленте после завершения",
    savingTrip: "Сохраняем",
    saveTrip: "Сохранить поездку",
    createShoppingError: "Не удалось добавить покупку.",
    updateShoppingError: "Не удалось обновить статус покупки.",
    deleteShoppingError: "Не удалось удалить покупку.",
    statsTrips: "Выездов",
    statsShopping: "Купить",
    statsGear: "Снастей",
    newTrip: "Новая поездка",
    tripTitle: "Название поездки",
    tripGoalsShort: "Что хочешь сделать на рыбалке",
    tripNotesShort: "План, логистика, снасти, тайминг",
    creatingTrip: "Создаем",
    createTrip: "Создать поездку",
    noPlaces: "Сначала добавь или найди реальную точку на карте. После этого можно планировать выезд.",
    openMap: "Открыть карту мест",
    shoppingSection: "Что купить к поездкам",
    shoppingTitle: "Что нужно купить",
    shoppingLinkNone: "Без привязки к поездке",
    shoppingNotes: "Комментарий: размер, цвет, бренд, где купить",
    addingShopping: "Добавляем",
    addShopping: "Добавить в список",
    shoppingTrip: "Поездка",
    shoppingDelete: "Удалить покупку",
    shoppingBought: "Отметить как куплено",
    shoppingRestore: "Вернуть в список",
    shoppingEmpty: "Пока ничего не нужно покупать. Добавляй приманки, расходники и забытые мелочи прямо сюда.",
    yourTrips: "Твои поездки",
    plannerTitle: "Планирование и отчеты",
    plannerMeta: (completed, inventory) => `Завершено ${completed} · В инвентаре ${inventory} позиций`,
    tripsEmpty: "Пока нет поездок. Начни с первой запланированной рыбалки и собери к ней список задач и покупок.",
    quantitySuffix: "шт.",
  },
  en: {
    createTripError: "Could not create the trip.",
    updateTripError: "Could not update the trip.",
    tripGoals: "Goals for this trip",
    tripNotes: "Plan, logistics, and notes before departure",
    tripSummary: "What happened after the trip and what you want to publish to the feed",
    tripReportPhoto: "Photo for the report",
    publishTrip: "Publish the report to the public feed after completion",
    savingTrip: "Saving",
    saveTrip: "Save trip",
    createShoppingError: "Could not add the shopping item.",
    updateShoppingError: "Could not update the shopping status.",
    deleteShoppingError: "Could not delete the shopping item.",
    statsTrips: "Trips",
    statsShopping: "To buy",
    statsGear: "Gear",
    newTrip: "New trip",
    tripTitle: "Trip title",
    tripGoalsShort: "What do you want to do on this trip",
    tripNotesShort: "Plan, logistics, tackle, timing",
    creatingTrip: "Creating",
    createTrip: "Create trip",
    noPlaces: "First add or find a place on the map. After that you can plan a trip.",
    openMap: "Open places map",
    shoppingSection: "Shopping for trips",
    shoppingTitle: "What do you need to buy",
    shoppingLinkNone: "Not linked to a trip",
    shoppingNotes: "Comment: size, color, brand, where to buy",
    addingShopping: "Adding",
    addShopping: "Add to list",
    shoppingTrip: "Trip",
    shoppingDelete: "Delete shopping item",
    shoppingBought: "Mark as bought",
    shoppingRestore: "Return to list",
    shoppingEmpty: "Nothing to buy yet. Add lures, consumables, and small forgotten items here.",
    yourTrips: "Your trips",
    plannerTitle: "Planning and reports",
    plannerMeta: (completed, inventory) => `Completed ${completed} · ${inventory} items in inventory`,
    tripsEmpty: "No trips yet. Start with your first planned session and build a checklist around it.",
    quantitySuffix: "pcs.",
  },
  es: {
    createTripError: "No se pudo crear la salida.",
    updateTripError: "No se pudo actualizar la salida.",
    tripGoals: "Objetivos de esta salida",
    tripNotes: "Plan, logística y notas antes de salir",
    tripSummary: "Qué ocurrió después de la salida y qué quieres publicar en el feed",
    tripReportPhoto: "Foto para el reporte",
    publishTrip: "Publicar el reporte en el feed general tras finalizar",
    savingTrip: "Guardando",
    saveTrip: "Guardar salida",
    createShoppingError: "No se pudo añadir la compra.",
    updateShoppingError: "No se pudo actualizar el estado de la compra.",
    deleteShoppingError: "No se pudo eliminar la compra.",
    statsTrips: "Salidas",
    statsShopping: "Comprar",
    statsGear: "Equipo",
    newTrip: "Nueva salida",
    tripTitle: "Nombre de la salida",
    tripGoalsShort: "Qué quieres hacer en esta salida",
    tripNotesShort: "Plan, logística, equipo, tiempos",
    creatingTrip: "Creando",
    createTrip: "Crear salida",
    noPlaces: "Primero añade o encuentra un lugar en el mapa. Después podrás planificar una salida.",
    openMap: "Abrir mapa de lugares",
    shoppingSection: "Compras para las salidas",
    shoppingTitle: "Qué necesitas comprar",
    shoppingLinkNone: "Sin vincular a una salida",
    shoppingNotes: "Comentario: tamaño, color, marca, dónde comprar",
    addingShopping: "Añadiendo",
    addShopping: "Añadir a la lista",
    shoppingTrip: "Salida",
    shoppingDelete: "Eliminar compra",
    shoppingBought: "Marcar como comprado",
    shoppingRestore: "Volver a la lista",
    shoppingEmpty: "Todavía no hace falta comprar nada. Añade señuelos, consumibles y pequeños olvidos aquí.",
    yourTrips: "Tus salidas",
    plannerTitle: "Planificación y reportes",
    plannerMeta: (completed, inventory) => `Completadas ${completed} · ${inventory} artículos en inventario`,
    tripsEmpty: "Aún no hay salidas. Empieza con la primera y arma una lista de tareas y compras.",
    quantitySuffix: "uds.",
  },
  fr: {
    createTripError: "Impossible de créer la sortie.",
    updateTripError: "Impossible de mettre à jour la sortie.",
    tripGoals: "Objectifs de cette sortie",
    tripNotes: "Plan, logistique et notes avant le départ",
    tripSummary: "Ce qui s'est passé après la sortie et ce que vous voulez publier dans le feed",
    tripReportPhoto: "Photo du rapport",
    publishTrip: "Publier le rapport dans le feed public après la sortie",
    savingTrip: "Enregistrement",
    saveTrip: "Enregistrer la sortie",
    createShoppingError: "Impossible d'ajouter l'achat.",
    updateShoppingError: "Impossible de mettre à jour le statut de l'achat.",
    deleteShoppingError: "Impossible de supprimer l'achat.",
    statsTrips: "Sorties",
    statsShopping: "À acheter",
    statsGear: "Équipement",
    newTrip: "Nouvelle sortie",
    tripTitle: "Titre de la sortie",
    tripGoalsShort: "Ce que vous voulez faire pendant cette sortie",
    tripNotesShort: "Plan, logistique, matériel, timing",
    creatingTrip: "Création",
    createTrip: "Créer la sortie",
    noPlaces: "Ajoutez ou trouvez d'abord un spot sur la carte. Ensuite vous pourrez planifier une sortie.",
    openMap: "Ouvrir la carte des spots",
    shoppingSection: "Achats pour les sorties",
    shoppingTitle: "Ce qu'il faut acheter",
    shoppingLinkNone: "Sans sortie liée",
    shoppingNotes: "Commentaire : taille, couleur, marque, où acheter",
    addingShopping: "Ajout",
    addShopping: "Ajouter à la liste",
    shoppingTrip: "Sortie",
    shoppingDelete: "Supprimer l'achat",
    shoppingBought: "Marquer comme acheté",
    shoppingRestore: "Remettre dans la liste",
    shoppingEmpty: "Rien à acheter pour le moment. Ajoutez ici leurres, consommables et petits oublis.",
    yourTrips: "Vos sorties",
    plannerTitle: "Planification et rapports",
    plannerMeta: (completed, inventory) => `${completed} terminées · ${inventory} éléments en inventaire`,
    tripsEmpty: "Aucune sortie pour le moment. Commencez par la première et bâtissez autour une liste de tâches et d'achats.",
    quantitySuffix: "pcs",
  },
  pt: {
    createTripError: "Não foi possível criar a viagem.",
    updateTripError: "Não foi possível atualizar a viagem.",
    tripGoals: "Objetivos desta viagem",
    tripNotes: "Plano, logística e notas antes da saída",
    tripSummary: "O que aconteceu depois da viagem e o que você quer publicar no feed",
    tripReportPhoto: "Foto para o relatório",
    publishTrip: "Publicar o relatório no feed público após a conclusão",
    savingTrip: "Salvando",
    saveTrip: "Salvar viagem",
    createShoppingError: "Não foi possível adicionar a compra.",
    updateShoppingError: "Não foi possível atualizar o status da compra.",
    deleteShoppingError: "Não foi possível excluir a compra.",
    statsTrips: "Viagens",
    statsShopping: "Comprar",
    statsGear: "Equipamentos",
    newTrip: "Nova viagem",
    tripTitle: "Nome da viagem",
    tripGoalsShort: "O que você quer fazer nesta viagem",
    tripNotesShort: "Plano, logística, equipamentos, timing",
    creatingTrip: "Criando",
    createTrip: "Criar viagem",
    noPlaces: "Primeiro adicione ou encontre um local no mapa. Depois disso você poderá planejar uma viagem.",
    openMap: "Abrir mapa de locais",
    shoppingSection: "Compras para as viagens",
    shoppingTitle: "O que precisa comprar",
    shoppingLinkNone: "Sem vínculo com viagem",
    shoppingNotes: "Comentário: tamanho, cor, marca, onde comprar",
    addingShopping: "Adicionando",
    addShopping: "Adicionar à lista",
    shoppingTrip: "Viagem",
    shoppingDelete: "Excluir compra",
    shoppingBought: "Marcar como comprado",
    shoppingRestore: "Voltar para a lista",
    shoppingEmpty: "Ainda não há nada para comprar. Adicione iscas, consumíveis e pequenos itens esquecidos aqui.",
    yourTrips: "Suas viagens",
    plannerTitle: "Planejamento e relatórios",
    plannerMeta: (completed, inventory) => `${completed} concluídas · ${inventory} itens no inventário`,
    tripsEmpty: "Ainda não há viagens. Comece pela primeira e monte uma lista de tarefas e compras.",
    quantitySuffix: "un.",
  },
};

function toDateTimeInput(value: Date | string | null) {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  return new Date(date.getTime() - date.getTimezoneOffset() * 60_000).toISOString().slice(0, 16);
}

function TripEditorCard({ trip }: { trip: TripItem }) {
  const router = useRouter();
  const { lang } = useLanguage();
  const t = translations[lang];
  const [form, setForm] = useState({
    title: trip.title,
    notes: trip.notes ?? "",
    goals: trip.goals ?? "",
    summary: trip.summary ?? "",
    status: trip.status,
    startAt: toDateTimeInput(trip.startAt),
    endAt: toDateTimeInput(trip.endAt ? trip.endAt : trip.status === "COMPLETED" ? new Date() : null),
    publish: Boolean(trip.publishedAt),
    reportImage: null as File | null,
  });
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  async function handleSave() {
    setError("");

    try {
      const payload = new FormData();
      payload.append("title", form.title.trim());
      payload.append("notes", form.notes.trim());
      payload.append("goals", form.goals.trim());
      payload.append("summary", form.summary.trim());
      payload.append("status", form.status);

      if (form.startAt) {
        payload.append("startAt", new Date(form.startAt).toISOString());
      }

      if (form.endAt) {
        payload.append("endAt", new Date(form.endAt).toISOString());
      }

      payload.append("publish", String(form.publish));

      if (form.reportImage) {
        payload.append("reportImage", form.reportImage);
      }

      const response = await fetch(apiPath(`/api/trips/${trip.id}`), {
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
      setError(saveError instanceof Error ? saveError.message : t.updateTripError);
    }
  }

  return (
    <div className="glass-panel rounded-[28px] border border-border-subtle p-4">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <div className="text-sm text-text-muted">{trip.place.name}</div>
          <div className="text-xl font-semibold text-text-main">{trip.title}</div>
          <div className="mt-1 text-sm text-text-muted">{formatDateTime(new Date(trip.startAt), lang)}</div>
        </div>
        <span className="rounded-full border border-primary/20 bg-primary/12 px-3 py-2 text-xs font-semibold text-primary">
          {tripStatusLabel(form.status, lang)}
        </span>
      </div>

      <div className="grid gap-4">
        <input
          value={form.title}
          onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
          className="rounded-[18px] border border-border-subtle bg-surface-soft px-4 py-3 text-text-main placeholder:text-text-soft focus:border-primary/30 focus:outline-none"
          placeholder={t.tripTitle}
        />
        <div className="grid grid-cols-2 gap-4">
          <input
            type="datetime-local"
            value={form.startAt}
            onChange={(event) => setForm((current) => ({ ...current, startAt: event.target.value }))}
            className="rounded-[18px] border border-border-subtle bg-surface-soft px-4 py-3 text-text-main focus:border-primary/30 focus:outline-none"
          />
          <input
            type="datetime-local"
            value={form.endAt}
            onChange={(event) => setForm((current) => ({ ...current, endAt: event.target.value }))}
            className="rounded-[18px] border border-border-subtle bg-surface-soft px-4 py-3 text-text-main focus:border-primary/30 focus:outline-none"
          />
        </div>
        <select
          value={form.status}
          onChange={(event) =>
            setForm((current) => ({
              ...current,
              status: event.target.value as TripItem["status"],
              publish: event.target.value === "COMPLETED" ? current.publish : false,
            }))
          }
          className="rounded-[18px] border border-border-subtle bg-surface-soft px-4 py-3 text-text-main focus:border-primary/30 focus:outline-none"
        >
          <option value="PLANNED">{tripStatusLabel("PLANNED", lang)}</option>
          <option value="CONFIRMED">{tripStatusLabel("CONFIRMED", lang)}</option>
          <option value="COMPLETED">{tripStatusLabel("COMPLETED", lang)}</option>
        </select>
        <textarea
          value={form.goals}
          onChange={(event) => setForm((current) => ({ ...current, goals: event.target.value }))}
          rows={3}
          placeholder={t.tripGoals}
          className="rounded-[18px] border border-border-subtle bg-surface-soft px-4 py-3 text-text-main placeholder:text-text-soft focus:border-primary/30 focus:outline-none"
        />
        <textarea
          value={form.notes}
          onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))}
          rows={3}
          placeholder={t.tripNotes}
          className="rounded-[18px] border border-border-subtle bg-surface-soft px-4 py-3 text-text-main placeholder:text-text-soft focus:border-primary/30 focus:outline-none"
        />
        <textarea
          value={form.summary}
          onChange={(event) => setForm((current) => ({ ...current, summary: event.target.value }))}
          rows={4}
          placeholder={t.tripSummary}
          className="rounded-[18px] border border-border-subtle bg-surface-soft px-4 py-3 text-text-main placeholder:text-text-soft focus:border-primary/30 focus:outline-none"
        />
        <label className="rounded-[18px] border border-dashed border-border-subtle bg-surface-soft px-4 py-3 text-sm text-text-muted">
          <span>{t.tripReportPhoto}</span>
          <input
            type="file"
            accept="image/*"
            className="mt-2 block w-full text-sm text-text-main"
            onChange={(event) =>
              setForm((current) => ({ ...current, reportImage: event.target.files?.[0] ?? null }))
            }
          />
        </label>
        <label className="flex items-center gap-3 rounded-[18px] border border-border-subtle bg-white/3 px-4 py-3 text-sm text-text-main">
          <input
            type="checkbox"
            checked={form.publish}
            onChange={(event) => setForm((current) => ({ ...current, publish: event.target.checked }))}
            disabled={form.status !== "COMPLETED"}
          />
          {t.publishTrip}
        </label>
      </div>

      {error ? <div className="mt-4 text-sm text-danger">{error}</div> : null}

      <button
        type="button"
        onClick={handleSave}
        disabled={isPending || !form.title.trim()}
        className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary px-4 py-3 text-sm font-semibold text-background disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
        <span>{isPending ? t.savingTrip : t.saveTrip}</span>
      </button>
    </div>
  );
}

export function TripPlanner({
  placeOptions,
  trips,
  shoppingItems,
  inventoryItems,
}: {
  placeOptions: PlaceOption[];
  trips: TripItem[];
  shoppingItems: ShoppingItem[];
  inventoryItems: InventoryItem[];
}) {
  const router = useRouter();
  const { lang } = useLanguage();
  const t = translations[lang];
  const [tripForm, setTripForm] = useState({
    placeId: placeOptions[0]?.id ?? "",
    title: "",
    notes: "",
    goals: "",
    startAt: "",
  });
  const [shoppingForm, setShoppingForm] = useState({
    title: "",
    notes: "",
    quantity: 1,
    tripId: "",
  });
  const [error, setError] = useState("");
  const [shoppingError, setShoppingError] = useState("");
  const [isPending, startTransition] = useTransition();
  const pendingShopping = shoppingItems.filter((item) => item.status === "PLANNED");
  const completedTrips = trips.filter((trip) => trip.status === "COMPLETED");

  async function handleCreateTrip() {
    setError("");

    try {
      const response = await fetch(apiPath("/api/trips"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          placeId: tripForm.placeId,
          title: tripForm.title.trim(),
          notes: tripForm.notes.trim(),
          goals: tripForm.goals.trim(),
          startAt: new Date(tripForm.startAt).toISOString(),
        }),
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(data?.error ?? "create failed");
      }

      setTripForm((current) => ({
        ...current,
        title: "",
        notes: "",
        goals: "",
        startAt: "",
      }));
      startTransition(() => {
        router.refresh();
      });
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : t.createTripError);
    }
  }

  async function handleCreateShoppingItem() {
    setShoppingError("");

    try {
      const response = await fetch(apiPath("/api/shopping-items"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: shoppingForm.title.trim(),
          notes: shoppingForm.notes.trim(),
          quantity: shoppingForm.quantity,
          tripId: shoppingForm.tripId || undefined,
        }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(payload?.error ?? "shopping create failed");
      }

      setShoppingForm({
        title: "",
        notes: "",
        quantity: 1,
        tripId: "",
      });
      startTransition(() => {
        router.refresh();
      });
    } catch (createError) {
      setShoppingError(createError instanceof Error ? createError.message : t.createShoppingError);
    }
  }

  async function handleToggleShoppingStatus(itemId: string, status: "PLANNED" | "BOUGHT") {
    const response = await fetch(apiPath(`/api/shopping-items/${itemId}`), {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        status,
      }),
    });

    if (!response.ok) {
      setShoppingError(t.updateShoppingError);
      return;
    }

    startTransition(() => {
      router.refresh();
    });
  }

  async function handleDeleteShoppingItem(itemId: string) {
    const response = await fetch(apiPath(`/api/shopping-items/${itemId}`), {
      method: "DELETE",
    });

    if (!response.ok) {
      setShoppingError(t.deleteShoppingError);
      return;
    }

    startTransition(() => {
      router.refresh();
    });
  }

  return (
    <div className="space-y-5">
      <section className="grid grid-cols-3 gap-3">
        <div className="glass-panel rounded-[24px] border border-border-subtle p-4">
          <div className="text-sm text-text-muted">{t.statsTrips}</div>
          <div className="mt-2 font-display text-2xl font-semibold text-text-main">{trips.length}</div>
        </div>
        <div className="glass-panel rounded-[24px] border border-border-subtle p-4">
          <div className="text-sm text-text-muted">{t.statsShopping}</div>
          <div className="mt-2 font-display text-2xl font-semibold text-text-main">{pendingShopping.length}</div>
        </div>
        <div className="glass-panel rounded-[24px] border border-border-subtle p-4">
          <div className="text-sm text-text-muted">{t.statsGear}</div>
          <div className="mt-2 font-display text-2xl font-semibold text-text-main">{inventoryItems.length}</div>
        </div>
      </section>

      <section className="glass-panel rounded-[30px] border border-border-subtle p-4">
        <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-text-main">
          <CalendarDays size={16} className="text-primary" />
          {t.newTrip}
        </div>

        {placeOptions.length > 0 ? (
          <>
            <div className="grid gap-4">
              <select
                value={tripForm.placeId}
                onChange={(event) => setTripForm((current) => ({ ...current, placeId: event.target.value }))}
                className="rounded-[18px] border border-border-subtle bg-surface-soft px-4 py-3 text-text-main focus:border-primary/30 focus:outline-none"
              >
                {placeOptions.map((place) => (
                  <option key={place.id} value={place.id} className="bg-background text-text-main">
                    {place.name}
                    {place.city ? ` · ${place.city}` : ""}
                  </option>
                ))}
              </select>
              <input
                value={tripForm.title}
                onChange={(event) => setTripForm((current) => ({ ...current, title: event.target.value }))}
                placeholder={t.tripTitle}
                className="rounded-[18px] border border-border-subtle bg-surface-soft px-4 py-3 text-text-main placeholder:text-text-soft focus:border-primary/30 focus:outline-none"
              />
              <input
                type="datetime-local"
                value={tripForm.startAt}
                onChange={(event) => setTripForm((current) => ({ ...current, startAt: event.target.value }))}
                className="rounded-[18px] border border-border-subtle bg-surface-soft px-4 py-3 text-text-main focus:border-primary/30 focus:outline-none"
              />
              <textarea
                value={tripForm.goals}
                onChange={(event) => setTripForm((current) => ({ ...current, goals: event.target.value }))}
                rows={3}
                placeholder={t.tripGoalsShort}
                className="rounded-[18px] border border-border-subtle bg-surface-soft px-4 py-3 text-text-main placeholder:text-text-soft focus:border-primary/30 focus:outline-none"
              />
              <textarea
                value={tripForm.notes}
                onChange={(event) => setTripForm((current) => ({ ...current, notes: event.target.value }))}
                rows={3}
                placeholder={t.tripNotesShort}
                className="rounded-[18px] border border-border-subtle bg-surface-soft px-4 py-3 text-text-main placeholder:text-text-soft focus:border-primary/30 focus:outline-none"
              />
            </div>

            {error ? <div className="mt-4 text-sm text-danger">{error}</div> : null}

            <button
              type="button"
              onClick={handleCreateTrip}
              disabled={isPending || !tripForm.title.trim() || !tripForm.startAt || !tripForm.placeId}
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary px-4 py-3 text-sm font-semibold text-background disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isPending ? <Loader2 size={16} className="animate-spin" /> : <CalendarDays size={16} />}
              <span>{isPending ? t.creatingTrip : t.createTrip}</span>
            </button>
          </>
        ) : (
          <div className="rounded-[24px] border border-dashed border-border-subtle bg-white/4 p-5 text-sm text-text-muted">
            {t.noPlaces}
            <div className="mt-3">
              <Link href="/explore" className="font-semibold text-primary">
                {t.openMap}
              </Link>
            </div>
          </div>
        )}
      </section>

      <section className="glass-panel rounded-[30px] border border-border-subtle p-4">
        <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-text-main">
          <ShoppingBag size={16} className="text-primary" />
          {t.shoppingSection}
        </div>

        <div className="grid gap-4 rounded-[24px] border border-border-subtle bg-white/4 p-4">
          <input
            value={shoppingForm.title}
            onChange={(event) => setShoppingForm((current) => ({ ...current, title: event.target.value }))}
            placeholder={t.shoppingTitle}
            className="rounded-[18px] border border-border-subtle bg-surface-soft px-4 py-3 text-text-main placeholder:text-text-soft focus:border-primary/30 focus:outline-none"
          />
          <div className="grid grid-cols-[1fr_96px] gap-3">
            <select
              value={shoppingForm.tripId}
              onChange={(event) => setShoppingForm((current) => ({ ...current, tripId: event.target.value }))}
              className="rounded-[18px] border border-border-subtle bg-surface-soft px-4 py-3 text-text-main focus:border-primary/30 focus:outline-none"
            >
              <option value="">{t.shoppingLinkNone}</option>
              {trips.map((trip) => (
                <option key={trip.id} value={trip.id}>
                  {trip.title}
                </option>
              ))}
            </select>
            <input
              type="number"
              min={1}
              max={20}
              value={shoppingForm.quantity}
              onChange={(event) =>
                setShoppingForm((current) => ({ ...current, quantity: Number(event.target.value || 1) }))
              }
              className="rounded-[18px] border border-border-subtle bg-surface-soft px-4 py-3 text-text-main focus:border-primary/30 focus:outline-none"
            />
          </div>
          <textarea
            value={shoppingForm.notes}
            onChange={(event) => setShoppingForm((current) => ({ ...current, notes: event.target.value }))}
            rows={2}
            placeholder={t.shoppingNotes}
            className="rounded-[18px] border border-border-subtle bg-surface-soft px-4 py-3 text-text-main placeholder:text-text-soft focus:border-primary/30 focus:outline-none"
          />
          <button
            type="button"
            onClick={handleCreateShoppingItem}
            disabled={isPending || !shoppingForm.title.trim()}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-4 py-3 text-sm font-semibold text-background disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending ? <Loader2 size={16} className="animate-spin" /> : <ClipboardList size={16} />}
            <span>{isPending ? t.addingShopping : t.addShopping}</span>
          </button>
        </div>

        {shoppingError ? <div className="mt-4 text-sm text-danger">{shoppingError}</div> : null}

        <div className="mt-4 space-y-3">
          {shoppingItems.length > 0 ? (
            shoppingItems.map((item) => {
              const nextStatus = item.status === "PLANNED" ? "BOUGHT" : "PLANNED";

              return (
                <div key={item.id} className="rounded-[22px] border border-border-subtle bg-white/4 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-semibold text-text-main">{item.title}</div>
                      <div className="mt-1 text-sm text-text-muted">
                        {shoppingStatusLabel(item.status, lang)} · {item.quantity} {t.quantitySuffix}
                      </div>
                      {item.trip ? (
                        <div className="mt-1 text-xs text-text-soft">
                          {t.shoppingTrip}: {item.trip.title}
                        </div>
                      ) : null}
                      {item.notes ? <div className="mt-2 text-sm leading-6 text-text-soft">{item.notes}</div> : null}
                    </div>
                    <button
                      type="button"
                      onClick={() => void handleDeleteShoppingItem(item.id)}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border-subtle bg-white/4 text-text-muted transition hover:border-danger/30 hover:text-danger"
                      aria-label={t.shoppingDelete}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => void handleToggleShoppingStatus(item.id, nextStatus)}
                    className={`mt-3 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${
                      item.status === "BOUGHT" ? "bg-white/8 text-text-main" : "bg-primary/12 text-primary"
                    }`}
                  >
                    <CheckCircle2 size={16} />
                    <span>{item.status === "BOUGHT" ? t.shoppingRestore : t.shoppingBought}</span>
                  </button>
                </div>
              );
            })
          ) : (
            <div className="rounded-[22px] border border-dashed border-border-subtle px-4 py-5 text-sm text-text-muted">
              {t.shoppingEmpty}
            </div>
          )}
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <div className="text-sm text-text-muted">{t.yourTrips}</div>
          <h2 className="font-display text-2xl font-semibold text-text-main">{t.plannerTitle}</h2>
          <div className="mt-1 text-sm text-text-soft">
            {t.plannerMeta(completedTrips.length, inventoryItems.length)}
          </div>
        </div>

        <div className="space-y-4">
          {trips.length > 0 ? (
            trips.map((trip) => <TripEditorCard key={trip.id} trip={trip} />)
          ) : (
            <div className="glass-panel rounded-[28px] border border-dashed border-border-subtle p-5 text-sm text-text-muted">
              {t.tripsEmpty}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

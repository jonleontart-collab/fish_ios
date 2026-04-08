'use client';

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
import { formatDateTime, shoppingStatusLabel, tripStatusLabel } from "@/lib/format";

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

function toDateTimeInput(value: Date | null) {
  if (!value) {
    return "";
  }

  return new Date(value.getTime() - value.getTimezoneOffset() * 60_000).toISOString().slice(0, 16);
}

function TripEditorCard({ trip }: { trip: TripItem }) {
  const router = useRouter();
  const [form, setForm] = useState({
    title: trip.title,
    notes: trip.notes ?? "",
    goals: trip.goals ?? "",
    summary: trip.summary ?? "",
    status: trip.status,
    startAt: toDateTimeInput(new Date(trip.startAt)),
    endAt: toDateTimeInput(trip.endAt ? new Date(trip.endAt) : trip.status === "COMPLETED" ? new Date() : null),
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

      const response = await fetch(`/api/trips/${trip.id}`, {
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
      setError(saveError instanceof Error ? saveError.message : "Не удалось обновить поездку.");
    }
  }

  return (
    <div className="glass-panel rounded-[28px] border border-border-subtle p-4">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <div className="text-sm text-text-muted">{trip.place.name}</div>
          <div className="text-xl font-semibold text-text-main">{trip.title}</div>
          <div className="mt-1 text-sm text-text-muted">{formatDateTime(new Date(trip.startAt))}</div>
        </div>
        <span className="rounded-full border border-primary/20 bg-primary/12 px-3 py-2 text-xs font-semibold text-primary">
          {tripStatusLabel(form.status)}
        </span>
      </div>

      <div className="grid gap-4">
        <input
          value={form.title}
          onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
          className="rounded-[18px] border border-border-subtle bg-surface-soft px-4 py-3 text-text-main placeholder:text-text-soft focus:border-primary/30 focus:outline-none"
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
          <option value="PLANNED">Запланирована</option>
          <option value="CONFIRMED">Подтверждена</option>
          <option value="COMPLETED">Завершена</option>
        </select>
        <textarea
          value={form.goals}
          onChange={(event) => setForm((current) => ({ ...current, goals: event.target.value }))}
          rows={3}
          placeholder="Что ты хочешь сделать в этой поездке"
          className="rounded-[18px] border border-border-subtle bg-surface-soft px-4 py-3 text-text-main placeholder:text-text-soft focus:border-primary/30 focus:outline-none"
        />
        <textarea
          value={form.notes}
          onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))}
          rows={3}
          placeholder="План, логистика, снасти и заметки до выезда"
          className="rounded-[18px] border border-border-subtle bg-surface-soft px-4 py-3 text-text-main placeholder:text-text-soft focus:border-primary/30 focus:outline-none"
        />
        <textarea
          value={form.summary}
          onChange={(event) => setForm((current) => ({ ...current, summary: event.target.value }))}
          rows={4}
          placeholder="Что получилось после рыбалки и что можно опубликовать в ленту"
          className="rounded-[18px] border border-border-subtle bg-surface-soft px-4 py-3 text-text-main placeholder:text-text-soft focus:border-primary/30 focus:outline-none"
        />
        <label className="rounded-[18px] border border-dashed border-border-subtle bg-surface-soft px-4 py-3 text-sm text-text-muted">
          <span>Фото для отчета</span>
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
          Опубликовать отчет в общей ленте после завершения
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
        <span>{isPending ? "Сохраняем" : "Сохранить поездку"}</span>
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
      const response = await fetch("/api/trips", {
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
      setError(createError instanceof Error ? createError.message : "Не удалось создать поездку.");
    }
  }

  async function handleCreateShoppingItem() {
    setShoppingError("");

    try {
      const response = await fetch("/api/shopping-items", {
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
      setShoppingError(createError instanceof Error ? createError.message : "Не удалось добавить покупку.");
    }
  }

  async function handleToggleShoppingStatus(itemId: string, status: "PLANNED" | "BOUGHT") {
    const response = await fetch(`/api/shopping-items/${itemId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        status,
      }),
    });

    if (!response.ok) {
      setShoppingError("Не удалось обновить статус покупки.");
      return;
    }

    startTransition(() => {
      router.refresh();
    });
  }

  async function handleDeleteShoppingItem(itemId: string) {
    const response = await fetch(`/api/shopping-items/${itemId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      setShoppingError("Не удалось удалить покупку.");
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
          <div className="text-sm text-text-muted">Поездок</div>
          <div className="mt-2 font-display text-2xl font-semibold text-text-main">{trips.length}</div>
        </div>
        <div className="glass-panel rounded-[24px] border border-border-subtle p-4">
          <div className="text-sm text-text-muted">Купить</div>
          <div className="mt-2 font-display text-2xl font-semibold text-text-main">{pendingShopping.length}</div>
        </div>
        <div className="glass-panel rounded-[24px] border border-border-subtle p-4">
          <div className="text-sm text-text-muted">Снасти</div>
          <div className="mt-2 font-display text-2xl font-semibold text-text-main">{inventoryItems.length}</div>
        </div>
      </section>

      <section className="glass-panel rounded-[30px] border border-border-subtle p-4">
        <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-text-main">
          <CalendarDays size={16} className="text-primary" />
          Новая поездка
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
                    {place.name} · {place.city}
                  </option>
                ))}
              </select>
              <input
                value={tripForm.title}
                onChange={(event) => setTripForm((current) => ({ ...current, title: event.target.value }))}
                placeholder="Название поездки"
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
                placeholder="Что хочешь сделать на рыбалке"
                className="rounded-[18px] border border-border-subtle bg-surface-soft px-4 py-3 text-text-main placeholder:text-text-soft focus:border-primary/30 focus:outline-none"
              />
              <textarea
                value={tripForm.notes}
                onChange={(event) => setTripForm((current) => ({ ...current, notes: event.target.value }))}
                rows={3}
                placeholder="План, логистика, снасти, тайминг"
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
              <span>{isPending ? "Создаем" : "Создать поездку"}</span>
            </button>
          </>
        ) : (
          <div className="rounded-[24px] border border-dashed border-border-subtle bg-white/4 p-5 text-sm text-text-muted">
            Сначала добавь или найди реальную точку на карте. После этого можно планировать выезд.
            <div className="mt-3">
              <Link href="/explore" className="font-semibold text-primary">
                Открыть карту мест
              </Link>
            </div>
          </div>
        )}
      </section>

      <section className="glass-panel rounded-[30px] border border-border-subtle p-4">
        <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-text-main">
          <ShoppingBag size={16} className="text-primary" />
          Что купить к поездкам
        </div>

        <div className="grid gap-4 rounded-[24px] border border-border-subtle bg-white/4 p-4">
          <input
            value={shoppingForm.title}
            onChange={(event) => setShoppingForm((current) => ({ ...current, title: event.target.value }))}
            placeholder="Что нужно купить"
            className="rounded-[18px] border border-border-subtle bg-surface-soft px-4 py-3 text-text-main placeholder:text-text-soft focus:border-primary/30 focus:outline-none"
          />
          <div className="grid grid-cols-[1fr_96px] gap-3">
            <select
              value={shoppingForm.tripId}
              onChange={(event) => setShoppingForm((current) => ({ ...current, tripId: event.target.value }))}
              className="rounded-[18px] border border-border-subtle bg-surface-soft px-4 py-3 text-text-main focus:border-primary/30 focus:outline-none"
            >
              <option value="">Без привязки к поездке</option>
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
            placeholder="Комментарий: размер, цвет, бренд, где купить"
            className="rounded-[18px] border border-border-subtle bg-surface-soft px-4 py-3 text-text-main placeholder:text-text-soft focus:border-primary/30 focus:outline-none"
          />
          <button
            type="button"
            onClick={handleCreateShoppingItem}
            disabled={isPending || !shoppingForm.title.trim()}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-4 py-3 text-sm font-semibold text-background disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending ? <Loader2 size={16} className="animate-spin" /> : <ClipboardList size={16} />}
            <span>{isPending ? "Добавляем" : "Добавить в список"}</span>
          </button>
        </div>

        {shoppingError ? <div className="mt-4 text-sm text-danger">{shoppingError}</div> : null}

        <div className="mt-4 space-y-3">
          {shoppingItems.length > 0 ? (
            shoppingItems.map((item) => {
              const nextStatus = item.status === "PLANNED" ? "BOUGHT" : "PLANNED";

              return (
                <div
                  key={item.id}
                  className="rounded-[22px] border border-border-subtle bg-white/4 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-semibold text-text-main">{item.title}</div>
                      <div className="mt-1 text-sm text-text-muted">
                        {shoppingStatusLabel(item.status)} · {item.quantity} шт.
                      </div>
                      {item.trip ? <div className="mt-1 text-xs text-text-soft">Поездка: {item.trip.title}</div> : null}
                      {item.notes ? <div className="mt-2 text-sm leading-6 text-text-soft">{item.notes}</div> : null}
                    </div>
                    <button
                      type="button"
                      onClick={() => void handleDeleteShoppingItem(item.id)}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border-subtle bg-white/4 text-text-muted transition hover:border-danger/30 hover:text-danger"
                      aria-label="Удалить покупку"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => void handleToggleShoppingStatus(item.id, nextStatus)}
                    className={`mt-3 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${
                      item.status === "BOUGHT"
                        ? "bg-white/8 text-text-main"
                        : "bg-primary/12 text-primary"
                    }`}
                  >
                    <CheckCircle2 size={16} />
                    <span>{item.status === "BOUGHT" ? "Вернуть в список" : "Отметить как куплено"}</span>
                  </button>
                </div>
              );
            })
          ) : (
            <div className="rounded-[22px] border border-dashed border-border-subtle px-4 py-5 text-sm text-text-muted">
              Пока ничего не нужно купить. Добавляй приманки, расходники и забытые мелочи прямо сюда.
            </div>
          )}
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <div className="text-sm text-text-muted">Твои поездки</div>
          <h2 className="font-display text-2xl font-semibold text-text-main">Планирование и отчеты</h2>
          <div className="mt-1 text-sm text-text-soft">
            Завершено {completedTrips.length} · В инвентаре {inventoryItems.length} позиций
          </div>
        </div>

        <div className="space-y-4">
          {trips.length > 0 ? (
            trips.map((trip) => <TripEditorCard key={trip.id} trip={trip} />)
          ) : (
            <div className="glass-panel rounded-[28px] border border-dashed border-border-subtle p-5 text-sm text-text-muted">
              Пока нет поездок. Начни с первой запланированной рыбалки и собери к ней список задач и покупок.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

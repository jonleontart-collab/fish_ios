"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Loader2, MapPin, Plus, Search } from "lucide-react";

import { PlacePickerMap } from "@/components/PlacePickerMap";
import { useLanguage } from "@/components/LanguageProvider";
import { useLocation } from "@/components/LocationProvider";
import { apiPath } from "@/lib/app-paths";
import type { TranslationMap } from "@/lib/i18n";

type PlaceOption = {
  id: string;
  slug: string;
  name: string;
  city: string;
  source?: string;
};

type SelectedPoint = {
  latitude: number;
  longitude: number;
};

const translations: TranslationMap<{
  label: string;
  selected: string;
  noSelection: string;
  search: string;
  noMatches: string;
  addPoint: string;
  hideCreator: string;
  creatorHint: string;
  name: string;
  city: string;
  region: string;
  mapHint: string;
  save: string;
  saving: string;
  saveError: string;
  requiredError: string;
  emptyTitle: string;
  mixedSpecies: string;
  parking: string;
  access: string;
  allSeason: string;
  savedShort: string;
  savedDescription: (city: string) => string;
}> = {
  ru: {
    label: "Место",
    selected: "Выбрано",
    noSelection: "Выбери место или сохрани новую точку на карте",
    search: "Поиск по местам",
    noMatches: "Ничего не найдено. Можно сохранить новую точку ниже.",
    addPoint: "Новая точка на карте",
    hideCreator: "Скрыть форму",
    creatorHint: "Нажми на карту, чтобы поставить точку, и сохрани место сразу в базу.",
    name: "Название места",
    city: "Город",
    region: "Регион",
    mapHint: "Клик по карте ставит метку.",
    save: "Сохранить место",
    saving: "Сохраняем место",
    saveError: "Не удалось сохранить место.",
    requiredError: "Нужно указать название, город и точку на карте.",
    emptyTitle: "Место не выбрано",
    mixedSpecies: "Разная рыба",
    parking: "Парковка",
    access: "Подход к берегу",
    allSeason: "Весь сезон",
    savedShort: "Пользовательская точка на карте",
    savedDescription: (city) =>
      `Точка сохранена из формы публикации улова рядом с ${city}. Детали и фото можно дополнить позже.`,
  },
  en: {
    label: "Place",
    selected: "Selected",
    noSelection: "Choose a place or save a new point on the map",
    search: "Search places",
    noMatches: "Nothing found. You can save a new point below.",
    addPoint: "New map point",
    hideCreator: "Hide form",
    creatorHint: "Tap the map to drop a pin and save the place right away.",
    name: "Place name",
    city: "City",
    region: "Region",
    mapHint: "Click the map to place the marker.",
    save: "Save place",
    saving: "Saving place",
    saveError: "Could not save the place.",
    requiredError: "Name, city, and a map point are required.",
    emptyTitle: "No place selected",
    mixedSpecies: "Mixed species",
    parking: "Parking",
    access: "Shore access",
    allSeason: "All season",
    savedShort: "User-saved map point",
    savedDescription: (city) => `Saved from the catch form near ${city}. Photos and details can be added later.`,
  },
  es: {
    label: "Lugar",
    selected: "Seleccionado",
    noSelection: "Elige un lugar o guarda un nuevo punto en el mapa",
    search: "Buscar lugares",
    noMatches: "No se encontró nada. Puedes guardar un nuevo punto abajo.",
    addPoint: "Nuevo punto en el mapa",
    hideCreator: "Ocultar formulario",
    creatorHint: "Pulsa el mapa para marcar un punto y guardarlo enseguida.",
    name: "Nombre del lugar",
    city: "Ciudad",
    region: "Región",
    mapHint: "Haz clic en el mapa para colocar el marcador.",
    save: "Guardar lugar",
    saving: "Guardando lugar",
    saveError: "No se pudo guardar el lugar.",
    requiredError: "Debes indicar nombre, ciudad y un punto en el mapa.",
    emptyTitle: "Ningún lugar seleccionado",
    mixedSpecies: "Especies mixtas",
    parking: "Parking",
    access: "Acceso a la orilla",
    allSeason: "Toda la temporada",
    savedShort: "Punto guardado por el usuario",
    savedDescription: (city) => `Guardado desde el formulario de captura cerca de ${city}. Los detalles y fotos se pueden añadir luego.`,
  },
  fr: {
    label: "Lieu",
    selected: "Sélectionné",
    noSelection: "Choisissez un lieu ou enregistrez un nouveau point sur la carte",
    search: "Rechercher des lieux",
    noMatches: "Aucun résultat. Vous pouvez enregistrer un nouveau point ci-dessous.",
    addPoint: "Nouveau point sur la carte",
    hideCreator: "Masquer le formulaire",
    creatorHint: "Touchez la carte pour poser un point et l'enregistrer tout de suite.",
    name: "Nom du lieu",
    city: "Ville",
    region: "Région",
    mapHint: "Cliquez sur la carte pour placer le marqueur.",
    save: "Enregistrer le lieu",
    saving: "Enregistrement",
    saveError: "Impossible d'enregistrer le lieu.",
    requiredError: "Le nom, la ville et un point sur la carte sont requis.",
    emptyTitle: "Aucun lieu sélectionné",
    mixedSpecies: "Espèces mixtes",
    parking: "Parking",
    access: "Accès berge",
    allSeason: "Toute la saison",
    savedShort: "Point enregistré par l'utilisateur",
    savedDescription: (city) => `Enregistré depuis le formulaire de prise près de ${city}. Les détails et photos peuvent être ajoutés plus tard.`,
  },
  pt: {
    label: "Local",
    selected: "Selecionado",
    noSelection: "Escolha um local ou salve um novo ponto no mapa",
    search: "Buscar locais",
    noMatches: "Nada encontrado. Você pode salvar um novo ponto abaixo.",
    addPoint: "Novo ponto no mapa",
    hideCreator: "Ocultar formulário",
    creatorHint: "Toque no mapa para marcar um ponto e salvar o local na hora.",
    name: "Nome do local",
    city: "Cidade",
    region: "Região",
    mapHint: "Clique no mapa para posicionar o marcador.",
    save: "Salvar local",
    saving: "Salvando local",
    saveError: "Não foi possível salvar o local.",
    requiredError: "Nome, cidade e um ponto no mapa são obrigatórios.",
    emptyTitle: "Nenhum local selecionado",
    mixedSpecies: "Espécies mistas",
    parking: "Estacionamento",
    access: "Acesso à margem",
    allSeason: "Temporada toda",
    savedShort: "Ponto salvo pelo usuário",
    savedDescription: (city) => `Salvo a partir do formulário de captura perto de ${city}. Detalhes e fotos podem ser adicionados depois.`,
  },
};

export function PlaceSelectorField({
  places,
  value,
  onChange,
  speciesHint,
}: {
  places: PlaceOption[];
  value: string;
  onChange: (value: string) => void;
  speciesHint?: string;
}) {
  const { lang } = useLanguage();
  const { location } = useLocation();
  const t = translations[lang];
  const [options, setOptions] = useState(places);
  const [query, setQuery] = useState("");
  const [showCreator, setShowCreator] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");
  const [createForm, setCreateForm] = useState({
    name: "",
    city: location?.city ?? "",
    region: location?.region ?? location?.city ?? "",
  });
  const [selectedPoint, setSelectedPoint] = useState<SelectedPoint | null>(
    location
      ? {
          latitude: Number(location.latitude.toFixed(6)),
          longitude: Number(location.longitude.toFixed(6)),
        }
      : null,
  );

  useEffect(() => {
    setOptions(places);
  }, [places]);

  useEffect(() => {
    if (!createForm.city && location?.city) {
      setCreateForm((current) => ({
        ...current,
        city: location.city ?? current.city,
        region: current.region || location.region || location.city || "",
      }));
    }
  }, [createForm.city, location]);

  useEffect(() => {
    if (!selectedPoint && location) {
      setSelectedPoint({
        latitude: Number(location.latitude.toFixed(6)),
        longitude: Number(location.longitude.toFixed(6)),
      });
    }
  }, [location, selectedPoint]);

  const selectedPlace = options.find((place) => place.id === value) ?? null;
  const filteredPlaces = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return options.slice(0, 8);
    }

    return options
      .filter((place) =>
        `${place.name} ${place.city}`.toLowerCase().includes(normalizedQuery),
      )
      .slice(0, 8);
  }, [options, query]);

  async function handleCreatePlace() {
    if (creating) {
      return;
    }

    if (!createForm.name.trim() || !createForm.city.trim() || !selectedPoint) {
      setCreateError(t.requiredError);
      return;
    }

    setCreating(true);
    setCreateError("");

    try {
      const payload = new FormData();
      payload.append("name", createForm.name.trim());
      payload.append("shortDescription", t.savedShort);
      payload.append("description", t.savedDescription(createForm.city.trim()));
      payload.append("type", "WILD");
      payload.append("city", createForm.city.trim());
      payload.append("region", (createForm.region.trim() || createForm.city.trim()));
      payload.append("latitude", String(selectedPoint.latitude));
      payload.append("longitude", String(selectedPoint.longitude));
      payload.append("fishSpecies", speciesHint?.trim() || t.mixedSpecies);
      payload.append("amenities", `${t.parking}|${t.access}`);
      payload.append("bestMonths", t.allSeason);

      if (location) {
        payload.append("viewerLatitude", String(location.latitude));
        payload.append("viewerLongitude", String(location.longitude));
      }

      const response = await fetch(apiPath("/api/places"), {
        method: "POST",
        body: payload,
      });

      if (!response.ok) {
        throw new Error("create place failed");
      }

      const created = (await response.json()) as { id: string; slug: string; name: string };
      const nextOption: PlaceOption = {
        id: created.id,
        slug: created.slug,
        name: created.name,
        city: createForm.city.trim(),
        source: "USER",
      };

      setOptions((current) => [nextOption, ...current]);
      onChange(created.id);
      setQuery(created.name);
      setShowCreator(false);
      setCreateForm((current) => ({
        ...current,
        name: "",
      }));
    } catch {
      setCreateError(t.saveError);
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="grid gap-3">
      <div className="rounded-[22px] border border-border-subtle bg-white/4 p-4">
        <div className="text-sm text-text-muted">{selectedPlace ? t.selected : t.emptyTitle}</div>
        <div className="mt-1 text-[17px] font-semibold text-text-main">
          {selectedPlace ? selectedPlace.name : t.noSelection}
        </div>
        {selectedPlace ? (
          <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-white/6 px-3 py-1.5 text-sm text-text-muted">
            <MapPin size={14} className="text-primary" />
            <span>{selectedPlace.city}</span>
          </div>
        ) : null}
      </div>

      <label className="grid gap-2">
        <span className="text-sm font-medium text-text-muted">{t.label}</span>
        <div className="flex items-center gap-3 rounded-[18px] border border-border-subtle bg-surface-soft px-4 py-3">
          <Search size={16} className="text-text-muted" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t.search}
            className="w-full bg-transparent text-text-main placeholder:text-text-soft focus:outline-none"
          />
        </div>
      </label>

      <div className="flex flex-wrap gap-2">
        {filteredPlaces.map((place) => {
          const isActive = place.id === value;

          return (
            <button
              key={place.id}
              type="button"
              onClick={() => onChange(place.id)}
              className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm transition ${
                isActive
                  ? "border-primary/40 bg-primary/12 text-primary"
                  : "border-white/10 bg-white/6 text-text-main hover:bg-white/10"
              }`}
            >
              {isActive ? <Check size={14} /> : <MapPin size={14} className="text-text-muted" />}
              <span className="max-w-[220px] truncate">
                {place.name}
                {place.city ? `, ${place.city}` : ""}
              </span>
            </button>
          );
        })}
      </div>

      {filteredPlaces.length === 0 ? <div className="text-sm text-text-muted">{t.noMatches}</div> : null}

      <button
        type="button"
        onClick={() => {
          setShowCreator((current) => !current);
          setCreateError("");
        }}
        className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/6 px-4 py-3 text-sm font-semibold text-text-main transition hover:bg-white/10"
      >
        <Plus size={16} className="text-primary" />
        <span>{showCreator ? t.hideCreator : t.addPoint}</span>
      </button>

      {showCreator ? (
        <div className="rounded-[24px] border border-border-subtle bg-white/4 p-4">
          <div className="mb-3 text-sm leading-6 text-text-muted">{t.creatorHint}</div>
          <div className="grid gap-3">
            <input
              value={createForm.name}
              onChange={(event) => setCreateForm((current) => ({ ...current, name: event.target.value }))}
              placeholder={t.name}
              className="rounded-[18px] border border-border-subtle bg-surface-soft px-4 py-3 text-text-main placeholder:text-text-soft focus:border-primary/30 focus:outline-none"
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                value={createForm.city}
                onChange={(event) => setCreateForm((current) => ({ ...current, city: event.target.value }))}
                placeholder={t.city}
                className="rounded-[18px] border border-border-subtle bg-surface-soft px-4 py-3 text-text-main placeholder:text-text-soft focus:border-primary/30 focus:outline-none"
              />
              <input
                value={createForm.region}
                onChange={(event) => setCreateForm((current) => ({ ...current, region: event.target.value }))}
                placeholder={t.region}
                className="rounded-[18px] border border-border-subtle bg-surface-soft px-4 py-3 text-text-main placeholder:text-text-soft focus:border-primary/30 focus:outline-none"
              />
            </div>
            <div className="space-y-2">
              <PlacePickerMap selectedPoint={selectedPoint} onSelect={setSelectedPoint} />
              <div className="text-xs text-text-muted">{t.mapHint}</div>
            </div>
          </div>

          {createError ? <div className="mt-3 text-sm text-danger">{createError}</div> : null}

          <button
            type="button"
            onClick={handleCreatePlace}
            disabled={creating}
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-4 py-3 text-sm font-semibold text-background disabled:cursor-not-allowed disabled:opacity-60"
          >
            {creating ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
            <span>{creating ? t.saving : t.save}</span>
          </button>
        </div>
      ) : null}
    </div>
  );
}

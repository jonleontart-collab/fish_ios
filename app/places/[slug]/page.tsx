import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink, ImagePlus, MapPin, Star, Waves } from "lucide-react";

import { CatchCard } from "@/components/CatchCard";
import { PlacePhotoUploader } from "@/components/PlacePhotoUploader";
import { withBasePath } from "@/lib/app-paths";
import { getSpeciesBadge } from "@/lib/assets";
import { placeSourceLabel, placeTypeLabel } from "@/lib/format";
import { type TranslationMap } from "@/lib/i18n";
import { getServerLanguage } from "@/lib/i18n-server";
import { getPlaceDetails } from "@/lib/queries";

export const dynamic = "force-dynamic";

const translations: TranslationMap<{
  back: string;
  noPhotos: string;
  photosCount: (count: number) => string;
  depth: string;
  bestMonths: string;
  fish: string;
  amenities: string;
  sourceLink: string;
  photoGallery: string;
  userPhotoCaption: string;
  addCatch: string;
  discuss: string;
  placeFeed: string;
  freshCatches: string;
  variableDepth: string;
}> = {
  ru: {
    back: "Назад к карте",
    noPhotos: "Пока нет фото для этого места. Добавьте первым!",
    photosCount: (count) => `${count} фото места`,
    depth: "Глубина",
    bestMonths: "Лучшие месяцы",
    fish: "Рыба",
    amenities: "Инфраструктура",
    sourceLink: "Открыть источник с фото и отзывами",
    photoGallery: "Фотографии точки",
    userPhotoCaption: "Пользователь добавил фото места",
    addCatch: "Добавить улов",
    discuss: "Обсудить в чатах",
    placeFeed: "По этому месту",
    freshCatches: "Свежие уловы",
    variableDepth: "переменная",
  },
  en: {
    back: "Back to map",
    noPhotos: "There are no photos for this place yet. Be the first to add one.",
    photosCount: (count) => `${count} place photos`,
    depth: "Depth",
    bestMonths: "Best months",
    fish: "Fish species",
    amenities: "Amenities",
    sourceLink: "Open source with photos and reviews",
    photoGallery: "Spot photos",
    userPhotoCaption: "A user added a photo of this place",
    addCatch: "Add catch",
    discuss: "Discuss in chats",
    placeFeed: "For this place",
    freshCatches: "Fresh catches",
    variableDepth: "variable",
  },
  es: {
    back: "Volver al mapa",
    noPhotos: "Todavía no hay fotos de este lugar. Sé el primero en añadir una.",
    photosCount: (count) => `${count} fotos del lugar`,
    depth: "Profundidad",
    bestMonths: "Mejores meses",
    fish: "Peces",
    amenities: "Infraestructura",
    sourceLink: "Abrir fuente con fotos y reseñas",
    photoGallery: "Fotos del punto",
    userPhotoCaption: "Un usuario añadió una foto del lugar",
    addCatch: "Añadir captura",
    discuss: "Hablar en chats",
    placeFeed: "Para este lugar",
    freshCatches: "Capturas recientes",
    variableDepth: "variable",
  },
  fr: {
    back: "Retour à la carte",
    noPhotos: "Aucune photo pour ce spot pour le moment. Ajoutez-en une en premier.",
    photosCount: (count) => `${count} photos du spot`,
    depth: "Profondeur",
    bestMonths: "Meilleurs mois",
    fish: "Poissons",
    amenities: "Infrastructure",
    sourceLink: "Ouvrir la source avec photos et avis",
    photoGallery: "Photos du spot",
    userPhotoCaption: "Un utilisateur a ajouté une photo du spot",
    addCatch: "Ajouter une prise",
    discuss: "Discuter dans les chats",
    placeFeed: "Pour ce spot",
    freshCatches: "Prises récentes",
    variableDepth: "variable",
  },
  pt: {
    back: "Voltar ao mapa",
    noPhotos: "Ainda não há fotos deste local. Seja o primeiro a adicionar uma.",
    photosCount: (count) => `${count} fotos do local`,
    depth: "Profundidade",
    bestMonths: "Melhores meses",
    fish: "Peixes",
    amenities: "Infraestrutura",
    sourceLink: "Abrir fonte com fotos e avaliações",
    photoGallery: "Fotos do ponto",
    userPhotoCaption: "Um usuário adicionou uma foto do local",
    addCatch: "Adicionar captura",
    discuss: "Discutir nos chats",
    placeFeed: "Sobre este local",
    freshCatches: "Capturas recentes",
    variableDepth: "variável",
  },
};

export default async function PlacePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const lang = await getServerLanguage();
  const t = translations[lang];
  const place = await getPlaceDetails(slug);

  if (!place) {
    notFound();
  }

  return (
    <div className="space-y-5 px-4 pb-8 pt-safe">
      <Link href="/explore" className="inline-flex items-center gap-2 text-sm font-semibold text-text-muted">
        <ArrowLeft size={16} />
        {t.back}
      </Link>

      <section className="glass-panel overflow-hidden rounded-[32px] border border-border-subtle">
        <div className="relative aspect-[1.2] bg-[linear-gradient(135deg,#0b1520,#17324a)]">
          {place.displayImage ? (
            <Image
              src={withBasePath(place.displayImage)}
              alt={place.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 380px"
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
              <ImagePlus size={48} className="mb-3 text-primary/40" />
              <div className="text-base font-medium text-primary/50 text-balance">{t.noPhotos}</div>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
          <div className="absolute inset-x-0 top-0 flex flex-wrap gap-2 p-5">
            <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-text-main">
              {placeTypeLabel(place.type, lang)}
            </span>
            <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-text-main">
              {placeSourceLabel(place.source, lang)}
            </span>
            {place.distanceKm ? (
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-text-main">
                {place.distanceKm} km
              </span>
            ) : null}
          </div>
          <div className="absolute inset-x-0 bottom-0 space-y-3 p-5">
            <div className="flex items-end justify-between gap-4">
              <div>
                <h1 className="font-display text-[28px] font-semibold text-text-main">{place.name}</h1>
                <div className="mt-1 flex items-center gap-2 text-sm text-text-muted">
                  <MapPin size={15} />
                  {place.city}, {place.region}
                </div>
              </div>
              <div className="rounded-[22px] border border-white/10 bg-black/20 px-4 py-3 text-right backdrop-blur">
                <div className="flex items-center justify-end gap-1 text-sm font-semibold text-text-main">
                  <Star size={14} className="fill-warning text-warning" />
                  {place.rating > 0 ? place.rating.toFixed(1) : "new"}
                </div>
                <div className="text-xs text-text-muted">{t.photosCount(place.photos.length)}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="glass-panel rounded-[28px] border border-border-subtle p-4">
        <p className="text-[15px] leading-7 text-text-main">{place.description}</p>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="rounded-[24px] bg-white/4 p-4">
            <div className="flex items-center gap-2 text-sm text-text-muted">
              <Waves size={16} />
              {t.depth}
            </div>
            <div className="mt-2 text-lg font-semibold text-text-main">
              {place.depthMeters ? `${place.depthMeters.toFixed(1)} m` : t.variableDepth}
            </div>
          </div>
          <div className="rounded-[24px] bg-white/4 p-4">
            <div className="text-sm text-text-muted">{t.bestMonths}</div>
            <div className="mt-2 text-lg font-semibold text-text-main">
              {place.bestMonthsList.slice(0, 2).join(" · ")}
            </div>
          </div>
        </div>

        <div className="mt-5 space-y-4">
          <div>
            <div className="mb-2 text-sm text-text-muted">{t.fish}</div>
            <div className="flex flex-wrap gap-2">
              {place.fishSpeciesList.map((item) => (
                <span
                  key={item}
                  className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
                >
                  <Image
                    src={withBasePath(getSpeciesBadge(item))}
                    alt={item}
                    width={20}
                    height={20}
                    className="rounded-full"
                  />
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div>
            <div className="mb-2 text-sm text-text-muted">{t.amenities}</div>
            <div className="flex flex-wrap gap-2">
              {place.amenitiesList.map((item) => (
                <span key={item} className="rounded-full bg-white/6 px-3 py-1 text-xs font-medium text-text-main">
                  {item}
                </span>
              ))}
            </div>
          </div>

          {place.sourceUrl ? (
            <Link
              href={place.sourceUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-sm font-semibold text-primary"
            >
              {t.sourceLink}
              <ExternalLink size={16} />
            </Link>
          ) : null}
        </div>
      </section>

      <PlacePhotoUploader placeId={place.id} />

      {place.photos.length > 0 ? (
        <section className="glass-panel rounded-[28px] border border-border-subtle p-4">
          <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-text-main">
            <ImagePlus size={16} className="text-primary" />
            {t.photoGallery}
          </div>
          <div className="grid grid-cols-2 gap-3">
            {place.photos.map((photo) => (
              <div key={photo.id} className="overflow-hidden rounded-[22px] border border-border-subtle bg-white/4">
                <div className="relative aspect-[1.05]">
                  <Image
                    src={withBasePath(photo.imagePath)}
                    alt={photo.caption ?? place.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 50vw, 180px"
                  />
                </div>
                <div className="space-y-1 p-3">
                  <div className="text-sm font-semibold text-text-main">{photo.user.name}</div>
                  <div className="text-xs leading-5 text-text-muted">{photo.caption ?? t.userPhotoCaption}</div>
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <div className="flex gap-3">
        <Link
          href="/add"
          className="flex-1 rounded-[20px] bg-primary px-4 py-4 text-center font-semibold text-background"
        >
          {t.addCatch}
        </Link>
        <Link
          href="/chats"
          className="glass-panel flex-1 rounded-[20px] border border-border-subtle px-4 py-4 text-center font-semibold text-text-main"
        >
          {t.discuss}
        </Link>
      </div>

      <section className="space-y-4">
        <div>
          <div className="text-sm text-text-muted">{t.placeFeed}</div>
          <h2 className="font-display text-2xl font-semibold text-text-main">{t.freshCatches}</h2>
        </div>

        <div className="space-y-4">
          {place.catches.map((catchItem) => (
            <CatchCard key={catchItem.id} catchItem={catchItem} />
          ))}
        </div>
      </section>
    </div>
  );
}

'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ImagePlus, MapPin, MoreHorizontal, Trophy } from "lucide-react";

import { CatchEngagementBar } from "@/components/CatchEngagementBar";
import { useLanguage } from "@/components/LanguageProvider";
import { withBasePath } from "@/lib/app-paths";
import { formatFeedDate, formatLength, formatWeight } from "@/lib/format";
import type { TranslationMap } from "@/lib/i18n";

type CatchCardProps = {
  catchItem: {
    id: string;
    species: string;
    weightKg: number | null;
    lengthCm: number | null;
    bait: string | null;
    note: string | null;
    imagePath: string;
    likesCount: number;
    likedByViewer: boolean;
    commentsCount: number;
    repostsCount?: number;
    repostedByViewer?: boolean;
    isFeatured: boolean;
    aiConfidence: number | null;
    createdAt: Date;
    mediaItems?: Array<{
      id: string;
      mediaPath: string;
      mediaType: "IMAGE" | "VIDEO";
      sortOrder: number;
    }>;
    repostMeta?: {
      user: {
        name: string;
        handle: string;
      };
      createdAt: Date | string;
    } | null;
    user: {
      name: string;
      handle: string;
      avatarGradient: string;
      avatarPath?: string | null;
    };
    place: {
      slug: string;
      name: string;
      city: string;
    };
  };
  showUser?: boolean;
  showActions?: boolean;
};

const translations: TranslationMap<{
  featured: string;
  bait: string;
  sharedBy: (name: string) => string;
  viewComments: (count: number) => string;
}> = {
  ru: {
    featured: "Трофей",
    bait: "Наживка",
    sharedBy: (name) => `${name} поделился этой записью`,
    viewComments: (count) => `Смотреть все комментарии (${count})`,
  },
  en: {
    featured: "Trophy",
    bait: "Bait",
    sharedBy: (name) => `${name} shared this post`,
    viewComments: (count) => `View all comments (${count})`,
  },
  es: {
    featured: "Trofeo",
    bait: "Cebo",
    sharedBy: (name) => `${name} compartió esta publicación`,
    viewComments: (count) => `Ver todos los comentarios (${count})`,
  },
  fr: {
    featured: "Trophée",
    bait: "Appât",
    sharedBy: (name) => `${name} a partagé cette publication`,
    viewComments: (count) => `Voir tous les commentaires (${count})`,
  },
  pt: {
    featured: "Troféu",
    bait: "Isca",
    sharedBy: (name) => `${name} compartilhou esta publicação`,
    viewComments: (count) => `Ver todos os comentários (${count})`,
  },
};

function CatchMediaFrame({
  media,
  alt,
  species,
}: {
  media: { mediaPath: string; mediaType: "IMAGE" | "VIDEO" } | null;
  alt: string;
  species: string;
}) {
  const [error, setError] = useState(false);

  if (!media || !media.mediaPath || error) {
    return (
      <div className="relative flex h-full w-full flex-col items-center justify-center border-y border-white/5 bg-[#0a1520]">
        <ImagePlus size={32} className="mb-2 text-white/10" />
        <span className="text-[14px] font-semibold text-white/30">{species}</span>
      </div>
    );
  }

  if (media.mediaType === "VIDEO") {
    return (
      <video
        src={withBasePath(media.mediaPath)}
        controls
        playsInline
        className="h-full w-full object-cover"
        onError={() => setError(true)}
      />
    );
  }

  return (
    <img
      src={withBasePath(media.mediaPath)}
      alt={alt}
      className="h-full w-full object-cover"
      onError={() => setError(true)}
    />
  );
}

export function CatchCard({ catchItem, showUser = true, showActions = true }: CatchCardProps) {
  const { lang } = useLanguage();
  const t = translations[lang];
  const mediaItems =
    catchItem.mediaItems && catchItem.mediaItems.length > 0
      ? catchItem.mediaItems
      : [
          {
            id: `${catchItem.id}-cover`,
            mediaPath: catchItem.imagePath,
            mediaType: "IMAGE" as const,
            sortOrder: 0,
          },
        ];
  const [activeIndex, setActiveIndex] = useState(0);
  const activeMedia = mediaItems[activeIndex] ?? mediaItems[0] ?? null;

  useEffect(() => {
    setActiveIndex(0);
  }, [catchItem.id]);

  function moveSlide(direction: -1 | 1) {
    setActiveIndex((current) => {
      if (mediaItems.length <= 1) {
        return current;
      }

      return (current + direction + mediaItems.length) % mediaItems.length;
    });
  }

  return (
    <article className="mb-8 overflow-hidden bg-background shadow-sm sm:rounded-[32px] sm:border sm:border-white/5 sm:bg-surface-elevated">
      {catchItem.repostMeta ? (
        <div className="flex items-center gap-2 px-4 pt-4 text-[13px] font-medium text-text-muted sm:px-5">
          <span>{t.sharedBy(catchItem.repostMeta.user.name)}</span>
        </div>
      ) : null}

      {showUser ? (
        <div className="flex items-center justify-between px-4 py-3.5 sm:px-5">
          <div className="flex w-full items-center gap-3">
            <Link href={`/profile/${catchItem.user.handle}`} className="relative shrink-0 overflow-hidden rounded-full border border-white/10 group">
              {catchItem.user.avatarPath ? (
                <img
                  src={withBasePath(catchItem.user.avatarPath)}
                  alt={catchItem.user.name}
                  className="h-10 w-10 object-cover transition-transform group-hover:scale-105"
                />
              ) : (
                <div className={`flex h-10 w-10 items-center justify-center bg-gradient-to-br ${catchItem.user.avatarGradient}`}>
                  <span className="text-[15px] font-bold text-white">{catchItem.user.name.slice(0, 1).toUpperCase()}</span>
                </div>
              )}
            </Link>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <Link href={`/profile/${catchItem.user.handle}`} className="truncate text-[14px] font-bold text-white hover:underline">
                  {catchItem.user.name}
                </Link>
                <span className="text-[13px] text-text-muted">•</span>
                <span suppressHydrationWarning className="truncate text-[13px] text-text-muted">
                  {formatFeedDate(catchItem.createdAt, lang)}
                </span>
              </div>

              <Link href={`/places/${catchItem.place.slug}`} className="group mt-0.5 flex items-center gap-1">
                <MapPin size={12} className="text-primary" />
                <span className="truncate text-[12px] font-medium text-text-muted transition-colors group-hover:text-white">
                  {catchItem.place.name}
                  {catchItem.place.city ? `, ${catchItem.place.city}` : ""}
                </span>
              </Link>
            </div>

            <button className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-text-muted transition-colors hover:bg-white/10 hover:text-white">
              <MoreHorizontal size={18} />
            </button>
          </div>
        </div>
      ) : null}

      <Link href={`/feed/${catchItem.id}`} className="group relative block">
        <div className="relative aspect-[4/5] w-full bg-black sm:aspect-square">
          <CatchMediaFrame media={activeMedia} alt={catchItem.species} species={catchItem.species} />

          {catchItem.isFeatured ? (
            <div className="absolute right-4 top-4 flex items-center gap-1.5 rounded-full bg-warning/90 px-3 py-1.5 text-[11px] font-bold text-black shadow-lg backdrop-blur-md">
              <Trophy size={12} /> {t.featured}
            </div>
          ) : null}

          {mediaItems.length > 1 ? (
            <>
              <button
                type="button"
                onClick={(event) => {
                  event.preventDefault();
                  moveSlide(-1);
                }}
                className="absolute left-4 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/55 text-white backdrop-blur"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                type="button"
                onClick={(event) => {
                  event.preventDefault();
                  moveSlide(1);
                }}
                className="absolute right-4 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/55 text-white backdrop-blur"
              >
                <ChevronRight size={18} />
              </button>
              <div className="absolute right-4 top-16 rounded-full bg-black/55 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
                {activeIndex + 1}/{mediaItems.length}
              </div>
              <div className="absolute bottom-18 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-black/40 px-3 py-1.5 backdrop-blur">
                {mediaItems.map((item, index) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={(event) => {
                      event.preventDefault();
                      setActiveIndex(index);
                    }}
                    className={`h-2.5 w-2.5 rounded-full transition ${
                      activeIndex === index ? "bg-primary" : "bg-white/35"
                    }`}
                  />
                ))}
              </div>
            </>
          ) : null}

          <div className="pointer-events-none absolute bottom-4 left-4 right-4 flex flex-wrap gap-2">
            <span className="rounded-full border border-white/10 bg-black/60 px-3 py-1.5 text-[13px] font-bold text-white shadow-sm backdrop-blur-md">
              {catchItem.species}
            </span>
            {catchItem.weightKg ? (
              <span className="rounded-full border border-white/10 bg-black/60 px-3 py-1.5 text-[13px] font-bold text-white shadow-sm backdrop-blur-md">
                {formatWeight(catchItem.weightKg, lang)}
              </span>
            ) : null}
            {catchItem.lengthCm ? (
              <span className="rounded-full border border-white/10 bg-black/60 px-3 py-1.5 text-[13px] font-bold text-white shadow-sm backdrop-blur-md">
                {formatLength(catchItem.lengthCm, lang)}
              </span>
            ) : null}
          </div>
        </div>
      </Link>

      {showActions ? (
        <div className="px-2 py-1">
          <CatchEngagementBar
            catchId={catchItem.id}
            initialLikesCount={catchItem.likesCount}
            initialCommentsCount={catchItem.commentsCount}
            initiallyLiked={catchItem.likedByViewer}
            initialRepostsCount={catchItem.repostsCount ?? 0}
            initiallyReposted={catchItem.repostedByViewer ?? false}
          />
        </div>
      ) : null}

      <div className="px-4 pb-5 sm:px-5">
        {catchItem.note || catchItem.bait ? (
          <div className="mt-1">
            {catchItem.note ? (
              <div className="text-[14px] leading-relaxed text-white">
                <Link href={`/profile/${catchItem.user.handle}`} className="mr-2 font-bold hover:underline">
                  {catchItem.user.name}
                </Link>
                <span className="inline opacity-90">{catchItem.note}</span>
              </div>
            ) : null}

            {catchItem.bait ? (
              <div className="mt-2 inline-flex items-center gap-1.5 rounded-md border border-white/5 bg-surface-soft px-2 py-1 text-[12px] font-medium text-text-muted">
                {t.bait}: <span className="text-white">{catchItem.bait}</span>
              </div>
            ) : null}
          </div>
        ) : null}

        {showActions && catchItem.commentsCount > 0 ? (
          <Link href={`/feed/${catchItem.id}`} className="mt-2 inline-block text-[14px] font-medium text-text-muted transition-colors hover:text-white">
            {t.viewComments(catchItem.commentsCount)}
          </Link>
        ) : null}
      </div>
    </article>
  );
}

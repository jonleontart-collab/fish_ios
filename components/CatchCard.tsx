'use client';

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { MapPin, Trophy, MoreHorizontal, ImagePlus } from "lucide-react";
import { CatchEngagementBar } from "@/components/CatchEngagementBar";
import { withBasePath } from "@/lib/app-paths";
import { formatFeedDate, formatLength, formatWeight } from "@/lib/format";

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
    isFeatured: boolean;
    aiConfidence: number | null;
    createdAt: Date;
    user: {
      name: string;
      handle: string;
      avatarGradient: string;
      avatarPath?: string | null;
    };
    place: {
      name: string;
      city: string;
    };
  };
  showUser?: boolean;
  showActions?: boolean;
};

// Internal safe image component
function CatchImage({ src, alt, species }: { src: string; alt: string; species: string }) {
  const [error, setError] = useState(false);

  if (!src || error) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-[#0a1520] border-y border-white/5 relative">
        <ImagePlus size={32} className="text-white/10 mb-2" />
        <span className="text-[14px] font-semibold text-white/30">{species}</span>
      </div>
    );
  }

  return (
    <img
      src={withBasePath(src)}
      alt={alt}
      className="object-cover w-full h-full"
      onError={() => setError(true)}
    />
  );
}

export function CatchCard({ catchItem, showUser = true, showActions = true }: CatchCardProps) {
  return (
    <article className="bg-background sm:bg-surface-elevated sm:border sm:border-white/5 sm:rounded-[32px] overflow-hidden mb-8 shadow-sm">
      
      {/* 1. Header (User Info) */}
      {showUser && (
        <div className="flex items-center justify-between px-4 sm:px-5 py-3.5">
          <div className="flex items-center gap-3 w-full">
            <Link href={`/profile/${catchItem.user.handle}`} className="shrink-0 rounded-full overflow-hidden border border-white/10 relative group">
              {catchItem.user.avatarPath ? (
                <img
                  src={withBasePath(catchItem.user.avatarPath)}
                  alt={catchItem.user.name}
                  className="h-10 w-10 object-cover group-hover:scale-105 transition-transform"
                />
              ) : (
                <div className={`flex h-10 w-10 items-center justify-center bg-gradient-to-br ${catchItem.user.avatarGradient}`}>
                  <span className="font-bold text-white text-[15px]">
                    {catchItem.user.name.slice(0, 1).toUpperCase()}
                  </span>
                </div>
              )}
            </Link>
            
            <div className="flex flex-col flex-1 min-w-0">
              <div className="flex items-center gap-1.5 align-baseline">
                 <Link href={`/profile/${catchItem.user.handle}`} className="font-bold text-white text-[14px] hover:underline truncate">
                   {catchItem.user.name}
                 </Link>
                 <span className="text-text-muted text-[13px]">•</span>
                 <span suppressHydrationWarning className="text-text-muted text-[13px] truncate">{formatFeedDate(catchItem.createdAt)}</span>
              </div>
              
              <Link href={`/places`} className="flex items-center gap-1 mt-0.5 group">
                <MapPin size={12} className="text-primary" />
                <span className="text-[12px] font-medium text-text-muted group-hover:text-white transition-colors truncate">
                  {catchItem.place.name}{catchItem.place.city ? `, ${catchItem.place.city}` : ""}
                </span>
              </Link>
            </div>
            
            <button className="h-8 w-8 rounded-full hover:bg-white/10 flex items-center justify-center text-text-muted hover:text-white transition-colors shrink-0">
              <MoreHorizontal size={18} />
            </button>
          </div>
        </div>
      )}

      {/* 2. Media Area (Instagram style edge-to-edge) */}
      <Link href={`/feed/${catchItem.id}`} className="block relative group">
        <div className="relative aspect-[4/5] sm:aspect-square w-full bg-black">
          <CatchImage src={catchItem.imagePath} alt={catchItem.species} species={catchItem.species} />
          
          {catchItem.isFeatured && (
            <div className="absolute top-4 right-4 flex items-center gap-1.5 rounded-full bg-warning/90 backdrop-blur-md px-3 py-1.5 text-[11px] font-bold text-black shadow-lg">
              <Trophy size={12} /> Трофей
            </div>
          )}

          {/* Integrated Statistics overlay, very minimal */}
          <div className="absolute bottom-4 left-4 right-4 flex flex-wrap gap-2 pointer-events-none">
             <span className="px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md text-white font-bold text-[13px] shadow-sm border border-white/10">
               {catchItem.species}
             </span>
             {catchItem.weightKg && (
               <span className="px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md text-white font-bold text-[13px] shadow-sm border border-white/10">
                 {formatWeight(catchItem.weightKg)}
               </span>
             )}
             {catchItem.lengthCm && (
               <span className="px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md text-white font-bold text-[13px] shadow-sm border border-white/10">
                 {formatLength(catchItem.lengthCm)}
               </span>
             )}
          </div>
        </div>
      </Link>

      {/* 3. Actions Toolbar */}
      {showActions && (
        <div className="px-2 py-1">
          <CatchEngagementBar
            catchId={catchItem.id}
            initialLikesCount={catchItem.likesCount}
            initialCommentsCount={catchItem.commentsCount}
            initiallyLiked={catchItem.likedByViewer}
          />
        </div>
      )}

      {/* 4. Description and Comments */}
      <div className="px-4 sm:px-5 pb-5">
        {(catchItem.note || catchItem.bait) && (
          <div className="mt-1">
             {catchItem.note && (
               <div className="text-[14px] leading-relaxed text-white">
                 <Link href={`/profile/${catchItem.user.handle}`} className="font-bold mr-2 hover:underline">
                   {catchItem.user.name}
                 </Link>
                 <span className="inline opacity-90">{catchItem.note}</span>
               </div>
             )}
             
             {catchItem.bait && (
               <div className="mt-2 inline-flex items-center gap-1.5 rounded-md bg-surface-soft px-2 py-1 text-[12px] font-medium text-text-muted border border-white/5">
                 Наживка: <span className="text-white">{catchItem.bait}</span>
               </div>
             )}
          </div>
        )}
        
        {/* Link to detail page if comments exist but we are showing the card in feed */}
        {showActions && catchItem.commentsCount > 0 && (
          <Link href={`/feed/${catchItem.id}`} className="inline-block mt-2 text-[14px] font-medium text-text-muted hover:text-white transition-colors">
            Смотреть все комментарии ({catchItem.commentsCount})
          </Link>
        )}
      </div>
    </article>
  );
}

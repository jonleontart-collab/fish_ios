import type { CSSProperties } from "react";
import Link from "next/link";
import { ChevronRight, Users } from "lucide-react";

import { FriendsDrawer } from "@/components/FriendsDrawer";
import { UserAvatar } from "@/components/UserAvatar";
import { withBasePath } from "@/lib/app-paths";

type FriendItem = {
  id: string;
  name: string;
  handle: string;
  city?: string | null;
  avatarPath?: string | null;
  avatarGradient: string;
};

type FriendsPanelProps = {
  title: string;
  subtitle?: string;
  emptyTitle: string;
  emptyDescription: string;
  openLabel: string;
  friends: FriendItem[];
  variant?: "home" | "profile";
  className?: string;
};

function panelSceneStyle(imagePath: string) {
  return {
    "--panel-scene-image": `url('${withBasePath(imagePath)}')`,
  } as CSSProperties;
}

export function FriendsPanel({
  title,
  subtitle,
  emptyTitle,
  emptyDescription,
  openLabel,
  friends,
  variant = "profile",
  className = "",
}: FriendsPanelProps) {
  const previewFriends = friends.slice(0, variant === "home" ? 3 : 4);

  return (
    <section
      className={`glass-panel panel-scene rounded-[30px] border border-border-subtle p-4 ${className}`.trim()}
      style={panelSceneStyle("/modal-backgrounds/chat-sheet-bg.png")}
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="min-w-0">
          {subtitle ? <div className="text-sm text-text-muted">{subtitle}</div> : null}
          <h2 className="mt-1 text-[20px] font-semibold tracking-tight text-white">{title}</h2>
        </div>
        <FriendsDrawer title={title} subtitle={subtitle} friends={friends}>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/8 px-3.5 py-2 text-sm font-semibold text-text-main transition hover:bg-white/12"
          >
            <span>{openLabel}</span>
            <ChevronRight size={15} className="text-primary" />
          </button>
        </FriendsDrawer>
      </div>

      {previewFriends.length > 0 ? (
        variant === "home" ? (
          <div className="space-y-3">
            {previewFriends.map((friend) => (
              <Link
                key={friend.id}
                href={`/profile/${friend.handle}`}
                className="flex items-center gap-3 rounded-[22px] border border-white/8 bg-black/22 px-3.5 py-3 transition hover:bg-black/30"
              >
                <UserAvatar
                  name={friend.name}
                  avatarPath={friend.avatarPath}
                  className="h-11 w-11 border border-white/10"
                  fallbackClassName="bg-white/8"
                  iconSize={16}
                />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold text-white">{friend.name}</div>
                  <div className="truncate text-xs text-text-muted">
                    @{friend.handle}
                    {friend.city ? `, ${friend.city}` : ""}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {previewFriends.map((friend) => (
              <Link
                key={friend.id}
                href={`/profile/${friend.handle}`}
                className="rounded-[22px] border border-white/8 bg-black/22 p-3 text-center transition hover:bg-black/30"
              >
                <UserAvatar
                  name={friend.name}
                  avatarPath={friend.avatarPath}
                  className="mx-auto h-16 w-16 border border-white/10"
                  fallbackClassName="bg-white/8"
                  iconSize={20}
                />
                <div className="mt-3 truncate text-sm font-semibold text-white">{friend.name}</div>
                <div className="truncate text-xs text-text-muted">
                  @{friend.handle}
                  {friend.city ? `, ${friend.city}` : ""}
                </div>
              </Link>
            ))}
          </div>
        )
      ) : (
        <div className="rounded-[24px] border border-dashed border-white/10 bg-black/22 px-5 py-8 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white/6 text-text-muted">
            <Users size={18} />
          </div>
          <div className="font-semibold text-white">{emptyTitle}</div>
          <div className="mt-2 text-sm leading-6 text-text-muted">{emptyDescription}</div>
        </div>
      )}
    </section>
  );
}

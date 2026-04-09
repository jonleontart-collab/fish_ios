"use client";

import { Drawer } from "vaul";
import { Users, X } from "lucide-react";

import { DirectChatButton } from "@/components/DirectChatButton";
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

export function FriendsDrawer({
  title,
  subtitle,
  friends,
  children,
}: {
  title: string;
  subtitle?: string;
  friends: FriendItem[];
  children: React.ReactNode;
}) {
  return (
    <Drawer.Root>
      <Drawer.Trigger asChild>{children}</Drawer.Trigger>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-[1000] bg-black/72 backdrop-blur-md" />
        <Drawer.Content
          className="fixed bottom-0 left-0 right-0 z-[1001] mx-auto mt-24 flex max-h-[90vh] max-w-md flex-col overflow-hidden rounded-t-[36px] border-t border-white/10 bg-[#09111a] outline-none"
          style={{
            backgroundImage: `linear-gradient(180deg, rgba(5, 9, 15, 0.82), rgba(5, 9, 15, 0.96)), url('${withBasePath("/modal-backgrounds/chat-sheet-bg.png")}')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="hide-scrollbar flex-1 overflow-y-auto">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/5 bg-[#09111a]/90 px-6 py-5 backdrop-blur-xl">
              <div>
                {subtitle ? <div className="text-sm text-text-muted">{subtitle}</div> : null}
                <h2 className="text-lg font-bold text-white">{title}</h2>
              </div>
              <Drawer.Close asChild>
                <button
                  type="button"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white/6 text-text-muted transition hover:text-white"
                >
                  <X size={16} />
                </button>
              </Drawer.Close>
            </div>

            <div className="space-y-3 p-4 pb-10">
              {friends.length > 0 ? (
                friends.map((friend) => (
                  <div
                    key={friend.id}
                    className="flex items-center gap-3 rounded-[24px] border border-white/8 bg-black/24 px-4 py-4 backdrop-blur-xl"
                  >
                    <UserAvatar
                      name={friend.name}
                      avatarPath={friend.avatarPath}
                      className="h-12 w-12"
                      fallbackClassName="border border-white/10 bg-white/8"
                      iconSize={18}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-semibold text-white">{friend.name}</div>
                      <div className="truncate text-sm text-text-muted">
                        @{friend.handle}
                        {friend.city ? `, ${friend.city}` : ""}
                      </div>
                    </div>
                    <DirectChatButton handle={friend.handle} label="Чат" className="px-3 py-2.5" />
                  </div>
                ))
              ) : (
                <div className="rounded-[24px] border border-dashed border-white/10 bg-black/20 px-5 py-8 text-center">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white/6 text-text-muted">
                    <Users size={18} />
                  </div>
                  <div className="font-semibold text-white">Пока без друзей</div>
                  <div className="mt-2 text-sm leading-6 text-text-muted">
                    Добавь людей из профилей, и они появятся здесь для быстрого перехода в чат.
                  </div>
                </div>
              )}
            </div>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}

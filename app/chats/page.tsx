import Link from "next/link";
import { ArrowRight, MessageSquare, PlusCircle, Users } from "lucide-react";
import { CreateChatForm } from "@/components/CreateChatForm";
import { JoinChatButton } from "@/components/JoinChatButton";
import { chatVisibilityLabel, formatFeedDate } from "@/lib/format";
import { getChatsInboxData } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function ChatsPage() {
  const data = await getChatsInboxData();

  return (
    <div className="space-y-5 px-4 pb-8 pt-safe">
      <header className="space-y-1">
        <h1 className="font-display text-[32px] font-bold tracking-tight text-white drop-shadow-sm">
          Сообщения
        </h1>
        <p className="text-[15px] font-medium text-text-muted">Чаты, друзья и местные клубы</p>
      </header>

      <CreateChatForm />

      <section className="space-y-3">
        <div>
          <div className="text-sm text-text-muted">Твои переписки</div>
          <h2 className="font-display text-2xl font-semibold text-text-main">Открывай как мессенджер</h2>
        </div>

        <div className="space-y-3">
          {data.chats.length > 0 ? (
            data.chats.map((chatItem) => {
              const latestMessage = chatItem.messages[0] ?? null;

              return (
                <Link
                  key={chatItem.id}
                  href={`/chats/${chatItem.slug}`}
                  className="glass-panel block rounded-[26px] border border-border-subtle p-4 transition hover:border-primary/20"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div
                        className="mt-1 flex h-12 w-12 items-center justify-center rounded-full"
                        style={{ backgroundColor: `${chatItem.accentColor}20`, color: chatItem.accentColor }}
                      >
                        <MessageSquare size={18} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <div className="truncate font-semibold text-text-main">{chatItem.title}</div>
                          <span className="rounded-full bg-white/6 px-2 py-1 text-[10px] font-semibold text-text-muted">
                            {chatVisibilityLabel(chatItem.visibility)}
                          </span>
                        </div>
                        <div className="mt-1 text-sm text-text-muted">
                          {latestMessage
                            ? `${latestMessage.user.name}: ${latestMessage.body}`
                            : chatItem.description ?? "Сообщений пока нет"}
                        </div>
                        <div className="mt-3 flex items-center gap-3 text-xs text-text-soft">
                          <span className="inline-flex items-center gap-1">
                            <Users size={13} />
                            {chatItem._count.members}
                          </span>
                          {latestMessage ? <span>{formatFeedDate(latestMessage.createdAt)}</span> : null}
                        </div>
                      </div>
                    </div>
                    <ArrowRight size={16} className="shrink-0 text-text-muted" />
                  </div>
                </Link>
              );
            })
          ) : (
            <div className="glass-panel rounded-[28px] border border-dashed border-border-subtle p-5 text-sm text-text-muted">
              Пока нет активных переписок. Создай свой чат или вступи в открытое сообщество ниже.
            </div>
          )}
        </div>
      </section>

      <section className="space-y-3">
        <div>
          <div className="text-sm text-text-muted">Открытые чаты</div>
          <h2 className="font-display text-2xl font-semibold text-text-main">Можно вступить</h2>
        </div>
        <div className="space-y-3">
          {data.discoverableChats.length > 0 ? (
            data.discoverableChats.map((chatItem) => (
              <div
                key={chatItem.id}
                className="glass-panel rounded-[26px] border border-border-subtle p-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="font-semibold text-text-main">{chatItem.title}</div>
                      <span className="rounded-full bg-white/6 px-3 py-1 text-[11px] font-semibold text-text-muted">
                        {chatVisibilityLabel(chatItem.visibility)}
                      </span>
                    </div>
                    <div className="text-sm leading-6 text-text-muted">{chatItem.description}</div>
                    <div className="text-xs text-text-soft">
                      Ведет {chatItem.owner.name}
                      {chatItem.locationLabel ? ` · ${chatItem.locationLabel}` : ""}
                    </div>
                    <div className="text-xs text-text-soft">
                      {chatItem._count.members} участников · {chatItem._count.messages} сообщений
                    </div>
                  </div>
                  <JoinChatButton chatId={chatItem.id} />
                </div>
              </div>
            ))
          ) : (
            <div className="glass-panel rounded-[28px] border border-dashed border-border-subtle p-5 text-sm text-text-muted">
              Сейчас нет доступных открытых чатов. Можно создать новый под свой регион или стиль ловли.
            </div>
          )}
        </div>
      </section>

      <Link href="/explore" className="inline-flex items-center gap-2 text-sm font-semibold text-primary">
        <PlusCircle size={16} />
        Добавить место и обсудить его потом в чатах
      </Link>
    </div>
  );
}

import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, MapPin, MessageSquare, Users, Lock } from "lucide-react";
import { ChatComposer } from "@/components/ChatComposer";
import { chatVisibilityLabel, formatFeedDate } from "@/lib/format";
import { getChatThreadData } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function ChatThreadPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = await getChatThreadData(slug);

  if (!data.activeChat) {
    notFound();
  }

  return (
    <div className="space-y-5 px-4 pb-8 pt-safe">
      <Link href="/chats" className="inline-flex items-center gap-2 text-sm font-semibold text-text-muted">
        <ArrowLeft size={16} />
        Назад к списку чатов
      </Link>

      <section
        className="glass-panel relative overflow-hidden rounded-[30px] border border-border-subtle p-4"
        style={{
          backgroundImage: "url('/patterns/pattern-chat-sonar.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-background/76" />
        <div className="relative space-y-5">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-text-muted">
              <MessageSquare size={15} />
              <span>{chatVisibilityLabel(data.activeChat.visibility)}</span>
            </div>
            <h1 className="font-display text-[28px] font-semibold text-text-main">{data.activeChat.title}</h1>
            {data.activeChat.description ? (
              <p className="text-sm leading-6 text-text-muted">{data.activeChat.description}</p>
            ) : null}
            <div className="flex flex-wrap gap-3 text-xs text-text-soft">
              <span className="inline-flex items-center gap-1">
                <Users size={13} />
                {data.activeChat.members.length} участников
              </span>
              {data.activeChat.locationLabel ? (
                <span className="inline-flex items-center gap-1">
                  <MapPin size={13} />
                  {data.activeChat.locationLabel}
                </span>
              ) : null}
            </div>
          </div>

          <div className="space-y-4">
            
            <div className="flex justify-center py-2">
                 <div className="inline-flex items-center gap-2 bg-black/40 px-4 py-2 rounded-[14px] border border-white/5 backdrop-blur-md shadow-inner">
                     <Lock size={14} className="text-[#EAB308]" />
                     <span className="text-[11px] font-bold text-[#EAB308]/90 uppercase tracking-widest text-center">Сообщения защищены E2EE-шифрованием</span>
                 </div>
            </div>

            {data.activeChat.messages.map((message) => {
              const own = message.userId === data.user.id;

              return (
                <div key={message.id} className={`flex ${own ? "justify-end" : "justify-start"}`}>
                  {!own && (
                     <div className="mr-2 mt-auto shrink-0 w-8 h-8 rounded-full overflow-hidden border border-white/10 bg-surface-strong flex items-center justify-center">
                        <span className="text-[10px] font-bold text-white">{message.user.name.charAt(0)}</span>
                     </div>
                  )}
                  <div
                    className={`max-w-[75%] rounded-[24px] px-4 py-3 shadow-lg ${
                      own
                        ? "bg-gradient-to-br from-primary to-primary-strong text-background rounded-br-[8px]"
                        : "glass-panel border-white/10 text-text-main rounded-bl-[8px]"
                    }`}
                  >
                    {!own && (
                      <div className="text-xs font-semibold text-primary mb-1">
                        <Link href={`/profile/${message.user.handle}`}>{message.user.name}</Link>
                      </div>
                    )}
                    <div className="text-[15px] leading-relaxed">{message.body}</div>
                    <div className={`mt-1.5 text-[10px] font-medium text-right ${own ? "text-background/60" : "text-text-soft"}`}>
                      {formatFeedDate(message.createdAt)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <ChatComposer chatId={data.activeChat.id} />
        </div>
      </section>

      {data.chats.length > 1 ? (
        <section className="space-y-3">
          <div>
            <div className="text-sm text-text-muted">Другие чаты</div>
            <h2 className="font-display text-2xl font-semibold text-text-main">Быстрый переход</h2>
          </div>
          <div className="space-y-3">
            {data.chats
              .filter((chatItem) => chatItem.id !== data.activeChat?.id)
              .slice(0, 3)
              .map((chatItem) => (
                <Link
                  key={chatItem.id}
                  href={`/chats/${chatItem.slug}`}
                  className="glass-panel block rounded-[24px] border border-border-subtle p-4"
                >
                  <div className="font-semibold text-text-main">{chatItem.title}</div>
                  <div className="mt-1 text-sm text-text-muted">
                    {chatItem.messages[0]
                      ? `${chatItem.messages[0].user.name}: ${chatItem.messages[0].body}`
                      : chatItem.description}
                  </div>
                </Link>
              ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}

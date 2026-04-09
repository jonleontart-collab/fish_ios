import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, MapPin, MessageSquare, Users } from "lucide-react";

import { ChatThreadClient } from "@/components/ChatThreadClient";
import { withBasePath } from "@/lib/app-paths";
import { chatVisibilityLabel, formatFeedDate } from "@/lib/format";
import { getChatDisplayDescription, getChatDisplayTitle, getMessagePreviewText } from "@/lib/chat";
import { type TranslationMap } from "@/lib/i18n";
import { getServerLanguage } from "@/lib/i18n-server";
import { getChatThreadData } from "@/lib/queries";

export const dynamic = "force-dynamic";

const translations: TranslationMap<{
  back: string;
  otherChats: string;
  quickSwitch: string;
  members: (count: number) => string;
}> = {
  ru: {
    back: "Назад к чатам",
    otherChats: "Другие чаты",
    quickSwitch: "Быстрый переход",
    members: (count) => `${count} участников`,
  },
  en: {
    back: "Back to chats",
    otherChats: "Other chats",
    quickSwitch: "Quick switch",
    members: (count) => `${count} members`,
  },
  es: {
    back: "Volver a chats",
    otherChats: "Otros chats",
    quickSwitch: "Cambio rápido",
    members: (count) => `${count} participantes`,
  },
  fr: {
    back: "Retour aux chats",
    otherChats: "Autres chats",
    quickSwitch: "Accès rapide",
    members: (count) => `${count} membres`,
  },
  pt: {
    back: "Voltar aos chats",
    otherChats: "Outros chats",
    quickSwitch: "Troca rápida",
    members: (count) => `${count} membros`,
  },
};

export default async function ChatThreadPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const lang = await getServerLanguage();
  const t = translations[lang];
  const { slug } = await params;
  const data = await getChatThreadData(slug);

  if (!data.activeChat) {
    notFound();
  }

  const chatTitle = getChatDisplayTitle(data.activeChat, data.user.id);
  const chatDescription = getChatDisplayDescription(data.activeChat, data.user.id) ?? data.activeChat.description;

  return (
    <div className="space-y-5 px-4 pb-8 pt-safe">
      <Link href="/chats" className="inline-flex items-center gap-2 text-sm font-semibold text-text-muted">
        <ArrowLeft size={16} />
        {t.back}
      </Link>

      <section
        className="glass-panel relative overflow-hidden rounded-[30px] border border-border-subtle p-4"
        style={{
          backgroundImage: `linear-gradient(180deg, rgba(5, 9, 15, 0.82), rgba(5, 9, 15, 0.98)), url('${withBasePath("/modal-backgrounds/chat-sheet-bg.png")}')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="relative space-y-5">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-text-muted">
              <MessageSquare size={15} />
              <span>{chatVisibilityLabel(data.activeChat.visibility, lang)}</span>
            </div>
            <h1 className="font-display text-[28px] font-semibold text-text-main">{chatTitle}</h1>
            {chatDescription ? <p className="text-sm leading-6 text-text-muted">{chatDescription}</p> : null}
            <div className="flex flex-wrap gap-3 text-xs text-text-soft">
              <span className="inline-flex items-center gap-1">
                <Users size={13} />
                {t.members(data.activeChat.members.length)}
              </span>
              {data.activeChat.locationLabel ? (
                <span className="inline-flex items-center gap-1">
                  <MapPin size={13} />
                  {data.activeChat.locationLabel}
                </span>
              ) : null}
            </div>
          </div>

          <ChatThreadClient chatId={data.activeChat.id} currentUserId={data.user.id} initialMessages={data.activeChat.messages} />
        </div>
      </section>

      {data.chats.length > 1 ? (
        <section className="space-y-3">
          <div>
            <div className="text-sm text-text-muted">{t.otherChats}</div>
            <h2 className="font-display text-2xl font-semibold text-text-main">{t.quickSwitch}</h2>
          </div>
          <div className="space-y-3">
            {data.chats
              .filter((chatItem) => chatItem.id !== data.activeChat?.id)
              .slice(0, 3)
              .map((chatItem) => {
                const latestMessage = chatItem.messages[0] ?? null;

                return (
                  <Link
                    key={chatItem.id}
                    href={`/chats/${chatItem.slug}`}
                    className="glass-panel block rounded-[24px] border border-border-subtle p-4"
                  >
                    <div className="font-semibold text-text-main">{getChatDisplayTitle(chatItem, data.user.id)}</div>
                    <div className="mt-1 text-sm text-text-muted">
                      {latestMessage
                        ? `${latestMessage.user.name}: ${getMessagePreviewText(latestMessage, lang)}`
                        : getChatDisplayDescription(chatItem, data.user.id) ?? chatItem.description}
                    </div>
                    {latestMessage ? (
                      <div className="mt-2 text-xs text-text-soft">{formatFeedDate(latestMessage.createdAt, lang)}</div>
                    ) : null}
                  </Link>
                );
              })}
          </div>
        </section>
      ) : null}
    </div>
  );
}

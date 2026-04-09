import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Lock, MapPin, MessageSquare, Users } from "lucide-react";

import { ChatComposer } from "@/components/ChatComposer";
import { chatVisibilityLabel, formatFeedDate } from "@/lib/format";
import { type TranslationMap } from "@/lib/i18n";
import { getServerLanguage } from "@/lib/i18n-server";
import { getChatThreadData } from "@/lib/queries";

export const dynamic = "force-dynamic";

const translations: TranslationMap<{
  back: string;
  encrypted: string;
  otherChats: string;
  quickSwitch: string;
  members: (count: number) => string;
}> = {
  ru: {
    back: "Назад к списку чатов",
    encrypted: "Сообщения защищены E2EE-шифрованием",
    otherChats: "Другие чаты",
    quickSwitch: "Быстрый переход",
    members: (count) => `${count} участников`,
  },
  en: {
    back: "Back to chats",
    encrypted: "Messages are protected with E2EE encryption",
    otherChats: "Other chats",
    quickSwitch: "Quick switch",
    members: (count) => `${count} members`,
  },
  es: {
    back: "Volver a chats",
    encrypted: "Los mensajes están protegidos con cifrado E2EE",
    otherChats: "Otros chats",
    quickSwitch: "Cambio rápido",
    members: (count) => `${count} participantes`,
  },
  fr: {
    back: "Retour aux chats",
    encrypted: "Les messages sont protégés par un chiffrement E2EE",
    otherChats: "Autres chats",
    quickSwitch: "Accès rapide",
    members: (count) => `${count} membres`,
  },
  pt: {
    back: "Voltar aos chats",
    encrypted: "As mensagens são protegidas com criptografia E2EE",
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

  return (
    <div className="space-y-5 px-4 pb-8 pt-safe">
      <Link href="/chats" className="inline-flex items-center gap-2 text-sm font-semibold text-text-muted">
        <ArrowLeft size={16} />
        {t.back}
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
              <span>{chatVisibilityLabel(data.activeChat.visibility, lang)}</span>
            </div>
            <h1 className="font-display text-[28px] font-semibold text-text-main">{data.activeChat.title}</h1>
            {data.activeChat.description ? <p className="text-sm leading-6 text-text-muted">{data.activeChat.description}</p> : null}
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

          <div className="space-y-4">
            <div className="flex justify-center py-2">
              <div className="inline-flex items-center gap-2 rounded-[14px] border border-white/5 bg-black/40 px-4 py-2 backdrop-blur-md shadow-inner">
                <Lock size={14} className="text-[#EAB308]" />
                <span className="text-center text-[11px] font-bold uppercase tracking-widest text-[#EAB308]/90">
                  {t.encrypted}
                </span>
              </div>
            </div>

            {data.activeChat.messages.map((message) => {
              const own = message.userId === data.user.id;

              return (
                <div key={message.id} className={`flex ${own ? "justify-end" : "justify-start"}`}>
                  {!own ? (
                    <div className="mr-2 mt-auto flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/10 bg-surface-strong text-[10px] font-bold text-white">
                      {message.user.name.charAt(0)}
                    </div>
                  ) : null}
                  <div
                    className={`max-w-[75%] rounded-[24px] px-4 py-3 shadow-lg ${
                      own
                        ? "rounded-br-[8px] bg-gradient-to-br from-primary to-primary-strong text-background"
                        : "glass-panel rounded-bl-[8px] border-white/10 text-text-main"
                    }`}
                  >
                    {!own ? (
                      <div className="mb-1 text-xs font-semibold text-primary">
                        <Link href={`/profile/${message.user.handle}`}>{message.user.name}</Link>
                      </div>
                    ) : null}
                    <div className="text-[15px] leading-relaxed">{message.body}</div>
                    <div className={`mt-1.5 text-right text-[10px] font-medium ${own ? "text-background/60" : "text-text-soft"}`}>
                      {formatFeedDate(message.createdAt, lang)}
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
            <div className="text-sm text-text-muted">{t.otherChats}</div>
            <h2 className="font-display text-2xl font-semibold text-text-main">{t.quickSwitch}</h2>
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

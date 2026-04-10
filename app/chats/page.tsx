import type { CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Shield, Users } from "lucide-react";

import { CreateChatForm } from "@/components/CreateChatForm";
import { FriendsDrawer } from "@/components/FriendsDrawer";
import { SectionHeader } from "@/components/SectionHeader";
import { JoinChatButton } from "@/components/JoinChatButton";
import { UserAvatar } from "@/components/UserAvatar";
import { getChatCounterpart, getChatDisplayDescription, getChatDisplayTitle, getMessagePreviewText } from "@/lib/chat";
import { withBasePath } from "@/lib/app-paths";
import { chatVisibilityLabel, formatFeedDate } from "@/lib/format";
import { type TranslationMap } from "@/lib/i18n";
import { getServerLanguage } from "@/lib/i18n-server";
import { getChatsInboxData } from "@/lib/queries";

export const dynamic = "force-dynamic";

const translations: TranslationMap<{
  title: string;
  subtitle: string;
  yours: string;
  yoursTitle: string;
  friends: string;
  friendsTitle: string;
  openFriends: string;
  openChats: string;
  openChatsTitle: string;
  noMessages: string;
  noOwnChats: string;
  noOpenChats: string;
  noFriends: string;
  ledBy: string;
  support: string;
  membersAndMessages: (members: number, messages: number) => string;
  addPlace: string;
}> = {
  ru: {
    title: "Сообщения",
    subtitle: "Личные диалоги, поддержка и сообщества рядом",
    yours: "Ваши чаты",
    yoursTitle: "Недавние диалоги",
    friends: "Друзья",
    friendsTitle: "Быстрый доступ",
    openFriends: "Открыть",
    openChats: "Открытые сообщества",
    openChatsTitle: "Чаты рядом и по интересам",
    noMessages: "Сообщений пока нет",
    noOwnChats: "Пока нет активных переписок. Создай чат или открой личный диалог с друзьями.",
    noOpenChats: "Сейчас нет доступных открытых чатов. Можно создать новый под свой регион или стиль ловли.",
    noFriends: "Список друзей пока пуст. Добавляй людей из профилей, и они появятся здесь.",
    ledBy: "Ведет",
    support: "Поддержка",
    membersAndMessages: (members, messages) => `${members} участников, ${messages} сообщений`,
    addPlace: "Добавить место и обсудить его потом в чатах",
  },
  en: {
    title: "Messages",
    subtitle: "Direct chats, support, and nearby communities",
    yours: "Your chats",
    yoursTitle: "Recent conversations",
    friends: "Friends",
    friendsTitle: "Quick access",
    openFriends: "Open",
    openChats: "Open communities",
    openChatsTitle: "Nearby and interest-based chats",
    noMessages: "No messages yet",
    noOwnChats: "No active chats yet. Create one or open a direct conversation with friends.",
    noOpenChats: "There are no open chats available right now. You can create one for your region or fishing style.",
    noFriends: "Your friends list is empty for now.",
    ledBy: "Led by",
    support: "Support",
    membersAndMessages: (members, messages) => `${members} members, ${messages} messages`,
    addPlace: "Add a place and discuss it later in chats",
  },
  es: {
    title: "Mensajes",
    subtitle: "Diálogos directos, soporte y comunidades cercanas",
    yours: "Tus chats",
    yoursTitle: "Conversaciones recientes",
    friends: "Amigos",
    friendsTitle: "Acceso rápido",
    openFriends: "Abrir",
    openChats: "Comunidades abiertas",
    openChatsTitle: "Chats cercanos y por intereses",
    noMessages: "Todavía no hay mensajes",
    noOwnChats: "Aún no hay chats activos. Crea uno o abre una conversación directa con amigos.",
    noOpenChats: "Ahora mismo no hay chats abiertos disponibles. Puedes crear uno para tu región o estilo.",
    noFriends: "Tu lista de amigos aún está vacía.",
    ledBy: "Lo lleva",
    support: "Soporte",
    membersAndMessages: (members, messages) => `${members} participantes, ${messages} mensajes`,
    addPlace: "Añadir un lugar y comentarlo luego en chats",
  },
  fr: {
    title: "Messages",
    subtitle: "Dialogs directs, support et communautés proches",
    yours: "Vos chats",
    yoursTitle: "Conversations récentes",
    friends: "Amis",
    friendsTitle: "Accès rapide",
    openFriends: "Ouvrir",
    openChats: "Communautés ouvertes",
    openChatsTitle: "Chats proches et thématiques",
    noMessages: "Pas encore de messages",
    noOwnChats: "Aucune conversation active pour le moment. Créez-en une ou ouvrez un direct avec des amis.",
    noOpenChats: "Aucun chat ouvert disponible pour le moment. Vous pouvez en créer un pour votre région ou votre style.",
    noFriends: "Votre liste d'amis est vide pour le moment.",
    ledBy: "Animé par",
    support: "Support",
    membersAndMessages: (members, messages) => `${members} membres, ${messages} messages`,
    addPlace: "Ajouter un spot et en parler ensuite dans les chats",
  },
  pt: {
    title: "Mensagens",
    subtitle: "Diálogos diretos, suporte e comunidades por perto",
    yours: "Seus chats",
    yoursTitle: "Conversas recentes",
    friends: "Amigos",
    friendsTitle: "Acesso rápido",
    openFriends: "Abrir",
    openChats: "Comunidades abertas",
    openChatsTitle: "Chats próximos e por interesse",
    noMessages: "Ainda não há mensagens",
    noOwnChats: "Ainda não há chats ativos. Crie um ou abra um diálogo direto com amigos.",
    noOpenChats: "Não há chats abertos disponíveis agora. Você pode criar um para sua região ou estilo.",
    noFriends: "Sua lista de amigos ainda está vazia.",
    ledBy: "Conduzido por",
    support: "Suporte",
    membersAndMessages: (members, messages) => `${members} membros, ${messages} mensagens`,
    addPlace: "Adicionar um local e discutir depois nos chats",
  },
};

export default async function ChatsPage() {
  const lang = await getServerLanguage();
  const t = translations[lang];
  const data = await getChatsInboxData();
  const recentChatSceneStyle = {
    "--panel-scene-image": `url('${withBasePath("/modal-backgrounds/chat-sheet-bg.png")}')`,
  } as CSSProperties;
  const openChatSceneStyle = {
    "--panel-scene-image": `url('${withBasePath("/patterns/pattern-chat-sonar.png")}')`,
  } as CSSProperties;

  return (
    <div className="space-y-5 px-4 pb-8 pt-safe">
      <header className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="font-display text-[32px] font-bold tracking-tight text-white drop-shadow-sm">{t.title}</h1>
        </div>

        <FriendsDrawer title={t.friends} subtitle={t.friends} friends={data.friends}>
          <button
            type="button"
            className="relative inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/6 text-text-main transition hover:bg-white/10"
            aria-label={t.friends}
          >
            <Users size={20} />
            {data.friends.length > 0 ? (
              <span className="absolute -right-1 -top-1 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-slate-950">
                {data.friends.length > 9 ? "9+" : data.friends.length}
              </span>
            ) : null}
          </button>
        </FriendsDrawer>
      </header>

      <CreateChatForm />

      <section className="space-y-3">
        <SectionHeader title={t.yoursTitle} />

        <div className="space-y-3">
          {data.chats.length > 0 ? (
            data.chats.map((chatItem) => {
              const latestMessage = chatItem.messages[0] ?? null;
              const counterpart = getChatCounterpart(chatItem, data.user.id);
              const showCounterpartAvatar = chatItem.visibility === "PRIVATE" && counterpart;

              return (
                <Link
                  key={chatItem.id}
                  href={`/chats/${chatItem.slug}`}
                  className={`glass-panel panel-scene block rounded-[26px] border p-4 transition hover:border-primary/20 ${
                    chatItem.isSystem ? "border-primary/20 bg-primary/[0.06]" : "border-border-subtle"
                  }`}
                  style={recentChatSceneStyle}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-start gap-3">
                      <div
                        className={`mt-1 flex h-13 w-13 shrink-0 items-center justify-center overflow-hidden rounded-full border ${
                          chatItem.isSystem ? "border-primary/25 bg-primary/10" : "border-white/10"
                        }`}
                        style={chatItem.isSystem ? undefined : { backgroundColor: `${chatItem.accentColor}18` }}
                      >
                        {chatItem.isSystem ? (
                          <Shield size={18} className="text-primary" />
                        ) : showCounterpartAvatar && counterpart ? (
                          <UserAvatar
                            name={counterpart.name}
                            avatarPath={counterpart.avatarPath}
                            className="h-full w-full"
                            fallbackClassName="border-0 bg-white/8"
                            iconSize={16}
                          />
                        ) : (
                          <Image
                            src={withBasePath("/images/logo_chat.png")}
                            alt=""
                            width={24}
                            height={24}
                            className="h-6 w-6 object-contain"
                          />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <div className="truncate font-semibold text-text-main">
                            {getChatDisplayTitle(chatItem, data.user.id)}
                          </div>
                          {chatItem.isSystem ? (
                            <span className="inline-flex items-center gap-1 rounded-full border border-primary/20 bg-primary/12 px-2 py-1 text-[10px] font-semibold text-primary">
                              <Shield size={11} />
                              {t.support}
                            </span>
                          ) : (
                            <span className="rounded-full bg-white/6 px-2 py-1 text-[10px] font-semibold text-text-muted">
                              {chatVisibilityLabel(chatItem.visibility, lang)}
                            </span>
                          )}
                        </div>
                        <div className="mt-1 text-sm text-text-muted">
                          {latestMessage
                            ? `${latestMessage.user.name}: ${getMessagePreviewText(latestMessage, lang)}`
                            : getChatDisplayDescription(chatItem, data.user.id) ?? chatItem.description ?? t.noMessages}
                        </div>
                        <div className="mt-3 flex items-center gap-3 text-xs text-text-soft">
                          <span className="inline-flex items-center gap-1">
                            <Users size={13} />
                            {chatItem._count.members}
                          </span>
                          {latestMessage ? <span>{formatFeedDate(latestMessage.createdAt, lang)}</span> : null}
                        </div>
                      </div>
                    </div>
                    <ArrowRight size={16} className="shrink-0 text-text-muted" />
                  </div>
                </Link>
              );
            })
          ) : (
            <div
              className="glass-panel panel-scene rounded-[28px] border border-dashed border-border-subtle p-5 text-sm text-text-muted"
              style={recentChatSceneStyle}
            >
              {t.noOwnChats}
            </div>
          )}
        </div>
      </section>

      <section className="space-y-3">
        <SectionHeader title={t.openChatsTitle} />
        <div className="space-y-3">
          {data.discoverableChats.length > 0 ? (
            data.discoverableChats.map((chatItem) => (
              <div
                key={chatItem.id}
                className="glass-panel panel-scene rounded-[26px] border border-border-subtle p-4"
                style={openChatSceneStyle}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex min-w-0 gap-3">
                    <div
                      className="mt-1 flex h-13 w-13 shrink-0 items-center justify-center rounded-full border border-white/10"
                      style={{ backgroundColor: `${chatItem.accentColor}18` }}
                    >
                      <Image
                        src={withBasePath("/images/logo_chat.png")}
                        alt=""
                        width={24}
                        height={24}
                        className="h-6 w-6 object-contain"
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="font-semibold text-text-main">{chatItem.title}</div>
                        <span className="rounded-full bg-white/6 px-3 py-1 text-[11px] font-semibold text-text-muted">
                          {chatVisibilityLabel(chatItem.visibility, lang)}
                        </span>
                      </div>
                      <div className="text-sm leading-6 text-text-muted">{chatItem.description}</div>
                      <div className="text-xs text-text-soft">
                        {t.ledBy} {chatItem.owner.name}
                        {chatItem.locationLabel ? `, ${chatItem.locationLabel}` : ""}
                      </div>
                      <div className="text-xs text-text-soft">
                        {t.membersAndMessages(chatItem._count.members, chatItem._count.messages)}
                      </div>
                    </div>
                  </div>
                  <JoinChatButton chatId={chatItem.id} />
                </div>
              </div>
            ))
          ) : (
            <div
              className="glass-panel panel-scene rounded-[28px] border border-dashed border-border-subtle p-5 text-sm text-text-muted"
              style={openChatSceneStyle}
            >
              {t.noOpenChats}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export type NotificationSeenState = {
  chats: Record<string, string>;
  requests: Record<string, true>;
};

const STORAGE_PREFIX = "fishflow-notifications";
const UPDATE_EVENT = "fishflow:notifications-updated";

function createEmptyState(): NotificationSeenState {
  return {
    chats: {},
    requests: {},
  };
}

function getStorageKey(userId: string) {
  return `${STORAGE_PREFIX}:${userId}`;
}

export function readNotificationSeenState(userId: string): NotificationSeenState {
  if (typeof window === "undefined") {
    return createEmptyState();
  }

  try {
    const raw = localStorage.getItem(getStorageKey(userId));

    if (!raw) {
      return createEmptyState();
    }

    const parsed = JSON.parse(raw) as Partial<NotificationSeenState>;

    return {
      chats: parsed.chats && typeof parsed.chats === "object" ? parsed.chats : {},
      requests: parsed.requests && typeof parsed.requests === "object" ? parsed.requests : {},
    };
  } catch {
    return createEmptyState();
  }
}

function writeNotificationSeenState(userId: string, state: NotificationSeenState) {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(getStorageKey(userId), JSON.stringify(state));
  window.dispatchEvent(
    new CustomEvent(UPDATE_EVENT, {
      detail: { userId, state },
    }),
  );
}

export function markNotificationsSeen(
  userId: string,
  payload: {
    chats?: Array<{ chatId: string; messageId: string }>;
    requestIds?: string[];
  },
) {
  const nextState = readNotificationSeenState(userId);

  for (const chat of payload.chats ?? []) {
    if (!chat.chatId || !chat.messageId) {
      continue;
    }

    nextState.chats[chat.chatId] = chat.messageId;
  }

  for (const requestId of payload.requestIds ?? []) {
    if (!requestId) {
      continue;
    }

    nextState.requests[requestId] = true;
  }

  writeNotificationSeenState(userId, nextState);
  return nextState;
}

export function subscribeToNotificationState(
  userId: string,
  callback: (state: NotificationSeenState) => void,
) {
  if (typeof window === "undefined") {
    return () => {};
  }

  const handler = (event: Event) => {
    const customEvent = event as CustomEvent<{ userId?: string; state?: NotificationSeenState }>;

    if (customEvent.detail?.userId !== userId || !customEvent.detail.state) {
      return;
    }

    callback(customEvent.detail.state);
  };

  window.addEventListener(UPDATE_EVENT, handler);
  return () => window.removeEventListener(UPDATE_EVENT, handler);
}

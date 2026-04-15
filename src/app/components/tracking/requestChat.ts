import { useCallback, useEffect, useState } from "react";
import type { RealtimeChannel } from "@supabase/supabase-js";
import type { ResQAuthRole } from "@/utils/supabase/auth";
import { createClient } from "@/utils/supabase/client";

export type RequestChatSenderRole = ResQAuthRole | "system";

export type RequestChatMessage = {
  id: string;
  requestId: string;
  senderId: string | null;
  senderName: string;
  senderRole: RequestChatSenderRole;
  body: string;
  createdAt: string;
};

type RequestChatRecord = {
  id: string;
  request_id: string;
  sender_id: string | null;
  sender_name: string;
  sender_role: RequestChatSenderRole;
  body: string;
  created_at: string;
};

const REQUEST_CHAT_TABLE = "service_request_messages";
const REQUEST_CHAT_PREFIX = "resq_request_chat";
const REQUEST_CHAT_EVENT = "resq-request-chat-change";
const REQUEST_CHAT_REFRESH_MS = 4000;

function getRequestChatStorageKey(requestId: string) {
  return `${REQUEST_CHAT_PREFIX}:${requestId}`;
}

function createMessageId() {
  return `chat-${Math.random().toString(36).slice(2, 10)}`;
}

function mapRecordToMessage(record: RequestChatRecord): RequestChatMessage {
  return {
    id: record.id,
    requestId: record.request_id,
    senderId: record.sender_id,
    senderName: record.sender_name,
    senderRole: record.sender_role,
    body: record.body,
    createdAt: record.created_at,
  };
}

function loadLocalRequestChatMessages(requestId: string | null) {
  if (!requestId || typeof window === "undefined") {
    return [];
  }

  try {
    const rawValue = window.localStorage.getItem(getRequestChatStorageKey(requestId));
    if (!rawValue) {
      return [];
    }

    const parsedValue = JSON.parse(rawValue) as RequestChatMessage[];
    if (!Array.isArray(parsedValue)) {
      return [];
    }

    return parsedValue
      .filter((message) => message && message.requestId === requestId)
      .sort((left, right) => Date.parse(left.createdAt) - Date.parse(right.createdAt));
  } catch {
    return [];
  }
}

function saveLocalRequestChatMessages(requestId: string, messages: RequestChatMessage[]) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(
    getRequestChatStorageKey(requestId),
    JSON.stringify(messages),
  );
  window.dispatchEvent(
    new CustomEvent(REQUEST_CHAT_EVENT, {
      detail: { requestId },
    }),
  );
}

function appendLocalRequestChatMessage(input: {
  requestId: string;
  senderId?: string | null;
  senderName: string;
  senderRole: RequestChatSenderRole;
  body: string;
}) {
  const nextBody = input.body.trim();
  if (!nextBody) {
    return [];
  }

  const nextMessages = [
    ...loadLocalRequestChatMessages(input.requestId),
    {
      id: createMessageId(),
      requestId: input.requestId,
      senderId: input.senderId ?? null,
      senderName: input.senderName.trim() || "ResQ",
      senderRole: input.senderRole,
      body: nextBody,
      createdAt: new Date().toISOString(),
    },
  ];

  saveLocalRequestChatMessages(input.requestId, nextMessages);
  return nextMessages;
}

async function fetchRemoteRequestChatMessages(requestId: string) {
  const { data, error } = await createClient()
    .from(REQUEST_CHAT_TABLE)
    .select("id, request_id, sender_id, sender_name, sender_role, body, created_at")
    .eq("request_id", requestId)
    .order("created_at", { ascending: true });

  if (error) {
    throw error;
  }

  return ((data ?? []) as RequestChatRecord[]).map(mapRecordToMessage);
}

async function sendRemoteRequestChatMessage(input: {
  requestId: string;
  senderId?: string | null;
  senderName: string;
  senderRole: RequestChatSenderRole;
  body: string;
}) {
  const nextBody = input.body.trim();
  if (!nextBody) {
    return;
  }

  const { error } = await createClient().from(REQUEST_CHAT_TABLE).insert({
    request_id: input.requestId,
    sender_id: input.senderId ?? null,
    sender_name: input.senderName.trim() || "ResQ",
    sender_role: input.senderRole,
    body: nextBody,
  });

  if (error) {
    throw error;
  }
}

export async function sendRequestChatMessage(input: {
  requestId: string;
  senderId?: string | null;
  senderName: string;
  senderRole: RequestChatSenderRole;
  body: string;
}) {
  const nextBody = input.body.trim();
  if (!nextBody) {
    return;
  }

  try {
    await sendRemoteRequestChatMessage(input);
  } catch {
    appendLocalRequestChatMessage({
      requestId: input.requestId,
      senderId: input.senderId,
      senderName: input.senderName,
      senderRole: input.senderRole,
      body: nextBody,
    });
  }
}

export function useRequestChat(requestId: string | null) {
  const [messages, setMessages] = useState<RequestChatMessage[]>(() =>
    loadLocalRequestChatMessages(requestId),
  );
  const [isLoading, setIsLoading] = useState(Boolean(requestId));
  const [isSending, setIsSending] = useState(false);
  const [isUsingFallback, setIsUsingFallback] = useState(false);

  const reload = useCallback(async () => {
    if (!requestId) {
      setMessages([]);
      setIsLoading(false);
      setIsUsingFallback(false);
      return;
    }

    setIsLoading(true);

    try {
      const nextMessages = await fetchRemoteRequestChatMessages(requestId);
      setMessages(nextMessages);
      saveLocalRequestChatMessages(requestId, nextMessages);
      setIsUsingFallback(false);
    } catch {
      setMessages(loadLocalRequestChatMessages(requestId));
      setIsUsingFallback(true);
    } finally {
      setIsLoading(false);
    }
  }, [requestId]);

  useEffect(() => {
    void reload();
  }, [reload]);

  useEffect(() => {
    if (!requestId || typeof window === "undefined") {
      return;
    }

    const supabase = createClient();
    let activeChannel: RealtimeChannel | null = supabase
      .channel(`resq-request-chat:${requestId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: REQUEST_CHAT_TABLE,
          filter: `request_id=eq.${requestId}`,
        },
        () => {
          void reload();
        },
      )
      .subscribe();

    const intervalId = window.setInterval(() => {
      void reload();
    }, REQUEST_CHAT_REFRESH_MS);

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key && event.key !== getRequestChatStorageKey(requestId)) {
        return;
      }

      setMessages(loadLocalRequestChatMessages(requestId));
    };

    const handleSameTabChange = (event: Event) => {
      const detail = (event as CustomEvent<{ requestId?: string }>).detail;
      if (detail?.requestId && detail.requestId !== requestId) {
        return;
      }

      setMessages(loadLocalRequestChatMessages(requestId));
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener(REQUEST_CHAT_EVENT, handleSameTabChange);

    return () => {
      window.clearInterval(intervalId);
      if (activeChannel) {
        void supabase.removeChannel(activeChannel);
        activeChannel = null;
      }
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener(REQUEST_CHAT_EVENT, handleSameTabChange);
    };
  }, [reload, requestId]);

  return {
    messages,
    isLoading,
    isSending,
    isUsingFallback,
    sendMessage: async (input: {
      senderId?: string | null;
      senderName: string;
      senderRole: RequestChatSenderRole;
      body: string;
    }) => {
      if (!requestId) {
        return false;
      }

      const nextBody = input.body.trim();
      if (!nextBody) {
        return false;
      }

      setIsSending(true);

      try {
        await sendRemoteRequestChatMessage({
          requestId,
          senderId: input.senderId,
          senderName: input.senderName,
          senderRole: input.senderRole,
          body: nextBody,
        });
        await reload();
        return true;
      } catch {
        setMessages(
          appendLocalRequestChatMessage({
            requestId,
            senderId: input.senderId,
            senderName: input.senderName,
            senderRole: input.senderRole,
            body: nextBody,
          }),
        );
        setIsUsingFallback(true);
        return true;
      } finally {
        setIsSending(false);
      }
    },
  };
}

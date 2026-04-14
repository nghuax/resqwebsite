import { useMemo, useState } from "react";
import { MessageSquare, SendHorizonal } from "lucide-react";
import type { ResQAuthRole } from "@/utils/supabase/auth";
import {
  useRequestChat,
  type RequestChatMessage,
} from "./requestChat";

const mono = "font-['IBM_Plex_Mono',monospace]";

function formatChatTimestamp(value: string) {
  return new Date(value).toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getMessageTone(role: RequestChatMessage["senderRole"], actorRole: ResQAuthRole) {
  if (role === "system") {
    return "border-[rgba(4,38,153,0.08)] bg-[#f7f7f8] text-[#4a5565]";
  }

  if (role === actorRole) {
    return "border-[#ee3224] bg-[rgba(238,50,36,0.08)] text-[#080b0d]";
  }

  return "border-[rgba(4,38,153,0.08)] bg-white text-[#080b0d]";
}

export function RequestChatPanel({
  requestId,
  actorId,
  actorName,
  actorRole,
  compact = false,
}: {
  requestId: string | null;
  actorId?: string | null;
  actorName: string;
  actorRole: ResQAuthRole;
  compact?: boolean;
}) {
  const { messages, isLoading, isSending, isUsingFallback, sendMessage } =
    useRequestChat(requestId);
  const [draft, setDraft] = useState("");

  const introLabel = useMemo(() => {
    return actorRole === "fixer" ? "Trao đổi với khách hàng" : "Trao đổi với fixer";
  }, [actorRole]);

  const emptyLabel = actorRole === "fixer"
    ? "Khi bạn xác nhận đơn, bạn có thể cập nhật nhanh cho khách hàng tại đây."
    : "Khi fixer nhận đơn, bạn có thể trao đổi trực tiếp trong khung chat này.";

  if (!requestId) {
    return null;
  }

  return (
    <section
      className={`rounded-[20px] border border-[rgba(4,38,153,0.08)] bg-white shadow-[0_18px_50px_rgba(8,11,13,0.04)] ${
        compact ? "p-4" : "p-6"
      }`}
    >
      <div className="mb-4 flex items-center gap-3">
        <div className="flex size-[42px] items-center justify-center rounded-full bg-[rgba(238,50,36,0.1)]">
          <MessageSquare size={18} className="text-[#ee3224]" />
        </div>
        <div>
          <p className={`${mono} text-[12px] uppercase tracking-[1.4px] text-[#99a1af]`}>
            Chat request
          </p>
          <p className={`${mono} text-[15px] font-[700] text-[#080b0d]`}>
            {introLabel}
          </p>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <span className={`${mono} inline-flex rounded-full bg-[rgba(4,38,153,0.05)] px-3 py-1 text-[10px] uppercase tracking-[0.14em] text-[#4a5565]`}>
          {isUsingFallback ? "Chat cục bộ" : "Chat đồng bộ"}
        </span>
        {isLoading && (
          <span className={`${mono} text-[10px] uppercase tracking-[0.14em] text-[#99a1af]`}>
            Đang tải hội thoại...
          </span>
        )}
      </div>

      <div className={`space-y-3 ${compact ? "max-h-[220px]" : "max-h-[280px]"} overflow-y-auto pr-1`}>
        {messages.length > 0 ? (
          messages.map((message) => (
            <article
              key={message.id}
              className={`rounded-[16px] border px-4 py-3 ${getMessageTone(
                message.senderRole,
                actorRole,
              )}`}
            >
              <div className="flex items-center justify-between gap-3">
                <p className={`${mono} text-[11px] font-[700] uppercase tracking-[0.14em]`}>
                  {message.senderRole === "system"
                    ? "ResQ"
                    : message.senderRole === actorRole
                      ? "Bạn"
                      : message.senderName}
                </p>
                <span className={`${mono} text-[10px] text-[#99a1af]`}>
                  {formatChatTimestamp(message.createdAt)}
                </span>
              </div>
              <p className={`${mono} mt-2 text-[12px] leading-[20px]`}>
                {message.body}
              </p>
            </article>
          ))
        ) : (
          <div className="rounded-[16px] border border-dashed border-[rgba(4,38,153,0.12)] bg-[#faf8f5] px-4 py-4">
            <p className={`${mono} text-[12px] leading-[20px] text-[#4a5565]`}>
              {emptyLabel}
            </p>
          </div>
        )}
      </div>

      <form
        className={`mt-4 ${compact ? "grid gap-3" : "flex gap-3"}`}
        onSubmit={(event) => {
          event.preventDefault();
          if (!draft.trim()) {
            return;
          }

          void sendMessage({
            senderId: actorId,
            senderName: actorName,
            senderRole: actorRole,
            body: draft,
          }).then((sent) => {
            if (sent) {
              setDraft("");
            }
          });
        }}
      >
        <input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder={
            actorRole === "fixer"
              ? "Nhắn trạng thái hoặc dặn khách hàng..."
              : "Nhắn cho fixer về vị trí hoặc tình trạng xe..."
          }
          disabled={isSending}
          className={`h-[46px] flex-1 rounded-[12px] border border-[rgba(4,38,153,0.08)] bg-[#f9fafb] px-4 text-[13px] text-[#080b0d] outline-none transition-colors placeholder:text-[#a4a4a4] focus:border-[#ee3224] ${mono}`}
        />
        <button
          type="submit"
          disabled={isSending || !draft.trim()}
          className={`inline-flex h-[46px] items-center justify-center gap-2 rounded-[12px] bg-[#ee3224] px-5 transition-colors hover:bg-[#d42b1e] ${
            compact ? "w-full" : ""
          } disabled:cursor-not-allowed disabled:bg-[#f3b3ad]`}
        >
          <SendHorizonal size={16} className="text-white" />
          <span className={`${mono} text-[13px] font-[500] text-white`}>
            {isSending ? "Đang gửi" : "Gửi"}
          </span>
        </button>
      </form>
    </section>
  );
}

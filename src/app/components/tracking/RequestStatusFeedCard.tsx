import { LoaderCircle, Radio } from "lucide-react";
import { useRequestStatusEvents } from "./requestStatusEvents";

const mono = "font-['IBM_Plex_Mono',monospace]";

function formatStatusEventTime(value: string) {
  return new Date(value).toLocaleString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
  });
}

export function RequestStatusFeedCard({
  requestId,
  compact = false,
}: {
  requestId: string | null;
  compact?: boolean;
}) {
  const { events, isLoading } = useRequestStatusEvents(requestId);
  const visibleEvents = [...events].reverse().slice(0, compact ? 3 : 5);

  return (
    <section
      className={`rounded-[26px] border border-[rgba(4,38,153,0.08)] bg-white shadow-[0_18px_40px_rgba(8,11,13,0.06)] ${
        compact ? "p-4" : "p-5 sm:p-6"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className={`${mono} text-[10px] uppercase tracking-[0.18em] text-[#99a1af]`}>
            Live updates
          </p>
          <h3 className={`mt-2 text-[#080b0d] ${compact ? "font-['Syne',sans-serif] text-[24px] leading-[1] font-[700] tracking-[-0.04em]" : `${mono} text-[20px] font-[700]`}`}>
            Cập nhật trạng thái
          </h3>
        </div>
        <div className="flex size-[40px] items-center justify-center rounded-[16px] bg-[rgba(238,50,36,0.08)]">
          <Radio size={18} className="text-[#ee3224]" />
        </div>
      </div>

      {isLoading && events.length === 0 ? (
        <div className="mt-4 flex items-center gap-3 rounded-[18px] bg-[#faf8f5] px-4 py-4">
          <LoaderCircle size={16} className="animate-spin text-[#ee3224]" />
          <p className={`${mono} text-[12px] text-[#667085]`}>
            Đang đồng bộ nhật ký trạng thái từ Supabase...
          </p>
        </div>
      ) : visibleEvents.length > 0 ? (
        <div className="mt-4 space-y-3">
          {visibleEvents.map((event) => (
            <div key={event.id} className="rounded-[18px] border border-black/5 bg-[#faf8f5] px-4 py-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className={`${mono} text-[12px] font-[500] text-[#080b0d]`}>
                    {event.status}
                  </p>
                  <p className={`${mono} mt-2 text-[11px] leading-[19px] text-[#667085]`}>
                    {event.detail || "ResQ đã ghi nhận thay đổi mới cho yêu cầu này."}
                  </p>
                </div>
                <span className={`${mono} shrink-0 text-[10px] uppercase tracking-[0.16em] text-[#99a1af]`}>
                  {formatStatusEventTime(event.createdAt)}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-4 rounded-[18px] bg-[#faf8f5] px-4 py-4">
          <p className={`${mono} text-[12px] leading-[20px] text-[#667085]`}>
            Chưa có cập nhật nào trong nhật ký trạng thái cho yêu cầu này.
          </p>
        </div>
      )}
    </section>
  );
}

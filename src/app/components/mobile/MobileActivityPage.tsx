import { Link } from "react-router";
import {
  Bike,
  Car,
  CheckCheck,
  ChevronRight,
  ClipboardList,
  CreditCard,
  LoaderCircle,
  MapPin,
  PhoneCall,
  ShieldCheck,
  Truck,
  UserRound,
  Wrench,
} from "lucide-react";
import { TrackingLiveMap } from "../tracking/TrackingLiveMap";
import { getServiceProgress } from "../tracking/request-progress";
import { RequestChatPanel } from "../tracking/RequestChatPanel";
import {
  advanceActiveRequestStatus,
  confirmIncomingRequest,
  useResQStore,
} from "../resqStore";
import { useAuth } from "../AuthContext";

const mono = "font-['IBM_Plex_Mono',monospace]";

function formatTimestamp(value: string) {
  return new Date(value).toLocaleString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
  });
}

export default function MobileActivityPage() {
  const { user } = useAuth();

  if (user?.role === "fixer") {
    return <MobileFixerActivityPage />;
  }

  return <MobileUserActivityPage />;
}

function MobileUserActivityPage() {
  const { user } = useAuth();
  const { activeRequest, requestHistory, isHydrating } = useResQStore();
  const liveRequest = activeRequest;
  const liveProgress = getServiceProgress(liveRequest?.status ?? "Chờ fixer xác nhận");

  return (
    <div className="space-y-5 pb-5">
      <section className="rounded-[30px] bg-[linear-gradient(135deg,#121212_0%,#1e1a18_36%,#43221e_100%)] px-5 py-5 text-white shadow-[0_24px_60px_rgba(8,11,13,0.22)]">
        <p className={`${mono} text-[10px] uppercase tracking-[0.22em] text-white/56`}>
          Requests / Activity
        </p>
        <h1 className="mt-3 font-['Syne',sans-serif] text-[32px] leading-[0.95] font-[700] tracking-[-0.04em]">
          Theo dõi fixer và xem lại lịch sử
        </h1>
        <p className={`${mono} mt-3 max-w-[290px] text-[12px] leading-[20px] text-white/72`}>
          Luồng mới bắt đầu từ lúc gửi yêu cầu, chờ fixer xác nhận, rồi tiếp tục cập nhật ETA trong cùng một nơi.
        </p>
      </section>

      {liveRequest ? (
        <>
          <section className="rounded-[26px] border border-[#f4c1bb] bg-[linear-gradient(180deg,#fff4f2_0%,#fffdfb_100%)] p-4 shadow-[0_18px_40px_rgba(8,11,13,0.06)]">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className={`${mono} text-[10px] uppercase tracking-[0.18em] text-[#99a1af]`}>
                  Active request
                </p>
                <h2 className="mt-2 font-['Syne',sans-serif] text-[26px] leading-[0.95] font-[700] tracking-[-0.04em] text-[#080b0d]">
                  {liveRequest.serviceTitle}
                </h2>
              </div>
              <span className={`${mono} rounded-full bg-[#ee3224] px-3 py-1.5 text-[10px] uppercase tracking-[0.18em] text-white`}>
                {liveRequest.status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-[18px] bg-white px-3 py-3">
                <p className={`${mono} text-[10px] uppercase tracking-[0.16em] text-[#99a1af]`}>
                  Mã yêu cầu
                </p>
                <p className={`${mono} mt-2 text-[13px] font-[500] text-[#080b0d]`}>
                  {liveRequest.id}
                </p>
              </div>
              <div className="rounded-[18px] bg-white px-3 py-3">
                <p className={`${mono} text-[10px] uppercase tracking-[0.16em] text-[#99a1af]`}>
                  ETA
                </p>
                <p className={`${mono} mt-2 text-[13px] font-[500] text-[#080b0d]`}>
                  {liveRequest.serviceEta}
                </p>
              </div>
            </div>

            <div className="mt-4 overflow-hidden rounded-[22px]">
              <TrackingLiveMap
                requestId={liveRequest.id}
                actorId={user?.id}
                actorRole="user"
                destinationPoint={liveRequest.locationPoint}
                destinationAddress={liveRequest.locationAddress}
              />
            </div>

            <div className="mt-4 flex items-start gap-3 rounded-[18px] bg-white px-3 py-3">
              <MapPin size={16} className="mt-[2px] shrink-0 text-[#ee3224]" />
              <div className="min-w-0">
                <p className={`${mono} text-[12px] font-[500] text-[#080b0d]`}>
                  {liveRequest.locationAddress}
                </p>
                <p className={`${mono} mt-1 text-[11px] leading-[18px] text-[#667085]`}>
                  Fixer: {liveRequest.fixerName || "Đang chờ xác nhận"} · {liveRequest.fixerTeam}
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-[26px] bg-white/92 p-4 shadow-[0_18px_40px_rgba(8,11,13,0.06)]">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className={`${mono} text-[10px] uppercase tracking-[0.18em] text-[#99a1af]`}>
                  Progress
                </p>
                <h2 className="mt-2 font-['Syne',sans-serif] text-[24px] leading-[1] font-[700] tracking-[-0.04em] text-[#080b0d]">
                  Tiến độ hỗ trợ
                </h2>
              </div>
              <span className={`${mono} rounded-full bg-[rgba(238,50,36,0.08)] px-3 py-1.5 text-[10px] uppercase tracking-[0.18em] text-[#ee3224]`}>
                {liveProgress.progressLabel}
              </span>
            </div>

            <div className="mb-4 h-[10px] overflow-hidden rounded-full bg-[#f1f2f4]">
              <div
                className="h-full rounded-full bg-[linear-gradient(90deg,#ee3224_0%,#ff7d6f_100%)]"
                style={{ width: `${liveProgress.percent}%` }}
              />
            </div>

            <div className="space-y-3">
              {liveProgress.steps.map((step, index) => {
                const current = index === liveProgress.currentIndex;
                const complete = index < liveProgress.currentIndex;

                return (
                  <div
                    key={step.label}
                    className={`rounded-[20px] border px-4 py-4 ${
                      current
                        ? "border-[#ee3224] bg-[rgba(238,50,36,0.05)]"
                        : complete
                          ? "border-[rgba(238,50,36,0.1)] bg-white"
                          : "border-black/5 bg-[#faf8f5]"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex size-[28px] items-center justify-center rounded-full ${
                          current || complete ? "bg-[#ee3224]" : "bg-white"
                        }`}
                      >
                        <span className={`${mono} text-[10px] font-[700] ${
                          current || complete ? "text-white" : "text-[#99a1af]"
                        }`}>
                          {index + 1}
                        </span>
                      </div>
                      <p className={`${mono} text-[12px] font-[500] text-[#080b0d]`}>
                        {step.label}
                      </p>
                    </div>
                    <p className={`${mono} mt-3 text-[11px] leading-[19px] text-[#667085]`}>
                      {step.detail}
                    </p>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="grid grid-cols-2 gap-3">
            <a
              href="tel:19001234"
              className="rounded-[22px] bg-[#111111] px-4 py-4 text-white no-underline shadow-[0_18px_40px_rgba(8,11,13,0.16)]"
            >
              <PhoneCall size={18} />
              <p className={`${mono} mt-4 text-[10px] uppercase tracking-[0.18em] text-white/56`}>
                Hỗ trợ
              </p>
              <p className="mt-2 font-['Syne',sans-serif] text-[22px] leading-none font-[700] tracking-[-0.04em]">
                Gọi hotline
              </p>
            </a>

            <Link
              to="/thanh-toan"
              className="rounded-[22px] bg-[#ee3224] px-4 py-4 text-white no-underline shadow-[0_18px_40px_rgba(238,50,36,0.28)]"
            >
              <CreditCard size={18} />
              <p className={`${mono} mt-4 text-[10px] uppercase tracking-[0.18em] text-white/70`}>
                Payment
              </p>
              <p className="mt-2 font-['Syne',sans-serif] text-[22px] leading-none font-[700] tracking-[-0.04em]">
                Thanh toán
              </p>
            </Link>
          </section>

          <RequestChatPanel
            requestId={liveRequest.id}
            actorId={user?.id}
            actorName={user?.name ?? liveRequest.requesterName}
            actorRole="user"
            compact
          />
        </>
      ) : (
        <section className="rounded-[26px] border border-dashed border-black/10 bg-white/88 p-5 text-center shadow-[0_18px_40px_rgba(8,11,13,0.06)]">
          <div className="mx-auto flex size-[56px] items-center justify-center rounded-[22px] bg-[rgba(238,50,36,0.08)]">
            {isHydrating ? (
              <LoaderCircle size={24} className="animate-spin text-[#ee3224]" />
            ) : (
              <ShieldCheck size={24} className="text-[#ee3224]" />
            )}
          </div>
          <h2 className="mt-4 font-['Syne',sans-serif] text-[26px] leading-[0.95] font-[700] tracking-[-0.04em] text-[#080b0d]">
            Hình như bạn chưa chọn dịch vụ nào
          </h2>
          <p className={`${mono} mt-3 text-[12px] leading-[20px] text-[#667085]`}>
            Chọn dịch vụ ở trang Dịch Vụ để tạo request mới, sau đó fixer và ETA sẽ xuất hiện tại đây.
          </p>
          <Link
            to="/dich-vu"
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#ee3224] px-4 py-2.5 text-white no-underline"
          >
            <span className={`${mono} text-[10px] uppercase tracking-[0.18em]`}>
              Đến trang Dịch Vụ
            </span>
            <ChevronRight size={14} />
          </Link>
        </section>
      )}

      <section className="rounded-[26px] bg-white/92 p-4 shadow-[0_18px_40px_rgba(8,11,13,0.06)]">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className={`${mono} text-[10px] uppercase tracking-[0.18em] text-[#99a1af]`}>
              Timeline
            </p>
            <h2 className="mt-2 font-['Syne',sans-serif] text-[24px] leading-[1] font-[700] tracking-[-0.04em] text-[#080b0d]">
              Lịch sử yêu cầu
            </h2>
          </div>
          <div className="flex size-[40px] items-center justify-center rounded-[16px] bg-[rgba(238,50,36,0.08)]">
            <ClipboardList size={18} className="text-[#ee3224]" />
          </div>
        </div>

        <div className="space-y-3">
          {requestHistory.map((item) => {
            const VehicleIcon = item.vehicleType === "Xe máy" ? Bike : Car;

            return (
              <div key={item.id} className="rounded-[22px] border border-black/5 bg-[#faf8f5] p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="flex size-[42px] items-center justify-center rounded-[16px] bg-white">
                      {item.status === "Hoàn thành" ? (
                        <CheckCheck size={18} className="text-[#0f9d58]" />
                      ) : (
                        <Truck size={18} className="text-[#ee3224]" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className={`${mono} text-[12px] font-[500] text-[#080b0d]`}>
                        {item.serviceTitle}
                      </p>
                      <p className={`${mono} mt-1 text-[11px] leading-[18px] text-[#667085]`}>
                        {formatTimestamp(item.createdAt)}
                      </p>
                    </div>
                  </div>

                  <span className={`${mono} rounded-full px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] ${
                    item.paymentStatus === "Đã thanh toán"
                      ? "bg-[rgba(15,157,88,0.12)] text-[#0f9d58]"
                      : "bg-[rgba(238,50,36,0.1)] text-[#ee3224]"
                  }`}>
                    {item.paymentStatus}
                  </span>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="flex items-start gap-3 rounded-[18px] bg-white px-3 py-3">
                    <VehicleIcon size={16} className="mt-[2px] shrink-0 text-[#ee3224]" />
                    <div className="min-w-0">
                      <p className={`${mono} text-[10px] uppercase tracking-[0.16em] text-[#99a1af]`}>
                        Xe
                      </p>
                      <p className={`${mono} mt-1 text-[11px] leading-[18px] text-[#080b0d]`}>
                        {item.vehicleName} · {item.vehiclePlate}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 rounded-[18px] bg-white px-3 py-3">
                    <MapPin size={16} className="mt-[2px] shrink-0 text-[#ee3224]" />
                    <div className="min-w-0">
                      <p className={`${mono} text-[10px] uppercase tracking-[0.16em] text-[#99a1af]`}>
                        Vị trí
                      </p>
                      <p className={`${mono} mt-1 text-[11px] leading-[18px] text-[#080b0d]`}>
                        {item.locationAddress}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {requestHistory.length === 0 && (
            <p className={`${mono} text-[12px] leading-[20px] text-[#667085]`}>
              Chưa có lịch sử yêu cầu nào trong tài khoản này.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}

function MobileFixerActivityPage() {
  const { user } = useAuth();
  const { activeRequest, incomingRequests, requestHistory } = useResQStore();

  const nextActionLabel =
    activeRequest?.status === "Fixer đã xác nhận"
      ? "Bắt đầu di chuyển"
      : activeRequest?.status === "Đang tiếp cận"
        ? "Đã đến nơi"
        : activeRequest?.status === "Đang hỗ trợ"
          ? "Hoàn tất đơn"
          : null;

  return (
    <div className="space-y-5 pb-5">
      <section className="rounded-[30px] bg-[linear-gradient(135deg,#121212_0%,#2d1714_50%,#4c1d1a_100%)] px-5 py-5 text-white shadow-[0_24px_60px_rgba(8,11,13,0.22)]">
        <p className={`${mono} text-[10px] uppercase tracking-[0.22em] text-white/56`}>
          Fixer / Dispatch
        </p>
        <h1 className="mt-3 font-['Syne',sans-serif] text-[32px] leading-[0.95] font-[700] tracking-[-0.04em]">
          Nhận request và xác nhận đơn
        </h1>
        <p className={`${mono} mt-3 max-w-[290px] text-[12px] leading-[20px] text-white/72`}>
          Mọi request mới từ khách hàng sẽ đổ về đây để fixer nhận và bắt đầu xử lý.
        </p>
      </section>

      {activeRequest ? (
        <>
          <section className="rounded-[26px] border border-[#f4c1bb] bg-[linear-gradient(180deg,#fff4f2_0%,#fffdfb_100%)] p-4 shadow-[0_18px_40px_rgba(8,11,13,0.06)]">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className={`${mono} text-[10px] uppercase tracking-[0.18em] text-[#99a1af]`}>
                  Assigned job
                </p>
                <h2 className="mt-2 font-['Syne',sans-serif] text-[26px] leading-[0.95] font-[700] tracking-[-0.04em] text-[#080b0d]">
                  {activeRequest.serviceTitle}
                </h2>
              </div>
              <span className={`${mono} rounded-full bg-[#ee3224] px-3 py-1.5 text-[10px] uppercase tracking-[0.18em] text-white`}>
                {activeRequest.status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-[18px] bg-white px-3 py-3">
                <p className={`${mono} text-[10px] uppercase tracking-[0.16em] text-[#99a1af]`}>
                  Khách hàng
                </p>
                <p className={`${mono} mt-2 text-[13px] font-[500] text-[#080b0d]`}>
                  {activeRequest.requesterName}
                </p>
              </div>
              <div className="rounded-[18px] bg-white px-3 py-3">
                <p className={`${mono} text-[10px] uppercase tracking-[0.16em] text-[#99a1af]`}>
                  Liên hệ
                </p>
                <p className={`${mono} mt-2 text-[13px] font-[500] text-[#080b0d]`}>
                  {activeRequest.requesterPhone || "1900 1234"}
                </p>
              </div>
            </div>

            <div className="mt-4 overflow-hidden rounded-[22px]">
              <TrackingLiveMap
                requestId={activeRequest.id}
                actorId={user?.id}
                actorRole="fixer"
                destinationPoint={activeRequest.locationPoint}
                destinationAddress={activeRequest.locationAddress}
              />
            </div>

            <div className="mt-4 space-y-3">
              <div className="flex items-start gap-3 rounded-[18px] bg-white px-3 py-3">
                <Wrench size={16} className="mt-[2px] shrink-0 text-[#ee3224]" />
                <div className="min-w-0">
                  <p className={`${mono} text-[10px] uppercase tracking-[0.16em] text-[#99a1af]`}>
                    Dịch vụ
                  </p>
                  <p className={`${mono} mt-1 text-[12px] text-[#080b0d]`}>
                    {activeRequest.serviceTitle}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-[18px] bg-white px-3 py-3">
                <MapPin size={16} className="mt-[2px] shrink-0 text-[#ee3224]" />
                <div className="min-w-0">
                  <p className={`${mono} text-[10px] uppercase tracking-[0.16em] text-[#99a1af]`}>
                    Vị trí
                  </p>
                  <p className={`${mono} mt-1 text-[12px] leading-[19px] text-[#080b0d]`}>
                    {activeRequest.locationAddress}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-4 grid gap-3">
              {nextActionLabel && (
                <button
                  onClick={() => {
                    advanceActiveRequestStatus();
                  }}
                  className="rounded-[18px] bg-[#ee3224] px-4 py-3 text-white"
                >
                  <span className={`${mono} text-[11px] uppercase tracking-[0.18em]`}>
                    {nextActionLabel}
                  </span>
                </button>
              )}
              <a
                href={`tel:${activeRequest.requesterPhone || "19001234"}`}
                className="rounded-[18px] border border-black/10 bg-white px-4 py-3 text-[#080b0d] no-underline"
              >
                <span className={`${mono} text-[11px] uppercase tracking-[0.18em]`}>
                  Gọi khách hàng
                </span>
              </a>
            </div>
          </section>

          <RequestChatPanel
            requestId={activeRequest.id}
            actorId={user?.id}
            actorName={user?.name ?? activeRequest.fixerName}
            actorRole="fixer"
            compact
          />

          {incomingRequests.length > 0 && (
            <section className="rounded-[26px] bg-white/92 p-4 shadow-[0_18px_40px_rgba(8,11,13,0.06)]">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className={`${mono} text-[10px] uppercase tracking-[0.18em] text-[#99a1af]`}>
                    Queue
                  </p>
                  <h2 className="mt-2 font-['Syne',sans-serif] text-[24px] leading-[1] font-[700] tracking-[-0.04em] text-[#080b0d]">
                    Request đang chờ
                  </h2>
                </div>
                <div className="flex size-[40px] items-center justify-center rounded-[16px] bg-[rgba(238,50,36,0.08)]">
                  <ClipboardList size={18} className="text-[#ee3224]" />
                </div>
              </div>
              <div className="space-y-3">
                {incomingRequests.map((request) => (
                  <IncomingRequestItem key={request.id} request={request} />
                ))}
              </div>
            </section>
          )}
        </>
      ) : incomingRequests.length > 0 ? (
        <section className="rounded-[26px] bg-white/92 p-4 shadow-[0_18px_40px_rgba(8,11,13,0.06)]">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className={`${mono} text-[10px] uppercase tracking-[0.18em] text-[#99a1af]`}>
                Queue
              </p>
              <h2 className="mt-2 font-['Syne',sans-serif] text-[24px] leading-[1] font-[700] tracking-[-0.04em] text-[#080b0d]">
                Request chờ xác nhận
              </h2>
            </div>
            <div className="flex size-[40px] items-center justify-center rounded-[16px] bg-[rgba(238,50,36,0.08)]">
              <ClipboardList size={18} className="text-[#ee3224]" />
            </div>
          </div>
          <div className="space-y-3">
            {incomingRequests.map((request) => (
              <IncomingRequestItem key={request.id} request={request} />
            ))}
          </div>
        </section>
      ) : (
        <section className="rounded-[26px] border border-dashed border-black/10 bg-white/88 p-5 text-center shadow-[0_18px_40px_rgba(8,11,13,0.06)]">
          <div className="mx-auto flex size-[56px] items-center justify-center rounded-[22px] bg-[rgba(238,50,36,0.08)]">
            <Truck size={24} className="text-[#ee3224]" />
          </div>
          <h2 className="mt-4 font-['Syne',sans-serif] text-[26px] leading-[0.95] font-[700] tracking-[-0.04em] text-[#080b0d]">
            Bạn chưa được nhận request nào
          </h2>
          <p className={`${mono} mt-3 text-[12px] leading-[20px] text-[#667085]`}>
            Khi khách hàng gửi yêu cầu mới, request chờ fixer xác nhận sẽ xuất hiện ngay tại đây.
          </p>
        </section>
      )}

      <section className="rounded-[26px] bg-white/92 p-4 shadow-[0_18px_40px_rgba(8,11,13,0.06)]">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className={`${mono} text-[10px] uppercase tracking-[0.18em] text-[#99a1af]`}>
              History
            </p>
            <h2 className="mt-2 font-['Syne',sans-serif] text-[24px] leading-[1] font-[700] tracking-[-0.04em] text-[#080b0d]">
              Lịch sử fixer
            </h2>
          </div>
          <div className="flex size-[40px] items-center justify-center rounded-[16px] bg-[rgba(238,50,36,0.08)]">
            <UserRound size={18} className="text-[#ee3224]" />
          </div>
        </div>

        <div className="space-y-3">
          {requestHistory.slice(0, 4).map((item) => (
            <div key={item.id} className="rounded-[22px] border border-black/5 bg-[#faf8f5] p-4">
              <p className={`${mono} text-[12px] font-[500] text-[#080b0d]`}>
                {item.serviceTitle}
              </p>
              <p className={`${mono} mt-1 text-[11px] leading-[18px] text-[#667085]`}>
                {item.requesterName} · {item.status}
              </p>
            </div>
          ))}

          {requestHistory.length === 0 && (
            <p className={`${mono} text-[12px] leading-[20px] text-[#667085]`}>
              Chưa có lịch sử xử lý nào trong tài khoản fixer này.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}

function IncomingRequestItem({
  request,
}: {
  request: ReturnType<typeof useResQStore>["incomingRequests"][number];
}) {
  const VehicleIcon = request.vehicleType === "Xe máy" ? Bike : Car;

  return (
    <div className="rounded-[22px] border border-black/5 bg-[#faf8f5] p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className={`${mono} text-[12px] font-[500] text-[#080b0d]`}>
            {request.serviceTitle}
          </p>
          <p className={`${mono} mt-1 text-[11px] leading-[18px] text-[#667085]`}>
            {request.requesterName} · {request.requesterPhone || "Chưa có số liên hệ"}
          </p>
        </div>
        <span className={`${mono} rounded-full bg-white px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] text-[#ee3224]`}>
          {request.serviceEta}
        </span>
      </div>

      <div className="mt-4 grid gap-3">
        <div className="flex items-start gap-3 rounded-[18px] bg-white px-3 py-3">
          <VehicleIcon size={16} className="mt-[2px] shrink-0 text-[#ee3224]" />
          <div className="min-w-0">
            <p className={`${mono} text-[10px] uppercase tracking-[0.16em] text-[#99a1af]`}>
              Xe
            </p>
            <p className={`${mono} mt-1 text-[11px] leading-[18px] text-[#080b0d]`}>
              {request.vehicleName} · {request.vehiclePlate}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3 rounded-[18px] bg-white px-3 py-3">
          <MapPin size={16} className="mt-[2px] shrink-0 text-[#ee3224]" />
          <div className="min-w-0">
            <p className={`${mono} text-[10px] uppercase tracking-[0.16em] text-[#99a1af]`}>
              Vị trí
            </p>
            <p className={`${mono} mt-1 text-[11px] leading-[18px] text-[#080b0d]`}>
              {request.locationAddress}
            </p>
          </div>
        </div>
      </div>

      <button
        onClick={() => {
          confirmIncomingRequest(request.id);
        }}
        className="mt-4 rounded-[18px] bg-[#ee3224] px-4 py-3 text-white"
      >
        <span className={`${mono} text-[10px] uppercase tracking-[0.18em]`}>
          Xác nhận đơn
        </span>
      </button>
    </div>
  );
}

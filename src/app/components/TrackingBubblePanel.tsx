import { Link, useLocation, useNavigate } from "react-router";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  ArrowRight,
  Bike,
  Car,
  ClipboardList,
  Clock3,
  Headset,
  LoaderCircle,
  MapPin,
  PhoneCall,
  ShieldCheck,
  Truck,
  UserRound,
  Wrench,
  X,
  type LucideIcon,
} from "lucide-react";
import { useAuth } from "./AuthContext";
import { useLanguage } from "./LanguageContext";
import { RequestChatPanel } from "./tracking/RequestChatPanel";
import { RequestStatusFeedCard } from "./tracking/RequestStatusFeedCard";
import { TrackingLiveMap } from "./tracking/TrackingLiveMap";
import { useLiveRequestLocationSync } from "./tracking/requestLocations";
import { getServiceProgress } from "./tracking/request-progress";
import {
  advanceActiveRequestStatus,
  cancelActiveRequest,
  confirmIncomingRequest,
  useResQStore,
  type ActiveResQRequest,
  type ResQHistoryItem,
} from "./resqStore";

const mono = "font-['IBM_Plex_Mono',monospace]";

function t(isEnglish: boolean, vi: string, en: string) {
  return isEnglish ? en : vi;
}

function translateStatusLabel(status: string, isEnglish: boolean) {
  if (!isEnglish) {
    return status;
  }

  switch (status) {
    case "Chờ fixer xác nhận":
      return "Waiting for fixer";
    case "Fixer đã xác nhận":
      return "Fixer confirmed";
    case "Đang tiếp cận":
      return "On the way";
    case "Đang hỗ trợ":
      return "In service";
    case "Hoàn thành":
      return "Completed";
    case "Đã hủy":
      return "Cancelled";
    default:
      return status;
  }
}

function translateVehicleType(type: string, isEnglish: boolean) {
  if (!isEnglish) {
    return type;
  }

  return type === "Xe máy" ? "Motorbike" : type === "Ô tô" ? "Car" : type;
}

function getLocalizedProgress(status: string, isEnglish: boolean) {
  const progress = getServiceProgress(status);

  return {
    ...progress,
    progressLabel: isEnglish
      ? `${progress.currentIndex + 1}/${progress.steps.length} phases`
      : progress.progressLabel,
    steps: progress.steps.map((step) => ({
      label:
        step.label === "Yêu cầu đã gửi"
          ? t(isEnglish, "Yêu cầu đã gửi", "Request sent")
          : step.label === "Fixer xác nhận"
            ? t(isEnglish, "Fixer xác nhận", "Fixer confirmed")
            : step.label === "Đang di chuyển"
              ? t(isEnglish, "Đang di chuyển", "Driving to you")
              : step.label === "Đang hỗ trợ"
                ? t(isEnglish, "Đang hỗ trợ", "Repair in progress")
                : step.label,
      detail:
        step.detail === "Hệ thống đã ghi nhận dịch vụ và chuẩn bị điều phối."
          ? t(
              isEnglish,
              "Hệ thống đã ghi nhận dịch vụ và chuẩn bị điều phối.",
              "Dispatch has recorded the request and is preparing the next step.",
            )
          : step.detail === "Đội ResQ đã nhận đơn và sẵn sàng di chuyển."
            ? t(
                isEnglish,
                "Đội ResQ đã nhận đơn và sẵn sàng di chuyển.",
                "The ResQ team has accepted the request and is getting ready to move.",
              )
            : step.detail === "Fixer đang đến vị trí của bạn theo tuyến đường cập nhật."
              ? t(
                  isEnglish,
                  "Fixer đang đến vị trí của bạn theo tuyến đường cập nhật.",
                  "The fixer is driving to your location with a live route update.",
                )
              : step.detail === "Kỹ thuật viên xử lý xe và hoàn thiện dịch vụ tại chỗ."
                ? t(
                    isEnglish,
                    "Kỹ thuật viên xử lý xe và hoàn thiện dịch vụ tại chỗ.",
                    "The technician is working on the vehicle and finishing the service on site.",
                  )
                : step.detail,
    })),
  };
}

function getFixerNextActionLabel(status: string, isEnglish: boolean) {
  if (status === "Fixer đã xác nhận") {
    return t(isEnglish, "Bắt đầu di chuyển", "Start driving");
  }

  if (status === "Đang tiếp cận") {
    return t(isEnglish, "Đến nơi và hỗ trợ", "Arrive and assist");
  }

  if (status === "Đang hỗ trợ") {
    return t(isEnglish, "Hoàn tất đơn", "Complete request");
  }

  return null;
}

function getTriggerMeta(args: {
  isEnglish: boolean;
  role: "user" | "fixer";
  activeRequest: ActiveResQRequest | null;
  incomingCount: number;
}) {
  const { isEnglish, role, activeRequest, incomingCount } = args;

  if (role === "fixer" && activeRequest) {
    return {
      label: t(isEnglish, "Đơn đang xử lý", "Active dispatch"),
      detail: translateStatusLabel(activeRequest.status, isEnglish),
      active: true,
    };
  }

  if (role === "fixer" && incomingCount > 0) {
    return {
      label: t(isEnglish, "Yêu cầu mới", "New requests"),
      detail: t(
        isEnglish,
        `${incomingCount} đơn đang chờ`,
        `${incomingCount} waiting`,
      ),
      active: true,
    };
  }

  if (activeRequest) {
    return {
      label: t(isEnglish, "Theo dõi đơn", "Track request"),
      detail: translateStatusLabel(activeRequest.status, isEnglish),
      active: true,
    };
  }

  return {
    label: t(isEnglish, "Hỗ trợ", "Support"),
    detail: t(isEnglish, "Không có đơn", "No active request"),
    active: false,
  };
}

export function TrackingBubblePanel() {
  const { user } = useAuth();
  const { language } = useLanguage();
  const isEnglish = language === "en";
  const navigate = useNavigate();
  const location = useLocation();
  const {
    activeRequest,
    incomingRequests,
    requestHistory,
    isHydrating,
  } = useResQStore();
  const [isOpen, setIsOpen] = useState(false);
  const role = user?.role === "fixer" ? "fixer" : "user";
  const triggerMeta = useMemo(
    () =>
      getTriggerMeta({
        isEnglish,
        role,
        activeRequest,
        incomingCount: incomingRequests.length,
      }),
    [activeRequest, incomingRequests.length, isEnglish, role],
  );
  const isPanelRequested = useMemo(() => {
    return new URLSearchParams(location.search).get("panel") === "tracking";
  }, [location.search]);

  useEffect(() => {
    if (isPanelRequested) {
      setIsOpen(true);
    }
  }, [isPanelRequested]);

  useLiveRequestLocationSync({
    requestId: isOpen ? activeRequest?.id ?? null : null,
    actorId: user?.id,
    actorRole: role,
    fallbackUserPoint: activeRequest?.locationPoint,
    fallbackUserAddress: activeRequest?.locationAddress,
  });

  const clearPanelQuery = () => {
    if (!isPanelRequested) {
      return;
    }

    const nextParams = new URLSearchParams(location.search);
    nextParams.delete("panel");

    navigate(
      {
        pathname: location.pathname,
        search: nextParams.toString() ? `?${nextParams.toString()}` : "",
        hash: location.hash,
      },
      { replace: true },
    );
  };

  const closePanel = () => {
    setIsOpen(false);
    clearPanelQuery();
  };

  return (
    <div className="pointer-events-none fixed inset-y-0 right-0 z-40 flex items-end justify-end p-4 sm:p-6">
      {isOpen && (
        <section className="pointer-events-auto flex h-[min(840px,calc(100vh-124px))] w-[min(430px,calc(100vw-2rem))] flex-col overflow-hidden rounded-[28px] border border-black/5 bg-white shadow-[0_28px_80px_rgba(8,11,13,0.18)]">
          <div className="flex items-start justify-between gap-4 bg-[#ee3224] px-5 py-4 text-white">
            <div className="min-w-0">
              <p className="resq-eyebrow text-white/72">
                {role === "fixer"
                  ? t(isEnglish, "Bảng fixer", "Fixer panel")
                  : t(isEnglish, "Bảng theo dõi", "Tracking panel")}
              </p>
              <h2 className={`${mono} mt-2 text-[14px] font-[700] uppercase tracking-[0.12em] text-white`}>
                {role === "fixer"
                  ? t(isEnglish, "Theo dõi cứu hộ", "ResQ dispatch")
                  : t(isEnglish, "Theo dõi cứu hộ", "ResQ tracking")}
              </h2>
              <p className="resq-body mt-2 text-[13px] leading-[20px] text-white/80">
                {role === "fixer"
                  ? t(
                      isEnglish,
                      "Nhận request, cập nhật tiến độ và nhắn với khách hàng trong cùng một panel.",
                      "Accept requests, update progress, and chat with customers in one panel.",
                    )
                  : t(
                      isEnglish,
                      "Theo dõi fixer, xem trạng thái và giữ mọi thao tác cứu hộ ở cùng một cột bên phải.",
                      "Track the fixer, watch status updates, and keep rescue actions in one right-side column.",
                    )}
              </p>
            </div>

            <button
              type="button"
              onClick={closePanel}
              className="flex size-[36px] shrink-0 items-center justify-center rounded-full bg-white/16 text-white transition-colors hover:bg-white/24 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
              aria-label={t(isEnglish, "Đóng panel theo dõi", "Close tracking panel")}
            >
              <X size={16} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto bg-[linear-gradient(180deg,#fff8f6_0%,#ffffff_14%,#ffffff_100%)] p-4">
            {role === "fixer" ? (
              <FixerTrackingPanelBody
                isEnglish={isEnglish}
                activeRequest={activeRequest}
                incomingRequests={incomingRequests}
                requestHistory={requestHistory}
                userName={user?.name ?? "Fixer ResQ"}
              />
            ) : (
              <UserTrackingPanelBody
                isEnglish={isEnglish}
                activeRequest={activeRequest}
                requestHistory={requestHistory}
                isHydrating={isHydrating}
                actorId={user?.id}
                actorName={user?.name ?? "Khách ResQ"}
                closePanel={closePanel}
              />
            )}
          </div>

          <div className="border-t border-black/5 bg-[#f9fafb] px-4 py-3">
            <p className={`${mono} text-center text-[10px] uppercase tracking-[0.14em] text-[#99a1af]`}>
              {t(isEnglish, "ResQ luôn sẵn sàng hỗ trợ bạn", "ResQ is ready when you need help")}
            </p>
          </div>
        </section>
      )}

      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="resq-button-pill resq-button-pill--primary pointer-events-auto relative flex min-w-[158px] items-center gap-3 px-4 py-3 text-left"
          aria-expanded={isOpen}
          aria-label={t(isEnglish, "Mở panel theo dõi", "Open tracking panel")}
        >
          <span className="flex size-[36px] shrink-0 items-center justify-center rounded-full bg-white/14">
            <Headset size={18} className="text-white" />
          </span>

          <span className="min-w-0">
            <span className={`${mono} block text-[11px] font-[500] uppercase tracking-[0.16em] text-white`}>
              {triggerMeta.label}
            </span>
            <span className="resq-body mt-1 block truncate text-[12px] text-white/78">
              {triggerMeta.detail}
            </span>
          </span>

          {triggerMeta.active && (
            <span className="absolute right-[12px] top-[10px] size-[10px] rounded-full border-2 border-white bg-[#00c950]" />
          )}
        </button>
      )}
    </div>
  );
}

function UserTrackingPanelBody({
  isEnglish,
  activeRequest,
  requestHistory,
  isHydrating,
  actorId,
  actorName,
  closePanel,
}: {
  isEnglish: boolean;
  activeRequest: ActiveResQRequest | null;
  requestHistory: ResQHistoryItem[];
  isHydrating: boolean;
  actorId?: string | null;
  actorName: string;
  closePanel: () => void;
}) {
  if (!activeRequest) {
    return (
      <div className="space-y-4">
        <PanelCard className="px-6 py-6 text-center">
          <div className="mx-auto flex size-[56px] items-center justify-center rounded-full bg-[rgba(238,50,36,0.08)]">
            {isHydrating ? (
              <LoaderCircle size={24} className="animate-spin text-[#ee3224]" />
            ) : (
              <ClipboardList size={24} className="text-[#ee3224]" />
            )}
          </div>
          <h3 className="resq-display mt-4 text-[28px] font-[700] leading-[0.95] text-[#080b0d]">
            {t(isEnglish, "Chưa có đơn nào", "No active request")}
          </h3>
          <p className={`${mono} mt-3 text-[12px] leading-[20px] text-[#667085]`}>
            {t(
              isEnglish,
              "Khi bạn gửi yêu cầu ở trang Dịch vụ, fixer, ETA và tiến độ sẽ hiện trong panel này ngay lập tức.",
              "Once you send a request from Services, the fixer, ETA, and live progress appear here right away.",
            )}
          </p>

          <div className="mt-5 flex flex-col gap-3">
            <Link
              to="/dich-vu"
              onClick={closePanel}
              className="resq-button-pill resq-button-pill--primary w-full px-5 py-3 no-underline"
            >
              <span className={`${mono} text-[12px] font-[500] uppercase tracking-[0.16em] text-white`}>
                {t(isEnglish, "Đến trang Dịch vụ", "Open services")}
              </span>
              <ArrowRight size={16} className="text-white" />
            </Link>

            <Link
              to="/tro-giup"
              onClick={closePanel}
              className="resq-button-pill resq-button-pill--secondary w-full px-5 py-3 no-underline"
            >
              <span className={`${mono} text-[12px] font-[500] uppercase tracking-[0.16em] text-[#080b0d]`}>
                {t(isEnglish, "Mở trợ giúp", "Open help")}
              </span>
            </Link>
          </div>
        </PanelCard>

        <SupportHotlineCard isEnglish={isEnglish} />

        <HistoryPanel
          isEnglish={isEnglish}
          items={requestHistory}
          emptyLabel={t(
            isEnglish,
            "Lịch sử cứu hộ sẽ xuất hiện tại đây sau khi bạn hoàn tất yêu cầu đầu tiên.",
            "Your rescue history will appear here after the first completed request.",
          )}
        />
      </div>
    );
  }

  const progress = getLocalizedProgress(activeRequest.status, isEnglish);
  const isWaitingForFixer = activeRequest.status === "Chờ fixer xác nhận";
  const VehicleIcon = activeRequest.vehicleType === "Xe máy" ? Bike : Car;

  return (
    <div className="space-y-4">
      <PanelCard className="bg-[linear-gradient(180deg,#fff4f2_0%,#ffffff_100%)] p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <span className={`${mono} inline-flex rounded-full bg-[rgba(238,50,36,0.08)] px-3 py-1.5 text-[10px] uppercase tracking-[0.18em] text-[#ee3224]`}>
              {translateStatusLabel(activeRequest.status, isEnglish)}
            </span>
            <h3 className="resq-display mt-3 text-[28px] font-[700] leading-[0.95] text-[#080b0d]">
              {activeRequest.serviceTitle}
            </h3>
            <p className={`${mono} mt-3 text-[12px] leading-[20px] text-[#667085]`}>
              {t(
                isEnglish,
                `Yêu cầu ${activeRequest.id} đang được theo dõi trong cùng một panel gắn ở mép phải.`,
                `Request ${activeRequest.id} is now tracked in the same right-edge panel.`,
              )}
            </p>
          </div>

          <span className="flex size-[42px] shrink-0 items-center justify-center rounded-full bg-[#ee3224] text-white">
            <Truck size={18} />
          </span>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <StatTile
            label={t(isEnglish, "Mã yêu cầu", "Request ID")}
            value={activeRequest.id}
          />
          <StatTile
            label="ETA"
            value={activeRequest.serviceEta}
          />
          <StatTile
            label={t(isEnglish, "Phương tiện", "Vehicle")}
            value={`${activeRequest.vehicleName} · ${translateVehicleType(activeRequest.vehicleType, isEnglish)}`}
          />
          <StatTile
            label={t(isEnglish, "Fixer", "Fixer")}
            value={activeRequest.fixerName || t(isEnglish, "Đang chờ xác nhận", "Waiting to confirm")}
          />
        </div>
      </PanelCard>

      {isWaitingForFixer ? (
        <PanelCard className="p-5">
          <div className="flex items-start gap-3">
            <div className="mt-[2px] flex size-[38px] shrink-0 items-center justify-center rounded-full bg-[rgba(238,50,36,0.08)]">
              <LoaderCircle size={18} className="animate-spin text-[#ee3224]" />
            </div>
            <div className="min-w-0">
              <p className={`${mono} text-[11px] uppercase tracking-[0.18em] text-[#ee3224]`}>
                {t(isEnglish, "Chờ fixer xác nhận", "Waiting for fixer")}
              </p>
              <p className={`${mono} mt-2 text-[12px] leading-[20px] text-[#4a5565]`}>
                {t(
                  isEnglish,
                  "Bản đồ trực tiếp sẽ bật ngay khi fixer nhận đơn. Trong lúc này ResQ vẫn giữ vị trí của bạn để điều phối chính xác hơn.",
                  "The live map turns on as soon as the fixer accepts. Until then, ResQ keeps your location ready for dispatch.",
                )}
              </p>
            </div>
          </div>
        </PanelCard>
      ) : (
        <TrackingLiveMap
          compact
          requestId={activeRequest.id}
          actorId={actorId}
          actorRole="user"
          destinationPoint={activeRequest.locationPoint}
          destinationAddress={activeRequest.locationAddress}
        />
      )}

      <ProgressPanel
        isEnglish={isEnglish}
        status={activeRequest.status}
        progress={progress}
      />

      <PanelCard className="p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className={`${mono} text-[11px] uppercase tracking-[0.18em] text-[#99a1af]`}>
              {t(isEnglish, "Fixer phụ trách", "Assigned fixer")}
            </p>
            <h4 className={`${mono} mt-2 text-[16px] font-[700] text-[#080b0d]`}>
              {activeRequest.fixerTeam}
            </h4>
          </div>
          <a
            href="tel:19001234"
            className="resq-button-pill resq-button-pill--secondary h-[38px] px-4 no-underline"
          >
            <PhoneCall size={14} className="text-[#ee3224]" />
            <span className={`${mono} text-[11px] uppercase tracking-[0.16em] text-[#080b0d]`}>
              {t(isEnglish, "Gọi", "Call")}
            </span>
          </a>
        </div>

        <div className="mt-4 space-y-3">
          <InfoLine
            icon={UserRound}
            label={t(isEnglish, "Fixer", "Fixer")}
            value={activeRequest.fixerName || "Fixer ResQ"}
          />
          <InfoLine
            icon={VehicleIcon}
            label={t(isEnglish, "Xe hỗ trợ", "Support vehicle")}
            value={activeRequest.fixerVehicle}
          />
          <InfoLine
            icon={MapPin}
            label={t(isEnglish, "Điểm hẹn", "Pinned location")}
            value={activeRequest.locationAddress}
          />
          {activeRequest.notes && (
            <InfoLine
              icon={Clock3}
              label={t(isEnglish, "Ghi chú", "Notes")}
              value={activeRequest.notes}
            />
          )}
        </div>

        <div className="mt-4 flex flex-col gap-3">
          <Link
            to={isWaitingForFixer ? "/dich-vu" : "/thanh-toan"}
            onClick={closePanel}
            className="resq-button-pill resq-button-pill--primary w-full px-5 py-3 no-underline"
          >
            <span className={`${mono} text-[12px] font-[500] uppercase tracking-[0.16em] text-white`}>
              {isWaitingForFixer
                ? t(isEnglish, "Xem dịch vụ", "View services")
                : t(isEnglish, "Thanh toán", "Open payment")}
            </span>
          </Link>

          <button
            type="button"
            onClick={() => {
              cancelActiveRequest();
            }}
            className="resq-button-pill resq-button-pill--secondary w-full px-5 py-3"
          >
            <span className={`${mono} text-[12px] font-[500] uppercase tracking-[0.16em] text-[#080b0d]`}>
              {t(isEnglish, "Hủy đơn", "Cancel request")}
            </span>
          </button>
        </div>
      </PanelCard>

      <RequestStatusFeedCard requestId={activeRequest.id} compact />

      {isWaitingForFixer ? (
        <PanelCard className="p-5">
          <div className="flex items-start gap-3">
            <div className="mt-[2px] flex size-[38px] shrink-0 items-center justify-center rounded-full bg-[rgba(238,50,36,0.08)]">
              <Headset size={18} className="text-[#ee3224]" />
            </div>
            <div className="min-w-0">
              <p className={`${mono} text-[11px] uppercase tracking-[0.18em] text-[#99a1af]`}>
                {t(isEnglish, "Khung chat", "Chat")}
              </p>
              <p className={`${mono} mt-2 text-[12px] leading-[20px] text-[#4a5565]`}>
                {t(
                  isEnglish,
                  "Chat sẽ mở ngay khi fixer xác nhận đơn để hai bên trao đổi trong cùng một luồng.",
                  "The chat opens as soon as the fixer confirms, so both sides can talk in the same flow.",
                )}
              </p>
            </div>
          </div>
        </PanelCard>
      ) : (
        <RequestChatPanel
          compact
          requestId={activeRequest.id}
          actorId={actorId}
          actorName={actorName}
          actorRole="user"
        />
      )}

      <HistoryPanel
        isEnglish={isEnglish}
        items={requestHistory}
        emptyLabel={t(
          isEnglish,
          "Lịch sử cứu hộ sẽ hiện tại đây sau khi đơn đầu tiên hoàn tất.",
          "Past rescue requests will appear here after the first completed job.",
        )}
      />
    </div>
  );
}

function FixerTrackingPanelBody({
  isEnglish,
  activeRequest,
  incomingRequests,
  requestHistory,
  userName,
}: {
  isEnglish: boolean;
  activeRequest: ActiveResQRequest | null;
  incomingRequests: ActiveResQRequest[];
  requestHistory: ResQHistoryItem[];
  userName: string;
}) {
  const nextActionLabel = activeRequest
    ? getFixerNextActionLabel(activeRequest.status, isEnglish)
    : null;

  if (!activeRequest && incomingRequests.length === 0) {
    return (
      <div className="space-y-4">
        <PanelCard className="px-6 py-6 text-center">
          <div className="mx-auto flex size-[56px] items-center justify-center rounded-full bg-[rgba(238,50,36,0.08)]">
            <Truck size={24} className="text-[#ee3224]" />
          </div>
          <h3 className="resq-display mt-4 text-[28px] font-[700] leading-[0.95] text-[#080b0d]">
            {t(isEnglish, "Chưa có request nào", "No incoming requests")}
          </h3>
          <p className={`${mono} mt-3 text-[12px] leading-[20px] text-[#667085]`}>
            {t(
              isEnglish,
              "Khi khách hàng gửi yêu cầu mới, hàng chờ và tiến độ xử lý sẽ hiện trong panel này.",
              "When new customer requests arrive, the queue and dispatch progress will show up here.",
            )}
          </p>
        </PanelCard>

        <HistoryPanel
          isEnglish={isEnglish}
          items={requestHistory}
          emptyLabel={t(
            isEnglish,
            "Lịch sử fixer sẽ hiện sau khi bạn hoàn tất request đầu tiên.",
            "Fixer history will appear after your first completed request.",
          )}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {activeRequest ? (
        <>
          <PanelCard className="bg-[linear-gradient(180deg,#fff4f2_0%,#ffffff_100%)] p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <span className={`${mono} inline-flex rounded-full bg-[rgba(238,50,36,0.08)] px-3 py-1.5 text-[10px] uppercase tracking-[0.18em] text-[#ee3224]`}>
                  {translateStatusLabel(activeRequest.status, isEnglish)}
                </span>
                <h3 className="resq-display mt-3 text-[28px] font-[700] leading-[0.95] text-[#080b0d]">
                  {activeRequest.serviceTitle}
                </h3>
                <p className={`${mono} mt-3 text-[12px] leading-[20px] text-[#667085]`}>
                  {activeRequest.requesterName} · {activeRequest.requesterPhone || "1900 1234"}
                </p>
              </div>

              <span className="flex size-[42px] shrink-0 items-center justify-center rounded-full bg-[#ee3224] text-white">
                <Wrench size={18} />
              </span>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <StatTile
                label={t(isEnglish, "Mã đơn", "Request ID")}
                value={activeRequest.id}
              />
              <StatTile label="ETA" value={activeRequest.serviceEta} />
              <StatTile
                label={t(isEnglish, "Xe khách", "Customer vehicle")}
                value={`${activeRequest.vehicleName} · ${activeRequest.vehiclePlate}`}
              />
              <StatTile
                label={t(isEnglish, "Điểm hẹn", "Meeting point")}
                value={activeRequest.locationAddress}
              />
            </div>
          </PanelCard>

          <TrackingLiveMap
            compact
            requestId={activeRequest.id}
            actorId={undefined}
            actorRole="fixer"
            destinationPoint={activeRequest.locationPoint}
            destinationAddress={activeRequest.locationAddress}
          />

          <PanelCard className="p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className={`${mono} text-[11px] uppercase tracking-[0.18em] text-[#99a1af]`}>
                  {t(isEnglish, "Điều khiển xử lý", "Dispatch controls")}
                </p>
                <h4 className={`${mono} mt-2 text-[16px] font-[700] text-[#080b0d]`}>
                  {t(isEnglish, "Tiếp tục cập nhật tiến độ", "Advance request progress")}
                </h4>
              </div>

              <span className="flex size-[40px] items-center justify-center rounded-full bg-[rgba(238,50,36,0.08)]">
                <ShieldCheck size={18} className="text-[#ee3224]" />
              </span>
            </div>

            <div className="mt-4 space-y-3">
              <InfoLine
                icon={UserRound}
                label={t(isEnglish, "Khách hàng", "Customer")}
                value={activeRequest.requesterName}
              />
              <InfoLine
                icon={PhoneCall}
                label={t(isEnglish, "Liên hệ", "Phone")}
                value={activeRequest.requesterPhone || "1900 1234"}
              />
              <InfoLine
                icon={MapPin}
                label={t(isEnglish, "Vị trí", "Location")}
                value={activeRequest.locationAddress}
              />
              {activeRequest.notes && (
                <InfoLine
                  icon={Clock3}
                  label={t(isEnglish, "Ghi chú", "Notes")}
                  value={activeRequest.notes}
                />
              )}
            </div>

            <div className="mt-4 flex flex-col gap-3">
              {nextActionLabel && (
                <button
                  type="button"
                  onClick={() => {
                    advanceActiveRequestStatus();
                  }}
                  className="resq-button-pill resq-button-pill--primary w-full px-5 py-3"
                >
                  <span className={`${mono} text-[12px] font-[500] uppercase tracking-[0.16em] text-white`}>
                    {nextActionLabel}
                  </span>
                </button>
              )}

              <a
                href={`tel:${activeRequest.requesterPhone || "19001234"}`}
                className="resq-button-pill resq-button-pill--secondary w-full px-5 py-3 no-underline"
              >
                <PhoneCall size={14} className="text-[#ee3224]" />
                <span className={`${mono} text-[12px] font-[500] uppercase tracking-[0.16em] text-[#080b0d]`}>
                  {t(isEnglish, "Gọi khách hàng", "Call customer")}
                </span>
              </a>
            </div>
          </PanelCard>

          <RequestStatusFeedCard requestId={activeRequest.id} compact />

          <RequestChatPanel
            compact
            requestId={activeRequest.id}
            actorId={undefined}
            actorName={userName}
            actorRole="fixer"
          />
        </>
      ) : (
        <PanelCard className="px-6 py-6 text-center">
          <div className="mx-auto flex size-[56px] items-center justify-center rounded-full bg-[rgba(238,50,36,0.08)]">
            <ClipboardList size={24} className="text-[#ee3224]" />
          </div>
          <h3 className="resq-display mt-4 text-[28px] font-[700] leading-[0.95] text-[#080b0d]">
            {t(isEnglish, "Request đang chờ", "Requests waiting")}
          </h3>
          <p className={`${mono} mt-3 text-[12px] leading-[20px] text-[#667085]`}>
            {t(
              isEnglish,
              "Khách hàng đã gửi vị trí và mô tả sự cố. Xác nhận một đơn để bắt đầu luồng xử lý.",
              "Customers already sent location and issue details. Confirm a request to start dispatch.",
            )}
          </p>
        </PanelCard>
      )}

      {incomingRequests.length > 0 && (
        <PanelCard className="p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className={`${mono} text-[11px] uppercase tracking-[0.18em] text-[#99a1af]`}>
                {t(isEnglish, "Hàng chờ", "Queue")}
              </p>
              <h4 className={`${mono} mt-2 text-[16px] font-[700] text-[#080b0d]`}>
                {t(isEnglish, "Request mới từ khách hàng", "Incoming customer requests")}
              </h4>
            </div>
            <span className={`${mono} inline-flex rounded-full bg-[rgba(238,50,36,0.08)] px-3 py-1.5 text-[10px] uppercase tracking-[0.16em] text-[#ee3224]`}>
              {incomingRequests.length}
            </span>
          </div>

          <div className="space-y-3">
            {incomingRequests.map((request) => (
              <IncomingRequestCard
                key={request.id}
                isEnglish={isEnglish}
                request={request}
              />
            ))}
          </div>
        </PanelCard>
      )}

      <HistoryPanel
        isEnglish={isEnglish}
        items={requestHistory}
        emptyLabel={t(
          isEnglish,
          "Lịch sử fixer sẽ hiện sau khi bạn xử lý xong request đầu tiên.",
          "Fixer history will appear after you finish the first request.",
        )}
      />
    </div>
  );
}

function ProgressPanel({
  isEnglish,
  status,
  progress,
}: {
  isEnglish: boolean;
  status: string;
  progress: ReturnType<typeof getLocalizedProgress>;
}) {
  return (
    <PanelCard className="p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className={`${mono} text-[11px] uppercase tracking-[0.18em] text-[#99a1af]`}>
            {t(isEnglish, "Tiến độ", "Progress")}
          </p>
          <h4 className={`${mono} mt-2 text-[16px] font-[700] text-[#080b0d]`}>
            {translateStatusLabel(status, isEnglish)}
          </h4>
        </div>

        <span className={`${mono} inline-flex rounded-full bg-[rgba(238,50,36,0.08)] px-3 py-1.5 text-[10px] uppercase tracking-[0.16em] text-[#ee3224]`}>
          {progress.progressLabel}
        </span>
      </div>

      <div className="mt-4 h-[8px] overflow-hidden rounded-full bg-[#eceef2]">
        <div
          className="h-full rounded-full bg-[linear-gradient(90deg,#ee3224_0%,#ff7d6f_100%)]"
          style={{ width: `${progress.percent}%` }}
        />
      </div>

      <div className="mt-4 space-y-3">
        {progress.steps.map((step, index) => {
          const isCurrent = index === progress.currentIndex;
          const isComplete = index < progress.currentIndex;

          return (
            <div
              key={step.label}
              className={`rounded-[18px] border px-4 py-4 ${
                isCurrent
                  ? "border-[rgba(238,50,36,0.16)] bg-[rgba(238,50,36,0.05)]"
                  : isComplete
                    ? "border-[rgba(238,50,36,0.08)] bg-white"
                    : "border-black/5 bg-[#faf8f5]"
              }`}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`flex size-[28px] shrink-0 items-center justify-center rounded-full ${
                    isCurrent || isComplete ? "bg-[#ee3224] text-white" : "bg-white text-[#99a1af]"
                  } ${mono} text-[10px] font-[700]`}
                >
                  {index + 1}
                </span>
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
    </PanelCard>
  );
}

function IncomingRequestCard({
  isEnglish,
  request,
}: {
  isEnglish: boolean;
  request: ActiveResQRequest;
}) {
  const VehicleIcon = request.vehicleType === "Xe máy" ? Bike : Car;

  return (
    <div className="rounded-[20px] border border-black/5 bg-[#faf8f5] p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className={`${mono} text-[12px] font-[700] text-[#080b0d]`}>
            {request.serviceTitle}
          </p>
          <p className={`${mono} mt-2 text-[11px] leading-[18px] text-[#667085]`}>
            {request.requesterName} · {request.requesterPhone || "1900 1234"}
          </p>
        </div>
        <span className={`${mono} shrink-0 rounded-full bg-white px-3 py-1 text-[10px] uppercase tracking-[0.16em] text-[#ee3224]`}>
          {request.serviceEta}
        </span>
      </div>

      <div className="mt-4 space-y-3">
        <InfoLine
          icon={VehicleIcon}
          label={t(isEnglish, "Xe", "Vehicle")}
          value={`${request.vehicleName} · ${request.vehiclePlate}`}
        />
        <InfoLine
          icon={MapPin}
          label={t(isEnglish, "Vị trí", "Location")}
          value={request.locationAddress}
        />
      </div>

      <button
        type="button"
        onClick={() => {
          confirmIncomingRequest(request.id);
        }}
        className="resq-button-pill resq-button-pill--primary mt-4 w-full px-5 py-3"
      >
        <span className={`${mono} text-[12px] font-[500] uppercase tracking-[0.16em] text-white`}>
          {t(isEnglish, "Xác nhận đơn", "Confirm request")}
        </span>
      </button>
    </div>
  );
}

function SupportHotlineCard({ isEnglish }: { isEnglish: boolean }) {
  return (
    <PanelCard className="p-5">
      <div className="flex items-start gap-3">
        <div className="mt-[2px] flex size-[38px] shrink-0 items-center justify-center rounded-full bg-[rgba(238,50,36,0.08)]">
          <PhoneCall size={18} className="text-[#ee3224]" />
        </div>
        <div className="min-w-0">
          <p className={`${mono} text-[11px] uppercase tracking-[0.18em] text-[#99a1af]`}>
            {t(isEnglish, "Hotline", "Hotline")}
          </p>
          <h4 className={`${mono} mt-2 text-[16px] font-[700] text-[#080b0d]`}>
            1900 1234
          </h4>
          <p className={`${mono} mt-2 text-[12px] leading-[20px] text-[#667085]`}>
            {t(
              isEnglish,
              "Dùng nhanh khi bạn thấy không an toàn, pin yếu hoặc cần điều phối chọn dịch vụ phù hợp.",
              "Use this when you feel unsafe, your phone battery is low, or dispatch should pick the right service for you.",
            )}
          </p>
        </div>
      </div>
    </PanelCard>
  );
}

function HistoryPanel({
  isEnglish,
  items,
  emptyLabel,
}: {
  isEnglish: boolean;
  items: ResQHistoryItem[];
  emptyLabel: string;
}) {
  return (
    <PanelCard className="p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className={`${mono} text-[11px] uppercase tracking-[0.18em] text-[#99a1af]`}>
            {t(isEnglish, "Lịch sử gần đây", "Recent history")}
          </p>
          <h4 className={`${mono} mt-2 text-[16px] font-[700] text-[#080b0d]`}>
            {t(isEnglish, "Những lần hỗ trợ trước", "Past rescue activity")}
          </h4>
        </div>
      </div>

      {items.length > 0 ? (
        <div className="mt-4 space-y-3">
          {items.slice(0, 4).map((item) => (
            <div key={item.id} className="rounded-[18px] border border-black/5 bg-[#faf8f5] px-4 py-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className={`${mono} text-[12px] font-[700] text-[#080b0d]`}>
                    {item.serviceTitle}
                  </p>
                  <p className={`${mono} mt-2 text-[11px] leading-[18px] text-[#667085]`}>
                    {translateStatusLabel(item.status, isEnglish)}
                  </p>
                </div>
                <span className={`${mono} shrink-0 rounded-full bg-white px-3 py-1 text-[10px] uppercase tracking-[0.16em] text-[#99a1af]`}>
                  {item.paymentStatus === "Đã thanh toán"
                    ? t(isEnglish, "Đã thanh toán", "Paid")
                    : t(isEnglish, "Chưa thanh toán", "Pending")}
                </span>
              </div>
              <p className={`${mono} mt-3 text-[11px] leading-[18px] text-[#667085]`}>
                {item.locationAddress}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-4 rounded-[18px] border border-dashed border-black/8 bg-[#faf8f5] px-4 py-4">
          <p className={`${mono} text-[11px] leading-[19px] text-[#667085]`}>
            {emptyLabel}
          </p>
        </div>
      )}
    </PanelCard>
  );
}

function StatTile({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[18px] border border-black/5 bg-white px-4 py-4">
      <p className={`${mono} text-[10px] uppercase tracking-[0.16em] text-[#99a1af]`}>
        {label}
      </p>
      <p className={`${mono} mt-2 text-[12px] font-[700] leading-[18px] text-[#080b0d]`}>
        {value}
      </p>
    </div>
  );
}

function InfoLine({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-[18px] bg-[#faf8f5] px-4 py-4">
      <span className="mt-[2px] flex size-[32px] shrink-0 items-center justify-center rounded-full bg-white">
        <Icon size={15} className="text-[#ee3224]" />
      </span>
      <span className="min-w-0">
        <span className={`${mono} block text-[10px] uppercase tracking-[0.16em] text-[#99a1af]`}>
          {label}
        </span>
        <span className={`${mono} mt-2 block text-[11px] leading-[19px] text-[#080b0d]`}>
          {value}
        </span>
      </span>
    </div>
  );
}

function PanelCard({
  className = "",
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <section className={`rounded-[24px] border border-black/5 bg-white shadow-[0_18px_42px_rgba(8,11,13,0.06)] ${className}`}>
      {children}
    </section>
  );
}

import { Link } from "react-router";
import {
  BadgeCheck,
  Bike,
  Car,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Clock3,
  CreditCard,
  LoaderCircle,
  MapPin,
  PhoneCall,
  ShieldCheck,
  Truck,
  UserRound,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { TrackingLiveMap } from "./tracking/TrackingLiveMap";
import { useLiveRequestLocationSync } from "./tracking/requestLocations";
import { RequestStatusFeedCard } from "./tracking/RequestStatusFeedCard";
import {
  advanceActiveRequestStatus,
  confirmIncomingRequest,
  useResQStore,
  type ActiveResQRequest,
} from "./resqStore";
import { getServiceProgress } from "./tracking/request-progress";
import { RequestChatPanel } from "./tracking/RequestChatPanel";
import { useAuth } from "./AuthContext";
import { useLanguage } from "./LanguageContext";
import {
  localizeFixerMeta,
  localizeRequestStatus,
  localizeServiceEta,
  localizeServiceTitle,
  localizeVehicleType,
  t,
} from "./localization";

const mono = "font-['IBM_Plex_Mono',monospace]";
const pagePadding = "px-5 sm:px-8 lg:px-[84px] xl:px-[120px]";
const pageShell = "mx-auto w-full max-w-[1240px]";

function getWaitingTips(isEnglish: boolean) {
  return isEnglish ? [
    "Keep your phone ready so the fixer can reach you if needed.",
    "Move the vehicle to a safe spot if traffic conditions allow.",
    "Prepare your vehicle details so the support process can move faster.",
  ] : [
    "Giữ điện thoại sẵn sàng để fixer có thể liên hệ khi cần.",
    "Di chuyển xe vào vị trí an toàn nếu điều kiện giao thông cho phép.",
    "Chuẩn bị thông tin xe để quá trình hỗ trợ diễn ra nhanh hơn.",
  ];
}

export default function TrackingPage() {
  const { user } = useAuth();

  if (user?.role === "fixer") {
    return <FixerTrackingPage />;
  }

  return <UserTrackingPage />;
}

function UserTrackingPage() {
  const { language } = useLanguage();
  const isEnglish = language === "en";
  const { user } = useAuth();
  const {
    activeRequest,
    requestHistory,
    isHydrating,
    cancelActiveRequest,
  } = useResQStore();

  useLiveRequestLocationSync({
    requestId: activeRequest?.id ?? null,
    actorId: user?.id,
    actorRole: user?.role === "fixer" ? "fixer" : "user",
    fallbackUserPoint: activeRequest?.locationPoint,
    fallbackUserAddress: activeRequest?.locationAddress,
  });

  if (!activeRequest) {
    return (
      <div className="overflow-x-hidden bg-white">
        <div className={`${pagePadding} pt-10 pb-16 sm:pt-14 sm:pb-20`}>
          <div className={pageShell}>
            <Link
              to="/"
              className={`mb-[16px] inline-flex items-center gap-[4px] text-[13px] font-[500] text-[#a4a4a4] no-underline transition-colors hover:text-[#080b0d] ${mono}`}
            >
              <ChevronLeft size={16} />
              {t(isEnglish, "Quay lại", "Back")}
            </Link>

            <div className="resq-reveal mb-8 max-w-[720px] sm:mb-10">
              <p className={`${mono} mb-4 text-[12px] font-[500] uppercase tracking-[1.8px] text-[#ee3224] sm:text-[13px]`}>
                {t(isEnglish, "Theo dõi cứu hộ", "Rescue tracking")}
              </p>
              <h1 className={`${mono} mb-[10px] text-[36px] font-[700] text-[#080b0d] sm:text-[44px] lg:text-[48px]`}>
                {t(isEnglish, "Hình như bạn chưa chọn dịch vụ nào", "It looks like you have not chosen a service yet")}
              </h1>
              <p className={`${mono} text-[14px] leading-[24px] text-[#4a5565] sm:text-[15px]`}>
                {t(
                  isEnglish,
                  "Khi bạn gửi yêu cầu trên trang Dịch Vụ, fixer, ETA và tiến độ xử lý sẽ hiển thị tại đây ngay lập tức.",
                  "After you submit a request from Services, the fixer, ETA, and progress will appear here immediately.",
                )}
              </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
              <section className="rounded-[24px] border border-dashed border-[rgba(4,38,153,0.12)] bg-[#faf8f5] p-6 shadow-[0_18px_50px_rgba(8,11,13,0.04)] sm:p-8">
                <div className="flex size-[64px] items-center justify-center rounded-full bg-[rgba(238,50,36,0.1)]">
                  {isHydrating ? (
                    <LoaderCircle size={28} className="animate-spin text-[#ee3224]" />
                  ) : (
                    <ClipboardList size={28} className="text-[#ee3224]" />
                  )}
                </div>
                <h2 className={`${mono} mt-5 text-[24px] font-[700] text-[#080b0d]`}>
                  {t(isEnglish, "Theo Dõi sẽ sáng lên sau khi bạn tạo đơn", "Tracking activates after you create a request")}
                </h2>
                <p className={`${mono} mt-3 max-w-[620px] text-[13px] leading-[22px] text-[#4a5565]`}>
                  {t(
                    isEnglish,
                    "ResQ sẽ ghi nhận yêu cầu, chuyển sang trạng thái chờ fixer xác nhận, rồi cập nhật lộ trình trực tiếp ngay trên bản đồ theo dõi này.",
                    "ResQ will record the request, move it into fixer confirmation, then update the live route on this tracking map.",
                  )}
                </p>
                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <Link
                    to="/dich-vu"
                    className="inline-flex h-[48px] items-center justify-center gap-2 rounded-[12px] bg-[#ee3224] px-6 no-underline transition-colors hover:bg-[#d42b1e]"
                  >
                    <span className={`${mono} text-[14px] font-[500] text-white`}>
                      {t(isEnglish, "Đến trang Dịch Vụ", "Go to Services")}
                    </span>
                    <ChevronRight size={16} className="text-white" />
                  </Link>
                  <Link
                    to="/tai-khoan"
                    className="inline-flex h-[48px] items-center justify-center rounded-[12px] border border-black px-6 no-underline transition-colors hover:bg-[#f5f5f5]"
                  >
                    <span className={`${mono} text-[14px] font-[500] text-[#080b0d]`}>
                      {t(isEnglish, "Quản lý xe", "Manage vehicles")}
                    </span>
                  </Link>
                </div>
              </section>

              <aside className="space-y-5">
                <div className="rounded-[20px] border border-[rgba(4,38,153,0.08)] bg-white p-6 shadow-[0_18px_50px_rgba(8,11,13,0.04)]">
                  <p className={`${mono} mb-4 text-[12px] uppercase tracking-[1.4px] text-[#99a1af]`}>
                    {t(isEnglish, "Quy trình", "Flow")}
                  </p>
                  <div className="space-y-3">
                    {(isEnglish ? [
                      "1. Choose the right service for your vehicle.",
                      "2. Send the request and wait for fixer confirmation.",
                      "3. Track the fixer, pay, and review history here.",
                    ] : [
                      "1. Chọn dịch vụ phù hợp cho xe của bạn.",
                      "2. Gửi yêu cầu và chờ fixer xác nhận đơn.",
                      "3. Theo dõi fixer, thanh toán và xem lịch sử tại đây.",
                    ]).map((step) => (
                      <p key={step} className={`${mono} text-[13px] leading-[22px] text-[#4a5565]`}>
                        {step}
                      </p>
                    ))}
                  </div>
                </div>

                {requestHistory.length > 0 && (
                  <div className="rounded-[20px] border border-[rgba(4,38,153,0.08)] bg-white p-6 shadow-[0_18px_50px_rgba(8,11,13,0.04)]">
                    <p className={`${mono} mb-4 text-[12px] uppercase tracking-[1.4px] text-[#99a1af]`}>
                      {t(isEnglish, "Lịch sử gần đây", "Recent history")}
                    </p>
                    <div className="space-y-3">
                      {requestHistory.slice(0, 3).map((item) => (
                        <div key={item.id} className="rounded-[16px] bg-[#f7f7f8] px-4 py-4">
                          <p className={`${mono} text-[13px] font-[500] text-[#080b0d]`}>
                            {localizeServiceTitle(item, isEnglish)}
                          </p>
                          <p className={`${mono} mt-2 text-[11px] text-[#667085]`}>
                            {localizeRequestStatus(item.status, isEnglish)} · {item.locationAddress}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </aside>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const request = activeRequest;
  const serviceTitle = localizeServiceTitle(request, isEnglish);
  const serviceEta = localizeServiceEta(request.serviceEta, isEnglish);
  const requestStatus = localizeRequestStatus(request.status, isEnglish);
  const vehicleType = localizeVehicleType(request.vehicleType, isEnglish);
  const fixerTeam = localizeFixerMeta(request.fixerTeam, isEnglish);
  const fixerVehicle = localizeFixerMeta(request.fixerVehicle, isEnglish);
  const quickStats = [
    { label: t(isEnglish, "Mã yêu cầu", "Request ID"), value: request.id },
    { label: t(isEnglish, "Dịch vụ", "Service"), value: serviceTitle },
    { label: t(isEnglish, "ETA dự kiến", "Estimated ETA"), value: serviceEta },
  ];
  const trackingHighlights = [
    { label: t(isEnglish, "Xe đã chọn", "Selected vehicle"), value: vehicleType },
    { label: t(isEnglish, "Trạng thái", "Status"), value: requestStatus },
    { label: "Fixer", value: request.fixerName || t(isEnglish, "Đang chờ xác nhận", "Waiting for confirmation") },
  ];
  const VehicleIcon = request.vehicleType === "Xe máy" ? Bike : Car;
  const serviceProgress = getServiceProgress(request.status, isEnglish);
  const isWaitingForFixerConfirmation = request.status === "Chờ fixer xác nhận";
  const currentProgressStep = serviceProgress.steps[serviceProgress.currentIndex];
  const nextProgressStep = serviceProgress.steps[serviceProgress.currentIndex + 1] ?? null;
  const heroLabel =
    isWaitingForFixerConfirmation
      ? t(isEnglish, "Yêu cầu đang chờ fixer xác nhận", "Your request is waiting for fixer confirmation")
      : request.status === "Fixer đã xác nhận"
        ? t(isEnglish, "Fixer đã nhận đơn của bạn", "A fixer accepted your request")
        : t(isEnglish, "Xe ResQ đang trên đường đến bạn", "The ResQ vehicle is on the way");

  return (
    <div className="overflow-x-hidden bg-white">
      <div className={`${pagePadding} pt-10 pb-16 sm:pt-14 sm:pb-20`}>
        <div className={pageShell}>
          <Link
            to="/"
            className={`mb-[16px] inline-flex items-center gap-[4px] text-[13px] font-[500] text-[#a4a4a4] no-underline transition-colors hover:text-[#080b0d] ${mono}`}
          >
            <ChevronLeft size={16} />
            {t(isEnglish, "Quay lại", "Back")}
          </Link>

          <div className="resq-reveal mb-8 max-w-[700px] sm:mb-10">
            <p className={`${mono} mb-4 text-[12px] font-[500] uppercase tracking-[1.8px] text-[#ee3224] sm:text-[13px]`}>
              {t(isEnglish, "Theo dõi cứu hộ", "Rescue tracking")}
            </p>
            <h1 className={`${mono} mb-[10px] text-[36px] font-[700] text-[#080b0d] sm:text-[44px] lg:text-[48px]`}>
              {t(isEnglish, "Theo dõi fixer theo thời gian thực", "Track your fixer in real time")}
            </h1>
            <p className={`${mono} text-[14px] leading-[24px] text-[#4a5565] sm:text-[15px]`}>
              {t(
                isEnglish,
                "Trạng thái mới của ResQ bắt đầu từ lúc gửi đơn, chờ fixer xác nhận, rồi tiếp tục đồng bộ lộ trình và tiến độ hỗ trợ trong cùng một trang.",
                "The ResQ status flow starts when you submit a request, waits for fixer confirmation, then keeps route and service progress in one page.",
              )}
            </p>
          </div>

          <div className="mb-6 grid gap-4 sm:grid-cols-3">
            {quickStats.map((item) => (
              <div
                key={item.label}
                className="resq-reveal resq-card-lift rounded-[16px] border border-[rgba(4,38,153,0.08)] bg-[#f7f7f8] px-5 py-4"
              >
                <p className={`${mono} mb-2 text-[11px] uppercase tracking-[1.4px] text-[#99a1af]`}>
                  {item.label}
                </p>
                <p className={`${mono} text-[16px] font-[700] text-[#080b0d]`}>
                  {item.value}
                </p>
              </div>
            ))}
          </div>

          <div className="resq-reveal resq-reveal--delay-1 mb-6 rounded-[20px] border border-[rgba(4,38,153,0.08)] bg-white p-5 shadow-[0_18px_50px_rgba(8,11,13,0.04)] sm:p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0">
                <div className="mb-3 flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-2 rounded-full bg-[#ee3224] px-3 py-1.5">
                    <BadgeCheck size={14} className="text-white" />
                    <span className={`${mono} text-[11px] uppercase tracking-[0.16em] text-white`}>
                      {requestStatus}
                    </span>
                  </span>
                  <span className={`${mono} inline-flex items-center rounded-full border border-[rgba(4,38,153,0.08)] bg-[#f7f7f8] px-3 py-1.5 text-[11px] uppercase tracking-[0.16em] text-[#4a5565]`}>
                    {t(isEnglish, "GPS trực tiếp", "Live GPS")}
                  </span>
                </div>

                <p className={`${mono} text-[24px] font-[700] leading-[1.2] text-[#080b0d] sm:text-[28px]`}>
                  {heroLabel}
                </p>
                <p className={`${mono} mt-2 max-w-[640px] text-[13px] leading-[23px] text-[#4a5565] sm:text-[14px] sm:leading-[24px]`}>
                  {t(
                    isEnglish,
                    `Theo dõi yêu cầu ${request.id} với dịch vụ ${serviceTitle.toLowerCase()}, phương tiện ${request.vehicleName} và điểm hẹn đã xác nhận lúc tạo đơn.`,
                    `Track request ${request.id} for ${serviceTitle.toLowerCase()}, vehicle ${request.vehicleName}, and the meeting point confirmed when the request was created.`,
                  )}
                </p>
              </div>

              <div className="inline-flex w-fit shrink-0 items-center gap-2 rounded-full bg-[rgba(238,50,36,0.1)] px-4 py-2.5">
                <Truck size={16} className="text-[#ee3224]" />
                <span className={`${mono} text-[11px] uppercase tracking-[0.18em] text-[#ee3224]`}>
                  {fixerTeam}
                </span>
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {trackingHighlights.map((item) => (
                <div
                  key={item.label}
                  className="rounded-[16px] border border-[rgba(4,38,153,0.08)] bg-[#f7f7f8] px-4 py-4"
                >
                  <p className={`${mono} text-[11px] uppercase tracking-[0.18em] text-[#99a1af]`}>
                    {item.label}
                  </p>
                  <p className={`${mono} mt-2 text-[19px] font-[700] leading-none text-[#080b0d]`}>
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
            <div className="min-w-0">
              {isWaitingForFixerConfirmation ? (
                <div className="resq-reveal resq-reveal--delay-2 rounded-[20px] border border-[rgba(4,38,153,0.08)] bg-[linear-gradient(180deg,#fff7f5_0%,#ffffff_100%)] p-5 shadow-[0_18px_50px_rgba(8,11,13,0.04)] sm:p-6">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[rgba(238,50,36,0.1)] px-3 py-1.5">
                        <Clock3 size={14} className="text-[#ee3224]" />
                        <span className={`${mono} text-[11px] uppercase tracking-[0.16em] text-[#ee3224]`}>
                          {t(isEnglish, "Chờ fixer xác nhận", "Waiting for fixer confirmation")}
                        </span>
                      </div>
                      <h2 className={`${mono} text-[24px] font-[700] leading-[1.2] text-[#080b0d] sm:text-[28px]`}>
                        {t(isEnglish, "Bản đồ sẽ mở ngay khi fixer nhận đơn", "The map opens as soon as a fixer accepts")}
                      </h2>
                      <p className={`${mono} mt-3 max-w-[620px] text-[13px] leading-[22px] text-[#4a5565] sm:text-[14px] sm:leading-[24px]`}>
                        {t(
                          isEnglish,
                          "ResQ đã lưu vị trí của bạn và đang gửi yêu cầu tới fixer phù hợp. Ngay khi có người nhận đơn, trang này sẽ chuyển sang bản đồ trực tiếp để bạn theo dõi xe cứu hộ.",
                          "ResQ saved your location and is routing the request to a matching fixer. As soon as someone accepts it, this page will switch to the live map.",
                        )}
                      </p>
                    </div>

                    <div className="inline-flex w-fit shrink-0 items-center gap-2 rounded-full bg-white px-4 py-2.5 shadow-[0_12px_30px_rgba(8,11,13,0.06)]">
                      <MapPin size={16} className="text-[#ee3224]" />
                      <span className={`${mono} text-[11px] uppercase tracking-[0.18em] text-[#080b0d]`}>
                        {t(isEnglish, "Vị trí đã đồng bộ", "Location synced")}
                      </span>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-[16px] border border-[rgba(4,38,153,0.08)] bg-white px-4 py-4">
                      <p className={`${mono} text-[11px] uppercase tracking-[0.16em] text-[#99a1af]`}>
                        {t(isEnglish, "Điểm hẹn hiện tại", "Current meeting point")}
                      </p>
                      <p className={`${mono} mt-2 text-[14px] leading-[23px] text-[#080b0d]`}>
                        {request.locationAddress}
                      </p>
                    </div>
                    <div className="rounded-[16px] border border-[rgba(4,38,153,0.08)] bg-white px-4 py-4">
                      <p className={`${mono} text-[11px] uppercase tracking-[0.16em] text-[#99a1af]`}>
                        {t(isEnglish, "Điều phối", "Dispatch")}
                      </p>
                      <p className={`${mono} mt-2 text-[14px] leading-[23px] text-[#080b0d]`}>
                        {t(
                          isEnglish,
                          `Hệ thống đang tìm fixer gần bạn nhất cho dịch vụ ${serviceTitle.toLowerCase()}.`,
                          `The system is finding the closest fixer for ${serviceTitle.toLowerCase()}.`,
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="resq-reveal resq-reveal--delay-2">
                  <TrackingLiveMap
                    requestId={request.id}
                    actorId={user?.id}
                    actorRole="user"
                    destinationPoint={request.locationPoint}
                    destinationAddress={request.locationAddress}
                  />
                </div>
              )}

              <div className="resq-reveal resq-reveal--delay-2 mt-5 rounded-[20px] border border-[rgba(4,38,153,0.08)] bg-white p-5 shadow-[0_18px_50px_rgba(8,11,13,0.04)] sm:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <p className={`${mono} text-[12px] uppercase tracking-[0.16em] text-[#99a1af]`}>
                      {t(isEnglish, "Tiến độ dịch vụ", "Service progress")}
                    </p>
                    <h2 className={`${mono} mt-2 text-[20px] font-[700] text-[#080b0d]`}>
                      {isWaitingForFixerConfirmation
                        ? t(isEnglish, "Fixer chưa xác nhận, bản đồ sẽ mở sau bước này", "The fixer has not confirmed yet; the map opens after this step")
                        : t(isEnglish, "Fixer xác nhận rồi bắt đầu di chuyển", "The fixer confirmed and started moving")}
                    </h2>
                    <p className={`${mono} mt-2 max-w-[640px] text-[13px] leading-[22px] text-[#4a5565]`}>
                      {isWaitingForFixerConfirmation
                        ? t(
                            isEnglish,
                            "ResQ vẫn tiếp tục ghi nhận vị trí của bạn trong lúc chờ. Khi fixer xác nhận đơn, lộ trình trực tiếp và khung chat sẽ bật ngay tại đây.",
                            "ResQ keeps your location while you wait. When a fixer confirms, the live route and chat turn on here.",
                          )
                        : t(
                            isEnglish,
                            "Thanh tiến độ bắt đầu từ bước chờ fixer xác nhận để bạn nhìn rõ quá trình tiếp nhận đơn trước khi fixer lên đường.",
                            "The progress bar starts at fixer confirmation so you can see the handoff before the fixer heads out.",
                          )}
                    </p>
                  </div>

                  <div className="inline-flex w-fit items-center rounded-full bg-[rgba(238,50,36,0.08)] px-3 py-2">
                    <span className={`${mono} text-[11px] uppercase tracking-[0.16em] text-[#ee3224]`}>
                      {serviceProgress.progressLabel}
                    </span>
                  </div>
                </div>

                <div className="mt-5">
                  <div className="mb-5 grid gap-3 sm:grid-cols-2">
                    <ProgressFocusCard
                      label={t(isEnglish, "Hiện tại", "Current")}
                      title={currentProgressStep?.label ?? request.status}
                      detail={
                        isWaitingForFixerConfirmation
                          ? t(
                              isEnglish,
                              "ResQ đang điều phối request tới fixer gần bạn nhất và vẫn tiếp tục đồng bộ vị trí của bạn trong nền.",
                              "ResQ is dispatching the request to the nearest fixer and continues syncing your location in the background.",
                            )
                          : currentProgressStep?.detail ?? t(isEnglish, "Đơn đang tiếp tục được xử lý trên cùng một luồng.", "The request is continuing in the same flow.")
                      }
                      accent
                    />
                    <ProgressFocusCard
                      label={t(isEnglish, "Tiếp theo", "Next")}
                      title={
                        nextProgressStep?.label
                        ?? (request.status === "Hoàn thành"
                          ? t(isEnglish, "Đã hoàn tất", "Completed")
                          : t(isEnglish, "Chờ bước tiếp theo", "Waiting for the next step"))
                      }
                      detail={
                        nextProgressStep?.detail
                        ?? (request.status === "Hoàn thành"
                          ? t(
                              isEnglish,
                              "Bạn có thể xem lại lịch sử, thanh toán và đánh giá fixer sau khi quá trình kết thúc.",
                              "You can review history, payment, and fixer rating after the process ends.",
                            )
                          : t(
                              isEnglish,
                              "Ngay khi fixer chuyển bước, trang này sẽ tự làm mới để bạn không cần thao tác thêm.",
                              "When the fixer moves to the next step, this page refreshes automatically.",
                            ))
                      }
                    />
                  </div>

                  <div className="h-[10px] overflow-hidden rounded-full bg-[#f1f2f4]">
                    <div
                      className="h-full rounded-full bg-[linear-gradient(90deg,#ee3224_0%,#ff7d6f_100%)] transition-all duration-500"
                      style={{ width: `${serviceProgress.percent}%` }}
                    />
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-4">
                    {serviceProgress.steps.map((step, index) => {
                      const isComplete = index < serviceProgress.currentIndex;
                      const isCurrent = index === serviceProgress.currentIndex;

                      return (
                        <div
                          key={step.label}
                          className={`rounded-[16px] border px-4 py-4 ${
                            isCurrent
                              ? "border-[#ee3224] bg-[rgba(238,50,36,0.06)]"
                              : isComplete
                                ? "border-[rgba(238,50,36,0.12)] bg-white"
                                : "border-[rgba(4,38,153,0.08)] bg-[#f7f7f8]"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`flex size-[28px] shrink-0 items-center justify-center rounded-full ${
                                isCurrent || isComplete ? "bg-[#ee3224]" : "bg-white"
                              }`}
                            >
                              <span
                                className={`${mono} text-[11px] font-[700] ${
                                  isCurrent || isComplete ? "text-white" : "text-[#99a1af]"
                                }`}
                              >
                                {index + 1}
                              </span>
                            </div>
                            <p className={`${mono} text-[12px] font-[500] text-[#080b0d]`}>
                              {step.label}
                            </p>
                          </div>
                          <p className={`${mono} mt-3 text-[12px] leading-[20px] text-[#4a5565]`}>
                            {step.detail}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="rounded-[16px] bg-[#f7f7f8] px-4 py-3">
                    <p className={`${mono} text-[11px] uppercase tracking-[0.16em] text-[#99a1af]`}>
                      {t(isEnglish, "Sẵn sàng thanh toán", "Payment ready")}
                    </p>
                    <p className={`${mono} mt-2 text-[14px] font-[500] text-[#080b0d]`}>
                      {isWaitingForFixerConfirmation
                        ? t(isEnglish, "Bạn vẫn có thể xem lại thanh toán trước, hoặc hủy đơn nếu cần đổi yêu cầu.", "You can preview payment now or cancel if you need to change the request.")
                        : t(isEnglish, "Hoàn tất trước, fixer vẫn tiếp tục hỗ trợ bình thường.", "You can finish payment first; the fixer can continue support normally.")}
                    </p>
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row">
                    {isWaitingForFixerConfirmation ? (
                      <Link
                        to="/dich-vu"
                        className="inline-flex h-[48px] items-center justify-center gap-2 rounded-[12px] bg-[#ee3224] px-6 no-underline transition-colors hover:bg-[#d42b1e]"
                      >
                        <Wrench size={18} className="text-white" />
                        <span className={`${mono} text-[14px] font-[500] text-white`}>
                          {t(isEnglish, "Xem Dịch Vụ", "View Services")}
                        </span>
                      </Link>
                    ) : (
                      <Link
                        to="/thanh-toan"
                        className="inline-flex h-[48px] items-center justify-center gap-2 rounded-[12px] bg-[#ee3224] px-6 no-underline transition-colors hover:bg-[#d42b1e]"
                      >
                        <CreditCard size={18} className="text-white" />
                        <span className={`${mono} text-[14px] font-[500] text-white`}>
                          {t(isEnglish, "Thanh Toán", "Payment")}
                        </span>
                      </Link>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        cancelActiveRequest();
                      }}
                      className="inline-flex h-[48px] items-center justify-center rounded-[12px] border border-black bg-white px-6 transition-colors hover:bg-[#f7f7f8]"
                    >
                      <span className={`${mono} text-[14px] font-[500] text-[#080b0d]`}>
                        {t(isEnglish, "Hủy đơn", "Cancel request")}
                      </span>
                    </button>
                  </div>
                </div>

                <div className="mt-5">
                  <RequestStatusFeedCard requestId={request.id} />
                </div>

                <div className="mt-5">
                  {isWaitingForFixerConfirmation ? (
                    <div className="rounded-[18px] border border-dashed border-[rgba(4,38,153,0.12)] bg-[#faf8f5] px-5 py-5">
                      <p className={`${mono} text-[12px] uppercase tracking-[0.16em] text-[#99a1af]`}>
                        {t(isEnglish, "Khung chat", "Chat panel")}
                      </p>
                      <p className={`${mono} mt-3 text-[13px] leading-[22px] text-[#4a5565]`}>
                        {t(
                          isEnglish,
                          "Chat sẽ mở ngay khi fixer xác nhận đơn để hai bên có thể trao đổi trực tiếp trong cùng một luồng theo dõi.",
                          "Chat opens as soon as a fixer confirms, so both sides can talk inside the same tracking flow.",
                        )}
                      </p>
                    </div>
                  ) : (
                    <RequestChatPanel
                      requestId={request.id}
                      actorId={user?.id}
                      actorName={user?.name ?? request.requesterName}
                      actorRole="user"
                    />
                  )}
                </div>
              </div>
            </div>

            <aside className="space-y-5 lg:sticky lg:top-[108px]">
              <div className="resq-reveal resq-card-lift rounded-[20px] border border-[rgba(4,38,153,0.08)] bg-white p-6 shadow-[0_18px_50px_rgba(8,11,13,0.04)]">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex size-[42px] items-center justify-center rounded-full bg-[rgba(238,50,36,0.1)]">
                    <Truck size={18} className="text-[#ee3224]" />
                  </div>
                  <div>
                    <p className={`${mono} text-[12px] uppercase tracking-[1.4px] text-[#99a1af]`}>
                      {t(isEnglish, "Fixer phụ trách", "Assigned fixer")}
                    </p>
                    <p className={`${mono} text-[15px] font-[700] text-[#080b0d]`}>
                      {fixerTeam}
                    </p>
                  </div>
                </div>
                <div className="space-y-3">
                  <InfoRow icon={UserRound} label={t(isEnglish, "Kỹ thuật viên", "Technician")} value={request.fixerName || t(isEnglish, "Đang xác nhận", "Confirming")} />
                  <InfoRow icon={ShieldCheck} label={t(isEnglish, "Phương tiện", "Vehicle")} value={fixerVehicle} />
                  <InfoRow icon={PhoneCall} label={t(isEnglish, "Liên hệ", "Contact")} value={request.requesterPhone || "1900 1234"} />
                </div>
              </div>

              <div className="resq-reveal resq-reveal--delay-1 resq-card-lift rounded-[20px] border border-[rgba(4,38,153,0.08)] bg-white p-6 shadow-[0_18px_50px_rgba(8,11,13,0.04)]">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex size-[42px] items-center justify-center rounded-full bg-[rgba(238,50,36,0.1)]">
                    <ClipboardList size={18} className="text-[#ee3224]" />
                  </div>
                  <div>
                    <p className={`${mono} text-[12px] uppercase tracking-[1.4px] text-[#99a1af]`}>
                      {t(isEnglish, "Chi tiết yêu cầu", "Request details")}
                    </p>
                    <p className={`${mono} text-[15px] font-[700] text-[#080b0d]`}>
                      {t(isEnglish, "Hỗ trợ đang xử lý", "Support in progress")}
                    </p>
                  </div>
                </div>
                <div className="space-y-3">
                  <InfoRow icon={Wrench} label={t(isEnglish, "Dịch vụ", "Service")} value={serviceTitle} />
                  <InfoRow
                    icon={VehicleIcon}
                    label={t(isEnglish, "Xe", "Vehicle")}
                    value={`${request.vehicleName} · ${request.vehiclePlate}`}
                  />
                  <InfoRow icon={MapPin} label={t(isEnglish, "Điểm hẹn", "Meeting point")} value={request.locationAddress} />
                  {request.notes && (
                    <InfoRow icon={Clock3} label={t(isEnglish, "Ghi chú", "Notes")} value={request.notes} />
                  )}
                </div>
              </div>

              <div className="resq-reveal resq-reveal--delay-2 resq-card-lift rounded-[20px] bg-[#f7f7f8] p-6">
                <p className={`${mono} mb-4 text-[12px] font-[500] uppercase tracking-[1.4px] text-[#99a1af]`}>
                  {t(isEnglish, "Lưu ý khi chờ hỗ trợ", "Tips while waiting")}
                </p>
                <div className="space-y-3">
                  {getWaitingTips(isEnglish).map((tip) => (
                    <div key={tip} className="flex items-start gap-3">
                      <span className="mt-[8px] size-[8px] shrink-0 rounded-full bg-[#ee3224]" />
                      <p className={`${mono} text-[13px] leading-[22px] text-[#4a5565]`}>
                        {tip}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProgressFocusCard({
  label,
  title,
  detail,
  accent = false,
}: {
  label: string;
  title: string;
  detail: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-[16px] border px-4 py-4 ${
        accent
          ? "border-[rgba(238,50,36,0.18)] bg-[rgba(238,50,36,0.05)]"
          : "border-[rgba(4,38,153,0.08)] bg-[#f7f7f8]"
      }`}
    >
      <p className={`${mono} text-[11px] uppercase tracking-[0.16em] text-[#99a1af]`}>
        {label}
      </p>
      <p className={`${mono} mt-2 text-[15px] font-[700] text-[#080b0d]`}>
        {title}
      </p>
      <p className={`${mono} mt-2 text-[12px] leading-[20px] text-[#4a5565]`}>
        {detail}
      </p>
    </div>
  );
}

function FixerTrackingPage() {
  const { language } = useLanguage();
  const isEnglish = language === "en";
  const { user } = useAuth();
  const {
    activeRequest,
    incomingRequests,
    requestHistory,
  } = useResQStore();

  useLiveRequestLocationSync({
    requestId: activeRequest?.id ?? null,
    actorId: user?.id,
    actorRole: user?.role === "user" ? "user" : "fixer",
    fallbackUserPoint: activeRequest?.locationPoint,
    fallbackUserAddress: activeRequest?.locationAddress,
  });

  const nextActionLabel =
    activeRequest?.status === "Fixer đã xác nhận"
      ? t(isEnglish, "Bắt đầu di chuyển", "Start moving")
      : activeRequest?.status === "Đang tiếp cận"
        ? t(isEnglish, "Đến nơi và hỗ trợ", "Arrive and support")
        : activeRequest?.status === "Đang hỗ trợ"
          ? t(isEnglish, "Hoàn tất đơn", "Complete request")
          : null;

  return (
    <div className="overflow-x-hidden bg-white">
      <div className={`${pagePadding} pt-10 pb-16 sm:pt-14 sm:pb-20`}>
        <div className={pageShell}>
          <div className="resq-reveal mb-8 max-w-[760px] sm:mb-10">
            <p className={`${mono} mb-4 text-[12px] font-[500] uppercase tracking-[1.8px] text-[#ee3224] sm:text-[13px]`}>
              {t(isEnglish, "Quá trình fixer", "Fixer workflow")}
            </p>
            <h1 className={`${mono} mb-[10px] text-[36px] font-[700] text-[#080b0d] sm:text-[44px] lg:text-[48px]`}>
              {t(isEnglish, "Quản lý quá trình xử lý đơn đang phụ trách", "Manage your assigned service request")}
            </h1>
            <p className={`${mono} text-[14px] leading-[24px] text-[#4a5565] sm:text-[15px]`}>
              {t(
                isEnglish,
                "Luồng fixer mới cho phép bạn nhận request, xác nhận đơn từ khách hàng, rồi tiếp tục cập nhật trạng thái và trao đổi ngay trên website.",
                "The updated fixer flow lets you accept requests, confirm customer jobs, update status, and chat directly on the website.",
              )}
            </p>
          </div>

          {activeRequest ? (
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
              <div className="space-y-6">
                <div className="rounded-[20px] border border-[rgba(4,38,153,0.08)] bg-white p-6 shadow-[0_18px_50px_rgba(8,11,13,0.04)]">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className={`${mono} text-[12px] uppercase tracking-[0.18em] text-[#99a1af]`}>
                        {t(isEnglish, "Đơn đang xử lý", "Active request")}
                      </p>
                      <h2 className={`${mono} mt-2 text-[26px] font-[700] text-[#080b0d]`}>
                        {localizeServiceTitle(activeRequest, isEnglish)}
                      </h2>
                      <p className={`${mono} mt-2 text-[13px] leading-[22px] text-[#4a5565]`}>
                        {activeRequest.requesterName} · {activeRequest.requesterPhone || t(isEnglish, "Chưa có số liên hệ", "No contact number")}
                      </p>
                    </div>
                    <span className="inline-flex items-center gap-2 rounded-full bg-[rgba(238,50,36,0.1)] px-4 py-2.5">
                      <BadgeCheck size={14} className="text-[#ee3224]" />
                      <span className={`${mono} text-[11px] uppercase tracking-[0.18em] text-[#ee3224]`}>
                        {localizeRequestStatus(activeRequest.status, isEnglish)}
                      </span>
                    </span>
                  </div>

                  <div className="mt-5 grid gap-3 sm:grid-cols-3">
                    {[
                      [t(isEnglish, "Mã đơn", "Request ID"), activeRequest.id],
                      [t(isEnglish, "Xe khách", "Customer vehicle"), `${activeRequest.vehicleName} · ${activeRequest.vehiclePlate}`],
                      [t(isEnglish, "ETA cam kết", "Promised ETA"), localizeServiceEta(activeRequest.serviceEta, isEnglish)],
                    ].map(([label, value]) => (
                      <div key={label} className="rounded-[16px] bg-[#f7f7f8] px-4 py-4">
                        <p className={`${mono} text-[11px] uppercase tracking-[0.18em] text-[#99a1af]`}>
                          {label}
                        </p>
                        <p className={`${mono} mt-2 text-[15px] font-[700] text-[#080b0d]`}>
                          {value}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-5 overflow-hidden rounded-[20px]">
                    <TrackingLiveMap
                      requestId={activeRequest.id}
                      actorId={user?.id}
                      actorRole="fixer"
                      destinationPoint={activeRequest.locationPoint}
                      destinationAddress={activeRequest.locationAddress}
                    />
                  </div>

                  <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                    {nextActionLabel && (
                      <button
                        type="button"
                        onClick={() => {
                          advanceActiveRequestStatus();
                        }}
                        className="inline-flex h-[48px] items-center justify-center rounded-[12px] bg-[#ee3224] px-6 transition-colors hover:bg-[#d42b1e]"
                      >
                        <span className={`${mono} text-[14px] font-[500] text-white`}>
                          {nextActionLabel}
                        </span>
                      </button>
                    )}
                    <a
                      href={`tel:${activeRequest.requesterPhone || "19001234"}`}
                      className="inline-flex h-[48px] items-center justify-center rounded-[12px] border border-black px-6 no-underline transition-colors hover:bg-[#f5f5f5]"
                    >
                      <span className={`${mono} text-[14px] font-[500] text-[#080b0d]`}>
                        {t(isEnglish, "Gọi khách hàng", "Call customer")}
                      </span>
                    </a>
                  </div>

                  <div className="mt-5">
                    <RequestStatusFeedCard requestId={activeRequest.id} />
                  </div>

                  <div className="mt-5">
                    <RequestChatPanel
                      requestId={activeRequest.id}
                      actorId={user?.id}
                      actorName={user?.name ?? activeRequest.fixerName}
                      actorRole="fixer"
                    />
                  </div>
                </div>

                {incomingRequests.length > 0 && (
                  <section className="rounded-[20px] border border-[rgba(4,38,153,0.08)] bg-white p-6 shadow-[0_18px_50px_rgba(8,11,13,0.04)]">
                    <div className="mb-5">
                      <p className={`${mono} text-[12px] uppercase tracking-[0.18em] text-[#99a1af]`}>
                        {t(isEnglish, "Đang chờ xử lý thêm", "More requests pending")}
                      </p>
                      <h2 className={`${mono} mt-2 text-[22px] font-[700] text-[#080b0d]`}>
                        {t(isEnglish, "Request mới từ khách hàng", "New customer requests")}
                      </h2>
                    </div>
                    <div className="space-y-4">
                      {incomingRequests.map((request) => (
                        <FixerIncomingCard key={request.id} request={request} isEnglish={isEnglish} />
                      ))}
                    </div>
                  </section>
                )}
              </div>

              <aside className="space-y-5">
                <FixerDetailsCard request={activeRequest} isEnglish={isEnglish} />
                <HistoryPreview items={requestHistory} isEnglish={isEnglish} />
              </aside>
            </div>
          ) : incomingRequests.length > 0 ? (
            <section className="rounded-[24px] border border-[rgba(4,38,153,0.08)] bg-white p-6 shadow-[0_18px_50px_rgba(8,11,13,0.04)] sm:p-8">
              <div className="mb-6 max-w-[620px]">
                <p className={`${mono} text-[12px] uppercase tracking-[0.18em] text-[#99a1af]`}>
                  {t(isEnglish, "Chờ fixer xác nhận", "Waiting for fixer confirmation")}
                </p>
                <h2 className={`${mono} mt-2 text-[28px] font-[700] text-[#080b0d]`}>
                  {t(
                    isEnglish,
                    `Có ${incomingRequests.length} request đang chờ bạn nhận`,
                    `${incomingRequests.length} request${incomingRequests.length === 1 ? "" : "s"} waiting for you`,
                  )}
                </h2>
                <p className={`${mono} mt-3 text-[13px] leading-[22px] text-[#4a5565]`}>
                  {t(
                    isEnglish,
                    "Khách hàng đã gửi vị trí và mô tả sự cố. Bạn chỉ cần xác nhận đơn để bắt đầu điều phối trên giao diện theo dõi.",
                    "Customers have sent location and issue details. Confirm a request to begin dispatch in the tracking interface.",
                  )}
                </p>
              </div>
              <div className="grid gap-4 lg:grid-cols-2">
                {incomingRequests.map((request) => (
                  <FixerIncomingCard key={request.id} request={request} isEnglish={isEnglish} />
                ))}
              </div>
            </section>
          ) : (
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
              <section className="rounded-[24px] border border-dashed border-[rgba(4,38,153,0.12)] bg-[#faf8f5] p-6 shadow-[0_18px_50px_rgba(8,11,13,0.04)] sm:p-8">
                <div className="flex size-[64px] items-center justify-center rounded-full bg-[rgba(238,50,36,0.1)]">
                  <Truck size={28} className="text-[#ee3224]" />
                </div>
                <h2 className={`${mono} mt-5 text-[26px] font-[700] text-[#080b0d]`}>
                  {t(isEnglish, "Bạn chưa được nhận request nào", "No requests assigned yet")}
                </h2>
                <p className={`${mono} mt-3 max-w-[620px] text-[13px] leading-[22px] text-[#4a5565]`}>
                  {t(
                    isEnglish,
                    "Khi khách hàng gửi yêu cầu mới, các đơn chờ xác nhận sẽ hiển thị tại đây để bạn nhận và bắt đầu xử lý.",
                    "When customers send new requests, pending jobs will appear here so you can accept and start handling them.",
                  )}
                </p>
              </section>
              <HistoryPreview items={requestHistory} isEnglish={isEnglish} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function FixerIncomingCard({
  request,
  isEnglish,
}: {
  request: ActiveResQRequest;
  isEnglish: boolean;
}) {
  const VehicleIcon = request.vehicleType === "Xe máy" ? Bike : Car;

  return (
    <div className="rounded-[20px] border border-[rgba(4,38,153,0.08)] bg-[#f7f7f8] p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className={`${mono} text-[12px] font-[700] text-[#080b0d]`}>
            {localizeServiceTitle(request, isEnglish)}
          </p>
          <p className={`${mono} mt-2 text-[12px] leading-[20px] text-[#4a5565]`}>
            {request.requesterName} · {request.requesterPhone || t(isEnglish, "Chưa có số liên hệ", "No contact number")}
          </p>
        </div>
        <span className={`${mono} rounded-full bg-white px-3 py-1 text-[10px] uppercase tracking-[0.16em] text-[#ee3224]`}>
          {localizeServiceEta(request.serviceEta, isEnglish)}
        </span>
      </div>

      <div className="mt-4 space-y-3">
        <InfoRow icon={VehicleIcon} label={t(isEnglish, "Xe", "Vehicle")} value={`${request.vehicleName} · ${request.vehiclePlate}`} />
        <InfoRow icon={MapPin} label={t(isEnglish, "Điểm hẹn", "Meeting point")} value={request.locationAddress} />
        {request.notes && <InfoRow icon={Clock3} label={t(isEnglish, "Ghi chú", "Notes")} value={request.notes} />}
      </div>

      <button
        type="button"
        onClick={() => {
          confirmIncomingRequest(request.id);
        }}
        className="mt-5 inline-flex h-[46px] items-center justify-center rounded-[12px] bg-[#ee3224] px-6 transition-colors hover:bg-[#d42b1e]"
      >
        <span className={`${mono} text-[13px] font-[500] text-white`}>
          {t(isEnglish, "Xác nhận đơn", "Confirm request")}
        </span>
      </button>
    </div>
  );
}

function FixerDetailsCard({
  request,
  isEnglish,
}: {
  request: ActiveResQRequest;
  isEnglish: boolean;
}) {
  return (
    <div className="rounded-[20px] border border-[rgba(4,38,153,0.08)] bg-white p-6 shadow-[0_18px_50px_rgba(8,11,13,0.04)]">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex size-[42px] items-center justify-center rounded-full bg-[rgba(238,50,36,0.1)]">
          <UserRound size={18} className="text-[#ee3224]" />
        </div>
        <div>
          <p className={`${mono} text-[12px] uppercase tracking-[1.4px] text-[#99a1af]`}>
            {t(isEnglish, "Người gửi request", "Request sender")}
          </p>
          <p className={`${mono} text-[15px] font-[700] text-[#080b0d]`}>
            {request.requesterName}
          </p>
        </div>
      </div>
      <div className="space-y-3">
        <InfoRow icon={PhoneCall} label={t(isEnglish, "Điện thoại", "Phone")} value={request.requesterPhone || "1900 1234"} />
        <InfoRow icon={MapPin} label={t(isEnglish, "Vị trí", "Location")} value={request.locationAddress} />
        <InfoRow icon={Wrench} label={t(isEnglish, "Dịch vụ", "Service")} value={localizeServiceTitle(request, isEnglish)} />
      </div>
    </div>
  );
}

function HistoryPreview({
  items,
  isEnglish,
}: {
  items: ActiveResQRequest[];
  isEnglish: boolean;
}) {
  return (
    <aside className="rounded-[20px] border border-[rgba(4,38,153,0.08)] bg-white p-6 shadow-[0_18px_50px_rgba(8,11,13,0.04)]">
      <p className={`${mono} mb-4 text-[12px] uppercase tracking-[1.4px] text-[#99a1af]`}>
        {t(isEnglish, "Lịch sử fixer", "Fixer history")}
      </p>
      <div className="space-y-3">
        {items.slice(0, 3).map((item) => (
          <div key={item.id} className="rounded-[16px] bg-[#f7f7f8] px-4 py-4">
            <p className={`${mono} text-[13px] font-[500] text-[#080b0d]`}>
              {localizeServiceTitle(item, isEnglish)}
            </p>
            <p className={`${mono} mt-2 text-[11px] leading-[18px] text-[#667085]`}>
              {item.requesterName} · {localizeRequestStatus(item.status, isEnglish)}
            </p>
          </div>
        ))}
        {items.length === 0 && (
          <p className={`${mono} text-[13px] leading-[22px] text-[#4a5565]`}>
            {t(
              isEnglish,
              "Chưa có lịch sử xử lý nào trong tài khoản fixer này.",
              "This fixer account has no handled request history yet.",
            )}
          </p>
        )}
      </div>
    </aside>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-[14px] bg-[#f7f7f8] px-4 py-3">
      <div className="mt-[2px] flex size-[34px] shrink-0 items-center justify-center rounded-full bg-white">
        <Icon size={15} className="text-[#ee3224]" />
      </div>
      <div className="min-w-0">
        <p className={`${mono} mb-1 text-[11px] uppercase tracking-[1.2px] text-[#99a1af]`}>
          {label}
        </p>
        <p className={`${mono} text-[13px] leading-[21px] text-[#080b0d]`}>
          {value}
        </p>
      </div>
    </div>
  );
}

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
import {
  advanceActiveRequestStatus,
  confirmIncomingRequest,
  useResQStore,
  type ActiveResQRequest,
} from "./resqStore";
import { getServiceProgress } from "./tracking/request-progress";
import { useAuth } from "./AuthContext";

const mono = "font-['IBM_Plex_Mono',monospace]";
const pagePadding = "px-5 sm:px-8 lg:px-[84px] xl:px-[120px]";
const pageShell = "mx-auto w-full max-w-[1240px]";

const waitingTips = [
  "Giữ điện thoại sẵn sàng để fixer có thể liên hệ khi cần.",
  "Di chuyển xe vào vị trí an toàn nếu điều kiện giao thông cho phép.",
  "Chuẩn bị thông tin xe để quá trình hỗ trợ diễn ra nhanh hơn.",
];

export default function TrackingPage() {
  const { user } = useAuth();

  if (user?.role === "fixer") {
    return <FixerTrackingPage />;
  }

  return <UserTrackingPage />;
}

function UserTrackingPage() {
  const { activeRequest, requestHistory, isHydrating } = useResQStore();

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
              Quay lại
            </Link>

            <div className="resq-reveal mb-8 max-w-[720px] sm:mb-10">
              <p className={`${mono} mb-4 text-[12px] font-[500] uppercase tracking-[1.8px] text-[#ee3224] sm:text-[13px]`}>
                Theo dõi cứu hộ
              </p>
              <h1 className={`${mono} mb-[10px] text-[36px] font-[700] text-[#080b0d] sm:text-[44px] lg:text-[48px]`}>
                Hình như bạn chưa chọn dịch vụ nào
              </h1>
              <p className={`${mono} text-[14px] leading-[24px] text-[#4a5565] sm:text-[15px]`}>
                Khi bạn gửi yêu cầu trên trang Dịch Vụ, fixer, ETA và tiến độ xử lý
                sẽ hiển thị tại đây ngay lập tức.
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
                  Theo Dõi sẽ sáng lên sau khi bạn tạo đơn
                </h2>
                <p className={`${mono} mt-3 max-w-[620px] text-[13px] leading-[22px] text-[#4a5565]`}>
                  ResQ sẽ ghi nhận yêu cầu, chuyển sang trạng thái chờ fixer xác nhận,
                  rồi cập nhật lộ trình trực tiếp ngay trên bản đồ theo dõi này.
                </p>
                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <Link
                    to="/dich-vu"
                    className="inline-flex h-[48px] items-center justify-center gap-2 rounded-[12px] bg-[#ee3224] px-6 no-underline transition-colors hover:bg-[#d42b1e]"
                  >
                    <span className={`${mono} text-[14px] font-[500] text-white`}>
                      Đến trang Dịch Vụ
                    </span>
                    <ChevronRight size={16} className="text-white" />
                  </Link>
                  <Link
                    to="/tai-khoan"
                    className="inline-flex h-[48px] items-center justify-center rounded-[12px] border border-black px-6 no-underline transition-colors hover:bg-[#f5f5f5]"
                  >
                    <span className={`${mono} text-[14px] font-[500] text-[#080b0d]`}>
                      Quản lý xe
                    </span>
                  </Link>
                </div>
              </section>

              <aside className="space-y-5">
                <div className="rounded-[20px] border border-[rgba(4,38,153,0.08)] bg-white p-6 shadow-[0_18px_50px_rgba(8,11,13,0.04)]">
                  <p className={`${mono} mb-4 text-[12px] uppercase tracking-[1.4px] text-[#99a1af]`}>
                    Quy trình
                  </p>
                  <div className="space-y-3">
                    {[
                      "1. Chọn dịch vụ phù hợp cho xe của bạn.",
                      "2. Gửi yêu cầu và chờ fixer xác nhận đơn.",
                      "3. Theo dõi fixer, thanh toán và xem lịch sử tại đây.",
                    ].map((step) => (
                      <p key={step} className={`${mono} text-[13px] leading-[22px] text-[#4a5565]`}>
                        {step}
                      </p>
                    ))}
                  </div>
                </div>

                {requestHistory.length > 0 && (
                  <div className="rounded-[20px] border border-[rgba(4,38,153,0.08)] bg-white p-6 shadow-[0_18px_50px_rgba(8,11,13,0.04)]">
                    <p className={`${mono} mb-4 text-[12px] uppercase tracking-[1.4px] text-[#99a1af]`}>
                      Lịch sử gần đây
                    </p>
                    <div className="space-y-3">
                      {requestHistory.slice(0, 3).map((item) => (
                        <div key={item.id} className="rounded-[16px] bg-[#f7f7f8] px-4 py-4">
                          <p className={`${mono} text-[13px] font-[500] text-[#080b0d]`}>
                            {item.serviceTitle}
                          </p>
                          <p className={`${mono} mt-2 text-[11px] text-[#667085]`}>
                            {item.status} · {item.locationAddress}
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
  const quickStats = [
    { label: "Mã yêu cầu", value: request.id },
    { label: "Dịch vụ", value: request.serviceTitle },
    { label: "ETA dự kiến", value: request.serviceEta },
  ];
  const trackingHighlights = [
    { label: "Xe đã chọn", value: request.vehicleType },
    { label: "Trạng thái", value: request.status },
    { label: "Fixer", value: request.fixerName || "Đang chờ xác nhận" },
  ];
  const VehicleIcon = request.vehicleType === "Xe máy" ? Bike : Car;
  const serviceProgress = getServiceProgress(request.status);
  const heroLabel =
    request.status === "Chờ fixer xác nhận"
      ? "Yêu cầu đang chờ fixer xác nhận"
      : request.status === "Fixer đã xác nhận"
        ? "Fixer đã nhận đơn của bạn"
        : "Xe ResQ đang trên đường đến bạn";

  return (
    <div className="overflow-x-hidden bg-white">
      <div className={`${pagePadding} pt-10 pb-16 sm:pt-14 sm:pb-20`}>
        <div className={pageShell}>
          <Link
            to="/"
            className={`mb-[16px] inline-flex items-center gap-[4px] text-[13px] font-[500] text-[#a4a4a4] no-underline transition-colors hover:text-[#080b0d] ${mono}`}
          >
            <ChevronLeft size={16} />
            Quay lại
          </Link>

          <div className="resq-reveal mb-8 max-w-[700px] sm:mb-10">
            <p className={`${mono} mb-4 text-[12px] font-[500] uppercase tracking-[1.8px] text-[#ee3224] sm:text-[13px]`}>
              Theo dõi cứu hộ
            </p>
            <h1 className={`${mono} mb-[10px] text-[36px] font-[700] text-[#080b0d] sm:text-[44px] lg:text-[48px]`}>
              Theo dõi fixer theo thời gian thực
            </h1>
            <p className={`${mono} text-[14px] leading-[24px] text-[#4a5565] sm:text-[15px]`}>
              Trạng thái mới của ResQ bắt đầu từ lúc gửi đơn, chờ fixer xác nhận,
              rồi tiếp tục đồng bộ lộ trình và tiến độ hỗ trợ trong cùng một trang.
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
                      {request.status}
                    </span>
                  </span>
                  <span className={`${mono} inline-flex items-center rounded-full border border-[rgba(4,38,153,0.08)] bg-[#f7f7f8] px-3 py-1.5 text-[11px] uppercase tracking-[0.16em] text-[#4a5565]`}>
                    GPS trực tiếp
                  </span>
                </div>

                <p className={`${mono} text-[24px] font-[700] leading-[1.2] text-[#080b0d] sm:text-[28px]`}>
                  {heroLabel}
                </p>
                <p className={`${mono} mt-2 max-w-[640px] text-[13px] leading-[23px] text-[#4a5565] sm:text-[14px] sm:leading-[24px]`}>
                  Theo dõi yêu cầu {request.id} với dịch vụ {request.serviceTitle.toLowerCase()},
                  phương tiện {request.vehicleName} và điểm hẹn đã xác nhận lúc tạo đơn.
                </p>
              </div>

              <div className="inline-flex w-fit shrink-0 items-center gap-2 rounded-full bg-[rgba(238,50,36,0.1)] px-4 py-2.5">
                <Truck size={16} className="text-[#ee3224]" />
                <span className={`${mono} text-[11px] uppercase tracking-[0.18em] text-[#ee3224]`}>
                  {request.fixerTeam}
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
              <div className="resq-reveal resq-reveal--delay-2">
                <TrackingLiveMap destinationPoint={request.locationPoint} />
              </div>

              <div className="resq-reveal resq-reveal--delay-2 mt-5 rounded-[20px] border border-[rgba(4,38,153,0.08)] bg-white p-5 shadow-[0_18px_50px_rgba(8,11,13,0.04)] sm:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <p className={`${mono} text-[12px] uppercase tracking-[0.16em] text-[#99a1af]`}>
                      Tiến độ dịch vụ
                    </p>
                    <h2 className={`${mono} mt-2 text-[20px] font-[700] text-[#080b0d]`}>
                      Fixer xác nhận rồi bắt đầu di chuyển
                    </h2>
                    <p className={`${mono} mt-2 max-w-[640px] text-[13px] leading-[22px] text-[#4a5565]`}>
                      Thanh tiến độ bắt đầu từ bước chờ fixer xác nhận để bạn nhìn rõ
                      quá trình tiếp nhận đơn trước khi fixer lên đường.
                    </p>
                  </div>

                  <div className="inline-flex w-fit items-center rounded-full bg-[rgba(238,50,36,0.08)] px-3 py-2">
                    <span className={`${mono} text-[11px] uppercase tracking-[0.16em] text-[#ee3224]`}>
                      {serviceProgress.progressLabel}
                    </span>
                  </div>
                </div>

                <div className="mt-5">
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
                      Sẵn sàng thanh toán
                    </p>
                    <p className={`${mono} mt-2 text-[14px] font-[500] text-[#080b0d]`}>
                      Hoàn tất trước, fixer vẫn tiếp tục hỗ trợ bình thường.
                    </p>
                  </div>

                  <Link
                    to="/thanh-toan"
                    className="inline-flex h-[48px] items-center justify-center gap-2 rounded-[12px] bg-[#ee3224] px-6 no-underline transition-colors hover:bg-[#d42b1e]"
                  >
                    <CreditCard size={18} className="text-white" />
                    <span className={`${mono} text-[14px] font-[500] text-white`}>
                      Thanh Toán
                    </span>
                  </Link>
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
                      Fixer phụ trách
                    </p>
                    <p className={`${mono} text-[15px] font-[700] text-[#080b0d]`}>
                      {request.fixerTeam}
                    </p>
                  </div>
                </div>
                <div className="space-y-3">
                  <InfoRow icon={UserRound} label="Kỹ thuật viên" value={request.fixerName || "Đang xác nhận"} />
                  <InfoRow icon={ShieldCheck} label="Phương tiện" value={request.fixerVehicle} />
                  <InfoRow icon={PhoneCall} label="Liên hệ" value={request.requesterPhone || "1900 1234"} />
                </div>
              </div>

              <div className="resq-reveal resq-reveal--delay-1 resq-card-lift rounded-[20px] border border-[rgba(4,38,153,0.08)] bg-white p-6 shadow-[0_18px_50px_rgba(8,11,13,0.04)]">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex size-[42px] items-center justify-center rounded-full bg-[rgba(238,50,36,0.1)]">
                    <ClipboardList size={18} className="text-[#ee3224]" />
                  </div>
                  <div>
                    <p className={`${mono} text-[12px] uppercase tracking-[1.4px] text-[#99a1af]`}>
                      Chi tiết yêu cầu
                    </p>
                    <p className={`${mono} text-[15px] font-[700] text-[#080b0d]`}>
                      Hỗ trợ đang xử lý
                    </p>
                  </div>
                </div>
                <div className="space-y-3">
                  <InfoRow icon={Wrench} label="Dịch vụ" value={request.serviceTitle} />
                  <InfoRow
                    icon={VehicleIcon}
                    label="Xe"
                    value={`${request.vehicleName} · ${request.vehiclePlate}`}
                  />
                  <InfoRow icon={MapPin} label="Điểm hẹn" value={request.locationAddress} />
                  {request.notes && (
                    <InfoRow icon={Clock3} label="Ghi chú" value={request.notes} />
                  )}
                </div>
              </div>

              <div className="resq-reveal resq-reveal--delay-2 resq-card-lift rounded-[20px] bg-[#f7f7f8] p-6">
                <p className={`${mono} mb-4 text-[12px] font-[500] uppercase tracking-[1.4px] text-[#99a1af]`}>
                  Lưu ý khi chờ hỗ trợ
                </p>
                <div className="space-y-3">
                  {waitingTips.map((tip) => (
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

function FixerTrackingPage() {
  const {
    activeRequest,
    incomingRequests,
    requestHistory,
  } = useResQStore();

  const nextActionLabel =
    activeRequest?.status === "Fixer đã xác nhận"
      ? "Bắt đầu di chuyển"
      : activeRequest?.status === "Đang tiếp cận"
        ? "Đến nơi và hỗ trợ"
        : activeRequest?.status === "Đang hỗ trợ"
          ? "Hoàn tất đơn"
          : null;

  return (
    <div className="overflow-x-hidden bg-white">
      <div className={`${pagePadding} pt-10 pb-16 sm:pt-14 sm:pb-20`}>
        <div className={pageShell}>
          <div className="resq-reveal mb-8 max-w-[760px] sm:mb-10">
            <p className={`${mono} mb-4 text-[12px] font-[500] uppercase tracking-[1.8px] text-[#ee3224] sm:text-[13px]`}>
              Fixer dashboard
            </p>
            <h1 className={`${mono} mb-[10px] text-[36px] font-[700] text-[#080b0d] sm:text-[44px] lg:text-[48px]`}>
              Xác nhận đơn và theo dõi ca đang xử lý
            </h1>
            <p className={`${mono} text-[14px] leading-[24px] text-[#4a5565] sm:text-[15px]`}>
              Luồng fixer mới cho phép bạn nhận request, xác nhận đơn từ khách hàng,
              rồi tiếp tục cập nhật trạng thái ngay trên website.
            </p>
          </div>

          {activeRequest ? (
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
              <div className="space-y-6">
                <div className="rounded-[20px] border border-[rgba(4,38,153,0.08)] bg-white p-6 shadow-[0_18px_50px_rgba(8,11,13,0.04)]">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className={`${mono} text-[12px] uppercase tracking-[0.18em] text-[#99a1af]`}>
                        Đơn đang xử lý
                      </p>
                      <h2 className={`${mono} mt-2 text-[26px] font-[700] text-[#080b0d]`}>
                        {activeRequest.serviceTitle}
                      </h2>
                      <p className={`${mono} mt-2 text-[13px] leading-[22px] text-[#4a5565]`}>
                        {activeRequest.requesterName} · {activeRequest.requesterPhone || "Chưa có số liên hệ"}
                      </p>
                    </div>
                    <span className="inline-flex items-center gap-2 rounded-full bg-[rgba(238,50,36,0.1)] px-4 py-2.5">
                      <BadgeCheck size={14} className="text-[#ee3224]" />
                      <span className={`${mono} text-[11px] uppercase tracking-[0.18em] text-[#ee3224]`}>
                        {activeRequest.status}
                      </span>
                    </span>
                  </div>

                  <div className="mt-5 grid gap-3 sm:grid-cols-3">
                    {[
                      ["Mã đơn", activeRequest.id],
                      ["Xe khách", `${activeRequest.vehicleName} · ${activeRequest.vehiclePlate}`],
                      ["ETA cam kết", activeRequest.serviceEta],
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
                    <TrackingLiveMap destinationPoint={activeRequest.locationPoint} />
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
                        Gọi khách hàng
                      </span>
                    </a>
                  </div>
                </div>

                {incomingRequests.length > 0 && (
                  <section className="rounded-[20px] border border-[rgba(4,38,153,0.08)] bg-white p-6 shadow-[0_18px_50px_rgba(8,11,13,0.04)]">
                    <div className="mb-5">
                      <p className={`${mono} text-[12px] uppercase tracking-[0.18em] text-[#99a1af]`}>
                        Đang chờ xử lý thêm
                      </p>
                      <h2 className={`${mono} mt-2 text-[22px] font-[700] text-[#080b0d]`}>
                        Request mới từ khách hàng
                      </h2>
                    </div>
                    <div className="space-y-4">
                      {incomingRequests.map((request) => (
                        <FixerIncomingCard key={request.id} request={request} />
                      ))}
                    </div>
                  </section>
                )}
              </div>

              <aside className="space-y-5">
                <FixerDetailsCard request={activeRequest} />
                <HistoryPreview items={requestHistory} />
              </aside>
            </div>
          ) : incomingRequests.length > 0 ? (
            <section className="rounded-[24px] border border-[rgba(4,38,153,0.08)] bg-white p-6 shadow-[0_18px_50px_rgba(8,11,13,0.04)] sm:p-8">
              <div className="mb-6 max-w-[620px]">
                <p className={`${mono} text-[12px] uppercase tracking-[0.18em] text-[#99a1af]`}>
                  Chờ fixer xác nhận
                </p>
                <h2 className={`${mono} mt-2 text-[28px] font-[700] text-[#080b0d]`}>
                  Có {incomingRequests.length} request đang chờ bạn nhận
                </h2>
                <p className={`${mono} mt-3 text-[13px] leading-[22px] text-[#4a5565]`}>
                  Khách hàng đã gửi vị trí và mô tả sự cố. Bạn chỉ cần xác nhận đơn để bắt
                  đầu điều phối trên giao diện theo dõi.
                </p>
              </div>
              <div className="grid gap-4 lg:grid-cols-2">
                {incomingRequests.map((request) => (
                  <FixerIncomingCard key={request.id} request={request} />
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
                  Bạn chưa được nhận request nào
                </h2>
                <p className={`${mono} mt-3 max-w-[620px] text-[13px] leading-[22px] text-[#4a5565]`}>
                  Khi khách hàng gửi yêu cầu mới, các đơn chờ xác nhận sẽ hiển thị tại đây
                  để bạn nhận và bắt đầu xử lý.
                </p>
              </section>
              <HistoryPreview items={requestHistory} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function FixerIncomingCard({ request }: { request: ActiveResQRequest }) {
  const VehicleIcon = request.vehicleType === "Xe máy" ? Bike : Car;

  return (
    <div className="rounded-[20px] border border-[rgba(4,38,153,0.08)] bg-[#f7f7f8] p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className={`${mono} text-[12px] font-[700] text-[#080b0d]`}>
            {request.serviceTitle}
          </p>
          <p className={`${mono} mt-2 text-[12px] leading-[20px] text-[#4a5565]`}>
            {request.requesterName} · {request.requesterPhone || "Chưa có số liên hệ"}
          </p>
        </div>
        <span className={`${mono} rounded-full bg-white px-3 py-1 text-[10px] uppercase tracking-[0.16em] text-[#ee3224]`}>
          {request.serviceEta}
        </span>
      </div>

      <div className="mt-4 space-y-3">
        <InfoRow icon={VehicleIcon} label="Xe" value={`${request.vehicleName} · ${request.vehiclePlate}`} />
        <InfoRow icon={MapPin} label="Điểm hẹn" value={request.locationAddress} />
        {request.notes && <InfoRow icon={Clock3} label="Ghi chú" value={request.notes} />}
      </div>

      <button
        type="button"
        onClick={() => {
          confirmIncomingRequest(request.id);
        }}
        className="mt-5 inline-flex h-[46px] items-center justify-center rounded-[12px] bg-[#ee3224] px-6 transition-colors hover:bg-[#d42b1e]"
      >
        <span className={`${mono} text-[13px] font-[500] text-white`}>
          Xác nhận đơn
        </span>
      </button>
    </div>
  );
}

function FixerDetailsCard({ request }: { request: ActiveResQRequest }) {
  return (
    <div className="rounded-[20px] border border-[rgba(4,38,153,0.08)] bg-white p-6 shadow-[0_18px_50px_rgba(8,11,13,0.04)]">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex size-[42px] items-center justify-center rounded-full bg-[rgba(238,50,36,0.1)]">
          <UserRound size={18} className="text-[#ee3224]" />
        </div>
        <div>
          <p className={`${mono} text-[12px] uppercase tracking-[1.4px] text-[#99a1af]`}>
            Người gửi request
          </p>
          <p className={`${mono} text-[15px] font-[700] text-[#080b0d]`}>
            {request.requesterName}
          </p>
        </div>
      </div>
      <div className="space-y-3">
        <InfoRow icon={PhoneCall} label="Điện thoại" value={request.requesterPhone || "1900 1234"} />
        <InfoRow icon={MapPin} label="Vị trí" value={request.locationAddress} />
        <InfoRow icon={Wrench} label="Dịch vụ" value={request.serviceTitle} />
      </div>
    </div>
  );
}

function HistoryPreview({ items }: { items: ActiveResQRequest[] }) {
  return (
    <aside className="rounded-[20px] border border-[rgba(4,38,153,0.08)] bg-white p-6 shadow-[0_18px_50px_rgba(8,11,13,0.04)]">
      <p className={`${mono} mb-4 text-[12px] uppercase tracking-[1.4px] text-[#99a1af]`}>
        Lịch sử fixer
      </p>
      <div className="space-y-3">
        {items.slice(0, 3).map((item) => (
          <div key={item.id} className="rounded-[16px] bg-[#f7f7f8] px-4 py-4">
            <p className={`${mono} text-[13px] font-[500] text-[#080b0d]`}>
              {item.serviceTitle}
            </p>
            <p className={`${mono} mt-2 text-[11px] leading-[18px] text-[#667085]`}>
              {item.requesterName} · {item.status}
            </p>
          </div>
        ))}
        {items.length === 0 && (
          <p className={`${mono} text-[13px] leading-[22px] text-[#4a5565]`}>
            Chưa có lịch sử xử lý nào trong tài khoản fixer này.
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

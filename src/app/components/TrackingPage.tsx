import { Link } from "react-router";
import {
  BadgeCheck,
  Bike,
  ChevronLeft,
  ClipboardList,
  Clock3,
  PhoneCall,
  ShieldCheck,
  Truck,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { TrackingLiveMap } from "./tracking/TrackingLiveMap";

const mono = "font-['IBM_Plex_Mono',monospace]";
const pagePadding = "px-5 sm:px-8 lg:px-[84px] xl:px-[120px]";
const pageShell = "mx-auto w-full max-w-[1240px]";

const quickStats = [
  { label: "Mã yêu cầu", value: "RSQ-330993" },
  { label: "Dịch vụ", value: "Vá lốp khẩn cấp" },
  { label: "ETA dự kiến", value: "15-20 phút" },
];

const trackingHighlights = [
  { label: "Khoảng cách ước tính", value: "2.4 km" },
  { label: "ETA hiện tại", value: "15-20 phút" },
  { label: "Trạng thái", value: "Đang tiếp cận" },
];

const waitingTips = [
  "Giữ điện thoại sẵn sàng để fixer có thể liên hệ khi cần.",
  "Di chuyển xe vào vị trí an toàn nếu điều kiện giao thông cho phép.",
  "Chuẩn bị thông tin xe để quá trình hỗ trợ diễn ra nhanh hơn.",
];

export default function TrackingPage() {
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

          <div className="mb-8 max-w-[700px] sm:mb-10">
            <p className={`${mono} mb-4 text-[12px] font-[500] uppercase tracking-[1.8px] text-[#ee3224] sm:text-[13px]`}>
              Theo dõi cứu hộ
            </p>
            <h1 className={`${mono} mb-[10px] text-[36px] font-[700] text-[#080b0d] sm:text-[44px] lg:text-[48px]`}>
              Theo dõi fixer theo thời gian thực
            </h1>
            <p className={`${mono} text-[14px] leading-[24px] text-[#4a5565] sm:text-[15px]`}>
              Bản đồ theo dõi được làm lại để đồng bộ hơn với ResQ: rõ ETA,
              rõ trạng thái, rõ lộ trình và giữ trải nghiệm gọn gàng trên cả
              desktop lẫn mobile.
            </p>
          </div>

          <div className="mb-6 grid gap-4 sm:grid-cols-3">
            {quickStats.map((item) => (
              <div
                key={item.label}
                className="rounded-[16px] border border-[rgba(4,38,153,0.08)] bg-[#f7f7f8] px-5 py-4"
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

          <div className="mb-6 rounded-[20px] border border-[rgba(4,38,153,0.08)] bg-white p-5 shadow-[0_18px_50px_rgba(8,11,13,0.04)] sm:p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0">
                <div className="mb-3 flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-2 rounded-full bg-[#ee3224] px-3 py-1.5">
                    <BadgeCheck size={14} className="text-white" />
                    <span className={`${mono} text-[11px] uppercase tracking-[0.16em] text-white`}>
                      ResQ đang di chuyển
                    </span>
                  </span>
                  <span className={`${mono} inline-flex items-center rounded-full border border-[rgba(4,38,153,0.08)] bg-[#f7f7f8] px-3 py-1.5 text-[11px] uppercase tracking-[0.16em] text-[#4a5565]`}>
                    GPS trực tiếp
                  </span>
                  <span className={`${mono} inline-flex items-center rounded-full border border-[rgba(4,38,153,0.08)] bg-[#f7f7f8] px-3 py-1.5 text-[11px] uppercase tracking-[0.16em] text-[#4a5565]`}>
                    Tuyến đường mô phỏng
                  </span>
                </div>

                <p className={`${mono} text-[24px] font-[700] leading-[1.2] text-[#080b0d] sm:text-[28px]`}>
                  Xe ResQ đang trên đường đến bạn
                </p>
                <p className={`${mono} mt-2 max-w-[640px] text-[13px] leading-[23px] text-[#4a5565] sm:text-[14px] sm:leading-[24px]`}>
                  Phần thông tin theo dõi được đưa ra khỏi bản đồ để màn hình
                  gọn hơn, giúp bạn nhìn rõ lộ trình xe cứu hộ và thao tác nhanh
                  hơn khi cần định vị lại.
                </p>
              </div>

              <div className="inline-flex w-fit shrink-0 items-center gap-2 rounded-full bg-[rgba(238,50,36,0.1)] px-4 py-2.5">
                <Truck size={16} className="text-[#ee3224]" />
                <span className={`${mono} text-[11px] uppercase tracking-[0.18em] text-[#ee3224]`}>
                  Đội 07 đang hỗ trợ
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
              <TrackingLiveMap />
            </div>

            <aside className="space-y-5 lg:sticky lg:top-[108px]">
              <div className="rounded-[20px] border border-[rgba(4,38,153,0.08)] bg-white p-6 shadow-[0_18px_50px_rgba(8,11,13,0.04)]">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex size-[42px] items-center justify-center rounded-full bg-[rgba(238,50,36,0.1)]">
                    <Truck size={18} className="text-[#ee3224]" />
                  </div>
                  <div>
                    <p className={`${mono} text-[12px] uppercase tracking-[1.4px] text-[#99a1af]`}>
                      Fixer phụ trách
                    </p>
                    <p className={`${mono} text-[15px] font-[700] text-[#080b0d]`}>
                      Đội lưu động ResQ 07
                    </p>
                  </div>
                </div>
                <div className="space-y-3">
                  <InfoRow icon={ShieldCheck} label="Phương tiện" value="Box van cứu hộ" />
                  <InfoRow icon={Clock3} label="Phản hồi" value="Cập nhật liên tục" />
                  <InfoRow icon={PhoneCall} label="Hotline" value="1900 1234" />
                </div>
              </div>

              <div className="rounded-[20px] border border-[rgba(4,38,153,0.08)] bg-white p-6 shadow-[0_18px_50px_rgba(8,11,13,0.04)]">
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
                  <InfoRow icon={Wrench} label="Dịch vụ" value="Vá lốp xe máy tận nơi" />
                  <InfoRow icon={Bike} label="Xe" value="Honda Wave RSX · 59F1-12345" />
                  <InfoRow icon={Clock3} label="Khu vực" value="TP. Hồ Chí Minh" />
                </div>
              </div>

              <div className="rounded-[20px] bg-[#f7f7f8] p-6">
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

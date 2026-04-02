import { Link } from "react-router";
import { MapEmbed } from "./MapEmbed";
import {
  ChevronLeft,
  Phone,
  Star,
  Clock,
  CheckCircle2,
  Circle,
} from "lucide-react";

const mono = "font-['IBM_Plex_Mono',monospace]";
const pagePadding = "px-5 sm:px-8 lg:px-[84px] xl:px-[120px]";
const pageShell = "mx-auto w-full max-w-[1240px]";

const statusItems = [
  { label: "Đã gửi", time: "14:02", done: true },
  { label: "Đang xử lý", time: "14:03", done: true },
  { label: "Fixer đã nhận", time: "14:05", done: true },
  { label: "Fixer đang đến", time: "14:07", done: true },
  { label: "Đã đến nơi", time: "", done: true },
  { label: "Đang sửa chữa", time: "", done: true },
  { label: "Hoàn thành", time: "", done: false },
];

const stageItems = [
  { num: "1", label: "Đã gửi yêu cầu" },
  { num: "2", label: "Fixer đang tới" },
  { num: "3", label: "Hoàn thành" },
];

export default function TrackingPage() {
  return (
    <div className="overflow-x-hidden bg-white">
      <div className={`${pagePadding} pt-8 pb-16 sm:pt-10 sm:pb-20`}>
        <div className={pageShell}>
          <Link
            to="/"
            className={`mb-[16px] inline-flex items-center gap-[4px] text-[13px] font-[500] text-[#a4a4a4] no-underline transition-colors hover:text-[#080b0d] ${mono}`}
          >
            <ChevronLeft size={16} /> Quay lại
          </Link>

          <div className="mb-8 max-w-[640px]">
            <h1 className={`${mono} mb-[8px] text-[36px] font-[700] text-[#080b0d] sm:text-[44px] lg:text-[48px]`}>
              Theo dõi Fixer
            </h1>
            <p className={`${mono} text-[14px] leading-[24px] text-[#4a5565]`}>
              Theo dõi tiến trình hỗ trợ, vị trí fixer và cập nhật trạng thái theo
              thời gian thực ngay trên một màn hình gọn gàng hơn.
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
            <div className="space-y-6">
              <div className="overflow-hidden rounded-[20px] border border-[rgba(4,38,153,0.08)] bg-white shadow-[0_18px_50px_rgba(8,11,13,0.04)]">
                <MapEmbed
                  className="h-[320px] rounded-none border-0 shadow-none sm:h-[380px] lg:h-[400px]"
                  lat={10.782}
                  lng={106.695}
                  zoom={13}
                  label="Fixer đang đến"
                  description="Fixer dự kiến tới trong khoảng 8 phút."
                />
              </div>

              <div className="rounded-[20px] border border-[rgba(4,38,153,0.08)] bg-white p-5 shadow-[0_18px_50px_rgba(8,11,13,0.04)] sm:p-7 lg:p-8">
                <div className="mb-6 flex items-center gap-0">
                  <div className="h-[6px] flex-1 rounded-l-full bg-[#4CAF50]" />
                  <div className="h-[6px] flex-1 bg-[#4CAF50]" />
                  <div className="h-[6px] flex-1 rounded-r-full bg-[#ee3224]" />
                </div>

                <div className="mb-6 grid gap-4 sm:grid-cols-3 sm:gap-5 lg:mb-8 lg:gap-[24px]">
                  {stageItems.map((stage) => (
                    <div
                      key={stage.num}
                      className="flex flex-col items-center rounded-[16px] bg-[#f7f7f8] px-4 py-5 text-center"
                    >
                      <div className="mb-[10px] flex size-[58px] items-center justify-center rounded-[12px] border-2 border-[#080b0d] bg-white">
                        <span className={`${mono} text-[28px] font-[700] text-[#080b0d]`}>
                          {stage.num}
                        </span>
                      </div>
                      <p className={`${mono} text-[13px] font-[500] text-[#080b0d]`}>
                        {stage.label}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className={`${mono} text-[13px] leading-[22px] text-[#4a5565]`}>
                    Bạn có thể thanh toán sau khi fixer hoàn tất hỗ trợ.
                  </p>
                  <Link
                    to="/thanh-toan"
                    className="inline-flex h-[42px] items-center justify-center rounded-full border border-[#080b0d] px-[24px] no-underline transition-colors hover:bg-[#080b0d] hover:text-white"
                  >
                    <span className={`${mono} text-[14px] font-[500] text-[#080b0d]`}>
                      Thanh Toán
                    </span>
                  </Link>
                </div>
              </div>
            </div>

            <aside className="space-y-5 lg:sticky lg:top-[108px]">
              <div className="rounded-[18px] border border-[rgba(4,38,153,0.08)] bg-white p-[21px] shadow-[0_18px_50px_rgba(8,11,13,0.04)]">
                <p className={`${mono} mb-[12px] text-[12px] font-[500] text-[#a4a4a4]`}>
                  Fixer của bạn
                </p>
                <div className="mb-[12px] flex items-center gap-[12px]">
                  <div className="flex size-[44px] items-center justify-center rounded-full bg-[rgba(238,50,36,0.1)]">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#EE3224" strokeWidth="1.67" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="10" cy="7" r="3" />
                      <path d="M3 18v-1a5 5 0 0 1 10 0v1" />
                    </svg>
                  </div>
                  <div>
                    <p className={`${mono} text-[14px] font-[500] text-[#080b0d]`}>
                      Trần Văn Minh
                    </p>
                    <div className="flex items-center gap-[4px]">
                      <Star size={12} className="fill-[#ee3224] text-[#ee3224]" />
                      <span className={`${mono} text-[12px] text-[#a4a4a4]`}>
                        4.8 (156 đánh giá)
                      </span>
                    </div>
                  </div>
                </div>
                <div className="mb-[16px] flex items-center gap-[8px]">
                  <Clock size={14} className="text-[#ee3224]" />
                  <span className={`${mono} text-[13px] text-[#080b0d]`}>
                    ETA: khoảng 8 phút
                  </span>
                </div>
                <button className="flex h-[38px] w-full items-center justify-center gap-[8px] rounded-[10px] border-0 bg-[#ee3224] cursor-pointer transition-colors hover:bg-[#d42b1e]">
                  <Phone size={14} className="text-white" />
                  <span className={`${mono} text-[13px] font-[500] text-white`}>
                    Gọi Fixer
                  </span>
                </button>
              </div>

              <div className="rounded-[18px] border border-[rgba(4,38,153,0.08)] bg-white p-[21px] shadow-[0_18px_50px_rgba(8,11,13,0.04)]">
                <p className={`${mono} mb-[12px] text-[12px] font-[500] text-[#a4a4a4]`}>
                  Chi tiết yêu cầu
                </p>
                {[
                  ["Dịch vụ", "Vá lốp xe máy"],
                  ["Xe", "Honda Wave RSX"],
                  ["Biển số", "59F1-12345"],
                ].map(([k, v]) => (
                  <div key={k} className="mb-[8px] flex justify-between last:mb-0">
                    <span className={`${mono} text-[13px] text-[#a4a4a4]`}>{k}</span>
                    <span className={`${mono} text-[13px] font-[500] text-[#080b0d]`}>
                      {v}
                    </span>
                  </div>
                ))}
              </div>

              <div className="rounded-[18px] border border-[rgba(4,38,153,0.08)] bg-white p-[21px] shadow-[0_18px_50px_rgba(8,11,13,0.04)]">
                <p className={`${mono} mb-[16px] text-[12px] font-[500] text-[#a4a4a4]`}>
                  Trạng thái
                </p>
                <div className="flex flex-col gap-[12px]">
                  {statusItems.map((status) => (
                    <div key={status.label} className="flex items-center gap-[12px]">
                      {status.done ? (
                        <CheckCircle2 size={16} className="shrink-0 text-[#ee3224]" />
                      ) : (
                        <Circle size={16} className="shrink-0 text-[#d9d9d9]" />
                      )}
                      <span
                        className={`${mono} flex-1 text-[13px] ${
                          status.done
                            ? "font-[500] text-[#080b0d]"
                            : "font-[400] text-[#a4a4a4]"
                        }`}
                      >
                        {status.label}
                      </span>
                      {status.time && (
                        <span className={`${mono} text-[12px] text-[#a4a4a4]`}>
                          {status.time}
                        </span>
                      )}
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

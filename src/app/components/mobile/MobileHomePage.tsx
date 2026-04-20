import { Link } from "react-router";
import {
  Bike,
  Car,
  ChevronRight,
  MapPin,
  PhoneCall,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useAuth } from "../AuthContext";
import { useLanguage } from "../LanguageContext";
import { getLocalizedText, emergencyLines } from "../emergencyContent";
import { resqServices } from "../resqData";
import { useResQStore } from "../resqStore";
import { getRoleLabel } from "@/utils/supabase/auth";

function formatTime(value: string, language: "vi" | "en") {
  const date = new Date(value);

  return date.toLocaleDateString(language === "en" ? "en-GB" : "vi-VN", {
    day: "2-digit",
    month: "2-digit",
  });
}

export default function MobileHomePage() {
  const { user, isLoggedIn } = useAuth();
  const { language } = useLanguage();
  const isEnglish = language === "en";
  const { vehicles, activeRequest, requestHistory } = useResQStore();
  const primaryVehicle = vehicles.find((vehicle) => vehicle.isDefault) ?? vehicles[0] ?? null;
  const featuredServices = resqServices.slice(0, 4);
  const recentHistory = requestHistory.slice(0, 2);
  const userRoleLabel = user ? getRoleLabel(user.role) : null;

  return (
    <div className="space-y-5 pb-5">
      <section className="overflow-hidden rounded-[30px] bg-[linear-gradient(135deg,#1c1817_0%,#271c19_46%,#ee3224_100%)] px-5 pb-5 pt-4 text-white shadow-[0_24px_60px_rgba(238,50,36,0.24)]">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="resq-eyebrow text-white/70">
              {isEnglish ? "Vietnam roadside support" : "Cứu hộ giao thông Việt Nam"}
            </p>
            <p className="resq-display text-[28px] font-[800] tracking-[-0.03em]">ResQ</p>
          </div>
          <div className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5">
            <span className="resq-mono text-[10px] uppercase tracking-[0.22em]">
              24/7
            </span>
          </div>
        </div>

        <div className="mb-5 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="resq-eyebrow text-white/72">
              {isLoggedIn
                ? isEnglish
                  ? `Hi, ${user?.name?.split(" ").at(-1) ?? "there"}`
                  : `Xin chào, ${user?.name?.split(" ").at(-1) ?? "bạn"}`
                : isEnglish
                  ? "Ready when the road goes wrong"
                  : "Sẵn sàng khi bạn gặp sự cố"}
            </p>
            {userRoleLabel && (
              <p className="resq-mono mt-2 text-[10px] uppercase tracking-[0.18em] text-white/56">
                {userRoleLabel}
              </p>
            )}
            <h1 className="resq-display mt-3 max-w-[250px] text-[34px] leading-[0.92] font-[700] tracking-[-0.05em]">
              {isEnglish ? "One tap to start help." : "Một chạm để bắt đầu cứu hộ."}
            </h1>
            <p className="resq-body mt-3 max-w-[270px] text-[13px] leading-[21px] text-white/78">
              {isEnglish
                ? "The mobile flow stays short: request support, pin the spot, and jump into tracking."
                : "Luồng di động được giữ ngắn: gửi yêu cầu, ghim vị trí, rồi chuyển sang theo dõi ngay."}
            </p>
          </div>

          <div className="flex size-[72px] shrink-0 items-center justify-center rounded-[24px] bg-white/10 backdrop-blur">
            <Sparkles size={28} />
          </div>
        </div>

        <Link
          to="/dich-vu"
          className="block rounded-[24px] bg-white px-4 py-4 text-[#080b0d] no-underline shadow-[0_16px_30px_rgba(8,11,13,0.16)]"
        >
          <p className="resq-eyebrow text-[#99a1af]">
            {isEnglish ? "Primary action" : "Hành động chính"}
          </p>
          <p className="resq-display mt-2 text-[24px] leading-none font-[700] tracking-[-0.03em]">
            {isEnglish ? "Request support" : "Yêu cầu hỗ trợ"}
          </p>
          <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#ee3224] px-3 py-1.5 text-white">
            <span className="resq-mono text-[10px] uppercase tracking-[0.18em]">
              {isEnglish ? "Start now" : "Bắt đầu ngay"}
            </span>
            <ChevronRight size={14} />
          </div>
        </Link>

        <div className="mt-4 flex items-center justify-between rounded-[18px] border border-white/12 bg-black/12 px-3 py-3">
          <div className="flex min-w-0 items-center gap-2">
            <MapPin size={15} className="shrink-0" />
            <p className="resq-body text-[12px] leading-[18px] text-white/82">
              {isEnglish
                ? "Priority: District 1, Binh Thanh, Thu Duc"
                : "Ưu tiên: Quận 1, Bình Thạnh, Thủ Đức"}
            </p>
          </div>
          <a href="tel:19001234" className="flex size-[36px] items-center justify-center rounded-full bg-white/10 text-white">
            <PhoneCall size={15} />
          </a>
        </div>
      </section>

      {activeRequest ? (
        <Link
          to="/theo-doi"
          className="block rounded-[26px] border border-[#f4c1bb] bg-[linear-gradient(135deg,#fff4f2_0%,#fffaf8_100%)] p-4 no-underline shadow-[0_18px_40px_rgba(8,11,13,0.06)]"
        >
          <div className="mb-3 flex items-center justify-between">
            <span className="resq-mono rounded-full bg-[#ee3224] px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] text-white">
              {isEnglish ? "Active" : "Đang hoạt động"}
            </span>
            <span className="resq-mono text-[11px] text-[#ee3224]">{activeRequest.serviceEta}</span>
          </div>
          <p className="resq-display text-[24px] leading-[1] font-[700] tracking-[-0.04em] text-[#080b0d]">
            {activeRequest.serviceTitle}
          </p>
          <p className="resq-body mt-2 text-[12px] leading-[20px] text-[#5c6470]">
            {activeRequest.locationAddress}
          </p>
          <div className="mt-4 flex items-center justify-between rounded-[18px] bg-white px-3 py-3">
            <div>
              <p className="resq-eyebrow text-[#99a1af]">
                {isEnglish ? "Status" : "Trạng thái"}
              </p>
              <p className="resq-body mt-1 text-[13px] font-[800] text-[#080b0d]">
                {activeRequest.status}
              </p>
            </div>
            <div className="inline-flex items-center gap-2 text-[#ee3224]">
              <span className="resq-mono text-[11px] uppercase tracking-[0.18em]">
                {isEnglish ? "Open tracking" : "Theo dõi"}
              </span>
              <ChevronRight size={16} />
            </div>
          </div>
        </Link>
      ) : (
        <section className="rounded-[26px] border border-black/5 bg-white/90 p-4 shadow-[0_18px_40px_rgba(8,11,13,0.06)]">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="resq-eyebrow text-[#99a1af]">
                {isEnglish ? "Ready now" : "Sẵn sàng"}
              </p>
              <p className="resq-display mt-2 text-[24px] leading-[1] font-[700] tracking-[-0.04em] text-[#080b0d]">
                {isEnglish ? "No open request" : "Chưa có yêu cầu đang mở"}
              </p>
            </div>
            <div className="flex size-[42px] items-center justify-center rounded-[16px] bg-[rgba(238,50,36,0.08)]">
              <ShieldCheck size={18} className="text-[#ee3224]" />
            </div>
          </div>
          <p className="resq-body mt-3 text-[13px] leading-[21px] text-[#5c6470]">
            {isEnglish
              ? "When something goes wrong, ResQ keeps the request short so you can finish it even under pressure."
              : "Khi xe gặp sự cố, ResQ giữ luồng tạo yêu cầu ngắn gọn để bạn hoàn tất nhanh kể cả lúc đang áp lực."}
          </p>
        </section>
      )}

      <section className="rounded-[26px] bg-white/92 p-4 shadow-[0_18px_40px_rgba(8,11,13,0.06)]">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="resq-eyebrow text-[#99a1af]">
              {isEnglish ? "Vehicle" : "Phương tiện"}
            </p>
            <h2 className="resq-display mt-2 text-[24px] leading-[1] font-[700] tracking-[-0.04em] text-[#080b0d]">
              {isEnglish ? "Default vehicle" : "Xe mặc định"}
            </h2>
          </div>
          <Link to="/tai-khoan" className="resq-mono text-[11px] uppercase tracking-[0.18em] text-[#ee3224] no-underline">
            {isEnglish ? "Manage" : "Quản lý"}
          </Link>
        </div>

        {primaryVehicle ? (
          <div className="rounded-[22px] border border-black/5 bg-[linear-gradient(180deg,#fffaf8_0%,#f7f5f2_100%)] p-4">
            <div className="flex items-center gap-3">
              <div className="flex size-[44px] items-center justify-center rounded-[18px] bg-[rgba(238,50,36,0.1)]">
                {primaryVehicle.type === "Xe máy" ? (
                  <Bike size={20} className="text-[#ee3224]" />
                ) : (
                  <Car size={20} className="text-[#ee3224]" />
                )}
              </div>
              <div className="min-w-0">
                <p className="resq-body text-[14px] font-[800] text-[#080b0d]">
                  {primaryVehicle.name}
                </p>
                <p className="resq-body mt-1 text-[12px] text-[#667085]">
                  {primaryVehicle.plate} · {primaryVehicle.year}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-[22px] border border-dashed border-black/10 bg-[#faf8f5] p-4">
            <p className="resq-body text-[12px] leading-[20px] text-[#667085]">
              {isEnglish
                ? "Save a vehicle now to make the next rescue request faster."
                : "Lưu xe trước để lần gọi cứu hộ tiếp theo diễn ra nhanh hơn."}
            </p>
          </div>
        )}
      </section>

      <section className="rounded-[26px] bg-white/92 p-4 shadow-[0_18px_40px_rgba(8,11,13,0.06)]">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="resq-eyebrow text-[#99a1af]">
              {isEnglish ? "Services" : "Dịch vụ"}
            </p>
            <h2 className="resq-display mt-2 text-[24px] leading-[1] font-[700] tracking-[-0.04em] text-[#080b0d]">
              {isEnglish ? "Popular support" : "Dịch vụ phổ biến"}
            </h2>
          </div>
          <Link to="/dich-vu" className="resq-mono text-[11px] uppercase tracking-[0.18em] text-[#ee3224] no-underline">
            {isEnglish ? "All" : "Xem tất cả"}
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {featuredServices.map((service) => {
            const Icon = service.icon;

            return (
              <Link
                key={service.id}
                to="/dich-vu"
                className="rounded-[22px] border border-black/5 bg-[#fffaf7] p-3 no-underline"
              >
                <div className="flex size-[42px] items-center justify-center rounded-[16px] bg-[rgba(238,50,36,0.1)]">
                  <Icon size={18} className="text-[#ee3224]" />
                </div>
                <p className="resq-body mt-4 text-[12px] font-[800] leading-[18px] text-[#080b0d]">
                  {isEnglish ? service.titleEn : service.title}
                </p>
                <p className="resq-body mt-2 text-[11px] leading-[18px] text-[#667085]">
                  {isEnglish ? service.descEn : service.desc}
                </p>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="rounded-[26px] bg-[#111111] p-4 text-white shadow-[0_18px_40px_rgba(8,11,13,0.16)]">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="resq-eyebrow text-white/56">
              {isEnglish ? "Emergency numbers" : "Đầu số khẩn cấp"}
            </p>
            <h2 className="resq-display mt-2 text-[24px] leading-[1] font-[700] tracking-[-0.04em]">
              {isEnglish ? "Quick call list" : "Danh sách gọi nhanh"}
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {emergencyLines.slice(0, 4).map((item) => (
            <a
              key={item.number}
              href={`tel:${item.number.replace(/\s+/g, "")}`}
              className="rounded-[18px] border border-white/10 bg-white/6 px-3 py-3 no-underline"
            >
              <p className="resq-eyebrow text-white/56">
                {getLocalizedText(language, item.label, item.labelEn)}
              </p>
              <p className="resq-display mt-2 text-[26px] leading-none font-[700] text-white">
                {item.number}
              </p>
            </a>
          ))}
        </div>
      </section>

      <section className="rounded-[26px] bg-white/92 p-4 shadow-[0_18px_40px_rgba(8,11,13,0.06)]">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="resq-eyebrow text-[#99a1af]">
              {isEnglish ? "Recent" : "Lịch sử gần"}
            </p>
            <h2 className="resq-display mt-2 text-[24px] leading-[1] font-[700] tracking-[-0.04em] text-[#080b0d]">
              {isEnglish ? "Last requests" : "Yêu cầu gần đây"}
            </h2>
          </div>
        </div>

        {recentHistory.length > 0 ? (
          <div className="space-y-3">
            {recentHistory.map((item) => (
              <div key={item.id} className="rounded-[22px] bg-[#faf8f5] px-4 py-4">
                <p className="resq-body text-[13px] font-[800] text-[#080b0d]">
                  {item.serviceTitle}
                </p>
                <p className="resq-body mt-1 text-[11px] text-[#667085]">
                  {item.status}
                </p>
                <p className="resq-body mt-2 text-[11px] text-[#99a1af]">
                  {formatTime(item.createdAt, language)}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-[22px] border border-dashed border-black/10 bg-[#faf8f5] p-4">
            <p className="resq-body text-[12px] leading-[20px] text-[#667085]">
              {isEnglish
                ? "Your recent requests will appear here after the first completed job."
                : "Các yêu cầu gần đây sẽ xuất hiện ở đây sau khi bạn hoàn thành đơn đầu tiên."}
            </p>
          </div>
        )}
      </section>
    </div>
  );
}

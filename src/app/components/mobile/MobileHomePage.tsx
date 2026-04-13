import { Link } from "react-router";
import {
  Bike,
  Car,
  ChevronRight,
  Clock3,
  MapPin,
  PhoneCall,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useAuth } from "../AuthContext";
import { resqServices } from "../resqData";
import { useResQStore } from "../resqStore";
import { getRoleLabel } from "@/utils/supabase/auth";

const mono = "font-['IBM_Plex_Mono',monospace]";

function formatTime(value: string) {
  const date = new Date(value);

  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
  });
}

export default function MobileHomePage() {
  const { user, isLoggedIn } = useAuth();
  const { vehicles, activeRequest, requestHistory } = useResQStore();
  const primaryVehicle = vehicles.find((vehicle) => vehicle.isDefault) ?? vehicles[0] ?? null;
  const featuredServices = resqServices.slice(0, 6);
  const recentHistory = requestHistory.slice(0, 2);
  const userRoleLabel = user ? getRoleLabel(user.role) : null;

  return (
    <div className="space-y-5 pb-5">
      <section className="overflow-hidden rounded-[30px] bg-[linear-gradient(135deg,#1d1a18_0%,#3b201a_42%,#ee3224_100%)] px-5 pb-5 pt-4 text-white shadow-[0_24px_60px_rgba(238,50,36,0.28)]">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className={`${mono} text-[10px] uppercase tracking-[0.26em] text-white/70`}>
              Vietnam-first roadside assistance
            </p>
            <p className="font-['Syne',sans-serif] text-[28px] font-[800] tracking-[-0.03em]">
              ResQ
            </p>
          </div>
          <div className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5">
            <span className={`${mono} text-[10px] uppercase tracking-[0.22em]`}>
              24/7 live
            </span>
          </div>
        </div>

        <div className="mb-5 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className={`${mono} mb-2 text-[11px] uppercase tracking-[0.18em] text-white/72`}>
              {isLoggedIn ? `Xin chào, ${user?.name?.split(" ").at(-1) ?? "bạn"}` : "Sẵn sàng khi bạn cần"}
            </p>
            {userRoleLabel && (
              <p className={`${mono} text-[10px] uppercase tracking-[0.18em] text-white/56`}>
                {userRoleLabel}
              </p>
            )}
            <h1 className="max-w-[260px] font-['Syne',sans-serif] text-[32px] leading-[0.95] font-[700] tracking-[-0.04em]">
              Gọi cứu hộ chỉ trong vài chạm
            </h1>
            <p className={`${mono} mt-3 max-w-[260px] text-[12px] leading-[20px] text-white/76`}>
              Yêu cầu hỗ trợ, ghim vị trí, theo dõi fixer và lưu lịch sử ngay trong một luồng di động gọn.
            </p>
          </div>

          <div className="flex size-[72px] shrink-0 items-center justify-center rounded-[24px] bg-white/10 backdrop-blur">
            <Sparkles size={28} />
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <Link
            to="/dich-vu"
            className="rounded-[22px] bg-white px-4 py-4 text-[#080b0d] no-underline shadow-[0_16px_30px_rgba(8,11,13,0.16)] transition-transform hover:-translate-y-0.5"
          >
            <p className={`${mono} text-[10px] uppercase tracking-[0.2em] text-[#99a1af]`}>
              Primary action
            </p>
            <p className="mt-2 font-['Syne',sans-serif] text-[22px] leading-none font-[700] tracking-[-0.03em]">
              Yêu cầu hỗ trợ
            </p>
            <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#ee3224] px-3 py-1.5 text-white">
              <span className={`${mono} text-[10px] uppercase tracking-[0.18em]`}>
                Chạm để bắt đầu
              </span>
              <ChevronRight size={14} />
            </div>
          </Link>

          <a
            href="tel:19001234"
            className="rounded-[22px] border border-white/15 bg-white/10 px-4 py-4 text-white no-underline backdrop-blur transition-colors hover:bg-white/14"
          >
            <div className="flex items-center justify-between">
              <PhoneCall size={18} />
              <span className={`${mono} text-[10px] uppercase tracking-[0.18em] text-white/72`}>
                Hotline
              </span>
            </div>
            <p className="mt-5 font-['Syne',sans-serif] text-[26px] leading-none font-[700] tracking-[-0.04em]">
              1900 1234
            </p>
            <p className={`${mono} mt-2 text-[12px] leading-[20px] text-white/72`}>
              Gọi nhanh nếu bạn đang ở tình huống khẩn cấp hoặc cần hỗ trợ ngay.
            </p>
          </a>
        </div>

        <div className="mt-4 flex items-center gap-2 rounded-[18px] border border-white/12 bg-black/10 px-3 py-3">
          <MapPin size={15} className="shrink-0" />
          <p className={`${mono} text-[11px] leading-[18px] text-white/82`}>
            Vị trí ưu tiên: TP. Hồ Chí Minh, Thủ Đức, Bình Thạnh, xa lộ chính
          </p>
        </div>
      </section>

      {activeRequest ? (
        <Link
          to="/theo-doi"
          className="block rounded-[26px] border border-[#f4c1bb] bg-[linear-gradient(135deg,#fff4f2_0%,#fffaf8_100%)] p-4 no-underline shadow-[0_18px_40px_rgba(8,11,13,0.06)]"
        >
          <div className="mb-3 flex items-center justify-between">
            <span className={`${mono} rounded-full bg-[#ee3224] px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] text-white`}>
              Đang hoạt động
            </span>
            <span className={`${mono} text-[11px] text-[#ee3224]`}>
              {activeRequest.serviceEta}
            </span>
          </div>
          <p className="font-['Syne',sans-serif] text-[24px] leading-[1] font-[700] tracking-[-0.04em] text-[#080b0d]">
            {activeRequest.serviceTitle}
          </p>
          <p className={`${mono} mt-2 text-[12px] leading-[20px] text-[#5c6470]`}>
            {activeRequest.locationAddress}
          </p>
          <div className="mt-4 flex items-center justify-between rounded-[18px] bg-white px-3 py-3">
            <div>
              <p className={`${mono} text-[10px] uppercase tracking-[0.18em] text-[#99a1af]`}>
                Trạng thái
              </p>
              <p className={`${mono} mt-1 text-[13px] font-[500] text-[#080b0d]`}>
                {activeRequest.status}
              </p>
            </div>
            <div className="inline-flex items-center gap-2 text-[#ee3224]">
              <span className={`${mono} text-[11px] uppercase tracking-[0.18em]`}>
                Theo dõi fixer
              </span>
              <ChevronRight size={16} />
            </div>
          </div>
        </Link>
      ) : (
        <section className="rounded-[26px] border border-black/5 bg-white/90 p-4 shadow-[0_18px_40px_rgba(8,11,13,0.06)]">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className={`${mono} text-[10px] uppercase tracking-[0.18em] text-[#99a1af]`}>
                Ready now
              </p>
              <p className="mt-2 font-['Syne',sans-serif] text-[24px] leading-[1] font-[700] tracking-[-0.04em] text-[#080b0d]">
                Không có yêu cầu đang mở
              </p>
            </div>
            <div className="flex size-[42px] items-center justify-center rounded-[16px] bg-[rgba(238,50,36,0.08)]">
              <ShieldCheck size={18} className="text-[#ee3224]" />
            </div>
          </div>
          <p className={`${mono} mt-3 text-[12px] leading-[20px] text-[#5c6470]`}>
            Khi xe gặp sự cố, ResQ sẽ giữ luồng tạo yêu cầu ngắn gọn để bạn hoàn tất nhanh trong điều kiện áp lực cao.
          </p>
        </section>
      )}

      <section className="rounded-[26px] bg-white/92 p-4 shadow-[0_18px_40px_rgba(8,11,13,0.06)]">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className={`${mono} text-[10px] uppercase tracking-[0.18em] text-[#99a1af]`}>
              Vehicle
            </p>
            <h2 className="mt-2 font-['Syne',sans-serif] text-[24px] leading-[1] font-[700] tracking-[-0.04em] text-[#080b0d]">
              Xe mặc định
            </h2>
          </div>
          <Link
            to="/tai-khoan"
            className={`${mono} text-[11px] uppercase tracking-[0.18em] text-[#ee3224] no-underline`}
          >
            Quản lý
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
                <p className={`${mono} text-[13px] font-[500] text-[#080b0d]`}>
                  {primaryVehicle.name}
                </p>
                <p className={`${mono} mt-1 text-[11px] text-[#667085]`}>
                  {primaryVehicle.plate} · {primaryVehicle.year}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-[22px] border border-dashed border-black/10 bg-[#faf8f5] p-4">
            <p className={`${mono} text-[12px] leading-[20px] text-[#667085]`}>
              Lưu xe để lần gọi cứu hộ tiếp theo diễn ra nhanh hơn.
            </p>
          </div>
        )}
      </section>

      <section className="rounded-[26px] bg-white/92 p-4 shadow-[0_18px_40px_rgba(8,11,13,0.06)]">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className={`${mono} text-[10px] uppercase tracking-[0.18em] text-[#99a1af]`}>
              Services
            </p>
            <h2 className="mt-2 font-['Syne',sans-serif] text-[24px] leading-[1] font-[700] tracking-[-0.04em] text-[#080b0d]">
              Dịch vụ phổ biến
            </h2>
          </div>
          <Link
            to="/dich-vu"
            className={`${mono} text-[11px] uppercase tracking-[0.18em] text-[#ee3224] no-underline`}
          >
            Xem tất cả
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {featuredServices.map((service) => {
            const Icon = service.icon;

            return (
              <Link
                key={service.id}
                to="/dich-vu"
                className="rounded-[22px] border border-black/5 bg-[#fffaf7] p-3 no-underline transition-transform hover:-translate-y-0.5"
              >
                <div className="flex size-[42px] items-center justify-center rounded-[16px] bg-[rgba(238,50,36,0.1)]">
                  <Icon size={18} className="text-[#ee3224]" />
                </div>
                <p className={`${mono} mt-4 text-[12px] font-[500] leading-[18px] text-[#080b0d]`}>
                  {service.title}
                </p>
                <p className={`${mono} mt-2 text-[10px] uppercase tracking-[0.16em] text-[#667085]`}>
                  {service.eta}
                </p>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="rounded-[26px] bg-[#111111] p-4 text-white shadow-[0_18px_40px_rgba(8,11,13,0.16)]">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <p className={`${mono} text-[10px] uppercase tracking-[0.18em] text-white/56`}>
              While waiting
            </p>
            <h2 className="mt-2 font-['Syne',sans-serif] text-[24px] leading-[1] font-[700] tracking-[-0.04em]">
              Chuẩn bị nhanh
            </h2>
          </div>
          <Clock3 size={18} className="text-white/72" />
        </div>
        <div className="space-y-3">
          {[
            "Đậu xe ở vị trí an toàn nếu điều kiện giao thông cho phép.",
            "Giữ điện thoại sáng pin để fixer có thể gọi nhanh.",
            "Chuẩn bị biển số và mô tả sự cố để xác nhận trong vài giây.",
          ].map((tip) => (
            <div key={tip} className="flex items-start gap-3 rounded-[18px] border border-white/10 bg-white/6 px-3 py-3">
              <span className="mt-[6px] size-[8px] shrink-0 rounded-full bg-[#ee3224]" />
              <p className={`${mono} text-[11px] leading-[19px] text-white/82`}>
                {tip}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-[26px] bg-white/92 p-4 shadow-[0_18px_40px_rgba(8,11,13,0.06)]">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className={`${mono} text-[10px] uppercase tracking-[0.18em] text-[#99a1af]`}>
              History
            </p>
            <h2 className="mt-2 font-['Syne',sans-serif] text-[24px] leading-[1] font-[700] tracking-[-0.04em] text-[#080b0d]">
              Hoạt động gần đây
            </h2>
          </div>
          <Link
            to="/theo-doi"
            className={`${mono} text-[11px] uppercase tracking-[0.18em] text-[#ee3224] no-underline`}
          >
            Mở activity
          </Link>
        </div>

        <div className="space-y-3">
          {recentHistory.map((item) => (
            <div key={item.id} className="rounded-[20px] border border-black/5 bg-[#faf8f5] p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className={`${mono} text-[12px] font-[500] text-[#080b0d]`}>
                    {item.serviceTitle}
                  </p>
                  <p className={`${mono} mt-1 text-[11px] leading-[18px] text-[#667085]`}>
                    {item.vehicleName} · {formatTime(item.createdAt)}
                  </p>
                </div>
                <span className={`${mono} rounded-full px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] ${
                  item.paymentStatus === "Đã thanh toán"
                    ? "bg-[rgba(15,157,88,0.12)] text-[#0f9d58]"
                    : "bg-[rgba(238,50,36,0.1)] text-[#ee3224]"
                }`}>
                  {item.paymentStatus}
                </span>
              </div>
              <p className={`${mono} mt-3 text-[11px] leading-[18px] text-[#5c6470]`}>
                {item.locationAddress}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

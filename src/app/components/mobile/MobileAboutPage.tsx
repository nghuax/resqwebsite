import { Link } from "react-router";
import { MapPin, ShieldCheck, Wrench } from "lucide-react";

const mono = "font-['IBM_Plex_Mono',monospace]";

export default function MobileAboutPage() {
  return (
    <div className="space-y-5 pb-5">
      <section className="rounded-[30px] bg-[linear-gradient(135deg,#fff4ef_0%,#ffe6dd_100%)] px-5 py-5 shadow-[0_18px_40px_rgba(8,11,13,0.06)]">
        <p className={`${mono} text-[10px] uppercase tracking-[0.22em] text-[#99a1af]`}>
          About ResQ
        </p>
        <h1 className="mt-3 font-['Syne',sans-serif] text-[34px] leading-[0.92] font-[700] tracking-[-0.05em] text-[#080b0d]">
          Xe của bạn, việc của tôi.
        </h1>
        <p className={`${mono} mt-3 max-w-[300px] text-[12px] leading-[20px] text-[#667085]`}>
          ResQ gom gọi cứu hộ, định vị, theo dõi fixer, thanh toán và lưu phương tiện vào một trải nghiệm tiếng Việt ưu tiên di động.
        </p>
      </section>

      <section className="space-y-3">
        {[
          {
            icon: ShieldCheck,
            title: "Thiết kế cho lúc khẩn cấp",
            desc: "Một CTA chính, ít chữ thừa, tiến trình rõ ràng và cập nhật trạng thái dễ hiểu ngay cả khi người dùng đang căng thẳng.",
          },
          {
            icon: MapPin,
            title: "Đặt vị trí làm trung tâm",
            desc: "Yêu cầu hỗ trợ luôn bắt đầu từ vị trí hiện tại, cho phép ghim lại điểm đón nếu GPS yếu hoặc không chính xác.",
          },
          {
            icon: Wrench,
            title: "Phù hợp thực tế Việt Nam",
            desc: "Dịch vụ cho xe máy, ô tô, tiếp nhiên liệu, vá lốp, kích bình và điều phối nhanh từ đội fixer gần nhất.",
          },
        ].map((item) => {
          const Icon = item.icon;

          return (
            <div key={item.title} className="rounded-[24px] bg-white/92 p-4 shadow-[0_18px_40px_rgba(8,11,13,0.06)]">
              <div className="flex size-[44px] items-center justify-center rounded-[18px] bg-[rgba(238,50,36,0.08)]">
                <Icon size={18} className="text-[#ee3224]" />
              </div>
              <h2 className="mt-4 font-['Syne',sans-serif] text-[24px] leading-[0.95] font-[700] tracking-[-0.04em] text-[#080b0d]">
                {item.title}
              </h2>
              <p className={`${mono} mt-3 text-[12px] leading-[20px] text-[#667085]`}>
                {item.desc}
              </p>
            </div>
          );
        })}
      </section>

      <section className="rounded-[26px] bg-[#111111] p-5 text-white shadow-[0_18px_40px_rgba(8,11,13,0.16)]">
        <p className={`${mono} text-[10px] uppercase tracking-[0.22em] text-white/56`}>
          Promise
        </p>
        <h2 className="mt-3 font-['Syne',sans-serif] text-[30px] leading-[0.92] font-[700] tracking-[-0.04em]">
          Hỗ trợ nhanh hơn website, nhưng không mất tính minh bạch.
        </h2>
        <p className={`${mono} mt-3 text-[12px] leading-[20px] text-white/76`}>
          Phiên bản mobile giữ toàn bộ chức năng cốt lõi của ResQ: đăng nhập, lưu xe, chọn dịch vụ, gửi yêu cầu, theo dõi fixer, thanh toán và xem lại lịch sử.
        </p>
      </section>

      <Link
        to="/dich-vu"
        className="block rounded-[26px] bg-[#ee3224] px-5 py-5 text-white no-underline shadow-[0_18px_40px_rgba(238,50,36,0.28)]"
      >
        <p className={`${mono} text-[10px] uppercase tracking-[0.22em] text-white/72`}>
          Next step
        </p>
        <h2 className="mt-3 font-['Syne',sans-serif] text-[30px] leading-[0.92] font-[700] tracking-[-0.04em]">
          Bắt đầu một yêu cầu mới
        </h2>
        <p className={`${mono} mt-3 text-[12px] leading-[20px] text-white/82`}>
          Chọn dịch vụ, xác nhận vị trí và để ResQ xử lý phần điều phối.
        </p>
      </Link>
    </div>
  );
}

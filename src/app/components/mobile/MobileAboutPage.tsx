import { Link } from "react-router";
import { MapPin, ShieldCheck, Wrench } from "lucide-react";
import { useLanguage } from "../LanguageContext";

export default function MobileAboutPage() {
  const { language } = useLanguage();
  const isEnglish = language === "en";

  const items = [
    {
      icon: ShieldCheck,
      title: isEnglish ? "Designed for pressure" : "Thiết kế cho lúc áp lực",
      desc: isEnglish
        ? "One clear CTA, less UI noise, and a shorter request flow when the user is already stressed."
        : "Một CTA chính, ít nhiễu giao diện hơn và luồng tạo yêu cầu ngắn hơn khi người dùng đang căng thẳng.",
    },
    {
      icon: MapPin,
      title: isEnglish ? "Location comes first" : "Vị trí luôn đi trước",
      desc: isEnglish
        ? "Requests begin from the pinned spot so the fixer starts with context instead of another call."
        : "Yêu cầu bắt đầu từ vị trí đã ghim để fixer nhận đúng bối cảnh thay vì phải gọi vòng lại.",
    },
    {
      icon: Wrench,
      title: isEnglish ? "Vietnam-first service mix" : "Danh mục sát thực tế Việt Nam",
      desc: isEnglish
        ? "Motorbikes, cars, fuel delivery, towing, punctures, batteries, and local dispatch priorities."
        : "Xe máy, ô tô, tiếp nhiên liệu, kéo xe, vá lốp, ắc quy và ưu tiên điều phối theo địa phương.",
    },
  ];

  return (
    <div className="space-y-5 pb-5">
      <section className="rounded-[30px] bg-[linear-gradient(135deg,#fff4ef_0%,#ffe6dd_100%)] px-5 py-5 shadow-[0_18px_40px_rgba(8,11,13,0.06)]">
        <p className="resq-eyebrow text-[#99a1af]">
          {isEnglish ? "About ResQ" : "Về ResQ"}
        </p>
        <h1 className="resq-display mt-3 text-[34px] leading-[0.92] font-[700] tracking-[-0.05em] text-[#080b0d]">
          {isEnglish ? "Your vehicle. Clear next step." : "Xe của bạn. Bước tiếp theo rõ ràng."}
        </h1>
        <p className="resq-body mt-3 max-w-[300px] text-[13px] leading-[21px] text-[#667085]">
          {isEnglish
            ? "ResQ combines support requests, tracking, payments, and emergency references in one calmer mobile flow."
            : "ResQ gom tạo yêu cầu, theo dõi, thanh toán và tham chiếu khẩn cấp vào cùng một luồng mobile gọn hơn."}
        </p>
      </section>

      <section className="space-y-3">
        {items.map((item) => {
          const Icon = item.icon;

          return (
            <div key={item.title} className="rounded-[24px] bg-white/92 p-4 shadow-[0_18px_40px_rgba(8,11,13,0.06)]">
              <div className="flex size-[44px] items-center justify-center rounded-[18px] bg-[rgba(238,50,36,0.08)]">
                <Icon size={18} className="text-[#ee3224]" />
              </div>
              <h2 className="resq-display mt-4 text-[24px] leading-[0.95] font-[700] tracking-[-0.04em] text-[#080b0d]">
                {item.title}
              </h2>
              <p className="resq-body mt-3 text-[13px] leading-[21px] text-[#667085]">
                {item.desc}
              </p>
            </div>
          );
        })}
      </section>

      <Link
        to="/dich-vu"
        className="block rounded-[26px] bg-[#111111] px-5 py-5 text-white no-underline shadow-[0_18px_40px_rgba(8,11,13,0.16)]"
      >
        <p className="resq-eyebrow text-white/56">
          {isEnglish ? "Next step" : "Bước tiếp theo"}
        </p>
        <h2 className="resq-display mt-3 text-[30px] leading-[0.92] font-[700] tracking-[-0.04em]">
          {isEnglish ? "Open the service flow" : "Mở luồng dịch vụ"}
        </h2>
        <p className="resq-body mt-3 text-[13px] leading-[21px] text-white/82">
          {isEnglish
            ? "See how the request flow was shortened for both users and fixers."
            : "Xem cách luồng tạo yêu cầu đã được rút gọn cho cả người dùng lẫn fixer."}
        </p>
      </Link>
    </div>
  );
}

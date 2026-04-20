import { useState } from "react";
import { ChevronDown, ChevronUp, PhoneCall, ShieldAlert } from "lucide-react";
import { useLanguage } from "../LanguageContext";
import {
  emergencyLines,
  getLocalizedText,
  localSupportPlaces,
} from "../emergencyContent";

export default function MobileHelpPage() {
  const { language } = useLanguage();
  const isEnglish = language === "en";
  const [openIndex, setOpenIndex] = useState(0);

  const faqs = isEnglish
    ? [
        {
          q: "How does ResQ work in an emergency?",
          a: "Choose the support type, confirm the location, and send the request. Dispatch routes the nearest fixer and updates ETA in tracking.",
        },
        {
          q: "What if GPS is weak?",
          a: "Re-pin the location and add a landmark before sending so the fixer starts from the right pickup point.",
        },
        {
          q: "When should I call the hotline?",
          a: "Call when you feel unsafe, the phone battery is low, or you want a dispatcher to choose the right support for you.",
        },
      ]
    : [
        {
          q: "ResQ hoạt động ra sao trong tình huống khẩn cấp?",
          a: "Bạn chọn dịch vụ, xác nhận vị trí và gửi yêu cầu. Điều phối sẽ tìm fixer gần nhất và cập nhật ETA trong màn theo dõi.",
        },
        {
          q: "Nếu GPS yếu thì sao?",
          a: "Hãy ghim lại vị trí và thêm cột mốc trước khi gửi để fixer bắt đầu từ đúng điểm đón.",
        },
        {
          q: "Khi nào nên gọi hotline?",
          a: "Hãy gọi nếu bạn thấy không an toàn, pin yếu hoặc muốn điều phối chọn đúng loại hỗ trợ giúp bạn.",
        },
      ];

  return (
    <div className="space-y-5 pb-5">
      <section className="rounded-[30px] bg-[linear-gradient(135deg,#fff4ef_0%,#ffe7df_100%)] px-5 py-5 shadow-[0_18px_40px_rgba(8,11,13,0.06)]">
        <p className="resq-eyebrow text-[#99a1af]">
          {isEnglish ? "Support / Safety" : "Hỗ trợ / An toàn"}
        </p>
        <h1 className="resq-display mt-3 text-[34px] leading-[0.92] font-[700] tracking-[-0.05em] text-[#080b0d]">
          {isEnglish ? "Emergency numbers and local places, right on mobile." : "Đầu số khẩn cấp và điểm hỗ trợ gần, ngay trên mobile."}
        </h1>
        <p className="resq-body mt-3 max-w-[310px] text-[13px] leading-[21px] text-[#667085]">
          {isEnglish
            ? "This screen now keeps the most important things together: call lines, local references, and short safety guidance."
            : "Màn này giờ gom những gì quan trọng nhất lại với nhau: đầu số gọi nhanh, điểm hỗ trợ gần và hướng dẫn an toàn ngắn gọn."}
        </p>
      </section>

      <a
        href="tel:19001234"
        className="block rounded-[26px] bg-[#ee3224] px-5 py-5 text-white no-underline shadow-[0_18px_40px_rgba(238,50,36,0.28)]"
      >
        <p className="resq-eyebrow text-white/72">
          {isEnglish ? "Primary action" : "Hành động chính"}
        </p>
        <h2 className="resq-display mt-3 text-[30px] leading-[0.92] font-[700] tracking-[-0.04em]">
          {isEnglish ? "Call ResQ dispatch" : "Gọi điều phối ResQ"}
        </h2>
        <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/14 px-4 py-2">
          <PhoneCall size={14} />
          <span className="resq-mono text-[10px] uppercase tracking-[0.18em]">1900 1234</span>
        </div>
      </a>

      <section className="rounded-[26px] bg-white/92 p-4 shadow-[0_18px_40px_rgba(8,11,13,0.06)]">
        <div className="mb-4">
          <p className="resq-eyebrow text-[#99a1af]">
            {isEnglish ? "Emergency numbers" : "Đầu số khẩn cấp"}
          </p>
          <h2 className="resq-display mt-2 text-[24px] leading-[1] font-[700] tracking-[-0.04em] text-[#080b0d]">
            {isEnglish ? "Quick call list" : "Danh sách gọi nhanh"}
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {emergencyLines.map((item) => (
            <a
              key={item.number}
              href={`tel:${item.number.replace(/\s+/g, "")}`}
              className="rounded-[22px] bg-[#faf8f5] px-4 py-4 no-underline"
            >
              <p className="resq-eyebrow text-[#99a1af]">
                {getLocalizedText(language, item.label, item.labelEn)}
              </p>
              <p className="resq-display mt-2 text-[26px] leading-none font-[700] text-[#080b0d]">
                {item.number}
              </p>
            </a>
          ))}
        </div>
      </section>

      <section className="rounded-[26px] bg-white/92 p-4 shadow-[0_18px_40px_rgba(8,11,13,0.06)]">
        <div className="mb-4">
          <p className="resq-eyebrow text-[#99a1af]">
            {isEnglish ? "Local places" : "Điểm hỗ trợ gần"}
          </p>
          <h2 className="resq-display mt-2 text-[24px] leading-[1] font-[700] tracking-[-0.04em] text-[#080b0d]">
            {isEnglish ? "Ho Chi Minh City references" : "Tham chiếu tại TP. Hồ Chí Minh"}
          </h2>
        </div>

        <div className="space-y-3">
          {localSupportPlaces.map((place) => (
            <div key={place.title} className="rounded-[22px] border border-black/5 bg-[#faf8f5] px-4 py-4">
              <p className="resq-body text-[13px] font-[800] text-[#080b0d]">
                {getLocalizedText(language, place.title, place.titleEn)}
              </p>
              <p className="resq-body mt-2 text-[12px] leading-[20px] text-[#667085]">
                {getLocalizedText(language, place.address, place.addressEn)}
              </p>
              <a
                href={`tel:${place.phone.replace(/[^\d]/g, "")}`}
                className="resq-mono mt-3 inline-flex rounded-full bg-[#080b0d] px-3 py-2 text-[10px] uppercase tracking-[0.18em] text-white no-underline"
              >
                {place.phone}
              </a>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-[26px] bg-white/92 p-4 shadow-[0_18px_40px_rgba(8,11,13,0.06)]">
        <div className="mb-4">
          <p className="resq-eyebrow text-[#99a1af]">FAQ</p>
          <h2 className="resq-display mt-2 text-[24px] leading-[1] font-[700] tracking-[-0.04em] text-[#080b0d]">
            {isEnglish ? "Fast answers" : "Trả lời nhanh"}
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, index) => {
            const open = openIndex === index;

            return (
              <div key={faq.q} className="rounded-[22px] border border-black/5 bg-[#faf8f5] px-4 py-4">
                <button
                  type="button"
                  onClick={() => setOpenIndex(open ? -1 : index)}
                  className="flex w-full items-start justify-between gap-4 border-0 bg-transparent p-0 text-left"
                >
                  <span className="resq-body text-[13px] font-[800] leading-[21px] text-[#080b0d]">
                    {faq.q}
                  </span>
                  {open ? (
                    <ChevronUp size={18} className="shrink-0 text-[#ee3224]" />
                  ) : (
                    <ChevronDown size={18} className="shrink-0 text-[#667085]" />
                  )}
                </button>
                {open && (
                  <p className="resq-body mt-3 text-[12px] leading-[20px] text-[#667085]">
                    {faq.a}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <section className="rounded-[26px] bg-[#111111] p-4 text-white shadow-[0_18px_40px_rgba(8,11,13,0.16)]">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex size-[44px] items-center justify-center rounded-[18px] bg-white/10">
            <ShieldAlert size={20} className="text-[#ff9b90]" />
          </div>
          <div>
            <p className="resq-eyebrow text-white/56">
              {isEnglish ? "Safety guidance" : "Hướng dẫn an toàn"}
            </p>
            <h2 className="resq-display mt-1 text-[24px] leading-[1] font-[700] tracking-[-0.04em]">
              {isEnglish ? "While waiting" : "Trong lúc chờ"}
            </h2>
          </div>
        </div>
        <div className="space-y-3">
          {(isEnglish
            ? [
                "Turn on hazard lights and move the vehicle to a safer edge if possible.",
                "Do not stand in a live traffic lane while waiting for help.",
                "If there is an injury, call 115 or 112 before continuing with vehicle support.",
              ]
            : [
                "Bật đèn cảnh báo và đưa xe vào vị trí an toàn hơn nếu có thể.",
                "Không đứng giữa làn xe đang lưu thông để chờ hỗ trợ.",
                "Nếu có người bị thương, hãy gọi 115 hoặc 112 trước khi tiếp tục xử lý cứu hộ xe.",
              ]).map((item) => (
            <div key={item} className="rounded-[18px] border border-white/10 bg-white/6 px-3 py-3">
              <p className="resq-body text-[12px] leading-[20px] text-white/82">
                {item}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

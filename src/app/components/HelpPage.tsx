import { useState } from "react";
import { ChevronDown, ChevronUp, Clock3, Mail, MapPin, PhoneCall, ShieldAlert } from "lucide-react";
import { MapEmbed } from "./MapEmbed";
import { useLanguage } from "./LanguageContext";
import {
  emergencyLines,
  getLocalizedText,
  localSupportPlaces,
} from "./emergencyContent";

export default function HelpPage() {
  const { language } = useLanguage();
  const isEnglish = language === "en";
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = isEnglish
    ? [
        {
          q: "How does ResQ work in an urgent roadside situation?",
          a: "Choose the support type, confirm the pinned location, add a short note if needed, and send the request. ResQ then routes it to the nearest available fixer.",
        },
        {
          q: "What if my GPS location is wrong?",
          a: "You can re-pin the pickup point on the map and add a manual landmark before sending the request.",
        },
        {
          q: "When should I call instead of using the form?",
          a: "Call the hotline if you are in immediate danger, your battery is low, or you need help deciding which service is correct.",
        },
        {
          q: "Can I see emergency numbers and nearby support places?",
          a: "Yes. This page now includes essential emergency lines in Vietnam together with reference hospitals and support points in Ho Chi Minh City.",
        },
      ]
    : [
        {
          q: "ResQ hoạt động ra sao trong tình huống khẩn cấp?",
          a: "Bạn chọn đúng dịch vụ, xác nhận vị trí đã ghim, thêm ghi chú ngắn nếu cần rồi gửi yêu cầu. ResQ sẽ điều phối tới fixer gần nhất phù hợp.",
        },
        {
          q: "Nếu GPS của tôi không chính xác thì sao?",
          a: "Bạn có thể ghim lại điểm đón trên bản đồ và thêm cột mốc thủ công trước khi gửi yêu cầu.",
        },
        {
          q: "Khi nào tôi nên gọi hotline thay vì tự tạo yêu cầu?",
          a: "Hãy gọi hotline nếu bạn đang ở tình huống nguy hiểm, pin yếu hoặc chưa chắc dịch vụ nào là phù hợp.",
        },
        {
          q: "Trang này có hiển thị đầu số và điểm hỗ trợ gần không?",
          a: "Có. Bạn sẽ thấy các đầu số khẩn cấp quan trọng tại Việt Nam cùng một số điểm y tế và điều phối tham chiếu tại TP. Hồ Chí Minh.",
        },
      ];

  const supportItems = [
    {
      icon: PhoneCall,
      label: isEnglish ? "Dispatch hotline" : "Hotline điều phối",
      value: "1900 1234",
      href: "tel:19001234",
    },
    {
      icon: Mail,
      label: "Email",
      value: "support@resq.vn",
      href: "mailto:support@resq.vn",
    },
    {
      icon: Clock3,
      label: isEnglish ? "Coverage" : "Khung hỗ trợ",
      value: isEnglish ? "24/7 including holidays" : "24/7 kể cả ngày lễ",
    },
    {
      icon: MapPin,
      label: isEnglish ? "Priority city" : "Thành phố ưu tiên",
      value: isEnglish ? "Ho Chi Minh City" : "TP. Hồ Chí Minh",
    },
  ];

  return (
    <div className="bg-white px-5 pb-16 pt-10 sm:px-8 sm:pb-20 sm:pt-14 lg:px-[84px] xl:px-[120px]">
      <div className="mx-auto max-w-[1240px]">
        <div className="mb-10 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-end">
          <div className="max-w-[760px]">
            <p className="resq-eyebrow text-[#ee3224]">
              {isEnglish ? "Support and safety" : "Hỗ trợ và an toàn"}
            </p>
            <h1 className="resq-display mt-4 text-[42px] leading-[0.94] font-[700] text-[#080b0d] sm:text-[56px]">
              {isEnglish ? "Find the right number before stress finds you." : "Tìm đúng đầu số trước khi áp lực ập tới."}
            </h1>
            <p className="resq-body mt-5 max-w-[640px] text-[17px] leading-[28px] text-[#4e5766]">
              {isEnglish
                ? "The help page now combines FAQ, ResQ dispatch contact, Vietnam emergency numbers, and local support references in one calmer layout."
                : "Trang trợ giúp giờ gom FAQ, hotline điều phối ResQ, đầu số khẩn cấp tại Việt Nam và các điểm hỗ trợ địa phương vào cùng một bố cục dễ quét hơn."}
            </p>
          </div>

          <div className="rounded-[26px] border border-[#f3d3cf] bg-[linear-gradient(180deg,#fff6f4_0%,#fffdfb_100%)] p-5 shadow-[0_20px_50px_rgba(8,11,13,0.05)]">
            <p className="resq-eyebrow text-[#99a1af]">
              {isEnglish ? "Fastest action" : "Hành động nhanh nhất"}
            </p>
            <a
              href="tel:19001234"
              className="mt-4 inline-flex items-center gap-3 rounded-full bg-[#ee3224] px-5 py-3 text-white no-underline shadow-[0_20px_44px_rgba(238,50,36,0.18)]"
            >
              <PhoneCall size={18} />
              <span className="resq-mono text-[12px] font-[500] uppercase tracking-[0.18em]">
                {isEnglish ? "Call 1900 1234" : "Gọi 1900 1234"}
              </span>
            </a>
            <p className="resq-body mt-4 text-[14px] leading-[23px] text-[#5e6775]">
              {isEnglish
                ? "Use the hotline when you need a person to route the issue for you, or when it is unsafe to keep filling in a form."
                : "Dùng hotline khi bạn cần một người điều phối giúp ngay, hoặc khi không còn an toàn để tiếp tục thao tác điền form."}
            </p>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
          <div className="space-y-8">
            <section className="rounded-[28px] border border-black/6 bg-white p-6 shadow-[0_18px_50px_rgba(8,11,13,0.04)] sm:p-8">
              <div className="mb-6">
                <p className="resq-eyebrow text-[#99a1af]">
                  {isEnglish ? "Emergency numbers" : "Đầu số khẩn cấp"}
                </p>
                <h2 className="resq-display mt-3 text-[32px] leading-[0.96] font-[700] text-[#080b0d]">
                  {isEnglish ? "Essential numbers for Vietnam" : "Những đầu số cần nhớ tại Việt Nam"}
                </h2>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {emergencyLines.map((item) => (
                  <a
                    key={item.number}
                    href={`tel:${item.number.replace(/\s+/g, "")}`}
                    className="rounded-[24px] border border-black/6 bg-[#fffaf7] px-4 py-4 no-underline"
                  >
                    <p className="resq-eyebrow text-[#99a1af]">
                      {getLocalizedText(language, item.label, item.labelEn)}
                    </p>
                    <p className="resq-display mt-3 text-[30px] leading-none font-[700] text-[#080b0d]">
                      {item.number}
                    </p>
                    <p className="resq-body mt-2 text-[13px] leading-[21px] text-[#667085]">
                      {getLocalizedText(language, item.note, item.noteEn)}
                    </p>
                  </a>
                ))}
              </div>
            </section>

            <section className="rounded-[28px] border border-black/6 bg-white p-6 shadow-[0_18px_50px_rgba(8,11,13,0.04)] sm:p-8">
              <div className="mb-6">
                <p className="resq-eyebrow text-[#99a1af]">
                  {isEnglish ? "Local support places" : "Điểm hỗ trợ gần"}
                </p>
                <h2 className="resq-display mt-3 text-[32px] leading-[0.96] font-[700] text-[#080b0d]">
                  {isEnglish ? "Ho Chi Minh City quick references" : "Các điểm tham chiếu nhanh tại TP. Hồ Chí Minh"}
                </h2>
              </div>

              <div className="space-y-4">
                {localSupportPlaces.map((place) => (
                  <div key={place.title} className="rounded-[24px] bg-[#faf8f5] px-5 py-5">
                    <p className="resq-body text-[16px] font-[800] text-[#080b0d]">
                      {getLocalizedText(language, place.title, place.titleEn)}
                    </p>
                    <p className="resq-body mt-2 text-[14px] leading-[23px] text-[#5d6574]">
                      {getLocalizedText(language, place.address, place.addressEn)}
                    </p>
                    <div className="mt-4 flex flex-wrap items-center gap-3">
                      <a
                        href={`tel:${place.phone.replace(/[^\d]/g, "")}`}
                        className="resq-mono inline-flex rounded-full bg-[#080b0d] px-3 py-2 text-[11px] uppercase tracking-[0.16em] text-white no-underline"
                      >
                        {place.phone}
                      </a>
                      <p className="resq-body text-[13px] leading-[21px] text-[#667085]">
                        {getLocalizedText(language, place.note, place.noteEn)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-[28px] border border-black/6 bg-white p-6 shadow-[0_18px_50px_rgba(8,11,13,0.04)] sm:p-8">
              <div className="mb-6">
                <p className="resq-eyebrow text-[#99a1af]">FAQ</p>
                <h2 className="resq-display mt-3 text-[32px] leading-[0.96] font-[700] text-[#080b0d]">
                  {isEnglish ? "What people need to know fast" : "Những gì người dùng cần biết thật nhanh"}
                </h2>
              </div>

              {faqs.map((faq, index) => (
                <div key={faq.q} className="border-b border-black/6 last:border-b-0">
                  <button
                    type="button"
                    onClick={() => setOpenIndex(openIndex === index ? null : index)}
                    className="flex w-full items-start justify-between gap-4 border-0 bg-transparent py-5 text-left cursor-pointer"
                  >
                    <span className="resq-body pr-4 text-[16px] font-[700] leading-[26px] text-[#080b0d]">
                      {faq.q}
                    </span>
                    {openIndex === index ? (
                      <ChevronUp size={20} className="shrink-0 text-[#ee3224]" />
                    ) : (
                      <ChevronDown size={20} className="shrink-0 text-[#667085]" />
                    )}
                  </button>
                  {openIndex === index && (
                    <p className="resq-body pb-5 text-[15px] leading-[25px] text-[#5d6574]">
                      {faq.a}
                    </p>
                  )}
                </div>
              ))}
            </section>
          </div>

          <aside className="space-y-6 lg:sticky lg:top-[108px]">
            <div className="rounded-[28px] bg-[#111111] p-6 text-white shadow-[0_24px_60px_rgba(8,11,13,0.14)] sm:p-7">
              <div className="flex items-center gap-3">
                <div className="flex size-[44px] items-center justify-center rounded-[18px] bg-white/10">
                  <ShieldAlert size={20} className="text-[#ff9b90]" />
                </div>
                <div>
                  <p className="resq-eyebrow text-white/56">
                    {isEnglish ? "Safety while waiting" : "Giữ an toàn khi chờ"}
                  </p>
                  <h3 className="resq-display mt-1 text-[24px] leading-none font-[700]">
                    {isEnglish ? "Hold your spot safely" : "Giữ vị trí an toàn"}
                  </h3>
                </div>
              </div>

              <div className="mt-5 space-y-3">
                {(isEnglish
                  ? [
                      "Turn on hazard lights and move the vehicle off the traffic lane if it is safe to do so.",
                      "Keep the phone reachable so the fixer or dispatch can call you without delay.",
                      "If anyone is injured, call 115 or 112 before continuing with vehicle support.",
                    ]
                  : [
                      "Bật đèn cảnh báo và đưa xe vào lề nếu điều kiện giao thông cho phép.",
                      "Giữ điện thoại luôn nghe được để fixer hoặc điều phối gọi tới ngay.",
                      "Nếu có người bị thương, hãy gọi 115 hoặc 112 trước khi tiếp tục xử lý cứu hộ xe.",
                    ]).map((item) => (
                  <div key={item} className="rounded-[20px] border border-white/10 bg-white/6 px-4 py-4">
                    <p className="resq-body text-[14px] leading-[23px] text-white/84">
                      {item}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[28px] border border-black/6 bg-white shadow-[0_18px_50px_rgba(8,11,13,0.04)]">
              <div className="p-6 sm:p-7">
                <h3 className="resq-display text-[26px] leading-[0.96] font-[700] text-[#080b0d]">
                  {isEnglish ? "Reference map" : "Bản đồ tham chiếu"}
                </h3>
                <p className="resq-body mt-3 text-[14px] leading-[23px] text-[#5e6775]">
                  {isEnglish
                    ? "A quick view of the city area ResQ is currently prioritizing for dispatch."
                    : "Góc nhìn nhanh về khu vực thành phố mà ResQ đang ưu tiên điều phối."}
                </p>
              </div>
              <MapEmbed
                className="h-[280px] rounded-none border-0 shadow-none"
                lat={10.7769}
                lng={106.7009}
                zoom={12}
                label={isEnglish ? "ResQ priority corridor" : "Cụm ưu tiên của ResQ"}
                description={
                  isEnglish
                    ? "Inner-city dispatch, Thu Duc access, and major road links."
                    : "Điều phối nội đô, cửa ngõ Thủ Đức và các trục đường lớn."
                }
              />
            </div>

            <div className="rounded-[28px] border border-[#f3d3cf] bg-[linear-gradient(180deg,#fff6f4_0%,#fffdfb_100%)] p-6 shadow-[0_18px_50px_rgba(8,11,13,0.04)] sm:p-7">
              <div className="space-y-4">
                {supportItems.map((item) => {
                  const Icon = item.icon;
                  const content = (
                    <div className="flex items-start gap-4 rounded-[20px] bg-white px-4 py-4">
                      <div className="mt-1 flex size-[40px] shrink-0 items-center justify-center rounded-full bg-[rgba(238,50,36,0.1)]">
                        <Icon size={18} className="text-[#ee3224]" />
                      </div>
                      <div className="min-w-0">
                        <p className="resq-eyebrow text-[#99a1af]">{item.label}</p>
                        <p className="resq-body mt-2 text-[15px] font-[800] leading-[22px] text-[#080b0d]">
                          {item.value}
                        </p>
                      </div>
                    </div>
                  );

                  return item.href ? (
                    <a key={item.label} href={item.href} className="block no-underline">
                      {content}
                    </a>
                  ) : (
                    <div key={item.label}>{content}</div>
                  );
                })}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

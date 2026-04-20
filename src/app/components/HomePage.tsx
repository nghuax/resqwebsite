import { Link } from "react-router";
import { ArrowRight, Gauge, MapPin, PhoneCall, ShieldAlert, Wrench } from "lucide-react";
import { MapEmbed } from "./MapEmbed";
import { useLanguage } from "./LanguageContext";
import {
  emergencyLines,
  getLocalizedText,
  localSupportPlaces,
} from "./emergencyContent";

const sectionPadding = "px-5 sm:px-8 lg:px-[84px] xl:px-[120px]";
const sectionShell = "mx-auto w-full max-w-[1240px]";

function HeroSection() {
  const { language } = useLanguage();
  const isEnglish = language === "en";
  const featuredLines = emergencyLines.slice(0, 3);

  return (
    <section className="border-b border-black/5 bg-[linear-gradient(180deg,#fffaf6_0%,#fff4ef_42%,#ffffff_100%)]">
      <div className={`${sectionPadding} pb-10 pt-10 sm:pb-12 sm:pt-14 lg:pb-[64px] lg:pt-[72px]`}>
        <div className={`${sectionShell} grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_480px] lg:items-center lg:gap-12`}>
          <div className="max-w-[640px]">
            <p className="resq-eyebrow mb-4 text-[#ee3224]">
              {isEnglish ? "Roadside help across Vietnam" : "Cứu hộ giao thông toàn quốc"}
            </p>
            <h1 className="resq-display text-[42px] leading-[0.94] font-[700] text-[#080b0d] sm:text-[56px] lg:text-[68px]">
              {isEnglish ? "One clear action when the road stops you." : "Một nút rõ ràng khi bạn gặp sự cố giữa đường."}
            </h1>
            <p className="resq-body mt-5 max-w-[560px] text-[17px] leading-[28px] text-[#4e5766]">
              {isEnglish
                ? "ResQ keeps the urgent flow short: choose the support you need, pin the spot, and let local dispatch take over."
                : "ResQ rút gọn luồng khẩn cấp: chọn đúng hỗ trợ, ghim vị trí, rồi để hệ thống điều phối gần bạn tiếp quản phần còn lại."}
            </p>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
              <Link
                to="/dich-vu"
                className="inline-flex h-[56px] items-center justify-center gap-2 rounded-full bg-[#ee3224] px-7 no-underline shadow-[0_20px_44px_rgba(238,50,36,0.18)] transition-colors hover:bg-[#d42b1e]"
              >
                <span className="resq-mono text-[12px] font-[500] uppercase tracking-[0.18em] text-white">
                  {isEnglish ? "Request support" : "Gọi cứu hộ ngay"}
                </span>
                <ArrowRight size={16} className="text-white" />
              </Link>
              <a
                href="tel:19001234"
                className="inline-flex items-center gap-3 text-[#080b0d] no-underline"
              >
                <span className="flex size-[42px] items-center justify-center rounded-full border border-black/10 bg-white">
                  <PhoneCall size={16} className="text-[#ee3224]" />
                </span>
                <span className="resq-body text-[15px] font-[700]">
                  {isEnglish ? "Emergency line 1900 1234" : "Hotline khẩn cấp 1900 1234"}
                </span>
              </a>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {featuredLines.map((item) => (
                <a
                  key={item.number}
                  href={`tel:${item.number.replace(/\s+/g, "")}`}
                  className="rounded-[20px] border border-black/6 bg-white/82 px-4 py-4 no-underline shadow-[0_14px_32px_rgba(8,11,13,0.04)]"
                >
                  <p className="resq-eyebrow text-[#99a1af]">
                    {getLocalizedText(language, item.label, item.labelEn)}
                  </p>
                  <p className="resq-display mt-3 text-[26px] leading-none font-[700] text-[#080b0d]">
                    {item.number}
                  </p>
                  <p className="resq-body mt-2 text-[13px] leading-[20px] text-[#667085]">
                    {getLocalizedText(language, item.note, item.noteEn)}
                  </p>
                </a>
              ))}
            </div>
          </div>

          <div className="rounded-[30px] border border-black/6 bg-white p-4 shadow-[0_28px_70px_rgba(8,11,13,0.08)]">
            <MapEmbed
              className="min-h-[360px] w-full"
              lat={10.7769}
              lng={106.7009}
              label={isEnglish ? "ResQ dispatch coverage in Ho Chi Minh City" : "Mạng lưới điều phối ResQ tại TP. Hồ Chí Minh"}
              description={
                isEnglish
                  ? "Priority support across inner districts, Thu Duc, and major road corridors."
                  : "Vùng hỗ trợ ưu tiên tại nội đô, Thủ Đức và các trục đường lớn."
              }
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function MetricsSection() {
  const { language } = useLanguage();
  const isEnglish = language === "en";
  const metrics = [
    {
      value: "15-30",
      suffix: isEnglish ? "min" : "phút",
      label: isEnglish ? "Average response window" : "Khung phản hồi trung bình",
    },
    {
      value: "24/7",
      suffix: "",
      label: isEnglish ? "Always-on dispatch" : "Điều phối liên tục",
    },
    {
      value: "2",
      suffix: isEnglish ? "steps" : "bước",
      label: isEnglish ? "User request flow" : "Luồng tạo yêu cầu",
    },
    {
      value: "2",
      suffix: isEnglish ? "actions" : "thao tác",
      label: isEnglish ? "Fixer acceptance flow" : "Luồng fixer xác nhận",
    },
  ];

  return (
    <section className={`${sectionPadding} py-8 sm:py-10`}>
      <div className={`${sectionShell} grid gap-4 border-y border-black/6 py-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6 lg:py-7`}>
        {metrics.map((metric) => (
          <div key={metric.label}>
            <p className="resq-display text-[34px] leading-none font-[700] text-[#080b0d]">
              {metric.value}
              {metric.suffix && (
                <span className="resq-body ml-2 text-[16px] font-[700] text-[#667085]">
                  {metric.suffix}
                </span>
              )}
            </p>
            <p className="resq-body mt-3 text-[14px] leading-[22px] text-[#586172]">
              {metric.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

function ServicesSection() {
  const { language } = useLanguage();
  const isEnglish = language === "en";
  const services = [
    {
      title: isEnglish ? "On-site repair" : "Sửa xe tận nơi",
      desc: isEnglish
        ? "For punctures, battery issues, engine checks, and common roadside faults."
        : "Cho vá lốp, ắc quy, lỗi điện và các sự cố thường gặp ngay trên đường.",
      icon: Wrench,
    },
    {
      title: isEnglish ? "Fuel delivery" : "Tiếp nhiên liệu",
      desc: isEnglish
        ? "A short, clear flow when you run out of fuel and need to move again quickly."
        : "Luồng gọi ngắn gọn khi bạn hết xăng và cần đi tiếp ngay.",
      icon: Gauge,
    },
    {
      title: isEnglish ? "Towing and recovery" : "Kéo xe và cứu hộ",
      desc: isEnglish
        ? "Dispatch a recovery vehicle when on-site repair is no longer the right option."
        : "Điều phối xe cứu hộ khi sửa tại chỗ không còn là lựa chọn phù hợp.",
      icon: ShieldAlert,
    },
    {
      title: isEnglish ? "Location-first support" : "Định vị làm trung tâm",
      desc: isEnglish
        ? "Pin the exact pickup point so the fixer starts with the right place, not another phone call."
        : "Ghim đúng điểm đón để fixer bắt đầu từ vị trí chính xác, không phải từ một cuộc gọi vòng vo.",
      icon: MapPin,
    },
  ];

  return (
    <section className={`${sectionPadding} py-10 sm:py-12 lg:py-[52px]`}>
      <div className={`${sectionShell} grid gap-8 lg:grid-cols-[320px_minmax(0,1fr)] lg:gap-12`}>
        <div>
          <p className="resq-eyebrow text-[#ee3224]">
            {isEnglish ? "What the product does" : "ResQ xử lý điều gì"}
          </p>
          <h2 className="resq-display mt-4 text-[36px] leading-[0.96] font-[700] text-[#080b0d] sm:text-[44px]">
            {isEnglish ? "Fewer choices, faster decisions." : "Ít lựa chọn thừa, quyết định nhanh hơn."}
          </h2>
          <p className="resq-body mt-4 text-[16px] leading-[27px] text-[#586172]">
            {isEnglish
              ? "Each service is written to be scanned in seconds, not read like a brochure."
              : "Mỗi dịch vụ được viết để người dùng quét nhanh trong vài giây, không phải đọc như brochure dài."}
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {services.map((service) => {
            const Icon = service.icon;

            return (
              <div
                key={service.title}
                className="rounded-[24px] border border-black/6 bg-[#fffaf7] px-5 py-5"
              >
                <div className="flex size-[48px] items-center justify-center rounded-[18px] bg-[rgba(238,50,36,0.08)]">
                  <Icon size={20} className="text-[#ee3224]" />
                </div>
                <h3 className="resq-display mt-5 text-[24px] leading-[0.96] font-[700] text-[#080b0d]">
                  {service.title}
                </h3>
                <p className="resq-body mt-3 text-[15px] leading-[25px] text-[#5a6372]">
                  {service.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function FlowSection() {
  const { language } = useLanguage();
  const isEnglish = language === "en";
  const flows = [
    {
      title: isEnglish ? "For users" : "Cho người dùng",
      eyebrow: isEnglish ? "2 steps" : "2 bước",
      steps: isEnglish
        ? [
            "Choose the help type and confirm the pinned location.",
            "Send the request and move straight to live tracking.",
          ]
        : [
            "Chọn đúng dịch vụ và xác nhận vị trí đã ghim.",
            "Gửi yêu cầu rồi chuyển thẳng sang màn theo dõi trực tiếp.",
          ],
    },
    {
      title: isEnglish ? "For fixers" : "Cho fixer",
      eyebrow: isEnglish ? "2 actions" : "2 thao tác",
      steps: isEnglish
        ? [
            "Open the incoming request with the vehicle and location already attached.",
            "Accept the job and continue on the dispatch timeline.",
          ]
        : [
            "Mở đơn mới với xe, vị trí và ghi chú đã được gắn sẵn.",
            "Xác nhận đơn rồi tiếp tục xử lý ngay trong luồng quá trình.",
          ],
    },
  ];

  return (
    <section className={`${sectionPadding} py-10 sm:py-12 lg:py-[56px]`}>
      <div className={`${sectionShell} rounded-[32px] bg-[#111111] px-6 py-7 text-white shadow-[0_28px_70px_rgba(8,11,13,0.18)] sm:px-8 sm:py-8 lg:px-10`}>
        <p className="resq-eyebrow text-white/56">
          {isEnglish ? "Reduced flow" : "Luồng được rút gọn"}
        </p>
        <h2 className="resq-display mt-4 max-w-[760px] text-[34px] leading-[0.95] font-[700] sm:text-[44px]">
          {isEnglish
            ? "The website now tells a simpler story on both sides of the request."
            : "Website giờ kể rõ một câu chuyện ngắn gọn hơn cho cả hai phía của đơn cứu hộ."}
        </h2>

        <div className="mt-8 grid gap-5 lg:grid-cols-2">
          {flows.map((flow) => (
            <div key={flow.title} className="rounded-[24px] border border-white/10 bg-white/6 px-5 py-5">
              <p className="resq-eyebrow text-white/56">{flow.eyebrow}</p>
              <h3 className="resq-display mt-3 text-[26px] leading-none font-[700]">
                {flow.title}
              </h3>
              <div className="mt-5 space-y-3">
                {flow.steps.map((step, index) => (
                  <div key={step} className="flex gap-3">
                    <span className="resq-mono mt-0.5 inline-flex size-[26px] shrink-0 items-center justify-center rounded-full bg-white text-[11px] font-[700] text-[#080b0d]">
                      {index + 1}
                    </span>
                    <p className="resq-body text-[15px] leading-[25px] text-white/84">
                      {step}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function EmergencySection() {
  const { language } = useLanguage();
  const isEnglish = language === "en";

  return (
    <section className={`${sectionPadding} py-10 sm:py-12 lg:py-[56px]`}>
      <div className={`${sectionShell} grid gap-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:gap-10`}>
        <div>
          <p className="resq-eyebrow text-[#ee3224]">
            {isEnglish ? "Emergency essentials" : "Khẩn cấp cần gì"}
          </p>
          <h2 className="resq-display mt-4 text-[36px] leading-[0.96] font-[700] text-[#080b0d] sm:text-[44px]">
            {isEnglish ? "Local places and numbers, not just a hotline." : "Có cả địa điểm gần và đầu số cần gọi, không chỉ mỗi hotline."}
          </h2>
          <p className="resq-body mt-4 text-[16px] leading-[27px] text-[#586172]">
            {isEnglish
              ? "In an emergency, the help page now surfaces essential Vietnam emergency numbers alongside nearby medical or dispatch reference points in Ho Chi Minh City."
              : "Khi khẩn cấp, trang trợ giúp giờ hiển thị cả đầu số khẩn cấp tại Việt Nam lẫn các điểm y tế hoặc điều phối tham chiếu gần bạn ở TP. Hồ Chí Minh."}
          </p>
        </div>

        <div className="grid gap-4">
          <div className="grid gap-4 md:grid-cols-2">
            {emergencyLines.map((line) => (
              <a
                key={line.number}
                href={`tel:${line.number.replace(/\s+/g, "")}`}
                className="rounded-[24px] border border-black/6 bg-white px-4 py-4 no-underline shadow-[0_18px_40px_rgba(8,11,13,0.05)]"
              >
                <p className="resq-eyebrow text-[#99a1af]">
                  {getLocalizedText(language, line.label, line.labelEn)}
                </p>
                <p className="resq-display mt-3 text-[28px] leading-none font-[700] text-[#080b0d]">
                  {line.number}
                </p>
                <p className="resq-body mt-2 text-[13px] leading-[21px] text-[#667085]">
                  {getLocalizedText(language, line.note, line.noteEn)}
                </p>
              </a>
            ))}
          </div>

          <div className="rounded-[24px] border border-black/6 bg-[#fffaf7] px-5 py-5">
            <p className="resq-eyebrow text-[#99a1af]">
              {isEnglish ? "Nearby support points" : "Điểm hỗ trợ gần"}
            </p>
            <div className="mt-4 space-y-4">
              {localSupportPlaces.map((place) => (
                <div key={place.title} className="border-t border-black/6 pt-4 first:border-t-0 first:pt-0">
                  <p className="resq-body text-[16px] font-[800] text-[#080b0d]">
                    {getLocalizedText(language, place.title, place.titleEn)}
                  </p>
                  <p className="resq-body mt-2 text-[14px] leading-[22px] text-[#5d6574]">
                    {getLocalizedText(language, place.address, place.addressEn)}
                  </p>
                  <div className="mt-3 flex flex-wrap items-center gap-3">
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
          </div>
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  const { language } = useLanguage();
  const isEnglish = language === "en";

  return (
    <section className={`${sectionPadding} pb-14 pt-4 sm:pb-16 lg:pb-[72px]`}>
      <div className={`${sectionShell} rounded-[30px] bg-[linear-gradient(135deg,#151412_0%,#221917_52%,#31211d_100%)] px-6 py-8 text-white sm:px-8 sm:py-9 lg:px-10`}>
        <p className="resq-eyebrow text-white/56">
          {isEnglish ? "Ready now" : "Sẵn sàng"}
        </p>
        <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-[720px]">
            <h2 className="resq-display text-[34px] leading-[0.95] font-[700] sm:text-[44px]">
              {isEnglish ? "Open the request flow when you need it, not before." : "Mở đúng luồng cứu hộ khi bạn thật sự cần, không phải trước đó."}
            </h2>
            <p className="resq-body mt-4 text-[16px] leading-[27px] text-white/76">
              {isEnglish
                ? "The main emphasis stays on one action: start the support request. Everything else can stay quieter."
                : "Điểm nhấn chính chỉ còn một hành động: bắt đầu yêu cầu cứu hộ. Những thứ còn lại được giữ yên hơn để người dùng đỡ phân tâm."}
            </p>
          </div>

          <Link
            to="/dich-vu"
            className="inline-flex h-[54px] items-center justify-center gap-2 rounded-full border border-white/18 bg-white px-7 no-underline transition-colors hover:bg-[#f2f2f2]"
          >
            <span className="resq-mono text-[12px] font-[500] uppercase tracking-[0.18em] text-[#080b0d]">
              {isEnglish ? "Open services" : "Mở danh mục dịch vụ"}
            </span>
            <ArrowRight size={16} className="text-[#080b0d]" />
          </Link>
        </div>
      </div>
    </section>
  );
}

export default function HomePage() {
  return (
    <div className="overflow-x-hidden bg-white">
      <HeroSection />
      <MetricsSection />
      <ServicesSection />
      <FlowSection />
      <EmergencySection />
      <CTASection />
    </div>
  );
}

import { Link } from "react-router";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { ResQLogoShowcase } from "./ResQLogoShowcase";
import { useLanguage } from "./LanguageContext";

const pagePadding = "px-5 sm:px-8 lg:px-[84px] xl:px-[120px]";
const pageShell = "mx-auto w-full max-w-[1240px]";

const IMG_REPAIR =
  "https://images.unsplash.com/photo-1663676128186-ddd0755f38db?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb3RvcmN5Y2xlJTIwcmVwYWlyJTIwbWVjaGFuaWMlMjB2aWV0bmFtfGVufDF8fHx8MTc3NTExNjc3NXww&ixlib=rb-4.1.0&q=80&w=1080";
const IMG_FUEL =
  "https://images.unsplash.com/photo-1711376643436-ab5e03732c75?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmdWVsJTIwZGVsaXZlcnklMjBnYXNvbGluZSUyMGNhbmlzdGVyfGVufDF8fHx8MTc3NTExNjc3NXww&ixlib=rb-4.1.0&q=80&w=1080";

export default function AboutPage() {
  const { language } = useLanguage();
  const isEnglish = language === "en";

  const stories = [
    {
      title: isEnglish ? "Built for urgent roadside moments" : "Thiết kế cho những phút căng thẳng trên đường",
      image: IMG_REPAIR,
      alt: isEnglish ? "Roadside repair" : "Sửa xe tận nơi",
      reverse: false,
      body: isEnglish
        ? [
            "ResQ was shaped around the moment when someone is already under pressure. That means less menu noise, fewer highlighted buttons, and faster decisions.",
            "The product keeps the important context close: vehicle, pinned location, service type, live tracking, and the numbers people may need in a real emergency.",
          ]
        : [
            "ResQ được thiết kế từ khoảnh khắc người dùng đã bắt đầu căng thẳng. Vì vậy giao diện ưu tiên ít nhiễu hơn, ít nút nổi bật hơn và ra quyết định nhanh hơn.",
            "Sản phẩm giữ những gì quan trọng ở gần nhau: xe đã chọn, vị trí ghim, loại hỗ trợ, theo dõi trực tiếp và các đầu số cần dùng khi thật sự khẩn cấp.",
          ],
    },
    {
      title: isEnglish ? "Local dispatch, not generic assistance" : "Điều phối địa phương, không phải hỗ trợ chung chung",
      image: IMG_FUEL,
      alt: isEnglish ? "Fuel delivery" : "Tiếp nhiên liệu",
      reverse: true,
      body: isEnglish
        ? [
            "The service mix is tuned for Vietnam-first roadside problems: motorbikes, cars, flat tires, fuel delivery, battery issues, towing, and fast local routing.",
            "We also shortened the story for both sides of the job: users start a request in fewer steps, while fixers receive cleaner request details and confirm faster.",
          ]
        : [
            "Danh mục dịch vụ được tinh chỉnh cho bối cảnh giao thông tại Việt Nam: xe máy, ô tô, vá lốp, tiếp nhiên liệu, ắc quy, kéo xe và điều phối nhanh theo địa phương.",
            "Chúng tôi cũng rút ngắn câu chuyện ở cả hai phía của đơn hàng: người dùng tạo yêu cầu ít bước hơn, còn fixer nhận đủ thông tin và xác nhận nhanh hơn.",
          ],
    },
  ];

  return (
    <div className="overflow-x-hidden bg-white">
      <section className={`${pagePadding} pb-12 pt-10 sm:pb-14 sm:pt-14 lg:pb-[60px] lg:pt-[76px]`}>
        <div className={`${pageShell} flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between`}>
          <div className="max-w-[620px]">
            <p className="resq-eyebrow text-[#ee3224]">
              {isEnglish ? "About ResQ" : "Về ResQ"}
            </p>
            <h1 className="resq-display mt-4 text-[44px] leading-[0.92] font-[700] text-[#080b0d] sm:text-[58px]">
              {isEnglish ? "Your vehicle. Clear next step." : "Xe của bạn. Bước tiếp theo rõ ràng."}
            </h1>
            <p className="resq-body mt-5 max-w-[540px] text-[17px] leading-[28px] text-[#4e5766]">
              {isEnglish
                ? "ResQ combines request creation, live tracking, local dispatch, payments, and emergency references in one calmer interface."
                : "ResQ kết nối tạo yêu cầu, theo dõi trực tiếp, điều phối địa phương, thanh toán và tham chiếu khẩn cấp vào cùng một giao diện gọn gàng hơn."}
            </p>
          </div>
          <ResQLogoShowcase className="min-h-[300px] w-full lg:min-h-[321px] lg:max-w-[703px]" />
        </div>
      </section>

      {stories.map((story) => (
        <section key={story.title} className={`${pagePadding} py-8 sm:py-10 lg:py-[44px]`}>
          <div
            className={`${pageShell} flex flex-col gap-8 lg:items-center lg:gap-[64px] ${
              story.reverse ? "lg:flex-row-reverse" : "lg:flex-row"
            }`}
          >
            <div className="h-[300px] w-full overflow-hidden rounded-[24px] sm:h-[360px] lg:h-[340px] lg:max-w-[580px]">
              <ImageWithFallback src={story.image} alt={story.alt} className="h-full w-full object-cover" />
            </div>
            <div className="flex-1">
              <h2 className="resq-display text-[34px] leading-[0.95] font-[700] text-[#080b0d] sm:text-[42px]">
                {story.title}
              </h2>
              <div className="resq-body mt-5 max-w-[560px] space-y-4 text-[16px] leading-[27px] text-[#4f5867]">
                {story.body.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </div>
          </div>
        </section>
      ))}

      <section className={`${pagePadding} py-12 sm:py-14 lg:py-[60px]`}>
        <div className={`${pageShell} rounded-[30px] bg-[#111111] px-6 py-10 text-white sm:px-8 lg:px-12 lg:py-12`}>
          <p className="resq-eyebrow text-white/56">
            {isEnglish ? "Next step" : "Bước tiếp theo"}
          </p>
          <h2 className="resq-display mt-4 text-[36px] leading-[0.94] font-[700] sm:text-[46px]">
            {isEnglish ? "Open the service flow when you want to see the streamlined request journey." : "Mở danh mục dịch vụ để xem rõ luồng tạo yêu cầu đã được tinh giản."}
          </h2>
          <div className="mt-6">
            <Link
              to="/dich-vu"
              className="inline-flex h-[52px] items-center justify-center rounded-full bg-white px-7 no-underline transition-colors hover:bg-[#f4f4f4]"
            >
              <span className="resq-mono text-[12px] font-[500] uppercase tracking-[0.18em] text-[#080b0d]">
                {isEnglish ? "Open services" : "Mở dịch vụ"}
              </span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

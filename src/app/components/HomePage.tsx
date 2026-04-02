import { Link } from "react-router";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { MapEmbed } from "./MapEmbed";
import imgImageWithFallback from "../../imports/TrangChủ/23a68e4ce3fc84f4148aa2f4c9267d3209fa7bfc.png";
import imgImageWithFallback1 from "../../imports/TrangChủ/31f1dab03f634560348c250c12aa5f224a22b5d9.png";

const mono = "font-['IBM_Plex_Mono',monospace]";
const sectionPadding = "px-5 sm:px-8 lg:px-[84px] xl:px-[120px]";
const sectionShell = "mx-auto w-full max-w-[1240px]";

function HeroSection() {
  return (
    <section className={`${sectionPadding} pt-10 pb-10 sm:pt-14 sm:pb-12 lg:pt-[80px] lg:pb-[60px]`}>
      <div className={`${sectionShell} flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between lg:gap-10`}>
        <div className="max-w-[560px]">
          <p className={`${mono} mb-4 text-[12px] font-[500] uppercase tracking-[1.8px] text-[#ee3224] sm:text-[13px]`}>
            Cứu hộ giao thông toàn quốc
          </p>
          <h1 className={`${mono} mb-5 text-[36px] font-[700] leading-[1.12] text-[#080b0d] sm:text-[44px] lg:text-[48px] lg:leading-[67px]`}>
            ResQ hỗ trợ bạn
            <br />
            ở bất kỳ đâu
          </h1>
          <p className={`${mono} mb-8 max-w-[460px] text-[14px] leading-[24px] text-[#4a5565] sm:text-[15px]`}>
            Mạng lưới ResQ phủ sóng toàn quốc, giúp bạn gọi cứu hộ nhanh, theo dõi
            hỗ trợ rõ ràng và an tâm hơn trong mọi tình huống trên đường.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              to="/dich-vu"
              className="inline-flex h-[55px] items-center justify-center rounded-[10px] bg-[#ee3224] px-[32px] no-underline transition-colors hover:bg-[#d42b1e]"
            >
              <span className={`${mono} text-[14px] font-[500] tracking-[1.12px] text-white`}>
                Gọi cứu hộ ngay
              </span>
            </Link>
            <span className={`${mono} text-[12px] text-[#6a7282] sm:text-[13px]`}>
              Phản hồi trung bình trong 15-30 phút
            </span>
          </div>
        </div>
        <MapEmbed
          className="min-h-[300px] w-full lg:min-h-[347px] lg:max-w-[540px]"
          lat={10.7769}
          lng={106.7009}
          label="ResQ tại TP. Hồ Chí Minh"
          description="Theo dõi khu vực hỗ trợ trọng điểm và điều phối fixer gần nhất."
        />
      </div>
    </section>
  );
}

function StatsSection() {
  const stats = [
    { value: "15-30 Phút", label: "Phản hồi, xử lý nhanh", sub: "Tối ưu thao tác,\ntạo yêu cầu nhanh chóng" },
    { value: "24/7", label: "Hỗ trợ mọi lúc", sub: "Điều phối hỗ trợ,\ncập nhật mọi lúc mọi nơi" },
    { value: "200", label: "Garage mọi phân khúc", sub: "Đa dạng lựa chọn cho khách hàng" },
  ];
  return (
    <section className={`${sectionPadding} py-6 sm:py-8 lg:py-[40px]`}>
      <div className={`${sectionShell} grid gap-5 md:grid-cols-3 md:gap-4`}>
        {stats.map((s, i) => (
          <div key={s.value} className="flex flex-col">
            <div className="mb-[16px]">
              <p className={`${mono} text-[36px] font-[700] leading-[1] text-black sm:text-[42px] lg:text-[48px]`}>
                {s.value}
              </p>
              <p className={`${mono} mt-[8px] text-[14px] font-[500] text-black`}>
                {s.label}
              </p>
            </div>
            <div
              className={`flex min-h-[99px] items-center justify-center bg-gradient-to-b from-[#ff493b] to-[#ee3224] px-[24px] ${
                i === 0
                  ? "rounded-[20px] md:rounded-l-[20px] md:rounded-r-[5px]"
                  : i === 2
                    ? "rounded-[20px] md:rounded-l-[5px] md:rounded-r-[20px]"
                    : "rounded-[20px] md:rounded-[5px]"
              }`}
            >
              <p className={`${mono} whitespace-pre-line text-center text-[14px] font-[500] text-white`}>
                {s.sub}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function ServicesSection() {
  const services = [
    { title: "Sửa xe tận nơi", desc: "Thợ sửa xe chuyên nghiệp đến ngay vị trí của bạn" },
    { title: "Giao xăng tận nhà", desc: "Hết xăng giữa đường? Chúng tôi giao ngay" },
    { title: "Thay ắc quy", desc: "Kích bình hoặc thay ắc quy tại chỗ" },
    { title: "Cứu hộ khẩn cấp", desc: "Xe cứu hộ đến nhanh trong 15-30 phút" },
  ];
  return (
    <section className={`${sectionPadding} py-10 sm:py-12 lg:py-[40px]`}>
      <div className={sectionShell}>
        <h2 className={`${mono} mb-10 text-center text-[32px] font-[700] text-[#080b0d] sm:text-[36px] lg:text-[40px]`}>
          Đa Dạng Dịch Vụ
        </h2>
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {services.map((s) => (
            <div
              key={s.title}
              className="h-full min-h-[188px] rounded-[14px] border border-[rgba(0,0,0,0.1)] bg-white p-[24px]"
            >
              <div className="mb-[16px] flex size-[48px] items-center justify-center rounded-[10px] bg-[rgba(238,50,36,0.1)]">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#EE3224" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 6v6l4 2" />
                </svg>
              </div>
              <p className={`${mono} mb-[8px] text-[16px] font-[500] text-[#080b0d]`}>
                {s.title}
              </p>
              <p className={`${mono} text-[13px] leading-[21px] text-[#4a5565]`}>
                {s.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function StepsSection() {
  const steps = [
    { num: "01", title: "Gửi yêu cầu", desc: "Chọn dịch vụ, chia sẻ vị trí và thông tin xe của bạn." },
    { num: "02", title: "Fixer được điều phối", desc: "Hệ thống tự động kết nối với Fixer gần nhất." },
    { num: "03", title: "Xong việc, thanh toán", desc: "Xác nhận hoàn thành, thanh toán và đánh giá." },
  ];
  return (
    <section className={`${sectionPadding} py-10 sm:py-12 lg:py-[40px]`}>
      <div className={sectionShell}>
        <h2 className={`${mono} mb-10 text-center text-[32px] font-[700] text-[#080b0d] sm:text-[36px] lg:text-[40px]`}>
          Các Bước Dễ Dàng
        </h2>
        <div className="grid gap-8 md:grid-cols-3 md:gap-[32px]">
          {steps.map((s) => (
            <div key={s.num} className="flex flex-col items-center text-center">
              <div className="mb-[16px] flex size-[64px] items-center justify-center rounded-full bg-[#ee3224]">
                <span className={`${mono} text-[20px] font-[400] text-white`}>{s.num}</span>
              </div>
              <p className={`${mono} mb-[8px] text-[18px] font-[500] text-[#080b0d]`}>
                {s.title}
              </p>
              <p className={`${mono} max-w-[264px] text-[13px] leading-[21px] text-[#4a5565]`}>
                {s.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function GallerySection() {
  return (
    <section className={`${sectionPadding} py-10 sm:py-12 lg:py-[40px]`}>
      <div className={`${sectionShell} grid gap-5 md:grid-cols-2 md:gap-[32px]`}>
        <div className="h-[280px] overflow-hidden rounded-[14px] sm:h-[340px] lg:h-[389px]">
          <ImageWithFallback
            src={imgImageWithFallback}
            alt="Sửa xe"
            className="h-full w-full object-cover"
          />
        </div>
        <div className="h-[280px] overflow-hidden rounded-[14px] sm:h-[340px] lg:h-[389px]">
          <ImageWithFallback
            src={imgImageWithFallback1}
            alt="Cứu hộ"
            className="h-full w-full object-cover"
          />
        </div>
      </div>
    </section>
  );
}

function ReviewsSection() {
  const reviews = [
    { text: "\"Rất nhanh chóng và chuyên nghiệp. Thợ đến trong 20 phút!\"", name: "Phùng Thanh Độ", car: "Honda Wave", stars: 5 },
    { text: "\"Tiết vụ giá xăng rất tốt, không cần phải lo hết xăng đi.\"", name: "Trần Thị B", car: "Toyota Vios", stars: 5 },
    { text: "\"Giá cả hợp lý, thợ sửa tận tâm. Sẽ dùng lại.\"", name: "Lương Đức Hùng", car: "Ford Fiesta", stars: 4 },
  ];
  return (
    <section className={`${sectionPadding} py-10 sm:py-12 lg:py-[40px]`}>
      <div className={sectionShell}>
        <h2 className={`${mono} mb-10 text-center text-[32px] font-[500] text-[#080b0d] sm:text-[36px] lg:text-[40px]`}>
          Đánh Giá Khách Hàng
        </h2>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {reviews.map((r) => (
            <div
              key={r.name}
              className="rounded-[14px] border border-[rgba(0,0,0,0.05)] bg-white p-[24px]"
            >
              <div className="mb-[12px] flex gap-[4px]">
                {Array.from({ length: r.stars }).map((_, i) => (
                  <svg key={i} width="16" height="16" viewBox="0 0 16 16" fill="#EE3224" stroke="#EE3224" strokeWidth="1.33">
                    <path d="M8 1.33l1.85 3.76 4.15.6-3 2.93.71 4.12L8 10.77l-3.71 1.97.71-4.12-3-2.93 4.15-.6L8 1.33z" />
                  </svg>
                ))}
              </div>
              <p className={`${mono} mb-[16px] text-[13px] leading-[21px] text-[#364153]`}>
                {r.text}
              </p>
              <div className="flex items-center justify-between">
                <span className={`${mono} text-[14px] text-[#080b0d]`}>{r.name}</span>
                <span className={`${mono} text-[12px] text-[#99a1af]`}>{r.car}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section className="bg-[#ee3224] px-5 py-16 sm:px-8 sm:py-20 lg:px-[84px] lg:py-[80px] xl:px-[120px]">
      <div className={`${sectionShell} flex flex-col items-center`}>
        <h2 className={`${mono} mb-8 max-w-[839px] text-center text-[32px] leading-[1.35] font-[500] text-white sm:text-[36px] lg:mb-[40px] lg:text-[40px] lg:leading-[60px]`}>
          Luôn đồng hành cùng bạn trên mọi nẻo đường!
        </h2>
        <Link
          to="/dich-vu"
          className="flex h-[56px] items-center justify-center rounded-[10px] bg-white px-[40px] no-underline transition-colors hover:bg-[#f5f5f5] sm:px-[48px]"
        >
          <span className={`${mono} text-[16px] font-[700] tracking-[0.8px] text-[#ee3224]`}>
            Thử ngay
          </span>
        </Link>
      </div>
    </section>
  );
}

export default function HomePage() {
  return (
    <div className="overflow-x-hidden bg-white">
      <HeroSection />
      <StatsSection />
      <ServicesSection />
      <StepsSection />
      <GallerySection />
      <ReviewsSection />
      <CTASection />
    </div>
  );
}

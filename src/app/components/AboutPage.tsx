import { Link } from "react-router";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { ResQLogoShowcase } from "./ResQLogoShowcase";

const mono = "font-['IBM_Plex_Mono',monospace]";
const pagePadding = "px-5 sm:px-8 lg:px-[84px] xl:px-[120px]";
const pageShell = "mx-auto w-full max-w-[1240px]";

const IMG_REPAIR =
  "https://images.unsplash.com/photo-1663676128186-ddd0755f38db?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb3RvcmN5Y2xlJTIwcmVwYWlyJTIwbWVjaGFuaWMlMjB2aWV0bmFtfGVufDF8fHx8MTc3NTExNjc3NXww&ixlib=rb-4.1.0&q=80&w=1080";
const IMG_FUEL =
  "https://images.unsplash.com/photo-1711376643436-ab5e03732c75?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmdWVsJTIwZGVsaXZlcnklMjBnYXNvbGluZSUyMGNhbmlzdGVyfGVufDF8fHx8MTc3NTExNjc3NXww&ixlib=rb-4.1.0&q=80&w=1080";

const stories = [
  {
    title: "Sửa xe tận nơi",
    image: IMG_REPAIR,
    alt: "Sửa xe tận nơi",
    reverse: false,
    body: [
      "Đội ngũ thợ sửa xe chuyên nghiệp của chúng tôi sẽ đến ngay vị trí của bạn trong thời gian nhanh nhất. Từ vá lốp, thay ắc quy đến sửa chữa động cơ, tất cả đều được xử lý tại chỗ.",
      "Với đội ngũ thợ được đào tạo bài bản và trang bị đầy đủ dụng cụ, chúng tôi cam kết mang đến dịch vụ sửa chữa nhanh chóng, an toàn và đáng tin cậy.",
    ],
  },
  {
    title: "Giao xăng tận nơi",
    image: IMG_FUEL,
    alt: "Giao xăng tận nơi",
    reverse: true,
    body: [
      "Hết xăng giữa đường? Không cần lo lắng. ResQ sẽ giao xăng hoặc dầu diesel đến ngay vị trí của bạn chỉ trong 15-25 phút.",
      "Dịch vụ giao nhiên liệu hoạt động 24/7, giúp bạn tiếp tục hành trình mà không bị gián đoạn, kể cả trong các tình huống khẩn cấp hoặc đêm khuya.",
    ],
  },
];

export default function AboutPage() {
  return (
    <div className="overflow-x-hidden bg-white">
      <section className={`${pagePadding} pt-10 pb-12 sm:pt-14 sm:pb-14 lg:pt-[80px] lg:pb-[60px]`}>
        <div className={`${pageShell} flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between`}>
          <div className="max-w-[560px]">
            <p className={`${mono} mb-4 text-[12px] font-[500] uppercase tracking-[1.8px] text-[#ee3224] sm:text-[13px]`}>
              Về ResQ
            </p>
            <h1 className={`${mono} mb-5 text-[36px] font-[700] leading-[1.12] text-[#080b0d] sm:text-[44px] lg:text-[48px] lg:leading-[67px]`}>
              Xe của bạn,
              <br />
              Việc của tôi.
            </h1>
            <p className={`${mono} max-w-[500px] text-[14px] leading-[24px] text-[#4a5565] sm:text-[15px]`}>
              ResQ kết nối cứu hộ, tiếp nhiên liệu, lưu phương tiện, định vị hiện
              trường và theo dõi fixer trong một giao diện tiếng Việt gọn gàng,
              ưu tiên trải nghiệm di động.
            </p>
          </div>
          <ResQLogoShowcase className="min-h-[300px] w-full lg:min-h-[321px] lg:max-w-[703px]" />
        </div>
      </section>

      <section className={`${pagePadding} py-8 sm:py-10 lg:py-[40px]`}>
        <div className={`${pageShell} max-w-[820px]`}>
          <h2 className={`${mono} mb-6 text-[32px] font-[700] text-[#080b0d] sm:text-[40px] lg:text-[48px]`}>
            Về chúng tôi
          </h2>
          <div className={`${mono} space-y-4 text-[14px] leading-[24px] text-[#080b0d]`}>
            <p>
              Chúng tôi là đội ngũ chuyên cung cấp dịch vụ sửa xe tận nơi, được
              thành lập với mong muốn mang lại sự tiện lợi, nhanh chóng và an tâm
              cho mọi khách hàng khi xe gặp sự cố.
            </p>
            <p>
              Trong cuộc sống bận rộn ngày nay, việc xe hỏng giữa đường hay không
              thể di chuyển đến tiệm sửa chữa là điều không ai mong muốn. Hiểu được
              điều đó, chúng tôi mang dịch vụ sửa chữa chuyên nghiệp đến ngay nơi
              bạn cần, dù bạn đang ở nhà, nơi làm việc hay trên đường.
            </p>
          </div>
        </div>
      </section>

      {stories.map((story) => (
        <section
          key={story.title}
          className={`${pagePadding} py-8 sm:py-10 lg:py-[40px]`}
        >
          <div
            className={`${pageShell} flex flex-col gap-8 lg:items-center lg:gap-[64px] ${
              story.reverse ? "lg:flex-row-reverse" : "lg:flex-row"
            }`}
          >
            <div className="h-[280px] w-full overflow-hidden rounded-[18px] sm:h-[340px] lg:h-[321px] lg:max-w-[580px]">
              <ImageWithFallback
                src={story.image}
                alt={story.alt}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="flex-1">
              <h2 className={`${mono} mb-6 text-[32px] font-[700] text-[#080b0d] sm:text-[40px] lg:text-[48px]`}>
                {story.title}
              </h2>
              <div className={`${mono} mb-8 max-w-[560px] space-y-4 text-[14px] leading-[24px] text-[#080b0d]`}>
                {story.body.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
              <Link
                to="/dich-vu"
                className="inline-flex h-[50px] items-center justify-center rounded-[10px] bg-[#ee3224] px-[32px] no-underline transition-colors hover:bg-[#d42b1e]"
              >
                <span className={`${mono} text-[15px] font-[500] tracking-[1.1px] text-white`}>
                  Thử Ngay
                </span>
              </Link>
            </div>
          </div>
        </section>
      ))}

      <section className={`${pagePadding} py-12 sm:py-14 lg:py-[60px]`}>
        <div className={`${pageShell} rounded-[24px] bg-[#f7f7f8] px-6 py-10 text-center sm:px-8 lg:px-12 lg:py-14`}>
          <h2 className={`${mono} mb-5 text-[32px] font-[700] text-[#080b0d] sm:text-[40px] lg:text-[48px]`}>
            Đồng hành cùng bạn trên mọi nẻo đường
          </h2>
          <p className={`${mono} mx-auto mb-8 max-w-[980px] text-[14px] leading-[24px] text-[#4a5565]`}>
            ResQ luôn sẵn sàng hỗ trợ bạn mọi lúc mọi nơi. Với đội ngũ fixer
            chuyên nghiệp và hệ thống điều phối thông minh, chúng tôi giúp bạn
            an tâm hơn trong mọi tình huống phát sinh trên đường.
          </p>
          <Link
            to="/tro-giup"
            className="inline-flex h-[50px] items-center justify-center rounded-[10px] border border-[#080b0d] px-[28px] no-underline transition-colors hover:bg-[#080b0d] hover:text-white"
          >
            <span className={`${mono} text-[14px] font-[500] text-[#080b0d]`}>
              Tìm hiểu thêm
            </span>
          </Link>
        </div>
      </section>
    </div>
  );
}

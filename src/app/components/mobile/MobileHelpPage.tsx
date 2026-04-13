import { useState } from "react";
import { Link } from "react-router";
import {
  ChevronDown,
  ChevronUp,
  Clock3,
  Mail,
  MapPin,
  PhoneCall,
  ShieldAlert,
} from "lucide-react";

const mono = "font-['IBM_Plex_Mono',monospace]";

const faqs = [
  {
    q: "ResQ hoạt động ra sao trong tình huống khẩn cấp?",
    a: "Bạn chọn dịch vụ, xác nhận vị trí, thêm ghi chú ngắn và gửi yêu cầu. ResQ điều phối fixer gần nhất và cập nhật ETA liên tục trong màn Activity.",
  },
  {
    q: "Nếu GPS của tôi không chính xác thì sao?",
    a: "Bạn có thể ghim lại vị trí trên bản đồ, nhập địa chỉ thủ công hoặc thêm cột mốc ngay trong bước tạo yêu cầu.",
  },
  {
    q: "Khi nào tôi nên gọi hotline thay vì tự tạo yêu cầu?",
    a: "Nếu bạn đang trong tình huống nguy hiểm, pin yếu hoặc không chắc dịch vụ nào phù hợp, hãy gọi hotline để đội ngũ điều phối hỗ trợ ngay.",
  },
  {
    q: "Tôi có thể thanh toán bằng cách nào?",
    a: "MVP hỗ trợ tiền mặt, chuyển khoản hoặc ví điện tử trong luồng thanh toán. Thông tin thanh toán được lưu lại ở lịch sử yêu cầu.",
  },
];

const supportCards = [
  {
    icon: PhoneCall,
    label: "Hotline",
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
    label: "Hỗ trợ",
    value: "24/7 kể cả ngày lễ",
  },
  {
    icon: MapPin,
    label: "Khu vực ưu tiên",
    value: "TP. Hồ Chí Minh và trục liên tỉnh",
  },
];

export default function MobileHelpPage() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <div className="space-y-5 pb-5">
      <section className="rounded-[30px] bg-[linear-gradient(135deg,#fff4ef_0%,#ffe7df_100%)] px-5 py-5 shadow-[0_18px_40px_rgba(8,11,13,0.06)]">
        <p className={`${mono} text-[10px] uppercase tracking-[0.22em] text-[#99a1af]`}>
          Support / Safety
        </p>
        <h1 className="mt-3 font-['Syne',sans-serif] text-[32px] leading-[0.95] font-[700] tracking-[-0.04em] text-[#080b0d]">
          Cần trợ giúp ngay cả khi bạn đang căng thẳng
        </h1>
        <p className={`${mono} mt-3 max-w-[300px] text-[12px] leading-[20px] text-[#667085]`}>
          Các nội dung ở đây được rút gọn để bạn tìm thấy hotline, FAQ và hướng dẫn an toàn chỉ trong vài giây.
        </p>
      </section>

      <section className="grid grid-cols-2 gap-3">
        {supportCards.map((card) => {
          const Icon = card.icon;
          const content = (
            <div className="rounded-[22px] bg-white/92 p-4 shadow-[0_18px_40px_rgba(8,11,13,0.06)]">
              <div className="flex size-[42px] items-center justify-center rounded-[16px] bg-[rgba(238,50,36,0.1)]">
                <Icon size={18} className="text-[#ee3224]" />
              </div>
              <p className={`${mono} mt-4 text-[10px] uppercase tracking-[0.18em] text-[#99a1af]`}>
                {card.label}
              </p>
              <p className="mt-2 font-['Syne',sans-serif] text-[21px] leading-[0.95] font-[700] tracking-[-0.03em] text-[#080b0d]">
                {card.value}
              </p>
            </div>
          );

          return card.href ? (
            <a key={card.label} href={card.href} className="no-underline">
              {content}
            </a>
          ) : (
            <div key={card.label}>{content}</div>
          );
        })}
      </section>

      <section className="rounded-[26px] bg-white/92 p-4 shadow-[0_18px_40px_rgba(8,11,13,0.06)]">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className={`${mono} text-[10px] uppercase tracking-[0.18em] text-[#99a1af]`}>
              FAQ
            </p>
            <h2 className="mt-2 font-['Syne',sans-serif] text-[24px] leading-[1] font-[700] tracking-[-0.04em] text-[#080b0d]">
              Câu hỏi thường gặp
            </h2>
          </div>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, index) => {
            const open = openIndex === index;

            return (
              <div key={faq.q} className="rounded-[22px] border border-black/5 bg-[#faf8f5] px-4 py-4">
                <button
                  onClick={() => setOpenIndex(open ? -1 : index)}
                  className="flex w-full items-start justify-between gap-4 border-0 bg-transparent p-0 text-left"
                >
                  <span className={`${mono} text-[12px] font-[500] leading-[20px] text-[#080b0d]`}>
                    {faq.q}
                  </span>
                  {open ? (
                    <ChevronUp size={18} className="shrink-0 text-[#ee3224]" />
                  ) : (
                    <ChevronDown size={18} className="shrink-0 text-[#667085]" />
                  )}
                </button>
                {open && (
                  <p className={`${mono} mt-3 text-[11px] leading-[19px] text-[#667085]`}>
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
            <p className={`${mono} text-[10px] uppercase tracking-[0.18em] text-white/56`}>
              Safety guidance
            </p>
            <h2 className="mt-1 font-['Syne',sans-serif] text-[24px] leading-[1] font-[700] tracking-[-0.04em]">
              Trong lúc chờ fixer
            </h2>
          </div>
        </div>
        <div className="space-y-3">
          {[
            "Bật đèn cảnh báo và đỗ xe gọn vào lề nếu điều kiện cho phép.",
            "Không đứng giữa làn đường để chờ hỗ trợ.",
            "Giữ điện thoại có thể nghe cuộc gọi và xác nhận vị trí khi fixer liên hệ.",
          ].map((item) => (
            <div key={item} className="rounded-[18px] border border-white/10 bg-white/6 px-3 py-3">
              <p className={`${mono} text-[11px] leading-[19px] text-white/82`}>
                {item}
              </p>
            </div>
          ))}
        </div>
      </section>

      <Link
        to="/ve-chung-toi"
        className="block rounded-[26px] bg-[linear-gradient(135deg,#fff4f2_0%,#fffaf7_100%)] px-5 py-5 no-underline shadow-[0_18px_40px_rgba(8,11,13,0.06)]"
      >
        <p className={`${mono} text-[10px] uppercase tracking-[0.22em] text-[#99a1af]`}>
          About ResQ
        </p>
        <h2 className="mt-3 font-['Syne',sans-serif] text-[28px] leading-[0.95] font-[700] tracking-[-0.04em] text-[#080b0d]">
          Xe của bạn, việc của tôi.
        </h2>
        <p className={`${mono} mt-3 max-w-[300px] text-[12px] leading-[20px] text-[#667085]`}>
          Xem triết lý sản phẩm, phạm vi dịch vụ và cách ResQ được rút gọn cho bối cảnh di động tại Việt Nam.
        </p>
      </Link>
    </div>
  );
}

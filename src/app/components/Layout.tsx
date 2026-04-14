import { Link, useLocation } from "react-router";
import svgPaths from "../../imports/TrangChủ/svg-t7f5kuudxj";
import { useAuth } from "./AuthContext";
import {
  User,
  LogOut,
  Bell,
  Wrench,
  CheckCircle2,
  Tag,
  X,
  Menu,
  Headset,
  MessageCircleQuestion,
  PhoneCall,
  ChevronRight,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";

function LogoIcon() {
  return (
    <svg width="44" height="49" viewBox="0 0 44 49" fill="none">
      <g clipPath="url(#clip_logo)">
        <path d={svgPaths.p2a278200} fill="white" />
        <path d={svgPaths.p34022a00} fill="#EE3224" />
        <path d={svgPaths.p29152900} fill="#EE3224" />
        <path d={svgPaths.p3d87be00} stroke="white" strokeMiterlimit="10" />
        <path d={svgPaths.p16ffe600} fill="#F8F8F9" />
      </g>
      <defs>
        <clipPath id="clip_logo">
          <rect width="44" height="49" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
}

const navItems = [
  { label: "Trang chủ", path: "/" },
  { label: "Dịch vụ", fixerLabel: "Đơn hàng", path: "/dich-vu" },
  { label: "Theo Dõi", fixerLabel: "Quá Trình", path: "/theo-doi" },
  { label: "Trợ giúp", path: "/tro-giup" },
  { label: "Về chúng tôi", path: "/ve-chung-toi" },
];

export function Navbar() {
  const location = useLocation();
  const { isLoggedIn, logout, user } = useAuth();
  const [showNotif, setShowNotif] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifs, setNotifs] = useState(mockNotifications);
  const notifRef = useRef<HTMLDivElement>(null);
  const unreadCount = notifs.filter((n) => !n.read).length;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setShowNotif(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const markAllRead = () => setNotifs((ns) => ns.map((n) => ({ ...n, read: true })));
  const handleLogout = () => {
    void logout();
  };

  const notifIcon = (type: string) => {
    if (type === "service") return <Wrench size={16} className="text-[#ee3224]" />;
    if (type === "done") return <CheckCircle2 size={16} className="text-[#22c55e]" />;
    return <Tag size={16} className="text-[#f59e0b]" />;
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-[rgba(4,38,153,0.08)] bg-[rgba(255,255,255,0.92)] backdrop-blur-sm">
      <div className="mx-auto flex min-h-[76px] w-full max-w-[1360px] items-center justify-between gap-4 px-4 sm:px-6 lg:min-h-[88px] lg:px-[84px]">
        <Link to="/" className="flex items-center gap-1 no-underline">
          <LogoIcon />
          <span className="font-['Syne',sans-serif] text-[28px] leading-[32px] font-[800] text-[#ee3224] sm:text-[30px]">
            esQ
          </span>
        </Link>

        <div className="hidden items-center gap-[32px] lg:flex">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`font-['IBM_Plex_Mono',monospace] text-[14px] leading-[18px] font-[500] no-underline transition-colors ${
                location.pathname === item.path
                  ? "text-[#ee3224]"
                  : "text-[#080b0d] hover:text-[#ee3224]"
              }`}
            >
              {user?.role === "fixer" ? item.fixerLabel ?? item.label : item.label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-[24px] lg:flex">
          {isLoggedIn ? (
            <>
              <div className="relative" ref={notifRef}>
                <button
                  onClick={() => setShowNotif(!showNotif)}
                  className="relative flex size-[36px] items-center justify-center rounded-full border-0 bg-transparent p-0 cursor-pointer transition-colors hover:bg-[#f5f5f5]"
                >
                  <Bell size={20} className={showNotif ? "text-[#ee3224]" : "text-[#080b0d]"} />
                  {unreadCount > 0 && (
                    <span className="absolute top-[2px] right-[2px] flex size-[18px] items-center justify-center rounded-full bg-[#ee3224]">
                      <span className="font-['IBM_Plex_Mono',monospace] text-[10px] font-[500] text-white">
                        {unreadCount}
                      </span>
                    </span>
                  )}
                </button>

                {showNotif && (
                  <div className="absolute top-[48px] right-0 w-[380px] overflow-hidden rounded-[12px] border border-[rgba(4,38,153,0.08)] bg-white shadow-[0_8px_32px_rgba(0,0,0,0.12)]">
                    <div className="flex items-center justify-between border-b border-[rgba(4,38,153,0.08)] px-[20px] py-[14px]">
                      <span className="font-['IBM_Plex_Mono',monospace] text-[14px] font-[500] text-[#080b0d]">
                        Thông báo
                      </span>
                      <div className="flex items-center gap-[12px]">
                        {unreadCount > 0 && (
                          <button
                            onClick={markAllRead}
                            className="border-0 bg-transparent p-0 cursor-pointer font-['IBM_Plex_Mono',monospace] text-[12px] font-[400] text-[#ee3224] hover:underline"
                          >
                            Đọc tất cả
                          </button>
                        )}
                        <button
                          onClick={() => setShowNotif(false)}
                          className="border-0 bg-transparent p-0 cursor-pointer"
                        >
                          <X size={16} className="text-[#a4a4a4]" />
                        </button>
                      </div>
                    </div>
                    <div className="max-h-[340px] overflow-y-auto">
                      {notifs.map((n) => (
                        <div
                          key={n.id}
                          className={`flex cursor-pointer items-start gap-[12px] border-b border-[rgba(4,38,153,0.04)] px-[20px] py-[14px] transition-colors hover:bg-[#fafafa] ${
                            !n.read ? "bg-[rgba(238,50,36,0.02)]" : ""
                          }`}
                          onClick={() =>
                            setNotifs((ns) =>
                              ns.map((x) =>
                                x.id === n.id ? { ...x, read: true } : x,
                              ),
                            )
                          }
                        >
                          <div
                            className={`mt-[2px] flex size-[36px] shrink-0 items-center justify-center rounded-full ${
                              !n.read ? "bg-[rgba(238,50,36,0.1)]" : "bg-[#f3f3f5]"
                            }`}
                          >
                            {notifIcon(n.type)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-[6px]">
                              <span className="font-['IBM_Plex_Mono',monospace] text-[13px] font-[500] text-[#080b0d]">
                                {n.title}
                              </span>
                              {!n.read && (
                                <span className="size-[6px] shrink-0 rounded-full bg-[#ee3224]" />
                              )}
                            </div>
                            <p className="truncate font-['IBM_Plex_Mono',monospace] text-[12px] font-[400] text-[#a4a4a4]">
                              {n.desc}
                            </p>
                            <p className="mt-[2px] font-['IBM_Plex_Mono',monospace] text-[11px] font-[400] text-[#c4c4c4]">
                              {n.time}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="border-t border-[rgba(4,38,153,0.08)] px-[20px] py-[12px] text-center">
                      <Link
                        to="/tai-khoan"
                        onClick={() => setShowNotif(false)}
                        className="font-['IBM_Plex_Mono',monospace] text-[12px] font-[500] text-[#ee3224] no-underline hover:underline"
                      >
                        Xem tất cả thông báo
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              <Link
                to="/tai-khoan"
                className={`flex items-center gap-[8px] font-['IBM_Plex_Mono',monospace] text-[14px] font-[500] tracking-[1.12px] no-underline transition-colors ${
                  location.pathname === "/tai-khoan"
                    ? "text-[#ee3224]"
                    : "text-black hover:text-[#ee3224]"
                }`}
              >
                <div className="flex size-[32px] items-center justify-center rounded-full bg-[rgba(238,50,36,0.1)]">
                  <User size={16} className="text-[#ee3224]" />
                </div>
                Tài khoản
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-[4px] border-0 bg-transparent p-0 cursor-pointer transition-colors hover:text-[#ee3224]"
              >
                <LogOut size={16} className="text-[#a4a4a4]" />
              </button>
            </>
          ) : (
            <>
              <Link
                to="/dang-nhap"
                className="font-['IBM_Plex_Mono',monospace] text-[14px] font-[500] tracking-[1.12px] text-black no-underline transition-colors hover:text-[#ee3224]"
              >
                Đăng nhập
              </Link>
              <Link
                to="/dang-nhap?tab=register"
                className="flex h-[34px] items-center justify-center rounded-[999px] bg-[#ee3224] px-[20px] no-underline transition-colors hover:bg-[#d42b1e]"
              >
                <span className="font-['IBM_Plex_Mono',monospace] text-[14px] leading-[16px] font-[500] tracking-[1.12px] text-[#f0f0f1]">
                  Đăng ký
                </span>
              </Link>
            </>
          )}
        </div>

        <div className="flex items-center gap-3 lg:hidden">
          {isLoggedIn && (
            <Link
              to="/tai-khoan"
              className="flex size-[40px] items-center justify-center rounded-full bg-[rgba(238,50,36,0.1)] no-underline"
            >
              <User size={18} className="text-[#ee3224]" />
            </Link>
          )}
          <button
            onClick={() => setMobileOpen((value) => !value)}
            className="flex size-[40px] items-center justify-center rounded-full border border-[rgba(4,38,153,0.08)] bg-white p-0 cursor-pointer"
            aria-label="Mở menu điều hướng"
            aria-expanded={mobileOpen}
          >
            <Menu size={18} className="text-[#080b0d]" />
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-[rgba(4,38,153,0.08)] bg-white lg:hidden">
          <div className="mx-auto flex w-full max-w-[1360px] flex-col gap-4 px-4 py-5 sm:px-6">
            <div className="flex flex-col gap-3">
                  {navItems.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                  className={`rounded-[14px] px-4 py-3 font-['IBM_Plex_Mono',monospace] text-[14px] font-[500] no-underline transition-colors ${
                    location.pathname === item.path
                      ? "bg-[rgba(238,50,36,0.08)] text-[#ee3224]"
                      : "bg-[#f7f7f8] text-[#080b0d]"
                  }`}
                    >
                      {user?.role === "fixer" ? item.fixerLabel ?? item.label : item.label}
                    </Link>
                  ))}
            </div>

            {isLoggedIn ? (
              <div className="flex flex-col gap-3 rounded-[18px] bg-[#f7f7f8] p-4">
                <div className="flex items-center justify-between">
                  <span className="font-['IBM_Plex_Mono',monospace] text-[13px] text-[#4a5565]">
                    Thông báo chưa đọc
                  </span>
                  <span className="font-['IBM_Plex_Mono',monospace] text-[13px] font-[500] text-[#ee3224]">
                    {unreadCount}
                  </span>
                </div>
                <Link
                  to="/tai-khoan"
                  className="flex h-[44px] items-center justify-center rounded-[12px] bg-white font-['IBM_Plex_Mono',monospace] text-[14px] font-[500] text-[#080b0d] no-underline"
                >
                  Đi tới tài khoản
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex h-[44px] items-center justify-center rounded-[12px] border border-[rgba(4,38,153,0.08)] bg-transparent font-['IBM_Plex_Mono',monospace] text-[14px] font-[500] text-[#080b0d]"
                >
                  Đăng xuất
                </button>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                <Link
                  to="/dang-nhap"
                  className="flex h-[44px] items-center justify-center rounded-[12px] border border-[rgba(4,38,153,0.08)] font-['IBM_Plex_Mono',monospace] text-[14px] font-[500] text-[#080b0d] no-underline"
                >
                  Đăng nhập
                </Link>
                <Link
                  to="/dang-nhap?tab=register"
                  className="flex h-[44px] items-center justify-center rounded-[12px] bg-[#ee3224] font-['IBM_Plex_Mono',monospace] text-[14px] font-[500] text-white no-underline"
                >
                  Đăng ký
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

export function Footer() {
  return (
    <footer className="w-full bg-[#080b0d]">
      <div className="mx-auto max-w-[1360px] px-5 pt-14 pb-8 sm:px-8 lg:px-[80px] lg:pt-[64px] lg:pb-[32px]">
        <div className="mb-10 flex flex-col gap-10 lg:flex-row lg:gap-[48px]">
          <div className="max-w-[320px] shrink-0">
            <div className="mb-[16px] flex items-center gap-1">
              <LogoIcon />
              <span className="font-['Syne',sans-serif] text-[30px] font-[800] text-[#ee3224]">
                esQ
              </span>
            </div>
            <p className="font-['IBM_Plex_Mono',monospace] text-[13px] leading-[21px] text-[#99a1af]">
              Dịch vụ cứu hộ xe và sửa chữa tận nơi hàng đầu Việt Nam.
            </p>
          </div>
          <div className="grid flex-1 gap-8 sm:grid-cols-2 xl:grid-cols-4">
            <div>
              <p className="mb-[16px] font-['IBM_Plex_Mono',monospace] text-[14px] font-[500] tracking-[0.35px] text-white">
                Công Ty Chúng Tôi
              </p>
              {["Về chúng tôi", "Tin Tức", "Voucher", "Đăng Ký Tài Xế"].map((item) => (
                <p
                  key={item}
                  className="mb-[8px] font-['IBM_Plex_Mono',monospace] text-[13px] leading-[19.5px] text-[#99a1af] transition-colors hover:text-white"
                >
                  {item}
                </p>
              ))}
            </div>
            <div>
              <p className="mb-[16px] font-['IBM_Plex_Mono',monospace] text-[14px] font-[500] tracking-[0.35px] text-white">
                Dịch Vụ
              </p>
              {["Cứu hộ đường dài", "Sửa xe tận nơi", "Giao xăng tận nhà", "Thay ắc quy"].map((item) => (
                <p
                  key={item}
                  className="mb-[8px] font-['IBM_Plex_Mono',monospace] text-[13px] leading-[19.5px] text-[#99a1af] transition-colors hover:text-white"
                >
                  {item}
                </p>
              ))}
            </div>
            <div>
              <p className="mb-[16px] font-['IBM_Plex_Mono',monospace] text-[14px] font-[500] tracking-[0.35px] text-white">
                Hỗ trợ
              </p>
              {["Câu hỏi thường gặp", "Liên hệ", "Điều khoản dịch vụ", "Chính sách bảo mật"].map((item) => (
                <p
                  key={item}
                  className="mb-[8px] font-['IBM_Plex_Mono',monospace] text-[13px] leading-[19.5px] text-[#99a1af] transition-colors hover:text-white"
                >
                  {item}
                </p>
              ))}
            </div>
            <div>
              <p className="mb-[16px] font-['IBM_Plex_Mono',monospace] text-[14px] font-[500] tracking-[0.35px] text-white">
                Liên hệ
              </p>
              <p className="mb-[12px] font-['IBM_Plex_Mono',monospace] text-[13px] leading-[19.5px] text-[#99a1af]">
                Hotline: 1900 1234
              </p>
              <p className="mb-[12px] font-['IBM_Plex_Mono',monospace] text-[13px] leading-[19.5px] text-[#99a1af]">
                Email: support@resq.vn
              </p>
              <p className="font-['IBM_Plex_Mono',monospace] text-[13px] leading-[19.5px] text-[#99a1af]">
                TP. Hồ Chí Minh, Việt Nam
              </p>
            </div>
          </div>
        </div>
        <div className="border-t border-[#1e2939] pt-[24px]">
          <p className="text-center font-['IBM_Plex_Mono',monospace] text-[12px] text-[#6a7282]">
            &copy; 2026 ResQ. Tất cả quyền được bảo lưu.
          </p>
        </div>
      </div>
    </footer>
  );
}

export function SupportBubble() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-40 sm:bottom-6 sm:right-6">
      {isOpen && (
        <div className="pointer-events-auto mb-3 w-[min(320px,calc(100vw-2rem))] overflow-hidden rounded-[22px] border border-[rgba(4,38,153,0.08)] bg-white shadow-[0_24px_60px_rgba(8,11,13,0.16)]">
          <div className="bg-[#080b0d] px-5 py-4">
            <p className="font-['IBM_Plex_Mono',monospace] text-[11px] uppercase tracking-[0.18em] text-[#99a1af]">
              Hỗ trợ ResQ
            </p>
            <p className="mt-2 font-['IBM_Plex_Mono',monospace] text-[18px] font-[700] text-white">
              Bạn cần trợ giúp nhanh?
            </p>
            <p className="mt-2 font-['IBM_Plex_Mono',monospace] text-[12px] leading-[20px] text-[#d1d5dc]">
              Gọi hotline, mở trang trợ giúp hoặc để lại yêu cầu để đội ResQ hỗ trợ bạn nhanh hơn.
            </p>
          </div>

          <div className="grid gap-3 p-4">
            <a
              href="tel:19001234"
              className="flex items-center justify-between rounded-[16px] bg-[#ee3224] px-4 py-3 no-underline transition-colors hover:bg-[#d42b1e]"
            >
              <div className="flex items-center gap-3">
                <div className="flex size-[36px] items-center justify-center rounded-full bg-[rgba(255,255,255,0.12)]">
                  <PhoneCall size={16} className="text-white" />
                </div>
                <div>
                  <p className="font-['IBM_Plex_Mono',monospace] text-[13px] font-[500] text-white">
                    Hotline khẩn cấp
                  </p>
                  <p className="font-['IBM_Plex_Mono',monospace] text-[11px] text-white/80">
                    1900 1234
                  </p>
                </div>
              </div>
              <ChevronRight size={16} className="text-white" />
            </a>

            <Link
              to="/tro-giup"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-between rounded-[16px] border border-[rgba(4,38,153,0.08)] bg-[#f7f7f8] px-4 py-3 no-underline transition-colors hover:border-[#ee3224]"
            >
              <div className="flex items-center gap-3">
                <div className="flex size-[36px] items-center justify-center rounded-full bg-white">
                  <MessageCircleQuestion size={16} className="text-[#ee3224]" />
                </div>
                <div>
                  <p className="font-['IBM_Plex_Mono',monospace] text-[13px] font-[500] text-[#080b0d]">
                    Mở trang trợ giúp
                  </p>
                  <p className="font-['IBM_Plex_Mono',monospace] text-[11px] text-[#6a7282]">
                    FAQ, hỗ trợ và liên hệ
                  </p>
                </div>
              </div>
              <ChevronRight size={16} className="text-[#080b0d]" />
            </Link>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setIsOpen((value) => !value)}
        className="pointer-events-auto flex items-center gap-3 rounded-full bg-[#ee3224] px-4 py-3 shadow-[0_20px_44px_rgba(238,50,36,0.28)] transition-transform hover:-translate-y-[1px]"
        aria-expanded={isOpen}
        aria-label="Mở hỗ trợ nhanh"
      >
        <span className="flex size-[38px] items-center justify-center rounded-full bg-white/14">
          <Headset size={18} className="text-white" />
        </span>
        <div className="text-left">
          <p className="font-['IBM_Plex_Mono',monospace] text-[10px] uppercase tracking-[0.16em] text-white/80">
            Hỗ trợ
          </p>
          <p className="font-['IBM_Plex_Mono',monospace] text-[13px] font-[500] text-white">
            ResQ luôn sẵn sàng
          </p>
        </div>
      </button>
    </div>
  );
}

const mockNotifications = [
  { id: 1, type: "service", title: "Fixer đang đến", desc: "Trần Văn Minh đang trên đường đến vị trí của bạn", time: "2 phút trước", read: false },
  { id: 2, type: "promo", title: "Giảm 20% dịch vụ thay nhớt", desc: "Áp dụng mã RESQ20 cho đơn tiếp theo", time: "1 giờ trước", read: false },
  { id: 3, type: "done", title: "Đơn hàng hoàn thành", desc: "Vá lốp xe máy · 95.000đ · Đánh giá ngay", time: "Hôm qua", read: true },
  { id: 4, type: "promo", title: "Ưu đãi cuối tuần", desc: "Giảm 15.000đ phí di chuyển từ T6-CN", time: "2 ngày trước", read: true },
];

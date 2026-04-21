import { Link, useLocation } from "react-router";
import svgPaths from "../../imports/TrangChủ/svg-t7f5kuudxj";
import { useAuth } from "./AuthContext";
import { LanguageToggle } from "./LanguageToggle";
import { useLanguage } from "./LanguageContext";
import { TrackingBubblePanel } from "./TrackingBubblePanel";
import {
  User,
  LogOut,
  Bell,
  Wrench,
  CheckCircle2,
  Tag,
  X,
  Menu,
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
  { label: "Trang chủ", labelEn: "Home", path: "/" },
  { label: "Dịch vụ", labelEn: "Services", fixerLabel: "Đơn hàng", fixerLabelEn: "Orders", path: "/dich-vu" },
  { label: "Bản đồ garage", labelEn: "Garage Map", path: "/ban-do-garage" },
  { label: "Trợ giúp", labelEn: "Help", path: "/tro-giup" },
  { label: "Về chúng tôi", labelEn: "About", path: "/ve-chung-toi" },
];

export function Navbar() {
  const location = useLocation();
  const { isLoggedIn, logout, user } = useAuth();
  const { language } = useLanguage();
  const isEnglish = language === "en";
  const isGarageMapRoute = location.pathname === "/ban-do-garage";
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

  const translatedNotifs = notifs.map((notification) => ({
    ...notification,
    title: isEnglish ? notification.titleEn : notification.title,
    desc: isEnglish ? notification.descEn : notification.desc,
    time: isEnglish ? notification.timeEn : notification.time,
  }));

  const navLabel = (item: (typeof navItems)[number]) =>
    user?.role === "fixer"
      ? isEnglish
        ? item.fixerLabelEn ?? item.labelEn
        : item.fixerLabel ?? item.label
      : isEnglish
        ? item.labelEn
        : item.label;

  return (
    <nav className={`sticky top-0 z-50 backdrop-blur-sm ${
      isGarageMapRoute
        ? "border-b border-white/18 bg-[rgba(255,255,255,0.76)] shadow-[0_12px_32px_rgba(8,11,13,0.08)]"
        : "border-b border-[rgba(4,38,153,0.08)] bg-[rgba(255,255,255,0.92)]"
    }`}>
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
              className={`resq-mono text-[13px] leading-[18px] font-[500] no-underline transition-colors ${
                location.pathname === item.path
                  ? "text-[#ee3224]"
                  : "text-[#080b0d] hover:text-[#ee3224]"
              }`}
            >
              {navLabel(item)}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-[24px] lg:flex">
          <LanguageToggle compact />
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
                      <span className="resq-mono text-[13px] font-[500] text-[#080b0d]">
                        {isEnglish ? "Notifications" : "Thông báo"}
                      </span>
                      <div className="flex items-center gap-[12px]">
                        {unreadCount > 0 && (
                          <button
                            onClick={markAllRead}
                            className="resq-mono cursor-pointer border-0 bg-transparent p-0 text-[11px] font-[400] text-[#ee3224] hover:underline"
                          >
                            {isEnglish ? "Mark all read" : "Đọc tất cả"}
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
                      {translatedNotifs.map((n) => (
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
                              <span className="resq-mono text-[12px] font-[500] text-[#080b0d]">
                                {n.title}
                              </span>
                              {!n.read && (
                                <span className="size-[6px] shrink-0 rounded-full bg-[#ee3224]" />
                              )}
                            </div>
                            <p className="resq-body truncate text-[13px] text-[#606775]">
                              {n.desc}
                            </p>
                            <p className="resq-mono mt-[2px] text-[10px] font-[400] text-[#c4c4c4]">
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
                        className="resq-mono text-[12px] font-[500] text-[#ee3224] no-underline hover:underline"
                      >
                        {isEnglish ? "View all notifications" : "Xem tất cả thông báo"}
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              <Link
                to="/tai-khoan"
                className={`flex items-center gap-[8px] resq-mono text-[13px] font-[500] tracking-[0.14em] no-underline transition-colors ${
                  location.pathname === "/tai-khoan"
                    ? "text-[#ee3224]"
                    : "text-black hover:text-[#ee3224]"
                }`}
              >
                <div className="flex size-[32px] items-center justify-center rounded-full bg-[rgba(238,50,36,0.1)]">
                  <User size={16} className="text-[#ee3224]" />
                </div>
                {isEnglish ? "Account" : "Tài khoản"}
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
                className="resq-mono text-[13px] font-[500] tracking-[0.14em] text-black no-underline transition-colors hover:text-[#ee3224]"
              >
                {isEnglish ? "Sign in" : "Đăng nhập"}
              </Link>
              <Link
                to="/dang-nhap?tab=register"
                className="flex h-[34px] items-center justify-center rounded-[999px] border border-black/10 bg-white px-[20px] no-underline transition-colors hover:border-[#080b0d] hover:bg-[#f7f7f8]"
              >
                <span className="resq-mono text-[12px] leading-[16px] font-[500] tracking-[0.14em] text-[#080b0d]">
                  {isEnglish ? "Register" : "Đăng ký"}
                </span>
              </Link>
            </>
          )}
        </div>

        <div className="flex items-center gap-3 lg:hidden">
          <LanguageToggle compact />
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
            aria-label={isEnglish ? "Open navigation menu" : "Mở menu điều hướng"}
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
                  className={`resq-mono rounded-[14px] px-4 py-3 text-[13px] font-[500] no-underline transition-colors ${
                    location.pathname === item.path
                      ? "bg-[rgba(238,50,36,0.08)] text-[#ee3224]"
                      : "bg-[#f7f7f8] text-[#080b0d]"
                  }`}
                    >
                      {navLabel(item)}
                    </Link>
                  ))}
            </div>

            {isLoggedIn ? (
              <div className="flex flex-col gap-3 rounded-[18px] bg-[#f7f7f8] p-4">
                <div className="flex items-center justify-between">
                  <span className="resq-mono text-[12px] text-[#4a5565]">
                    {isEnglish ? "Unread notifications" : "Thông báo chưa đọc"}
                  </span>
                  <span className="resq-mono text-[12px] font-[500] text-[#ee3224]">
                    {unreadCount}
                  </span>
                </div>
                <Link
                  to="/tai-khoan"
                  className="flex h-[44px] items-center justify-center rounded-[12px] bg-white resq-mono text-[13px] font-[500] text-[#080b0d] no-underline"
                >
                  {isEnglish ? "Go to account" : "Đi tới tài khoản"}
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex h-[44px] items-center justify-center rounded-[12px] border border-[rgba(4,38,153,0.08)] bg-transparent resq-mono text-[13px] font-[500] text-[#080b0d]"
                >
                  {isEnglish ? "Sign out" : "Đăng xuất"}
                </button>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                <Link
                  to="/dang-nhap"
                  className="flex h-[44px] items-center justify-center rounded-[12px] border border-[rgba(4,38,153,0.08)] resq-mono text-[13px] font-[500] text-[#080b0d] no-underline"
                >
                  {isEnglish ? "Sign in" : "Đăng nhập"}
                </Link>
                <Link
                  to="/dang-nhap?tab=register"
                  className="flex h-[44px] items-center justify-center rounded-[12px] bg-[#080b0d] resq-mono text-[13px] font-[500] text-white no-underline"
                >
                  {isEnglish ? "Register" : "Đăng ký"}
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
  const { language } = useLanguage();
  const isEnglish = language === "en";
  const companyLinks = isEnglish
    ? ["About", "News", "Offers", "Become a fixer"]
    : ["Về chúng tôi", "Tin tức", "Ưu đãi", "Đăng ký fixer"];
  const serviceLinks = isEnglish
    ? ["Long-distance towing", "On-site repair", "Fuel delivery", "Battery support"]
    : ["Cứu hộ đường dài", "Sửa xe tận nơi", "Giao xăng tận nơi", "Thay ắc quy"];
  const supportLinks = isEnglish
    ? ["FAQ", "Contact", "Terms", "Privacy"]
    : ["Câu hỏi thường gặp", "Liên hệ", "Điều khoản dịch vụ", "Chính sách bảo mật"];

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
            <p className="resq-body text-[14px] leading-[22px] text-[#b0bac7]">
              {isEnglish
                ? "Roadside help built for urgent moments, clear actions, and fast local dispatch."
                : "Dịch vụ cứu hộ được tối ưu cho lúc khẩn cấp, thao tác rõ ràng và điều phối nhanh tại địa phương."}
            </p>
          </div>
          <div className="grid flex-1 gap-8 sm:grid-cols-2 xl:grid-cols-4">
            <div>
              <p className="resq-mono mb-[16px] text-[12px] font-[500] uppercase tracking-[0.18em] text-white">
                {isEnglish ? "Company" : "Công ty"}
              </p>
              {companyLinks.map((item) => (
                <p
                  key={item}
                  className="resq-body mb-[8px] text-[14px] leading-[22px] text-[#99a1af] transition-colors hover:text-white"
                >
                  {item}
                </p>
              ))}
            </div>
            <div>
              <p className="resq-mono mb-[16px] text-[12px] font-[500] uppercase tracking-[0.18em] text-white">
                {isEnglish ? "Services" : "Dịch vụ"}
              </p>
              {serviceLinks.map((item) => (
                <p
                  key={item}
                  className="resq-body mb-[8px] text-[14px] leading-[22px] text-[#99a1af] transition-colors hover:text-white"
                >
                  {item}
                </p>
              ))}
            </div>
            <div>
              <p className="resq-mono mb-[16px] text-[12px] font-[500] uppercase tracking-[0.18em] text-white">
                {isEnglish ? "Support" : "Hỗ trợ"}
              </p>
              {supportLinks.map((item) => (
                <p
                  key={item}
                  className="resq-body mb-[8px] text-[14px] leading-[22px] text-[#99a1af] transition-colors hover:text-white"
                >
                  {item}
                </p>
              ))}
            </div>
            <div>
              <p className="resq-mono mb-[16px] text-[12px] font-[500] uppercase tracking-[0.18em] text-white">
                {isEnglish ? "Contact" : "Liên hệ"}
              </p>
              <p className="resq-body mb-[12px] text-[14px] leading-[22px] text-[#99a1af]">
                Hotline: 1900 1234
              </p>
              <p className="resq-body mb-[12px] text-[14px] leading-[22px] text-[#99a1af]">
                Email: support@resq.vn
              </p>
              <p className="resq-body text-[14px] leading-[22px] text-[#99a1af]">
                {isEnglish ? "Ho Chi Minh City, Vietnam" : "TP. Hồ Chí Minh, Việt Nam"}
              </p>
            </div>
          </div>
        </div>
        <div className="border-t border-[#1e2939] pt-[24px]">
          <p className="resq-mono text-center text-[11px] text-[#6a7282]">
            {isEnglish
              ? "© 2026 ResQ. All rights reserved."
              : "© 2026 ResQ. Tất cả quyền được bảo lưu."}
          </p>
        </div>
      </div>
    </footer>
  );
}

export function SupportBubble() {
  return <TrackingBubblePanel />;
}

const mockNotifications = [
  {
    id: 1,
    type: "service",
    title: "Fixer đang đến",
    titleEn: "Fixer is on the way",
    desc: "Trần Văn Minh đang trên đường đến vị trí của bạn",
    descEn: "Tran Van Minh is driving to your pinned location",
    time: "2 phút trước",
    timeEn: "2 min ago",
    read: false,
  },
  {
    id: 2,
    type: "promo",
    title: "Giảm 20% dịch vụ thay nhớt",
    titleEn: "20% off oil change service",
    desc: "Áp dụng mã RESQ20 cho đơn tiếp theo",
    descEn: "Apply code RESQ20 on your next request",
    time: "1 giờ trước",
    timeEn: "1 hour ago",
    read: false,
  },
  {
    id: 3,
    type: "done",
    title: "Đơn hàng hoàn thành",
    titleEn: "Request completed",
    desc: "Vá lốp xe máy · 95.000đ · Đánh giá ngay",
    descEn: "Motorbike tire repair · 95,000 VND · Leave a review",
    time: "Hôm qua",
    timeEn: "Yesterday",
    read: true,
  },
  {
    id: 4,
    type: "promo",
    title: "Ưu đãi cuối tuần",
    titleEn: "Weekend offer",
    desc: "Giảm 15.000đ phí di chuyển từ T6-CN",
    descEn: "Save 15,000 VND on travel fees from Fri to Sun",
    time: "2 ngày trước",
    timeEn: "2 days ago",
    read: true,
  },
];

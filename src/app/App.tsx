import { useEffect } from "react";
import { RouterProvider } from "react-router";
import { AuthProvider } from "./components/AuthContext";
import { LanguageProvider, useLanguage } from "./components/LanguageContext";
import { getSecureWebsiteRedirectTarget } from "./components/tracking/tracking-utils";
import { router } from "./routes";

export default function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}

function AppContent() {
  const secureRedirectTarget =
    typeof window !== "undefined" ? getSecureWebsiteRedirectTarget() : null;
  const { language } = useLanguage();
  const isEnglish = language === "en";

  useEffect(() => {
    if (secureRedirectTarget) {
      window.location.replace(secureRedirectTarget);
    }
  }, [secureRedirectTarget]);

  if (secureRedirectTarget) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#151412] px-6 text-center text-white">
        <div className="max-w-[520px] rounded-[28px] bg-[linear-gradient(180deg,#1d1716_0%,#241b19_100%)] px-6 py-8 shadow-[0_30px_90px_rgba(8,11,13,0.35)]">
          <p className="resq-eyebrow text-white/56">
            {isEnglish ? "Secure redirect" : "Chuyển hướng bảo mật"}
          </p>
          <h1 className="resq-display mt-4 text-[34px] leading-[0.92] font-[700]">
            {isEnglish
              ? "Switching to HTTPS so location services can work"
              : "Đang chuyển sang bản HTTPS để bật định vị"}
          </h1>
          <p className="resq-body mt-4 text-[14px] leading-[22px] text-white/76">
            {isEnglish
              ? "Browsers only allow live location permission on secure pages. ResQ is opening the HTTPS version so GPS and live tracking can work correctly."
              : "Trình duyệt chỉ cho phép xin quyền vị trí trên trang bảo mật. ResQ đang mở bản HTTPS để bạn có thể bật GPS và theo dõi fixer đúng cách."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}

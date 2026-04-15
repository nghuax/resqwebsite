import { useEffect } from "react";
import { RouterProvider } from "react-router";
import { AuthProvider } from "./components/AuthContext";
import { getSecureWebsiteRedirectTarget } from "./components/tracking/tracking-utils";
import { router } from "./routes";

export default function App() {
  const secureRedirectTarget =
    typeof window !== "undefined" ? getSecureWebsiteRedirectTarget() : null;

  useEffect(() => {
    if (secureRedirectTarget) {
      window.location.replace(secureRedirectTarget);
    }
  }, [secureRedirectTarget]);

  if (secureRedirectTarget) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#151412] px-6 text-center text-white">
        <div className="max-w-[520px] rounded-[28px] bg-[linear-gradient(180deg,#1d1716_0%,#241b19_100%)] px-6 py-8 shadow-[0_30px_90px_rgba(8,11,13,0.35)]">
          <p className="font-['IBM_Plex_Mono',monospace] text-[11px] uppercase tracking-[0.22em] text-white/56">
            Secure Redirect
          </p>
          <h1 className="mt-4 font-['Syne',sans-serif] text-[34px] leading-[0.92] font-[700] tracking-[-0.04em]">
            Đang chuyển sang bản HTTPS để bật định vị
          </h1>
          <p className="mt-4 font-['IBM_Plex_Mono',monospace] text-[12px] leading-[20px] text-white/76">
            Trình duyệt chỉ cho phép xin quyền vị trí trên trang bảo mật. ResQ đang mở bản
            HTTPS để bạn có thể bật GPS và theo dõi fixer đúng cách.
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

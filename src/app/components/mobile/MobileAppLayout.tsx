import { Link, useLocation } from "react-router";
import {
  CircleHelp,
  House,
  ShieldPlus,
  UserRound,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import type { ReactNode } from "react";
import { useAuth } from "../AuthContext";

const mono = "font-['IBM_Plex_Mono',monospace]";

const navItems: Array<{
  label: string;
  fixerLabel?: string;
  path: string;
  icon: LucideIcon;
}> = [
  { label: "Home", path: "/", icon: House },
  { label: "Services", fixerLabel: "Đơn hàng", path: "/dich-vu", icon: Wrench },
  { label: "Activity", fixerLabel: "Quá Trình", path: "/theo-doi", icon: ShieldPlus },
  { label: "Help", path: "/tro-giup", icon: CircleHelp },
  { label: "Profile", path: "/tai-khoan", icon: UserRound },
];

function isActivePath(currentPath: string, itemPath: string) {
  if (itemPath === "/") {
    return currentPath === "/";
  }

  return currentPath === itemPath || currentPath.startsWith(`${itemPath}/`);
}

export default function MobileAppLayout({ children }: { children: ReactNode }) {
  const location = useLocation();
  const { user } = useAuth();
  const hideBottomNav = location.pathname === "/thanh-toan";

  return (
    <div className="min-h-screen bg-[#151412] px-0 text-[#080b0d] sm:px-4 sm:py-4">
      <div className="relative mx-auto flex min-h-screen w-full max-w-[440px] flex-col overflow-hidden bg-[linear-gradient(180deg,#fff6f1_0%,#f7f3ee_16%,#f4f1eb_100%)] shadow-[0_36px_110px_rgba(8,11,13,0.28)] sm:min-h-[calc(100vh-32px)] sm:rounded-[34px] sm:border sm:border-white/10">
        <main className="flex-1 overflow-y-auto px-4 pb-[104px] pt-4 sm:px-5 sm:pt-5">
          {children}
        </main>

        {!hideBottomNav && (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-30 px-4 pb-[calc(12px+env(safe-area-inset-bottom))] sm:px-5">
            <nav className="pointer-events-auto flex items-center justify-between rounded-[26px] border border-black/5 bg-[rgba(255,255,255,0.92)] px-2 py-2 shadow-[0_20px_40px_rgba(8,11,13,0.12)] backdrop-blur-xl">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActivePath(location.pathname, item.path);

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-[18px] px-2 py-2 no-underline transition-colors ${
                      active ? "bg-[#ee3224] text-white" : "text-[#667085]"
                    }`}
                  >
                    <Icon size={18} />
                    <span className={`${mono} text-[9px] uppercase tracking-[0.18em]`}>
                      {user?.role === "fixer" ? item.fixerLabel ?? item.label : item.label}
                    </span>
                  </Link>
                );
              })}
            </nav>
          </div>
        )}
      </div>
    </div>
  );
}

import { createBrowserRouter, Navigate, Outlet, useLocation } from "react-router";
import { Navbar, Footer, SupportBubble } from "./components/Layout";
import HomePage from "./components/HomePage";
import AboutPage from "./components/AboutPage";
import ServicesPage from "./components/ServicesPage";
import GarageMapPage from "./components/GarageMapPage";
import SignInPage from "./components/SignInPage";
import PaymentPage from "./components/PaymentPage";
import AccountPage from "./components/AccountPage";
import HelpPage from "./components/HelpPage";
import { useIsMobile } from "./components/ui/use-mobile";
import MobileAppLayout from "./components/mobile/MobileAppLayout";
import MobileHomePage from "./components/mobile/MobileHomePage";
import MobileServicesPage from "./components/mobile/MobileServicesPage";
import MobileActivityPage from "./components/mobile/MobileActivityPage";
import MobileHelpPage from "./components/mobile/MobileHelpPage";
import MobileProfilePage from "./components/mobile/MobileProfilePage";
import MobileAboutPage from "./components/mobile/MobileAboutPage";

const routerBase = import.meta.env.BASE_URL.replace(/\/$/, "") || "/";

function Root() {
  const isMobile = useIsMobile();
  const location = useLocation();
  const isGarageMapRoute = location.pathname === "/ban-do-garage";

  if (isMobile) {
    return (
      <MobileAppLayout>
        <Outlet />
      </MobileAppLayout>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className={isGarageMapRoute ? "min-h-0 flex-1" : "flex-1"}>
        <Outlet />
      </main>
      {!isGarageMapRoute && <Footer />}
      <SupportBubble />
    </div>
  );
}

function SignInLayout() {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <div className="min-h-screen bg-[#151412] px-0 text-[#080b0d] sm:px-4 sm:py-4">
        <div className="mx-auto min-h-screen w-full max-w-[440px] bg-[linear-gradient(180deg,#fff6f1_0%,#f7f3ee_16%,#f4f1eb_100%)] px-4 py-4 shadow-[0_36px_110px_rgba(8,11,13,0.28)] sm:min-h-[calc(100vh-32px)] sm:rounded-[34px] sm:border sm:border-white/10 sm:px-5 sm:py-5">
          <Outlet />
        </div>
        <SupportBubble />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <SupportBubble />
    </div>
  );
}

function ResponsiveHomePage() {
  return useIsMobile() ? <MobileHomePage /> : <HomePage />;
}

function ResponsiveServicesPage() {
  return useIsMobile() ? <MobileServicesPage /> : <ServicesPage />;
}

function ResponsiveGarageMapPage() {
  return <GarageMapPage />;
}

function ResponsiveTrackingPage() {
  return useIsMobile()
    ? <MobileActivityPage />
    : <Navigate to="/dich-vu?panel=tracking" replace />;
}

function ResponsiveHelpPage() {
  return useIsMobile() ? <MobileHelpPage /> : <HelpPage />;
}

function ResponsiveAboutPage() {
  return useIsMobile() ? <MobileAboutPage /> : <AboutPage />;
}

function ResponsiveAccountPage() {
  return useIsMobile() ? <MobileProfilePage /> : <AccountPage />;
}

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: ResponsiveHomePage },
      { path: "dich-vu", Component: ResponsiveServicesPage },
      { path: "ban-do-garage", Component: ResponsiveGarageMapPage },
      { path: "theo-doi", Component: ResponsiveTrackingPage },
      { path: "tro-giup", Component: ResponsiveHelpPage },
      { path: "ve-chung-toi", Component: ResponsiveAboutPage },
      { path: "thanh-toan", Component: PaymentPage },
      { path: "tai-khoan", Component: ResponsiveAccountPage },
    ],
  },
  {
    path: "/dang-nhap",
    Component: SignInLayout,
    children: [
      { index: true, Component: SignInPage },
    ],
  },
], {
  basename: routerBase,
});

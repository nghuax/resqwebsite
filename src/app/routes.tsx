import { createBrowserRouter, Outlet } from "react-router";
import { Navbar, Footer, SupportBubble } from "./components/Layout";
import HomePage from "./components/HomePage";
import AboutPage from "./components/AboutPage";
import ServicesPage from "./components/ServicesPage";
import TrackingPage from "./components/TrackingPage";
import SignInPage from "./components/SignInPage";
import PaymentPage from "./components/PaymentPage";
import AccountPage from "./components/AccountPage";
import HelpPage from "./components/HelpPage";

const routerBase = import.meta.env.BASE_URL.replace(/\/$/, "") || "/";

function Root() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <SupportBubble />
    </div>
  );
}

function SignInLayout() {
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

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: HomePage },
      { path: "dich-vu", Component: ServicesPage },
      { path: "theo-doi", Component: TrackingPage },
      { path: "tro-giup", Component: HelpPage },
      { path: "ve-chung-toi", Component: AboutPage },
      { path: "thanh-toan", Component: PaymentPage },
      { path: "tai-khoan", Component: AccountPage },
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

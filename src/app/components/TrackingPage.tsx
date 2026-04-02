import { Link } from "react-router";
import { ChevronLeft, MapPinned, Route, Waves } from "lucide-react";
import { TrackingLiveMap } from "./tracking/TrackingLiveMap";

const mono = "font-['IBM_Plex_Mono',monospace]";
const display = "font-['Syne',sans-serif]";
const pagePadding = "px-5 sm:px-8 lg:px-[72px] xl:px-[104px]";
const pageShell = "mx-auto w-full max-w-[1320px]";

const notes = [
  {
    icon: MapPinned,
    title: "Client-only map",
    body: "The Leaflet experience is isolated to the browser so it stays safe for SSR-style rendering later.",
  },
  {
    icon: Route,
    title: "OSRM first",
    body: "Development routing uses the OSRM demo API and automatically falls back to a straight line if that request fails.",
  },
  {
    icon: Waves,
    title: "Live simulation",
    body: "Vehicle motion, ETA, and distance are simulated on the frontend so the page works now without a backend.",
  },
];

export default function TrackingPage() {
  return (
    <div className="overflow-x-hidden bg-[linear-gradient(180deg,#f8fafc_0%,#eff2f5_100%)]">
      <div className={`${pagePadding} pt-8 pb-16 sm:pt-10 sm:pb-20 lg:pt-12`}>
        <div className={pageShell}>
          <Link
            to="/"
            className={`mb-5 inline-flex items-center gap-2 text-[12px] uppercase tracking-[0.18em] text-[#64748b] no-underline transition-colors hover:text-[#0f172a] ${mono}`}
          >
            <ChevronLeft size={16} />
            Back to home
          </Link>

          <div className="mb-8 max-w-[860px] lg:mb-10">
            <div className="mb-4 inline-flex items-center rounded-full border border-black/8 bg-white/70 px-4 py-2 shadow-[0_10px_30px_rgba(15,23,42,0.06)] backdrop-blur-xl">
              <span className={`${mono} text-[11px] uppercase tracking-[0.22em] text-[#64748b]`}>
                Premium rescue tracking
              </span>
            </div>

            <h1 className={`${display} max-w-[820px] text-[2.9rem] leading-[0.94] text-[#0f172a] sm:text-[4rem] lg:text-[4.8rem]`}>
              Theo dõi xe ResQ như một hành trình ride hailing cao cấp.
            </h1>
            <p className={`${mono} mt-5 max-w-[760px] text-[13px] leading-7 text-[#475569] sm:text-[14px]`}>
              The tracking page now centers on a simulated rescue vehicle moving
              toward the user in real time, with OSRM development routing, custom
              Leaflet markers, floating controls, and a refined bottom sheet that
              keeps the experience mobile-first and polished.
            </p>
          </div>

          <TrackingLiveMap />

          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            {notes.map((note) => {
              const Icon = note.icon;

              return (
                <div
                  key={note.title}
                  className="rounded-[24px] border border-black/8 bg-white/72 p-5 shadow-[0_18px_42px_rgba(15,23,42,0.08)] backdrop-blur-xl"
                >
                  <div className="mb-4 flex size-11 items-center justify-center rounded-full border border-black/8 bg-[#f8fafc]">
                    <Icon size={18} className="text-[#0f172a]" />
                  </div>
                  <p className={`${display} text-[1.3rem] text-[#0f172a]`}>
                    {note.title}
                  </p>
                  <p className={`${mono} mt-2 text-[12px] leading-6 text-[#475569]`}>
                    {note.body}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

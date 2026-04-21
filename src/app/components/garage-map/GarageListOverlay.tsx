import { ChevronDown, MapPinned } from "lucide-react";
import { GarageList } from "./GarageList";
import type { GarageRecord, GarageSourceLink } from "./garageMapTypes";

const mono = "font-['IBM_Plex_Mono',monospace]";

function t(isEnglish: boolean, vi: string, en: string) {
  return isEnglish ? en : vi;
}

export function GarageListOverlay({
  garages,
  isEnglish,
  isLoading,
  errorMessage,
  selectedGarageId,
  distanceLabelsById,
  activeSourceLink,
  searchTerm,
  expanded,
  visibleLabel,
  onClearSearch,
  onRetry,
  onToggleExpanded,
  onSelectGarage,
}: {
  garages: GarageRecord[];
  isEnglish: boolean;
  isLoading: boolean;
  errorMessage: string | null;
  selectedGarageId: string | null;
  distanceLabelsById?: Record<string, string>;
  activeSourceLink?: GarageSourceLink;
  searchTerm: string;
  expanded: boolean;
  visibleLabel: string;
  onClearSearch: () => void;
  onRetry: () => void;
  onToggleExpanded: () => void;
  onSelectGarage: (garageId: string) => void;
}) {
  return (
    <>
      <div className="pointer-events-none absolute left-4 top-[250px] bottom-6 z-[1200] hidden w-[390px] lg:block xl:top-[178px]">
        <div className="pointer-events-auto flex h-full flex-col overflow-hidden rounded-[30px] border border-white/42 bg-[rgba(255,255,255,0.84)] shadow-[0_28px_80px_rgba(8,11,13,0.16)] backdrop-blur-[20px]">
          <DesktopHeader isEnglish={isEnglish} visibleLabel={visibleLabel} />
          <div className="flex-1 overflow-y-auto px-4 pb-4">
            <GarageList
              garages={garages}
              isEnglish={isEnglish}
              isLoading={isLoading}
              errorMessage={errorMessage}
              selectedGarageId={selectedGarageId}
              distanceLabelsById={distanceLabelsById}
              activeSourceLink={activeSourceLink}
              searchTerm={searchTerm}
              onClearSearch={onClearSearch}
              onRetry={onRetry}
              onSelectGarage={onSelectGarage}
            />
          </div>
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-3 bottom-[calc(76px+env(safe-area-inset-bottom))] z-[1200] lg:hidden">
        <div className={`pointer-events-auto overflow-hidden rounded-[28px] border border-white/42 bg-[rgba(255,255,255,0.9)] shadow-[0_24px_70px_rgba(8,11,13,0.2)] backdrop-blur-[20px] transition-[height,transform] duration-300 ${
          expanded ? "h-[44vh]" : "h-[142px]"
        }`}>
          <button
            type="button"
            onClick={onToggleExpanded}
            className="flex w-full items-center justify-between px-4 pb-3 pt-4 text-left"
            aria-expanded={expanded}
          >
            <div className="min-w-0">
              <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-[#d5d8df]" />
              <p className="resq-eyebrow text-[#ee3224]">
                {t(isEnglish, "Danh sach garage", "Garage browser")}
              </p>
              <h2 className="resq-display mt-2 text-[24px] leading-none font-[700] text-[#080b0d]">
                {visibleLabel}
              </h2>
            </div>

            <span className="flex size-[40px] shrink-0 items-center justify-center rounded-full bg-[#f6f2ee]">
              <ChevronDown
                size={18}
                className={`text-[#080b0d] transition-transform ${expanded ? "rotate-180" : ""}`}
              />
            </span>
          </button>

          <div className={`h-[calc(100%-92px)] overflow-y-auto px-4 pb-4 ${expanded ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
            <GarageList
              garages={garages}
              isEnglish={isEnglish}
              isLoading={isLoading}
              errorMessage={errorMessage}
              selectedGarageId={selectedGarageId}
              distanceLabelsById={distanceLabelsById}
              activeSourceLink={activeSourceLink}
              searchTerm={searchTerm}
              onClearSearch={onClearSearch}
              onRetry={onRetry}
              onSelectGarage={onSelectGarage}
            />
          </div>
        </div>
      </div>
    </>
  );
}

function DesktopHeader({
  isEnglish,
  visibleLabel,
}: {
  isEnglish: boolean;
  visibleLabel: string;
}) {
  return (
    <div className="border-b border-black/6 px-4 py-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="resq-eyebrow text-[#ee3224]">
            {isEnglish ? "Garage browser" : "Danh sach garage"}
          </p>
          <h2 className="resq-display mt-3 text-[28px] leading-[0.95] font-[700] text-[#080b0d]">
            {visibleLabel}
          </h2>
        </div>

        <div className="rounded-[18px] bg-[#f6f2ee] px-3 py-3">
          <MapPinned size={18} className="text-[#ee3224]" />
        </div>
      </div>
      <p className={`${mono} mt-3 text-[11px] leading-[18px] text-[#667085]`}>
        {isEnglish
          ? "Cards stay interactive while the map remains visible underneath."
          : "Ban do van hien ben duoi trong khi ban duyet garage o day."}
      </p>
    </div>
  );
}

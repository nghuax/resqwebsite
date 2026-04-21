import { ExternalLink, RefreshCcw, SearchX } from "lucide-react";
import { GarageCard } from "./GarageCard";
import type { GarageRecord, GarageSourceLink } from "./garageMapTypes";

const mono = "font-['IBM_Plex_Mono',monospace]";

function LoadingCards() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={index}
          className="animate-pulse rounded-[24px] border border-black/6 bg-white px-5 py-5 shadow-[0_14px_32px_rgba(8,11,13,0.05)]"
        >
          <div className="h-3 w-28 rounded-full bg-[#eceef2]" />
          <div className="mt-4 h-9 w-3/4 rounded-[16px] bg-[#eceef2]" />
          <div className="mt-5 space-y-3">
            <div className="h-16 rounded-[18px] bg-[#f3f4f6]" />
            <div className="h-16 rounded-[18px] bg-[#f3f4f6]" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function GarageList({
  garages,
  isEnglish,
  isLoading,
  errorMessage,
  selectedGarageId,
  distanceLabelsById,
  activeSourceLink,
  searchTerm,
  onClearSearch,
  onRetry,
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
  onClearSearch: () => void;
  onRetry: () => void;
  onSelectGarage: (garageId: string) => void;
}) {
  if (isLoading) {
    return <LoadingCards />;
  }

  if (errorMessage) {
    return (
      <div className="rounded-[24px] border border-[#f5c1bc] bg-[linear-gradient(180deg,#fff4f2_0%,#ffffff_100%)] px-5 py-5 shadow-[0_18px_42px_rgba(8,11,13,0.06)]">
        <p className="resq-eyebrow text-[#ee3224]">
          {isEnglish ? "Garage data unavailable" : "Khong tai duoc du lieu garage"}
        </p>
        <h3 className="resq-display mt-4 text-[28px] leading-[0.95] font-[700] text-[#080b0d]">
          {isEnglish ? "The live list could not load." : "Danh sach garage song chua tai duoc."}
        </h3>
        <p className={`${mono} mt-3 text-[12px] leading-[20px] text-[#667085]`}>
          {errorMessage}
        </p>
        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={onRetry}
            className="resq-button-pill resq-button-pill--primary px-5 py-3"
          >
            <RefreshCcw size={14} className="text-white" />
            <span className={`${mono} text-[11px] font-[500] uppercase tracking-[0.16em] text-white`}>
              {isEnglish ? "Retry" : "Tải lại"}
            </span>
          </button>
          {activeSourceLink && (
            <a
              href={activeSourceLink.url}
              target="_blank"
              rel="noreferrer"
              className="resq-button-pill resq-button-pill--secondary px-5 py-3 no-underline"
            >
              <span className={`${mono} text-[11px] font-[500] uppercase tracking-[0.16em] text-[#080b0d]`}>
                {isEnglish ? "Open source list" : "Mo danh sach goc"}
              </span>
              <ExternalLink size={14} className="text-[#ee3224]" />
            </a>
          )}
        </div>
      </div>
    );
  }

  if (garages.length === 0) {
    const noSearchResults = searchTerm.trim().length > 0;

    return (
      <div className="rounded-[24px] border border-black/6 bg-white px-5 py-5 shadow-[0_18px_42px_rgba(8,11,13,0.06)]">
        <div className="flex size-[54px] items-center justify-center rounded-full bg-[rgba(238,50,36,0.08)]">
          <SearchX size={22} className="text-[#ee3224]" />
        </div>
        <h3 className="resq-display mt-4 text-[28px] leading-[0.95] font-[700] text-[#080b0d]">
          {noSearchResults
            ? isEnglish
              ? "No garages match this search."
              : "Khong co garage phu hop voi tim kiem."
            : isEnglish
              ? "No garages found in this category."
              : "Chua tim thay garage nao trong danh muc nay."}
        </h3>
        <p className={`${mono} mt-3 text-[12px] leading-[20px] text-[#667085]`}>
          {noSearchResults
            ? isEnglish
              ? "Try a different name or address, or clear the search to see everything in this category."
              : "Hay thu ten hoac dia chi khac, hoac xoa tim kiem de xem toan bo danh muc nay."
            : isEnglish
              ? "Switch category, try another search, or retry later if the live provider is still updating."
              : "Hay doi danh muc, thu tu khoa khac, hoac tai lai neu du lieu song dang cap nhat."}
        </p>
        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          {noSearchResults && (
            <button
              type="button"
              onClick={onClearSearch}
              className="resq-button-pill resq-button-pill--primary px-5 py-3"
            >
              <span className={`${mono} text-[11px] font-[500] uppercase tracking-[0.16em] text-white`}>
                {isEnglish ? "Clear search" : "Xóa tìm kiếm"}
              </span>
            </button>
          )}
          {activeSourceLink && (
            <a
              href={activeSourceLink.url}
              target="_blank"
              rel="noreferrer"
              className="resq-button-pill resq-button-pill--secondary px-5 py-3 no-underline"
            >
              <span className={`${mono} text-[11px] font-[500] uppercase tracking-[0.16em] text-[#080b0d]`}>
                {isEnglish ? activeSourceLink.labelEn : activeSourceLink.label}
              </span>
              <ExternalLink size={14} className="text-[#ee3224]" />
            </a>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {garages.map((garage) => (
        <GarageCard
          key={garage.id}
          garage={garage}
          isEnglish={isEnglish}
          isSelected={garage.id === selectedGarageId}
          distanceLabel={distanceLabelsById?.[garage.id]}
          onSelect={() => onSelectGarage(garage.id)}
        />
      ))}
    </div>
  );
}

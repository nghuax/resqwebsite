import { ExternalLink, LocateFixed, Maximize2, Search, SlidersHorizontal } from "lucide-react";
import { GarageCategoryTabs } from "./GarageCategoryTabs";
import type { GarageCategory, GarageSourceLink } from "./garageMapTypes";

const mono = "font-['IBM_Plex_Mono',monospace]";

export type GarageSortMode = "smart" | "rating" | "reviews" | "nearest";

function t(isEnglish: boolean, vi: string, en: string) {
  return isEnglish ? en : vi;
}

export function GarageTopOverlay({
  activeCategory,
  counts,
  isEnglish,
  searchTerm,
  providerLabel,
  visibleCount,
  sortMode,
  isLocatingUser,
  activeSourceLink,
  onCategoryChange,
  onSearchChange,
  onSortChange,
  onLocateUser,
  onFitResults,
}: {
  activeCategory: GarageCategory;
  counts: Record<GarageCategory, number>;
  isEnglish: boolean;
  searchTerm: string;
  providerLabel: string;
  visibleCount: number;
  sortMode: GarageSortMode;
  isLocatingUser: boolean;
  activeSourceLink?: GarageSourceLink;
  onCategoryChange: (category: GarageCategory) => void;
  onSearchChange: (value: string) => void;
  onSortChange: (mode: GarageSortMode) => void;
  onLocateUser: () => void;
  onFitResults: () => void;
}) {
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-[1300] px-3 pt-2 sm:px-5 sm:pt-3 lg:px-6">
      <div className="mx-auto flex w-full max-w-[1480px] flex-col gap-3">
        <div className="pointer-events-auto rounded-[22px] border border-white/42 bg-[rgba(255,255,255,0.82)] p-2.5 shadow-[0_18px_48px_rgba(8,11,13,0.12)] backdrop-blur-[20px] sm:p-3">
          <div className="grid gap-2 lg:grid-cols-[190px_minmax(260px,1fr)_auto] lg:items-center xl:grid-cols-[230px_minmax(360px,1fr)_auto]">
            <div className="min-w-0">
              <p className="resq-eyebrow text-[10px] text-[#ee3224]">
                {t(isEnglish, "Bản đồ garage", "Garage map")}
              </p>
              <h1 className="resq-display mt-1 text-[18px] leading-[0.96] font-[700] text-[#080b0d] sm:text-[22px]">
                {activeCategory === "car"
                  ? t(isEnglish, "Garage ô tô gần bạn", "Nearby car garages")
                  : t(isEnglish, "Garage xe máy gần bạn", "Nearby motorcycle garages")}
              </h1>
            </div>

            <div className="flex min-w-0 flex-col gap-1.5 xl:flex-row xl:items-center">
              <label className="flex min-w-0 flex-1 items-center gap-2.5 rounded-full border border-black/6 bg-white px-3.5 py-2 shadow-[0_10px_20px_rgba(8,11,13,0.05)]">
                <Search size={15} className="text-[#99a1af]" />
                <input
                  value={searchTerm}
                  onChange={(event) => onSearchChange(event.target.value)}
                  placeholder={t(
                    isEnglish,
                    "Tìm theo tên hoặc địa chỉ garage",
                    "Search by garage name or address",
                  )}
                  className="resq-body w-full border-0 bg-transparent text-[14px] text-[#080b0d] outline-none placeholder:text-[#99a1af]"
                />
              </label>

              <GarageCategoryTabs
                activeCategory={activeCategory}
                counts={counts}
                isEnglish={isEnglish}
                compact
                onChange={onCategoryChange}
              />
            </div>

            <div className="flex flex-wrap justify-start gap-1.5 lg:justify-end">
              <label className="flex items-center gap-2 rounded-full border border-white/50 bg-white/86 px-2.5 py-1.5 shadow-[0_8px_18px_rgba(8,11,13,0.05)]">
                <SlidersHorizontal size={13} className="text-[#667085]" />
                <select
                  value={sortMode}
                  onChange={(event) => onSortChange(event.target.value as GarageSortMode)}
                  className={`${mono} border-0 bg-transparent text-[10px] uppercase tracking-[0.14em] text-[#080b0d] outline-none`}
                >
                  <option value="smart">{t(isEnglish, "Thông minh", "Smart")}</option>
                  <option value="rating">{t(isEnglish, "Điểm cao nhất", "Highest rated")}</option>
                  <option value="reviews">{t(isEnglish, "Nhiều đánh giá", "Most reviewed")}</option>
                  <option value="nearest">{t(isEnglish, "Gần nhất", "Nearest first")}</option>
                </select>
              </label>

              <button
                type="button"
                onClick={onLocateUser}
                className="resq-button-pill resq-button-pill--secondary px-3 py-1.5"
              >
                <LocateFixed size={13} className={`${isLocatingUser ? "animate-pulse" : ""} text-[#ee3224]`} />
                <span className={`${mono} text-[10px] font-[500] uppercase tracking-[0.14em] text-[#080b0d]`}>
                  {isLocatingUser
                    ? t(isEnglish, "Đang tìm", "Locating")
                    : t(isEnglish, "Vị trí của tôi", "Locate me")}
                </span>
              </button>

              <button
                type="button"
                onClick={onFitResults}
                className="resq-button-pill resq-button-pill--secondary px-3 py-1.5"
              >
                <Maximize2 size={13} className="text-[#ee3224]" />
                <span className={`${mono} text-[10px] font-[500] uppercase tracking-[0.14em] text-[#080b0d]`}>
                  {t(isEnglish, "Căn hết kết quả", "Fit results")}
                </span>
              </button>
            </div>
          </div>

          <div className="mt-2 flex flex-wrap items-center justify-between gap-2 border-t border-black/5 pt-2">
            <div className="flex flex-wrap gap-2">
              <div className="rounded-full border border-white/50 bg-white/82 px-2.5 py-1 shadow-[0_8px_18px_rgba(8,11,13,0.05)]">
                <span className={`${mono} text-[9px] uppercase tracking-[0.14em] text-[#667085]`}>
                  {visibleCount} {t(isEnglish, "địa điểm", "locations")}
                </span>
              </div>
              <div className="hidden rounded-full border border-white/50 bg-white/82 px-2.5 py-1 shadow-[0_8px_18px_rgba(8,11,13,0.05)] sm:block">
                <span className={`${mono} text-[9px] uppercase tracking-[0.14em] text-[#667085]`}>
                  {providerLabel}
                </span>
              </div>
            </div>

            {activeSourceLink && (
              <a
                href={activeSourceLink.url}
                target="_blank"
                rel="noreferrer"
                className="resq-button-pill resq-button-pill--secondary px-2.5 py-1 no-underline"
              >
                <ExternalLink size={12} className="text-[#ee3224]" />
                <span className={`${mono} text-[9px] font-[500] uppercase tracking-[0.14em] text-[#080b0d]`}>
                  {isEnglish ? "Source" : "Nguồn"}
                </span>
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

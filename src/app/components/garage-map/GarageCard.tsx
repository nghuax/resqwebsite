import { ExternalLink, MapPin, PhoneCall } from "lucide-react";
import {
  formatAddressCopy,
  formatGarageCategoryLabel,
  formatPhoneCopy,
  formatRatingCopy,
  formatReviewCopy,
  getGarageStatusCopy,
} from "./garageMapFormat";
import type { GarageRecord } from "./garageMapTypes";

const mono = "font-['IBM_Plex_Mono',monospace]";

export function GarageCard({
  garage,
  isEnglish,
  isSelected,
  distanceLabel,
  onSelect,
}: {
  garage: GarageRecord;
  isEnglish: boolean;
  isSelected: boolean;
  distanceLabel?: string | null;
  onSelect: () => void;
}) {
  return (
    <article
      onClick={onSelect}
      className={`cursor-pointer rounded-[24px] border px-5 py-5 transition-all ${
        isSelected
          ? "border-[#ee3224] bg-[linear-gradient(180deg,#fff5f3_0%,#ffffff_100%)] shadow-[0_20px_44px_rgba(238,50,36,0.14)]"
          : "border-black/6 bg-white shadow-[0_14px_32px_rgba(8,11,13,0.05)] hover:-translate-y-[1px] hover:border-[#ee3224]/18"
      }`}
      aria-pressed={isSelected}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect();
        }
      }}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="resq-eyebrow text-[#99a1af]">
            {formatGarageCategoryLabel(garage.type, isEnglish)}
          </p>
          <h3 className="resq-display mt-3 text-[24px] leading-[0.98] font-[700] text-[#080b0d]">
            {garage.name}
          </h3>
        </div>

        <span
          className={`inline-flex items-center rounded-full px-3 py-2 ${mono} text-[11px] font-[500] uppercase tracking-[0.14em] ${
            garage.isOpen === true
              ? "bg-[rgba(27,172,101,0.12)] text-[#13814d]"
              : garage.isOpen === false
                ? "bg-[rgba(238,50,36,0.12)] text-[#ee3224]"
                : "bg-[#f3f4f6] text-[#667085]"
          }`}
        >
          {getGarageStatusCopy(garage, isEnglish)}
        </span>
      </div>

      <div className="mt-4 rounded-[18px] bg-[#faf8f5] px-4 py-4">
        <div className="flex items-start gap-3">
          <span className="mt-[2px] flex size-[30px] shrink-0 items-center justify-center rounded-full bg-white">
            <MapPin size={14} className="text-[#ee3224]" />
          </span>
          <div className="min-w-0">
            <p className={`${mono} text-[10px] uppercase tracking-[0.16em] text-[#99a1af]`}>
              {isEnglish ? "Address" : "Dia chi"}
            </p>
            <p className={`${mono} mt-2 text-[12px] leading-[20px] text-[#080b0d]`}>
              {formatAddressCopy(garage, isEnglish)}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-3">
        <div className="rounded-[18px] bg-[#faf8f5] px-4 py-4">
          <p className={`${mono} text-[10px] uppercase tracking-[0.16em] text-[#99a1af]`}>
            {isEnglish ? "Phone" : "Dien thoai"}
          </p>
          <p className={`${mono} mt-2 text-[12px] leading-[20px] text-[#080b0d]`}>
            {formatPhoneCopy(garage, isEnglish)}
          </p>
        </div>
        <div className="rounded-[18px] bg-[#faf8f5] px-4 py-4">
          <p className={`${mono} text-[10px] uppercase tracking-[0.16em] text-[#99a1af]`}>
            {isEnglish ? "Rating" : "Danh gia"}
          </p>
          <p className={`${mono} mt-2 text-[12px] leading-[20px] text-[#080b0d]`}>
            {formatRatingCopy(garage, isEnglish)}
          </p>
        </div>
        <div className="rounded-[18px] bg-[#faf8f5] px-4 py-4">
          <p className={`${mono} text-[10px] uppercase tracking-[0.16em] text-[#99a1af]`}>
            {isEnglish ? "Reviews" : "Luot danh gia"}
          </p>
          <p className={`${mono} mt-2 text-[12px] leading-[20px] text-[#080b0d]`}>
            {formatReviewCopy(garage, isEnglish)}
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <span className={`${mono} text-[11px] text-[#667085]`}>
          {distanceLabel
            ? distanceLabel
            : isSelected
              ? isEnglish
                ? "Selected on map"
                : "Dang duoc chon tren ban do"
              : isEnglish
                ? "Tap to focus the map"
                : "Cham de dua ban do toi garage nay"}
        </span>
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onSelect();
          }}
          className="resq-button-pill resq-button-pill--primary px-4 py-2"
        >
          <span className={`${mono} text-[11px] font-[500] uppercase tracking-[0.16em] text-white`}>
            {isEnglish ? "Details" : "Chi tiet"}
          </span>
        </button>

        {garage.phone && (
          <a
            href={`tel:${garage.phone.replace(/\s+/g, "")}`}
            onClick={(event) => event.stopPropagation()}
            className="resq-button-pill resq-button-pill--secondary px-4 py-2 no-underline"
          >
            <PhoneCall size={14} className="text-[#ee3224]" />
            <span className={`${mono} text-[11px] font-[500] uppercase tracking-[0.16em] text-[#080b0d]`}>
              {isEnglish ? "Call" : "Goi"}
            </span>
          </a>
        )}

        <a
          href={garage.directionsUrl ?? garage.googleMapsUrl}
          target="_blank"
          rel="noreferrer"
          onClick={(event) => event.stopPropagation()}
          className="resq-button-pill resq-button-pill--secondary px-4 py-2 no-underline"
        >
          <ExternalLink size={14} className="text-[#ee3224]" />
          <span className={`${mono} text-[11px] font-[500] uppercase tracking-[0.16em] text-[#080b0d]`}>
            {isEnglish ? "Directions" : "Chi duong"}
          </span>
        </a>
      </div>
    </article>
  );
}

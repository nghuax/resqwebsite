import type { ReactNode } from "react";
import { ExternalLink, MapPin, PhoneCall, Star } from "lucide-react";
import {
  formatAddressCopy,
  formatGarageCategoryLabel,
  formatOpeningHoursCopy,
  formatPhoneCopy,
  formatRatingCopy,
  formatReviewCopy,
  getGarageStatusCopy,
} from "./garageMapFormat";
import type { GarageRecord } from "./garageMapTypes";

const mono = "font-['IBM_Plex_Mono',monospace]";

function DetailBlock({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[20px] bg-[#faf7f2] px-4 py-4">
      <div className="flex items-start gap-3">
        <span className="mt-[2px] flex size-[32px] shrink-0 items-center justify-center rounded-full bg-white shadow-[0_10px_20px_rgba(8,11,13,0.05)]">
          {icon}
        </span>
        <div className="min-w-0">
          <p className={`${mono} text-[10px] uppercase tracking-[0.16em] text-[#99a1af]`}>
            {label}
          </p>
          <p className={`${mono} mt-2 text-[12px] leading-[20px] text-[#080b0d]`}>
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

export function GarageDetailsPanel({
  garage,
  isEnglish,
}: {
  garage: GarageRecord | null;
  isEnglish: boolean;
}) {
  if (!garage) {
    return (
      <div className="rounded-[26px] border border-dashed border-black/10 bg-white/84 px-5 py-5">
        <p className="resq-eyebrow text-[#99a1af]">
          {isEnglish ? "Garage details" : "Chi tiet garage"}
        </p>
        <h3 className="resq-display mt-4 text-[30px] leading-[0.96] font-[700] text-[#080b0d]">
          {isEnglish ? "Choose a garage on the map." : "Chon mot garage tren ban do."}
        </h3>
        <p className={`${mono} mt-3 text-[12px] leading-[20px] text-[#667085]`}>
          {isEnglish
            ? "Select a marker or a card to inspect the location, compare contact details, and open directions when needed."
            : "Chon marker hoac card de xem vi tri, so sanh thong tin lien he va mo chi duong khi can."}
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-[26px] border border-black/6 bg-[linear-gradient(180deg,#fff9f6_0%,#ffffff_100%)] px-5 py-5 shadow-[0_20px_48px_rgba(8,11,13,0.05)]">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="resq-eyebrow text-[#99a1af]">
            {formatGarageCategoryLabel(garage.type, isEnglish)}
          </p>
          <h3 className="resq-display mt-3 text-[30px] leading-[0.96] font-[700] text-[#080b0d] sm:text-[34px]">
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

      <div className="mt-5 grid gap-3 md:grid-cols-2">
        <DetailBlock
          icon={<MapPin size={15} className="text-[#ee3224]" />}
          label={isEnglish ? "Address" : "Dia chi"}
          value={formatAddressCopy(garage, isEnglish)}
        />
        <DetailBlock
          icon={<PhoneCall size={15} className="text-[#ee3224]" />}
          label={isEnglish ? "Phone" : "Dien thoai"}
          value={formatPhoneCopy(garage, isEnglish)}
        />
        <DetailBlock
          icon={<Star size={15} className="fill-[#ee3224] text-[#ee3224]" />}
          label={isEnglish ? "Rating" : "Danh gia"}
          value={formatRatingCopy(garage, isEnglish)}
        />
        <DetailBlock
          icon={<Star size={15} className="text-[#ee3224]" />}
          label={isEnglish ? "Reviews" : "Luot danh gia"}
          value={formatReviewCopy(garage, isEnglish)}
        />
      </div>

      <div className="mt-4 rounded-[20px] bg-[#faf7f2] px-4 py-4">
        <p className={`${mono} text-[10px] uppercase tracking-[0.16em] text-[#99a1af]`}>
          {isEnglish ? "Opening hours" : "Gio mo cua"}
        </p>
        <p className={`${mono} mt-2 text-[12px] leading-[20px] text-[#080b0d]`}>
          {formatOpeningHoursCopy(garage, isEnglish)}
        </p>
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <a
          href={garage.directionsUrl ?? garage.googleMapsUrl}
          target="_blank"
          rel="noreferrer"
          className="resq-button-pill resq-button-pill--primary justify-center px-5 py-3 no-underline"
        >
          <ExternalLink size={15} className="text-white" />
          <span className={`${mono} text-[11px] font-[500] uppercase tracking-[0.16em] text-white`}>
            {isEnglish ? "Get directions" : "Chi duong"}
          </span>
        </a>

        <a
          href={garage.phone ? `tel:${garage.phone.replace(/\s+/g, "")}` : undefined}
          onClick={(event) => {
            if (!garage.phone) {
              event.preventDefault();
            }
          }}
          className={`resq-button-pill resq-button-pill--secondary justify-center px-5 py-3 no-underline ${
            !garage.phone ? "pointer-events-none opacity-55" : ""
          }`}
        >
          <PhoneCall size={15} className="text-[#ee3224]" />
          <span className={`${mono} text-[11px] font-[500] uppercase tracking-[0.16em] text-[#080b0d]`}>
            {isEnglish ? "Call now" : "Goi ngay"}
          </span>
        </a>
      </div>
    </div>
  );
}

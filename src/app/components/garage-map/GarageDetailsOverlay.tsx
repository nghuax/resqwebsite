import { X } from "lucide-react";
import { GarageDetailsPanel } from "./GarageDetailsPanel";
import type { GarageRecord } from "./garageMapTypes";

export function GarageDetailsOverlay({
  garage,
  isEnglish,
  isMobile,
  onClose,
}: {
  garage: GarageRecord | null;
  isEnglish: boolean;
  isMobile: boolean;
  onClose: () => void;
}) {
  if (!garage) {
    return null;
  }

  if (isMobile) {
    return (
      <div className="pointer-events-none absolute inset-x-3 bottom-[calc(158px+env(safe-area-inset-bottom))] z-[1400] lg:hidden">
        <div className="pointer-events-auto relative rounded-[30px] border border-white/42 bg-[rgba(255,255,255,0.94)] p-3 shadow-[0_28px_80px_rgba(8,11,13,0.22)] backdrop-blur-[20px]">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-3 right-3 z-10 flex size-[36px] items-center justify-center rounded-full bg-[#f5f2ee]"
            aria-label={isEnglish ? "Close details" : "Dong chi tiet"}
          >
            <X size={16} className="text-[#080b0d]" />
          </button>
          <GarageDetailsPanel garage={garage} isEnglish={isEnglish} />
        </div>
      </div>
    );
  }

  return (
    <div className="pointer-events-none absolute right-6 bottom-6 z-[1400] hidden w-[380px] lg:block">
      <div className="pointer-events-auto relative rounded-[30px] border border-white/42 bg-[rgba(255,255,255,0.9)] p-3 shadow-[0_28px_80px_rgba(8,11,13,0.18)] backdrop-blur-[20px]">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 z-10 flex size-[36px] items-center justify-center rounded-full bg-[#f5f2ee]"
          aria-label={isEnglish ? "Close details" : "Dong chi tiet"}
        >
          <X size={16} className="text-[#080b0d]" />
        </button>
        <GarageDetailsPanel garage={garage} isEnglish={isEnglish} />
      </div>
    </div>
  );
}

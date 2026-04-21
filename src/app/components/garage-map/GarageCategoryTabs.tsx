import { Bike, Car } from "lucide-react";
import type { GarageCategory } from "./garageMapTypes";

const mono = "font-['IBM_Plex_Mono',monospace]";

export function GarageCategoryTabs({
  activeCategory,
  counts,
  isEnglish,
  compact = false,
  onChange,
}: {
  activeCategory: GarageCategory;
  counts: Record<GarageCategory, number>;
  isEnglish: boolean;
  compact?: boolean;
  onChange: (nextCategory: GarageCategory) => void;
}) {
  const items: Array<{
    value: GarageCategory;
    label: string;
    labelEn: string;
    icon: typeof Car;
  }> = [
    {
      value: "car",
      label: "Garage ô tô",
      labelEn: "Car Garages",
      icon: Car,
    },
    {
      value: "motorcycle",
      label: "Garage xe máy",
      labelEn: "Motorcycle Garages",
      icon: Bike,
    },
  ];

  return (
    <div className={`flex flex-wrap ${compact ? "gap-2" : "gap-3"}`}>
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = item.value === activeCategory;

        return (
          <button
            key={item.value}
            type="button"
            onClick={() => onChange(item.value)}
            className={`inline-flex items-center rounded-full border transition-all ${
              compact ? "gap-1.5 px-2.5 py-1.5" : "gap-3 px-4 py-3"
            } ${
              isActive
                ? "border-[#ee3224] bg-[#ee3224] text-white shadow-[0_18px_32px_rgba(238,50,36,0.24)]"
                : "border-black/8 bg-white text-[#080b0d] shadow-[0_12px_24px_rgba(8,11,13,0.06)] hover:-translate-y-[1px] hover:border-[#ee3224]/18"
            }`}
            aria-pressed={isActive}
          >
            <span
              className={`flex items-center justify-center rounded-full ${
                compact ? "size-[26px]" : "size-[36px]"
              } ${
                isActive ? "bg-white/16" : "bg-[rgba(238,50,36,0.08)]"
              }`}
            >
              <Icon size={compact ? 13 : 16} className={isActive ? "text-white" : "text-[#ee3224]"} />
            </span>

            <span className="text-left">
              <span className={`${mono} block ${compact ? "text-[9px]" : "text-[11px]"} font-[500] uppercase tracking-[0.14em]`}>
                {isEnglish ? item.labelEn : item.label}
              </span>
              <span className={`${mono} mt-0.5 block ${compact ? "text-[8px]" : "text-[10px]"} ${isActive ? "text-white/76" : "text-[#99a1af]"}`}>
                {counts[item.value]} {isEnglish ? "results" : "kết quả"}
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}

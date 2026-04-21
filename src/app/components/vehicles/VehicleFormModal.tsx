import { useEffect, useState, type ReactNode } from "react";
import { Car, Bike, Plus, X } from "lucide-react";
import type { VehicleType } from "../resqStore";
import { useLanguage } from "../LanguageContext";
import { localizeVehicleType, t } from "../localization";

const mono = "font-['IBM_Plex_Mono',monospace]";

type VehicleFormModalProps = {
  allowedTypes?: VehicleType[];
  onClose: () => void;
  onSave: (payload: {
    name: string;
    plate: string;
    year: string;
    type: VehicleType;
  }) => void;
};

export function VehicleFormModal({
  allowedTypes = ["Xe máy", "Ô tô"],
  onClose,
  onSave,
}: VehicleFormModalProps) {
  const { language } = useLanguage();
  const isEnglish = language === "en";
  const [name, setName] = useState("");
  const [plate, setPlate] = useState("");
  const [year, setYear] = useState("");
  const [type, setType] = useState<VehicleType>(allowedTypes[0] ?? "Xe máy");

  useEffect(() => {
    setType(allowedTypes[0] ?? "Xe máy");
  }, [allowedTypes]);

  const isValid =
    name.trim().length >= 3 &&
    plate.trim().length >= 5 &&
    year.trim().length === 4;

  return (
    <div
      className="resq-modal-backdrop fixed inset-0 z-[60] overflow-y-auto bg-black/40 px-4 py-6 sm:px-6 sm:py-10"
      onClick={onClose}
    >
      <div className="mx-auto flex min-h-full w-full max-w-[460px] items-center justify-center">
        <div
          className="resq-modal-panel relative w-full rounded-[18px] bg-white p-6 sm:p-8"
          onClick={(event) => event.stopPropagation()}
        >
          <button
            type="button"
            onClick={onClose}
            className="absolute right-[16px] top-[16px] flex size-[32px] items-center justify-center rounded-full border-0 bg-transparent cursor-pointer transition-colors hover:bg-[#f5f5f5]"
            aria-label={t(isEnglish, "Đóng thêm xe", "Close add vehicle")}
          >
            <X size={18} className="text-[#a4a4a4]" />
          </button>

          <div className="mb-6 pr-8">
            <p className={`${mono} mb-2 text-[11px] uppercase tracking-[0.18em] text-[#99a1af]`}>
              {t(isEnglish, "Thêm xe nhanh", "Quick add vehicle")}
            </p>
            <h3 className={`${mono} text-[22px] font-[700] text-[#080b0d]`}>
              {t(isEnglish, "Thêm phương tiện để đặt dịch vụ", "Add a vehicle for service requests")}
            </h3>
            <p className={`${mono} mt-2 text-[13px] leading-[22px] text-[#4a5565]`}>
              {t(
                isEnglish,
                "Xe mới sẽ được lưu ngay để bạn có thể dùng lại ở các lần hỗ trợ sau.",
                "The new vehicle will be saved so you can reuse it for future support.",
              )}
            </p>
          </div>

          <div className="mb-5">
            <p className={`${mono} mb-[10px] text-[11px] uppercase tracking-[0.16em] text-[#99a1af]`}>
              {t(isEnglish, "Loại xe", "Vehicle type")}
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
              {allowedTypes.map((option) => {
                const isActive = option === type;

                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setType(option)}
                    className={`flex items-center gap-3 rounded-[12px] border px-4 py-3 text-left transition-colors ${
                      isActive
                        ? "border-[#ee3224] bg-[rgba(238,50,36,0.06)]"
                        : "border-[rgba(4,38,153,0.08)] bg-white hover:border-[#ee3224]"
                    }`}
                  >
                    <div
                      className={`flex size-[34px] shrink-0 items-center justify-center rounded-full ${
                        isActive ? "bg-[rgba(238,50,36,0.12)]" : "bg-[#f3f3f5]"
                      }`}
                    >
                      {option === "Xe máy" ? (
                        <Bike size={16} className={isActive ? "text-[#ee3224]" : "text-[#4a5565]"} />
                      ) : (
                        <Car size={16} className={isActive ? "text-[#ee3224]" : "text-[#4a5565]"} />
                      )}
                    </div>
                    <span className={`${mono} text-[13px] font-[500] text-[#080b0d]`}>
                      {localizeVehicleType(option, isEnglish)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid gap-4">
            <Field label={t(isEnglish, "Tên xe", "Vehicle name")}>
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder={type === "Xe máy" ? t(isEnglish, "VD: Honda Vision 2023", "E.g. Honda Vision 2023") : t(isEnglish, "VD: Toyota Vios G", "E.g. Toyota Vios G")}
                className={`h-[46px] w-full rounded-[10px] border border-[rgba(4,38,153,0.08)] bg-white px-[14px] text-[13px] text-[#080b0d] outline-none transition-colors placeholder:text-[#a4a4a4] focus:border-[#ee3224] ${mono}`}
              />
            </Field>

            <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_120px]">
              <Field label={t(isEnglish, "Biển số", "Plate number")}>
                <input
                  value={plate}
                  onChange={(event) => setPlate(event.target.value.toUpperCase())}
                  placeholder="59F1-12345"
                  className={`h-[46px] w-full rounded-[10px] border border-[rgba(4,38,153,0.08)] bg-white px-[14px] text-[13px] text-[#080b0d] outline-none transition-colors placeholder:text-[#a4a4a4] focus:border-[#ee3224] ${mono}`}
                />
              </Field>

              <Field label={t(isEnglish, "Năm", "Year")}>
                <input
                  value={year}
                  onChange={(event) => setYear(event.target.value.replace(/\D/g, "").slice(0, 4))}
                  placeholder="2024"
                  inputMode="numeric"
                  className={`h-[46px] w-full rounded-[10px] border border-[rgba(4,38,153,0.08)] bg-white px-[14px] text-[13px] text-[#080b0d] outline-none transition-colors placeholder:text-[#a4a4a4] focus:border-[#ee3224] ${mono}`}
                />
              </Field>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={onClose}
              className="h-[46px] flex-1 rounded-[10px] border border-black bg-white transition-colors hover:bg-[#f5f5f5]"
            >
              <span className={`${mono} text-[14px] font-[500] text-[#080b0d]`}>
                {t(isEnglish, "Hủy", "Cancel")}
              </span>
            </button>
            <button
              type="button"
              onClick={() => onSave({ name, plate, year, type })}
              disabled={!isValid}
              className="flex h-[46px] flex-[1.2] items-center justify-center gap-2 rounded-[10px] border-0 bg-[#ee3224] transition-colors hover:bg-[#d42b1e] disabled:cursor-not-allowed disabled:bg-[#f3b3ad]"
            >
              <Plus size={16} className="text-white" />
              <span className={`${mono} text-[14px] font-[500] text-white`}>
                {t(isEnglish, "Lưu xe", "Save vehicle")}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({
  children,
  label,
}: {
  children: ReactNode;
  label: string;
}) {
  return (
    <label className="block">
      <p className={`${mono} mb-[8px] text-[11px] uppercase tracking-[0.16em] text-[#99a1af]`}>
        {label}
      </p>
      {children}
    </label>
  );
}

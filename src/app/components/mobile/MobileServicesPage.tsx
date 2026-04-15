import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import {
  AlertCircle,
  Bike,
  Car,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Loader2,
  MapPin,
  PhoneCall,
  Plus,
  X,
} from "lucide-react";
import {
  ServiceLocationPicker,
  type ServiceLocationValue,
} from "../location/ServiceLocationPicker";
import {
  createRequestDraft,
  confirmIncomingRequest,
  useResQStore,
  type ActiveResQRequest,
  type VehicleType,
} from "../resqStore";
import {
  resqServiceFilters,
  resqServices,
  type ResQService,
} from "../resqData";
import { VehicleFormModal } from "../vehicles/VehicleFormModal";
import { useAuth } from "../AuthContext";

const mono = "font-['IBM_Plex_Mono',monospace]";

type SheetStep = "select" | "review" | "sending" | "done";

function getAllowedVehicleTypes(service: ResQService): VehicleType[] {
  return service.types.includes("xe-may") && service.types.includes("o-to")
    ? ["Xe máy", "Ô tô"]
    : service.types.includes("xe-may")
      ? ["Xe máy"]
      : ["Ô tô"];
}

function ServiceRequestSheet({
  service,
  onClose,
}: {
  service: ResQService;
  onClose: () => void;
}) {
  const { vehicles, addVehicle, setActiveRequest } = useResQStore();
  const navigate = useNavigate();
  const allowedVehicleTypes = getAllowedVehicleTypes(service);
  const availableVehicles = vehicles.filter((vehicle) =>
    allowedVehicleTypes.includes(vehicle.type),
  );
  const defaultVehicle = availableVehicles.find((vehicle) => vehicle.isDefault)
    ?? availableVehicles[0]
    ?? null;

  const [selectedVehicleId, setSelectedVehicleId] = useState(defaultVehicle?.id ?? "");
  const [selectedLocation, setSelectedLocation] = useState<ServiceLocationValue | null>(null);
  const [locationLabel, setLocationLabel] = useState("");
  const [notes, setNotes] = useState("");
  const [vehicleModalTypes, setVehicleModalTypes] = useState<VehicleType[] | null>(null);
  const [step, setStep] = useState<SheetStep>("select");
  const [submittedRequest, setSubmittedRequest] = useState<ActiveResQRequest | null>(null);

  const selectedVehicle =
    availableVehicles.find((vehicle) => vehicle.id === selectedVehicleId) ?? defaultVehicle;
  const locationSummary =
    locationLabel.trim() || selectedLocation?.address || "Đang xác định vị trí";
  const locationCoordinates = selectedLocation
    ? `${selectedLocation.point.lat.toFixed(5)}, ${selectedLocation.point.lng.toFixed(5)}`
    : null;
  const flowSteps = [
    "Chọn xe",
    "Chốt vị trí",
    "Chờ fixer xác nhận",
  ];

  useEffect(() => {
    if (!availableVehicles.some((vehicle) => vehicle.id === selectedVehicleId)) {
      setSelectedVehicleId(defaultVehicle?.id ?? "");
    }
  }, [availableVehicles, defaultVehicle, selectedVehicleId]);

  useEffect(() => {
    if (step === "sending") {
      const timer = setTimeout(() => setStep("done"), 2200);
      return () => clearTimeout(timer);
    }
  }, [step]);

  const handleSubmit = () => {
    if (!selectedVehicle || !selectedLocation) {
      return;
    }

    const draft = createRequestDraft({
      serviceId: service.id,
      serviceTitle: service.title,
      servicePrice: service.price,
      serviceEta: service.eta,
      vehicle: selectedVehicle,
      locationAddress: locationSummary,
      locationPoint: selectedLocation.point,
      locationSource: selectedLocation.source,
      notes,
    });

    setSubmittedRequest(draft);
    setActiveRequest(draft);
    setStep("sending");
  };

  if (step === "sending") {
    return (
      <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/45 px-4 pb-6 pt-10">
        <div className="w-full max-w-[420px] rounded-[30px] bg-white px-5 py-8 text-center shadow-[0_28px_70px_rgba(8,11,13,0.3)]">
          <Loader2 size={42} className="mx-auto animate-spin text-[#ee3224]" />
          <h2 className="mt-5 font-['Syne',sans-serif] text-[28px] leading-[0.95] font-[700] tracking-[-0.04em] text-[#080b0d]">
            Đang gửi yêu cầu
          </h2>
          <p className={`${mono} mt-3 text-[12px] leading-[20px] text-[#667085]`}>
            Hệ thống đang chuyển request sang trạng thái chờ fixer xác nhận.
          </p>
        </div>
      </div>
    );
  }

  if (step === "done") {
    return (
      <div
        className="fixed inset-0 z-50 flex items-end justify-center bg-black/45 px-4 pb-6 pt-10"
        onClick={onClose}
      >
        <div
          className="w-full max-w-[420px] rounded-[30px] bg-white px-5 py-7 shadow-[0_28px_70px_rgba(8,11,13,0.3)]"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="flex size-[56px] items-center justify-center rounded-[22px] bg-[rgba(238,50,36,0.08)]">
            <Check size={26} className="text-[#ee3224]" />
          </div>
          <h2 className="mt-5 font-['Syne',sans-serif] text-[30px] leading-[0.94] font-[700] tracking-[-0.04em] text-[#080b0d]">
            Yêu cầu đã được gửi
          </h2>
          <p className={`${mono} mt-3 text-[12px] leading-[20px] text-[#667085]`}>
            Request đang chờ fixer xác nhận trước khi bắt đầu di chuyển.
          </p>

          <div className="mt-5 space-y-3 rounded-[24px] bg-[#faf8f5] p-4">
            {[
              ["Dịch vụ", submittedRequest?.serviceTitle ?? service.title],
              ["Xe", submittedRequest?.vehicleName ?? selectedVehicle?.name ?? "--"],
              ["Biển số", submittedRequest?.vehiclePlate ?? selectedVehicle?.plate ?? "--"],
              ["Vị trí", locationSummary],
              ["Giá ước tính", submittedRequest?.servicePrice ?? service.price],
            ].map(([label, value]) => (
              <div key={label} className="flex items-start justify-between gap-3">
                <span className={`${mono} text-[11px] text-[#99a1af]`}>{label}</span>
                <span className={`${mono} max-w-[180px] text-right text-[11px] font-[500] text-[#080b0d]`}>
                  {value}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-4 rounded-[22px] bg-[#faf8f5] p-4">
            <p className={`${mono} text-[10px] uppercase tracking-[0.18em] text-[#99a1af]`}>
              Tiếp theo
            </p>
            <div className="mt-3 space-y-2">
              {[
                "ResQ đang tìm fixer gần bạn nhất cho yêu cầu này.",
                "Trang Theo Dõi sẽ bật bản đồ và chat ngay khi fixer xác nhận đơn.",
                "Trong lúc chờ, bạn vẫn có thể quay lại chỉnh hoặc hủy yêu cầu.",
              ].map((item) => (
                <p key={item} className={`${mono} text-[11px] leading-[19px] text-[#667085]`}>
                  {item}
                </p>
              ))}
            </div>
          </div>

          <div className="mt-5 grid gap-3">
            <button
              onClick={() => {
                onClose();
                navigate("/theo-doi");
              }}
              className="rounded-[18px] bg-[#ee3224] px-4 py-3 text-white"
            >
              <span className={`${mono} text-[11px] uppercase tracking-[0.18em]`}>
                Theo dõi fixer
              </span>
            </button>
            <button
              onClick={onClose}
              className="rounded-[18px] border border-black/10 bg-white px-4 py-3 text-[#080b0d]"
            >
              <span className={`${mono} text-[11px] uppercase tracking-[0.18em]`}>
                Đóng
              </span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (step === "review") {
    return (
      <div
        className="fixed inset-0 z-50 flex items-end justify-center bg-black/45 px-4 pb-0 pt-10"
        onClick={onClose}
      >
        <div
          className="w-full max-w-[420px] rounded-t-[32px] bg-[linear-gradient(180deg,#ffffff_0%,#fbf7f3_100%)] px-5 pb-[calc(20px+env(safe-area-inset-bottom))] pt-5 shadow-[0_-12px_40px_rgba(8,11,13,0.18)]"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="mx-auto h-1.5 w-12 rounded-full bg-black/10" />
          <div className="mt-4 flex items-start justify-between gap-3">
            <div>
              <p className={`${mono} text-[10px] uppercase tracking-[0.18em] text-[#99a1af]`}>
                Review request
              </p>
              <h2 className="mt-2 font-['Syne',sans-serif] text-[28px] leading-[0.95] font-[700] tracking-[-0.04em] text-[#080b0d]">
                Xác nhận thông tin
              </h2>
            </div>
            <button
              onClick={onClose}
              className="flex size-[36px] items-center justify-center rounded-full bg-white text-[#667085]"
            >
              <X size={18} />
            </button>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {flowSteps.map((stepLabel, index) => (
              <span
                key={stepLabel}
                className={`${mono} inline-flex items-center rounded-full px-3 py-1.5 text-[10px] uppercase tracking-[0.16em] ${
                  index === 1
                    ? "bg-[#ee3224] text-white"
                    : index < 1
                      ? "bg-[rgba(238,50,36,0.1)] text-[#ee3224]"
                      : "bg-white text-[#667085]"
                }`}
              >
                {index + 1}. {stepLabel}
              </span>
            ))}
          </div>

          <div className="mt-5 space-y-3">
            <div className="rounded-[22px] bg-white p-4">
              <div className="flex items-center gap-3">
                <div className="flex size-[44px] items-center justify-center rounded-[18px] bg-[rgba(238,50,36,0.1)]">
                  <service.icon size={18} className="text-[#ee3224]" />
                </div>
                <div>
                  <p className={`${mono} text-[12px] font-[500] text-[#080b0d]`}>
                    {service.title}
                  </p>
                  <p className={`${mono} mt-1 text-[11px] text-[#667085]`}>
                    {selectedVehicle?.name ?? "Chưa chọn xe"} · {selectedVehicle?.plate ?? "--"}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-[22px] bg-white p-4">
              <p className={`${mono} text-[10px] uppercase tracking-[0.18em] text-[#99a1af]`}>
                Vị trí
              </p>
              <p className={`${mono} mt-2 text-[12px] leading-[20px] text-[#080b0d]`}>
                {locationSummary}
              </p>
              {locationCoordinates && (
                <p className={`${mono} mt-2 text-[10px] text-[#667085]`}>
                  {locationCoordinates}
                </p>
              )}
            </div>

            <div className="rounded-[22px] bg-white p-4">
              <p className={`${mono} text-[10px] uppercase tracking-[0.18em] text-[#99a1af]`}>
                Ghi chú cho fixer
              </p>
              <textarea
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder="Ví dụ: xe đang ở lề phải, lốp trước bị thủng..."
                className={`mt-3 h-[110px] w-full resize-none rounded-[18px] border border-black/8 bg-[#faf8f5] px-4 py-3 text-[12px] text-[#080b0d] outline-none transition-colors placeholder:text-[#99a1af] focus:border-[#ee3224] ${mono}`}
              />
            </div>

            <div className="flex items-start gap-3 rounded-[22px] border border-[#f5d3cf] bg-[#fff5f3] px-4 py-4">
              <AlertCircle size={16} className="mt-[2px] shrink-0 text-[#ee3224]" />
              <p className={`${mono} text-[11px] leading-[19px] text-[#5c6470]`}>
                Giá hiển thị là ước tính ban đầu. Fixer có thể xác nhận lại chi phí sau khi kiểm tra tình trạng thực tế.
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-3">
            <button
              onClick={handleSubmit}
              disabled={!selectedVehicle || !selectedLocation}
              className="rounded-[18px] bg-[#ee3224] px-4 py-3 text-white disabled:bg-[#f3b3ad]"
            >
              <span className={`${mono} text-[11px] uppercase tracking-[0.18em]`}>
                Gửi yêu cầu
              </span>
            </button>
            <button
              onClick={() => setStep("select")}
              className="rounded-[18px] border border-black/10 bg-white px-4 py-3 text-[#080b0d]"
            >
              <span className={`${mono} text-[11px] uppercase tracking-[0.18em]`}>
                Quay lại
              </span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/45 px-4 pb-0 pt-10"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[420px] rounded-t-[32px] bg-[linear-gradient(180deg,#ffffff_0%,#fbf7f3_100%)] px-5 pb-[calc(20px+env(safe-area-inset-bottom))] pt-5 shadow-[0_-12px_40px_rgba(8,11,13,0.18)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mx-auto h-1.5 w-12 rounded-full bg-black/10" />
        <div className="mt-4 flex items-start justify-between gap-3">
          <div>
            <p className={`${mono} text-[10px] uppercase tracking-[0.18em] text-[#99a1af]`}>
              Service request
            </p>
            <h2 className="mt-2 font-['Syne',sans-serif] text-[30px] leading-[0.94] font-[700] tracking-[-0.04em] text-[#080b0d]">
              {service.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="flex size-[36px] items-center justify-center rounded-full bg-white text-[#667085]"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mt-4 rounded-[22px] bg-white p-4">
          <div className="flex flex-wrap gap-2">
            {flowSteps.map((stepLabel, index) => (
              <span
                key={stepLabel}
                className={`${mono} inline-flex items-center rounded-full px-3 py-1.5 text-[10px] uppercase tracking-[0.16em] ${
                  index === 0 ? "bg-[#ee3224] text-white" : "bg-[#faf8f5] text-[#667085]"
                }`}
              >
                {index + 1}. {stepLabel}
              </span>
            ))}
          </div>
          <p className={`${mono} mt-3 text-[11px] leading-[19px] text-[#667085]`}>
            Xong bước này, app sẽ đưa bạn sang phần kiểm tra lại yêu cầu trước khi gửi sang hệ thống điều phối fixer.
          </p>
        </div>

        <div className="mt-5 space-y-4 overflow-y-auto pb-2">
          <div className="rounded-[24px] bg-white p-4">
            <div className="flex items-center gap-3">
              <div className="flex size-[46px] items-center justify-center rounded-[18px] bg-[rgba(238,50,36,0.1)]">
                <service.icon size={20} className="text-[#ee3224]" />
              </div>
              <div className="min-w-0">
                <p className={`${mono} text-[12px] font-[500] text-[#080b0d]`}>
                  {service.desc}
                </p>
                <p className={`${mono} mt-2 text-[10px] uppercase tracking-[0.16em] text-[#667085]`}>
                  ETA {service.eta} · {service.price}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-[24px] bg-white p-4">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className={`${mono} text-[10px] uppercase tracking-[0.16em] text-[#99a1af]`}>
                  Chọn xe
                </p>
                <p className={`${mono} mt-1 text-[12px] text-[#080b0d]`}>
                  Lưu xe để xác nhận yêu cầu nhanh hơn
                </p>
              </div>
              <button
                type="button"
                onClick={() => setVehicleModalTypes(allowedVehicleTypes)}
                className="inline-flex items-center gap-2 rounded-full border border-black/8 bg-[#faf8f5] px-3 py-2"
              >
                <Plus size={14} className="text-[#ee3224]" />
                <span className={`${mono} text-[10px] uppercase tracking-[0.18em] text-[#080b0d]`}>
                  Thêm xe
                </span>
              </button>
            </div>

            {availableVehicles.length > 0 ? (
              <div className="space-y-3">
                {availableVehicles.map((vehicle) => (
                  <button
                    key={vehicle.id}
                    onClick={() => setSelectedVehicleId(vehicle.id)}
                    className={`flex w-full items-center gap-3 rounded-[20px] border px-4 py-4 text-left ${
                      selectedVehicleId === vehicle.id
                        ? "border-[#ee3224] bg-[rgba(238,50,36,0.04)]"
                        : "border-black/6 bg-[#faf8f5]"
                    }`}
                  >
                    <div className="flex size-[42px] items-center justify-center rounded-[16px] bg-white">
                      {vehicle.type === "Xe máy" ? (
                        <Bike size={18} className="text-[#ee3224]" />
                      ) : (
                        <Car size={18} className="text-[#ee3224]" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className={`${mono} text-[12px] font-[500] text-[#080b0d]`}>
                          {vehicle.name}
                        </p>
                        {vehicle.isDefault && (
                          <span className={`${mono} rounded-full bg-[rgba(238,50,36,0.1)] px-2 py-1 text-[9px] uppercase tracking-[0.16em] text-[#ee3224]`}>
                            Mặc định
                          </span>
                        )}
                      </div>
                      <p className={`${mono} mt-1 text-[11px] text-[#667085]`}>
                        {vehicle.plate} · {vehicle.year}
                      </p>
                    </div>
                    {selectedVehicleId === vehicle.id && (
                      <div className="flex size-[26px] items-center justify-center rounded-full bg-[#ee3224]">
                        <CheckCircle2 size={14} className="text-white" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            ) : (
              <div className="rounded-[20px] border border-dashed border-black/10 bg-[#faf8f5] px-4 py-4">
                <p className={`${mono} text-[11px] leading-[19px] text-[#667085]`}>
                  Chưa có phương tiện phù hợp cho dịch vụ này. Thêm xe để tiếp tục.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {allowedVehicleTypes.map((vehicleType) => (
                    <button
                      key={vehicleType}
                      type="button"
                      onClick={() => setVehicleModalTypes([vehicleType])}
                      className="inline-flex items-center gap-2 rounded-full border border-black/8 bg-white px-3 py-2"
                    >
                      {vehicleType === "Xe máy" ? (
                        <Bike size={14} className="text-[#ee3224]" />
                      ) : (
                        <Car size={14} className="text-[#ee3224]" />
                      )}
                      <span className={`${mono} text-[10px] uppercase tracking-[0.16em] text-[#080b0d]`}>
                        Thêm {vehicleType.toLowerCase()}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="rounded-[24px] bg-white p-4">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className={`${mono} text-[10px] uppercase tracking-[0.16em] text-[#99a1af]`}>
                  Xác nhận vị trí
                </p>
                <p className={`${mono} mt-1 text-[12px] text-[#080b0d]`}>
                  Ghim lại nếu GPS chưa chính xác
                </p>
              </div>
              <Clock3 size={16} className="text-[#667085]" />
            </div>

            <ServiceLocationPicker
              className="h-[240px]"
              onChange={(nextLocation) => {
                setSelectedLocation(nextLocation);
                setLocationLabel(nextLocation.address);
              }}
            />

            <div className="mt-4 grid gap-3">
              <div>
                <p className={`${mono} mb-2 text-[10px] uppercase tracking-[0.16em] text-[#99a1af]`}>
                  Địa chỉ / cột mốc
                </p>
                <input
                  value={locationLabel}
                  onChange={(event) => setLocationLabel(event.target.value)}
                  placeholder="VD: gần cây xăng, trước cổng chung cư..."
                  className={`h-[44px] w-full rounded-[16px] border border-black/8 bg-[#faf8f5] px-4 text-[12px] text-[#080b0d] outline-none transition-colors placeholder:text-[#99a1af] focus:border-[#ee3224] ${mono}`}
                />
              </div>

              <div className="rounded-[18px] bg-[#faf8f5] px-4 py-4">
                <p className={`${mono} text-[10px] uppercase tracking-[0.16em] text-[#99a1af]`}>
                  Tóm tắt vị trí
                </p>
                <p className={`${mono} mt-2 text-[12px] leading-[20px] text-[#080b0d]`}>
                  {locationSummary}
                </p>
                {locationCoordinates && (
                  <p className={`${mono} mt-2 text-[10px] text-[#667085]`}>
                    {locationCoordinates}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="rounded-[24px] bg-[#111111] px-4 py-4 text-white">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className={`${mono} text-[10px] uppercase tracking-[0.18em] text-white/56`}>
                  Estimate
                </p>
                <p className="mt-2 font-['Syne',sans-serif] text-[24px] leading-none font-[700] tracking-[-0.04em]">
                  {service.price}
                </p>
              </div>
              <div className="text-right">
                <p className={`${mono} text-[10px] uppercase tracking-[0.18em] text-white/56`}>
                  ETA
                </p>
                <p className="mt-2 font-['Syne',sans-serif] text-[24px] leading-none font-[700] tracking-[-0.04em]">
                  {service.eta}
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={() => setStep("review")}
            disabled={!selectedVehicle || !selectedLocation || !locationLabel.trim()}
            className="flex w-full items-center justify-center gap-2 rounded-[18px] bg-[#ee3224] px-4 py-3 text-white disabled:bg-[#f3b3ad]"
          >
            <span className={`${mono} text-[11px] uppercase tracking-[0.18em]`}>
              Tiếp tục
            </span>
            <ChevronRight size={14} />
          </button>
        </div>

        {vehicleModalTypes && (
          <VehicleFormModal
            allowedTypes={vehicleModalTypes}
            onClose={() => setVehicleModalTypes(null)}
            onSave={(payload) => {
              const vehicle = addVehicle(payload);
              setSelectedVehicleId(vehicle.id);
              setVehicleModalTypes(null);
            }}
          />
        )}
      </div>
    </div>
  );
}

export default function MobileServicesPage() {
  const { user } = useAuth();
  const [activeFilter, setActiveFilter] = useState("all");
  const [selectedService, setSelectedService] = useState<ResQService | null>(null);
  const { activeRequest, incomingRequests } = useResQStore();
  const navigate = useNavigate();

  if (user?.role === "fixer") {
    return <MobileFixerServicesPage incomingRequests={incomingRequests} activeRequest={activeRequest} />;
  }

  const filteredServices =
    activeFilter === "all"
      ? resqServices
      : resqServices.filter((service) => service.types.includes(activeFilter as "xe-may" | "o-to"));

  return (
    <div className="space-y-5 pb-5">
      <section className="rounded-[30px] bg-[linear-gradient(135deg,#111111_0%,#241514_42%,#ee3224_100%)] px-5 py-5 text-white shadow-[0_24px_60px_rgba(8,11,13,0.22)]">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className={`${mono} text-[10px] uppercase tracking-[0.22em] text-white/56`}>
              Services
            </p>
            <h1 className="mt-3 font-['Syne',sans-serif] text-[34px] leading-[0.92] font-[700] tracking-[-0.05em]">
              Chọn đúng hỗ trợ cho đúng sự cố
            </h1>
          </div>
          <a
            href="tel:19001234"
            className="flex size-[44px] shrink-0 items-center justify-center rounded-[18px] border border-white/10 bg-white/10 text-white no-underline"
          >
            <PhoneCall size={18} />
          </a>
        </div>

        <p className={`${mono} mt-3 max-w-[300px] text-[12px] leading-[20px] text-white/74`}>
          Danh mục được tối ưu cho thao tác bằng một tay: chọn xe, ghim vị trí và gửi yêu cầu ngay.
        </p>

        {activeRequest && (
          <Link
            to="/theo-doi"
            className="mt-4 block rounded-[22px] border border-white/12 bg-white/10 px-4 py-4 text-white no-underline backdrop-blur"
          >
            <p className={`${mono} text-[10px] uppercase tracking-[0.18em] text-white/56`}>
              Đang hoạt động
            </p>
            <p className="mt-2 font-['Syne',sans-serif] text-[24px] leading-none font-[700] tracking-[-0.04em]">
              {activeRequest.serviceTitle}
            </p>
            <p className={`${mono} mt-2 text-[11px] leading-[18px] text-white/78`}>
              {activeRequest.status} · {activeRequest.serviceEta}
            </p>
          </Link>
        )}
      </section>

      <section className="rounded-[26px] bg-white/92 p-4 shadow-[0_18px_40px_rgba(8,11,13,0.06)]">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {resqServiceFilters.map((filter) => {
            const active = activeFilter === filter.value;
            const count =
              filter.value === "all"
                ? resqServices.length
                : resqServices.filter((service) => service.types.includes(filter.value)).length;

            return (
              <button
                key={filter.value}
                onClick={() => setActiveFilter(filter.value)}
                className={`shrink-0 rounded-full px-4 py-2 ${
                  active
                    ? "bg-[#ee3224] text-white"
                    : "border border-black/8 bg-[#faf8f5] text-[#080b0d]"
                }`}
              >
                <span className={`${mono} text-[10px] uppercase tracking-[0.18em]`}>
                  {filter.label} · {count}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="rounded-[26px] bg-white/92 p-4 shadow-[0_18px_40px_rgba(8,11,13,0.06)]">
        <p className={`${mono} text-[10px] uppercase tracking-[0.18em] text-[#99a1af]`}>
          Luồng tạo yêu cầu
        </p>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          {[
            "1. Chọn đúng dịch vụ cho xe của bạn.",
            "2. Xác nhận xe, vị trí và ghi chú ngắn.",
            "3. Chuyển sang Theo Dõi để chờ fixer xác nhận.",
          ].map((item) => (
            <div key={item} className="rounded-[20px] bg-[#faf8f5] px-4 py-4">
              <p className={`${mono} text-[11px] leading-[19px] text-[#667085]`}>
                {item}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        {filteredServices.map((service) => {
          const Icon = service.icon;

          return (
            <button
              key={service.id}
              onClick={() => {
                if (activeRequest) {
                  navigate("/theo-doi");
                  return;
                }

                setSelectedService(service);
              }}
              className="w-full rounded-[26px] bg-white/92 p-4 text-left shadow-[0_18px_40px_rgba(8,11,13,0.06)]"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex min-w-0 items-start gap-3">
                  <div className="flex size-[46px] items-center justify-center rounded-[18px] bg-[rgba(238,50,36,0.1)]">
                    <Icon size={18} className="text-[#ee3224]" />
                  </div>
                  <div className="min-w-0">
                    <p className={`${mono} text-[12px] font-[500] leading-[19px] text-[#080b0d]`}>
                      {service.title}
                    </p>
                    <p className={`${mono} mt-2 text-[11px] leading-[19px] text-[#667085]`}>
                      {service.desc}
                    </p>
                  </div>
                </div>

                <ChevronRight size={18} className="mt-1 shrink-0 text-[#99a1af]" />
              </div>

              <div className="mt-4 flex items-center justify-between gap-3 rounded-[20px] bg-[#faf8f5] px-3 py-3">
                <div>
                  <p className={`${mono} text-[10px] uppercase tracking-[0.16em] text-[#99a1af]`}>
                    Giá ước tính
                  </p>
                  <p className={`${mono} mt-1 text-[12px] font-[500] text-[#080b0d]`}>
                    {service.price}
                  </p>
                </div>
                <div className="text-right">
                  <p className={`${mono} text-[10px] uppercase tracking-[0.16em] text-[#99a1af]`}>
                    ETA
                  </p>
                  <p className={`${mono} mt-1 text-[12px] font-[500] text-[#080b0d]`}>
                    {service.eta}
                  </p>
                </div>
              </div>
              {activeRequest && (
                <p className={`${mono} mt-3 text-[11px] leading-[18px] text-[#a8564f]`}>
                  Bạn đang có request mở. Chạm để quay lại Theo Dõi thay vì tạo request mới.
                </p>
              )}
            </button>
          );
        })}
      </section>

      <section className="rounded-[26px] border border-[#f5d3cf] bg-[linear-gradient(135deg,#fff4f2_0%,#fffaf8_100%)] px-5 py-5 shadow-[0_18px_40px_rgba(8,11,13,0.06)]">
        <p className={`${mono} text-[10px] uppercase tracking-[0.22em] text-[#99a1af]`}>
          Không chắc chọn dịch vụ nào?
        </p>
        <h2 className="mt-3 font-['Syne',sans-serif] text-[28px] leading-[0.95] font-[700] tracking-[-0.04em] text-[#080b0d]">
          Gọi hotline để được điều phối nhanh
        </h2>
        <p className={`${mono} mt-3 text-[12px] leading-[20px] text-[#667085]`}>
          Đội ngũ ResQ có thể giúp bạn xác định loại hỗ trợ phù hợp trước khi tạo yêu cầu.
        </p>
        <a
          href="tel:19001234"
          className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#ee3224] px-4 py-2.5 text-white no-underline"
        >
          <PhoneCall size={14} />
          <span className={`${mono} text-[10px] uppercase tracking-[0.18em]`}>
            1900 1234
          </span>
        </a>
      </section>

      {selectedService && (
        <ServiceRequestSheet
          service={selectedService}
          onClose={() => setSelectedService(null)}
        />
      )}
    </div>
  );
}

function MobileFixerServicesPage({
  incomingRequests,
  activeRequest,
}: {
  incomingRequests: ReturnType<typeof useResQStore>["incomingRequests"];
  activeRequest: ReturnType<typeof useResQStore>["activeRequest"];
}) {
  return (
    <div className="space-y-5 pb-5">
      <section className="rounded-[30px] bg-[linear-gradient(135deg,#111111_0%,#241514_42%,#ee3224_100%)] px-5 py-5 text-white shadow-[0_24px_60px_rgba(8,11,13,0.22)]">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className={`${mono} text-[10px] uppercase tracking-[0.22em] text-white/56`}>
              Fixer orders
            </p>
            <h1 className="mt-3 font-['Syne',sans-serif] text-[34px] leading-[0.92] font-[700] tracking-[-0.05em]">
              Kiểm tra đơn hàng mới từ khách hàng
            </h1>
          </div>
          <Link
            to="/theo-doi"
            className="flex size-[44px] shrink-0 items-center justify-center rounded-[18px] border border-white/10 bg-white/10 text-white no-underline"
          >
            <ChevronRight size={18} />
          </Link>
        </div>

        <p className={`${mono} mt-3 max-w-[300px] text-[12px] leading-[20px] text-white/74`}>
          Xác nhận đơn tại đây rồi chuyển sang Quá Trình để cập nhật trạng thái xử lý cho khách hàng.
        </p>

        {activeRequest && (
          <Link
            to="/theo-doi"
            className="mt-4 block rounded-[22px] border border-white/12 bg-white/10 px-4 py-4 text-white no-underline backdrop-blur"
          >
            <p className={`${mono} text-[10px] uppercase tracking-[0.18em] text-white/56`}>
              Đơn đang phụ trách
            </p>
            <p className="mt-2 font-['Syne',sans-serif] text-[24px] leading-none font-[700] tracking-[-0.04em]">
              {activeRequest.serviceTitle}
            </p>
            <p className={`${mono} mt-2 text-[11px] leading-[18px] text-white/78`}>
              {activeRequest.requesterName} · {activeRequest.status}
            </p>
          </Link>
        )}
      </section>

      {incomingRequests.length === 0 ? (
        <section className="rounded-[26px] border border-dashed border-black/10 bg-white/88 p-5 text-center shadow-[0_18px_40px_rgba(8,11,13,0.06)]">
          <div className="mx-auto flex size-[56px] items-center justify-center rounded-[22px] bg-[rgba(238,50,36,0.08)]">
            <ClipboardList size={24} className="text-[#ee3224]" />
          </div>
          <h2 className="mt-4 font-['Syne',sans-serif] text-[26px] leading-[0.95] font-[700] tracking-[-0.04em] text-[#080b0d]">
            Bạn chưa được nhận request nào
          </h2>
          <p className={`${mono} mt-3 text-[12px] leading-[20px] text-[#667085]`}>
            Khi khách hàng gửi yêu cầu mới, request chờ fixer xác nhận sẽ xuất hiện tại đây.
          </p>
        </section>
      ) : (
        <section className="space-y-3">
          {incomingRequests.map((request) => {
            const VehicleIcon = request.vehicleType === "Xe máy" ? Bike : Car;

            return (
              <div
                key={request.id}
                className="rounded-[26px] bg-white/92 p-4 text-left shadow-[0_18px_40px_rgba(8,11,13,0.06)]"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className={`${mono} text-[10px] uppercase tracking-[0.18em] text-[#99a1af]`}>
                      {request.id}
                    </p>
                    <p className={`${mono} mt-2 text-[12px] font-[500] leading-[19px] text-[#080b0d]`}>
                      {request.serviceTitle}
                    </p>
                    <p className={`${mono} mt-2 text-[11px] leading-[19px] text-[#667085]`}>
                      {request.requesterName} · {request.requesterPhone || "Chưa có số liên hệ"}
                    </p>
                  </div>

                  <span className={`${mono} rounded-full bg-[rgba(238,50,36,0.08)] px-3 py-1 text-[10px] uppercase tracking-[0.16em] text-[#ee3224]`}>
                    {request.serviceEta}
                  </span>
                </div>

                <div className="mt-4 space-y-3">
                  <div className="flex items-start gap-3 rounded-[20px] bg-[#faf8f5] px-3 py-3">
                    <VehicleIcon size={16} className="mt-[2px] shrink-0 text-[#ee3224]" />
                    <div className="min-w-0">
                      <p className={`${mono} text-[10px] uppercase tracking-[0.16em] text-[#99a1af]`}>
                        Xe
                      </p>
                      <p className={`${mono} mt-1 text-[11px] leading-[18px] text-[#080b0d]`}>
                        {request.vehicleName} · {request.vehiclePlate}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 rounded-[20px] bg-[#faf8f5] px-3 py-3">
                    <MapPin size={16} className="mt-[2px] shrink-0 text-[#ee3224]" />
                    <div className="min-w-0">
                      <p className={`${mono} text-[10px] uppercase tracking-[0.16em] text-[#99a1af]`}>
                        Vị trí
                      </p>
                      <p className={`${mono} mt-1 text-[11px] leading-[18px] text-[#080b0d]`}>
                        {request.locationAddress}
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    confirmIncomingRequest(request.id);
                  }}
                  className="mt-4 rounded-[18px] bg-[#ee3224] px-4 py-3 text-white"
                >
                  <span className={`${mono} text-[10px] uppercase tracking-[0.18em]`}>
                    Xác nhận đơn
                  </span>
                </button>
              </div>
            );
          })}
        </section>
      )}
    </div>
  );
}

import { useState } from "react";
import { Link } from "react-router";
import {
  Bell,
  Bike,
  Car,
  ChevronRight,
  LogOut,
  Plus,
  Shield,
  Trash2,
  UserRound,
} from "lucide-react";
import { useAuth } from "../AuthContext";
import { useResQStore, type VehicleType } from "../resqStore";
import { VehicleFormModal } from "../vehicles/VehicleFormModal";
import { getRoleLabel } from "@/utils/supabase/auth";

const mono = "font-['IBM_Plex_Mono',monospace]";

const notificationDefaults = {
  request: true,
  eta: true,
  payment: false,
};

export default function MobileProfilePage() {
  const { user, isLoggedIn, logout } = useAuth();
  const {
    vehicles,
    addVehicle,
    removeVehicle,
    requestHistory,
    setDefaultVehicle,
  } = useResQStore();
  const [showVehicleModal, setShowVehicleModal] = useState(false);
  const [notifications, setNotifications] = useState(notificationDefaults);
  const roleLabel = user ? getRoleLabel(user.role) : "Khách hàng";
  const handleLogout = async () => {
    await logout();
  };

  if (!isLoggedIn) {
    return (
      <div className="space-y-5 pb-5">
        <section className="rounded-[30px] bg-[linear-gradient(135deg,#111111_0%,#241615_100%)] px-5 py-5 text-white shadow-[0_24px_60px_rgba(8,11,13,0.22)]">
          <p className={`${mono} text-[10px] uppercase tracking-[0.22em] text-white/56`}>
            Account
          </p>
          <h1 className="mt-3 font-['Syne',sans-serif] text-[32px] leading-[0.95] font-[700] tracking-[-0.04em]">
            Đăng nhập để lưu xe và theo dõi mọi yêu cầu
          </h1>
          <p className={`${mono} mt-3 max-w-[290px] text-[12px] leading-[20px] text-white/72`}>
            Hồ sơ, phương tiện mặc định, lịch sử và thông báo sẽ được giữ lại cho những lần hỗ trợ tiếp theo.
          </p>
        </section>

        <section className="rounded-[26px] bg-white/92 p-5 text-center shadow-[0_18px_40px_rgba(8,11,13,0.06)]">
          <div className="mx-auto flex size-[58px] items-center justify-center rounded-[22px] bg-[rgba(238,50,36,0.08)]">
            <UserRound size={24} className="text-[#ee3224]" />
          </div>
          <h2 className="mt-4 font-['Syne',sans-serif] text-[26px] leading-[0.95] font-[700] tracking-[-0.04em] text-[#080b0d]">
            Tài khoản giúp bạn gọi nhanh hơn
          </h2>
          <p className={`${mono} mt-3 text-[12px] leading-[20px] text-[#667085]`}>
            Lưu biển số, nhận cập nhật ETA và xem lại hồ sơ thanh toán ngay trong app.
          </p>
          <div className="mt-5 grid gap-3">
            <Link
              to="/dang-nhap"
              className="rounded-[18px] bg-[#ee3224] px-4 py-3 text-white no-underline"
            >
              <span className={`${mono} text-[11px] uppercase tracking-[0.18em]`}>
                Đăng nhập
              </span>
            </Link>
            <Link
              to="/dang-nhap?tab=register"
              className="rounded-[18px] border border-black/10 bg-white px-4 py-3 text-[#080b0d] no-underline"
            >
              <span className={`${mono} text-[11px] uppercase tracking-[0.18em]`}>
                Tạo tài khoản
              </span>
            </Link>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-5 pb-5">
      <section className="rounded-[30px] bg-[linear-gradient(135deg,#fff4ef_0%,#ffe8df_100%)] px-5 py-5 shadow-[0_18px_40px_rgba(8,11,13,0.06)]">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className={`${mono} text-[10px] uppercase tracking-[0.22em] text-[#99a1af]`}>
              Profile
            </p>
            <h1 className="mt-3 font-['Syne',sans-serif] text-[30px] leading-[0.95] font-[700] tracking-[-0.04em] text-[#080b0d]">
              {user?.name ?? "Người dùng ResQ"}
            </h1>
            <p className={`${mono} mt-3 text-[12px] leading-[20px] text-[#667085]`}>
              {user?.phone} · {user?.email}
            </p>
            <p className={`${mono} mt-2 text-[10px] uppercase tracking-[0.18em] text-[#ee3224]`}>
              {roleLabel}
            </p>
          </div>
          <button
            onClick={() => void handleLogout()}
            className="flex size-[42px] items-center justify-center rounded-[16px] border border-black/5 bg-white text-[#ee3224]"
          >
            <LogOut size={18} />
          </button>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-3">
          {[
            ["Xe lưu", vehicles.length.toString()],
            ["Yêu cầu", requestHistory.length.toString()],
            ["Thông báo", Object.values(notifications).filter(Boolean).length.toString()],
          ].map(([label, value]) => (
            <div key={label} className="rounded-[20px] bg-white px-3 py-3">
              <p className={`${mono} text-[10px] uppercase tracking-[0.16em] text-[#99a1af]`}>
                {label}
              </p>
              <p className="mt-2 font-['Syne',sans-serif] text-[24px] leading-none font-[700] tracking-[-0.04em] text-[#080b0d]">
                {value}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-[26px] bg-white/92 p-4 shadow-[0_18px_40px_rgba(8,11,13,0.06)]">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className={`${mono} text-[10px] uppercase tracking-[0.18em] text-[#99a1af]`}>
              Vehicles
            </p>
            <h2 className="mt-2 font-['Syne',sans-serif] text-[24px] leading-[1] font-[700] tracking-[-0.04em] text-[#080b0d]">
              Xe của tôi
            </h2>
          </div>

          <button
            type="button"
            onClick={() => setShowVehicleModal(true)}
            className="inline-flex items-center gap-2 rounded-full bg-[#ee3224] px-3 py-2 text-white"
          >
            <Plus size={14} />
            <span className={`${mono} text-[10px] uppercase tracking-[0.18em]`}>
              Thêm xe
            </span>
          </button>
        </div>

        <div className="space-y-3">
          {vehicles.map((vehicle) => (
            <div key={vehicle.id} className="rounded-[22px] border border-black/5 bg-[#faf8f5] p-4">
              <div className="flex items-center gap-3">
                <div className="flex size-[44px] items-center justify-center rounded-[18px] bg-white">
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
                <button
                  type="button"
                  onClick={() => removeVehicle(vehicle.id)}
                  className="flex size-[34px] items-center justify-center rounded-full bg-white text-[#667085]"
                  aria-label={`Xóa xe ${vehicle.name}`}
                >
                  <Trash2 size={14} />
                </button>
              </div>

              {!vehicle.isDefault && (
                <button
                  type="button"
                  onClick={() => setDefaultVehicle(vehicle.id)}
                  className="mt-3 rounded-full border border-black/10 bg-white px-3 py-2"
                >
                  <span className={`${mono} text-[10px] uppercase tracking-[0.18em] text-[#080b0d]`}>
                    Đặt mặc định
                  </span>
                </button>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-[26px] bg-white/92 p-4 shadow-[0_18px_40px_rgba(8,11,13,0.06)]">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex size-[42px] items-center justify-center rounded-[16px] bg-[rgba(238,50,36,0.08)]">
            <Bell size={18} className="text-[#ee3224]" />
          </div>
          <div>
            <p className={`${mono} text-[10px] uppercase tracking-[0.18em] text-[#99a1af]`}>
              Notifications
            </p>
            <h2 className="mt-1 font-['Syne',sans-serif] text-[24px] leading-[1] font-[700] tracking-[-0.04em] text-[#080b0d]">
              Tùy chỉnh thông báo
            </h2>
          </div>
        </div>

        <div className="space-y-3">
          {[
            ["request", "Xác nhận yêu cầu"],
            ["eta", "ETA và fixer đến gần"],
            ["payment", "Nhắc thanh toán"],
          ].map(([key, label]) => (
            <button
              key={key}
              onClick={() =>
                setNotifications((current) => ({
                  ...current,
                  [key]: !current[key as keyof typeof current],
                }))
              }
              className="flex w-full items-center justify-between rounded-[20px] bg-[#faf8f5] px-4 py-4 text-left"
            >
              <div>
                <p className={`${mono} text-[12px] font-[500] text-[#080b0d]`}>
                  {label}
                </p>
              </div>
              <div
                className={`relative h-[28px] w-[48px] rounded-full transition-colors ${
                  notifications[key as keyof typeof notifications]
                    ? "bg-[#ee3224]"
                    : "bg-[#d8d8d8]"
                }`}
              >
                <div
                  className={`absolute top-[3px] size-[22px] rounded-full bg-white transition-all ${
                    notifications[key as keyof typeof notifications]
                      ? "left-[23px]"
                      : "left-[3px]"
                  }`}
                />
              </div>
            </button>
          ))}
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3">
        <Link
          to="/tro-giup"
          className="rounded-[22px] bg-white/92 px-4 py-4 no-underline shadow-[0_18px_40px_rgba(8,11,13,0.06)]"
        >
          <Shield size={18} className="text-[#ee3224]" />
          <p className={`${mono} mt-4 text-[10px] uppercase tracking-[0.18em] text-[#99a1af]`}>
            Safety
          </p>
          <p className="mt-2 font-['Syne',sans-serif] text-[22px] leading-none font-[700] tracking-[-0.04em] text-[#080b0d]">
            Trợ giúp
          </p>
        </Link>

        <Link
          to="/ve-chung-toi"
          className="rounded-[22px] bg-[#111111] px-4 py-4 text-white no-underline shadow-[0_18px_40px_rgba(8,11,13,0.16)]"
        >
          <ChevronRight size={18} />
          <p className={`${mono} mt-4 text-[10px] uppercase tracking-[0.18em] text-white/56`}>
            Brand
          </p>
          <p className="mt-2 font-['Syne',sans-serif] text-[22px] leading-none font-[700] tracking-[-0.04em]">
            Về ResQ
          </p>
        </Link>
      </section>

      {showVehicleModal && (
        <VehicleFormModal
          allowedTypes={["Xe máy", "Ô tô"] satisfies VehicleType[]}
          onClose={() => setShowVehicleModal(false)}
          onSave={(payload) => {
            addVehicle(payload);
            setShowVehicleModal(false);
          }}
        />
      )}
    </div>
  );
}

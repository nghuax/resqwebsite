import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { CheckCircle2, Eye, EyeOff, ShieldCheck, Wrench } from "lucide-react";
import { useAuth } from "./AuthContext";

const mono = "font-['IBM_Plex_Mono',monospace]";

const roleOptions = [
  {
    id: "user",
    label: "Khách hàng",
    description: "Gọi cứu hộ, lưu xe và theo dõi ETA trong một tài khoản.",
    icon: ShieldCheck,
  },
  {
    id: "fixer",
    label: "Fixer",
    description: "Đăng nhập để nhận điều phối và quản lý ca hỗ trợ ResQ.",
    icon: Wrench,
  },
] as const;

export default function SignInPage() {
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get("tab") === "register" ? "register" : "login";
  const initialRole = searchParams.get("role") === "fixer" ? "fixer" : "user";
  const [tab, setTab] = useState<"login" | "register">(initialTab);
  const [authRole, setAuthRole] = useState<"user" | "fixer">(initialRole);
  const [showPassword, setShowPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [regName, setRegName] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirm, setRegConfirm] = useState("");
  const [regAgree, setRegAgree] = useState(false);
  const [regError, setRegError] = useState("");
  const [noticeMessage, setNoticeMessage] = useState("");
  const { user, isLoggedIn, isLoading, login, register } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoggedIn) {
      return;
    }

    navigate("/tai-khoan", { replace: true });
  }, [isLoggedIn, navigate]);

  const clearMessages = () => {
    setLoginError("");
    setRegError("");
    setNoticeMessage("");
  };

  const handleLogin = async () => {
    if (!loginEmail.trim()) {
      setLoginError("Vui lòng nhập email");
      return;
    }

    if (!loginPassword) {
      setLoginError("Vui lòng nhập mật khẩu");
      return;
    }

    setLoginError("");
    setNoticeMessage("");

    const result = await login({
      email: loginEmail,
      password: loginPassword,
      role: authRole,
    });

    if (result.error) {
      setLoginError(result.error);
      return;
    }

    navigate("/tai-khoan");
  };

  const handleRegister = async () => {
    if (!regName.trim()) {
      setRegError("Vui lòng nhập họ tên");
      return;
    }

    if (!regPhone.trim()) {
      setRegError("Vui lòng nhập số điện thoại");
      return;
    }

    if (!regEmail.trim()) {
      setRegError("Vui lòng nhập email");
      return;
    }

    if (!regPassword) {
      setRegError("Vui lòng nhập mật khẩu");
      return;
    }

    if (regPassword.length < 6) {
      setRegError("Mật khẩu phải có ít nhất 6 ký tự");
      return;
    }

    if (regPassword !== regConfirm) {
      setRegError("Mật khẩu xác nhận không khớp");
      return;
    }

    if (!regAgree) {
      setRegError("Vui lòng đồng ý với điều khoản dịch vụ");
      return;
    }

    setRegError("");
    setNoticeMessage("");

    const result = await register({
      name: regName,
      phone: regPhone,
      email: regEmail,
      password: regPassword,
      role: authRole,
    });

    if (result.error) {
      setRegError(result.error);
      return;
    }

    if (result.needsEmailConfirmation) {
      setTab("login");
      setLoginEmail(regEmail);
      setLoginPassword("");
      setNoticeMessage(
        authRole === "fixer"
          ? "Tài khoản fixer đã được tạo. Hãy xác nhận email rồi đăng nhập để vào ResQ."
          : "Tài khoản đã được tạo. Hãy xác nhận email rồi đăng nhập để tiếp tục.",
      );
      return;
    }

    navigate("/tai-khoan");
  };

  return (
    <div className="overflow-x-hidden bg-white">
      <div className="flex min-h-[calc(100vh-76px)] items-center justify-center px-5 py-10 sm:px-8 lg:min-h-[calc(100vh-88px)] lg:px-[84px]">
        <div className="w-full max-w-[500px] rounded-[28px] border border-[rgba(4,38,153,0.08)] bg-white p-6 shadow-[0_22px_70px_rgba(8,11,13,0.08)] sm:p-8">
          <div className="mb-8 text-center">
            <p className={`${mono} mb-4 text-[12px] font-[500] uppercase tracking-[1.8px] text-[#ee3224]`}>
              Tài khoản ResQ
            </p>
            <h1 className={`${mono} mb-3 text-[28px] font-[700] leading-[1.2] text-[#080b0d] sm:text-[32px]`}>
              {tab === "login"
                ? authRole === "fixer"
                  ? "Truy cập bảng điều phối fixer"
                  : "Chào mừng quay lại"
                : authRole === "fixer"
                  ? "Tạo tài khoản fixer"
                  : "Tạo tài khoản mới"}
            </h1>
            <p className={`${mono} text-[13px] leading-[22px] text-[#4a5565]`}>
              {tab === "login"
                ? authRole === "fixer"
                  ? "Đăng nhập để nhận điều phối, theo dõi trạng thái ca hỗ trợ và cập nhật hồ sơ fixer."
                  : "Đăng nhập để tiếp tục theo dõi dịch vụ, thanh toán và quản lý tài khoản của bạn."
                : authRole === "fixer"
                  ? "Tạo tài khoản fixer để ResQ lưu hồ sơ liên hệ, vai trò và thông tin xác thực của bạn."
                  : "Đăng ký nhanh để lưu thông tin xe, gọi cứu hộ và nhận cập nhật từ ResQ."}
            </p>
          </div>

          <div className="mb-6 grid gap-3 sm:grid-cols-2">
            {roleOptions.map((option) => {
              const Icon = option.icon;
              const isActive = authRole === option.id;

              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => {
                    setAuthRole(option.id);
                    clearMessages();
                  }}
                  className={`rounded-[20px] border px-4 py-4 text-left transition-colors ${
                    isActive
                      ? "border-[#ee3224] bg-[rgba(238,50,36,0.08)]"
                      : "border-[rgba(4,38,153,0.08)] bg-[#f9fafb] hover:border-[#ee3224]/40"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`mt-0.5 flex size-[38px] shrink-0 items-center justify-center rounded-[12px] ${
                        isActive ? "bg-[#ee3224] text-white" : "bg-white text-[#ee3224]"
                      }`}
                    >
                      <Icon size={18} />
                    </div>
                    <div className="min-w-0">
                      <p className={`${mono} text-[13px] font-[700] text-[#080b0d]`}>
                        {option.label}
                      </p>
                      <p className={`${mono} mt-1 text-[11px] leading-[18px] text-[#667085]`}>
                        {option.description}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mb-8 flex border-b border-[rgba(4,38,153,0.08)]">
            <button
              type="button"
              onClick={() => {
                setTab("login");
                clearMessages();
              }}
              className={`flex-1 cursor-pointer border-0 border-b-2 bg-transparent pb-3 transition-colors ${
                tab === "login"
                  ? "border-[#ee3224] text-[#ee3224]"
                  : "border-transparent text-[#a4a4a4] hover:text-[#080b0d]"
              }`}
            >
              <span className={`${mono} text-[14px] font-[500]`}>Đăng nhập</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setTab("register");
                clearMessages();
              }}
              className={`flex-1 cursor-pointer border-0 border-b-2 bg-transparent pb-3 transition-colors ${
                tab === "register"
                  ? "border-[#ee3224] text-[#ee3224]"
                  : "border-transparent text-[#a4a4a4] hover:text-[#080b0d]"
              }`}
            >
              <span className={`${mono} text-[14px] font-[500]`}>Đăng ký</span>
            </button>
          </div>

          {noticeMessage && (
            <div className="mb-5 rounded-[14px] border border-[rgba(238,50,36,0.16)] bg-[rgba(238,50,36,0.06)] px-4 py-3">
              <p className={`${mono} text-[12px] leading-[20px] text-[#b42318]`}>
                {noticeMessage}
              </p>
            </div>
          )}

          {tab === "login" ? (
            <>
              <div className="flex flex-col gap-[14px]">
                <div>
                  <label className={`${mono} mb-[6px] block text-[11px] font-[500] uppercase tracking-[0.88px] text-[#a4a4a4]`}>
                    Email
                  </label>
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={(event) => {
                      setLoginEmail(event.target.value);
                      setLoginError("");
                      setNoticeMessage("");
                    }}
                    onKeyDown={(event) => event.key === "Enter" && void handleLogin()}
                    placeholder="you@example.com"
                    className={`h-[44px] w-full rounded-[12px] border px-[16px] text-[13px] text-black placeholder:text-[#a4a4a4] outline-none transition-colors focus:border-[#ee3224] ${mono} ${
                      loginError && !loginEmail ? "border-[#ee3224]" : "border-black"
                    }`}
                  />
                </div>

                <div>
                  <label className={`${mono} mb-[6px] block text-[11px] font-[500] uppercase tracking-[0.88px] text-[#a4a4a4]`}>
                    Mật khẩu
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={loginPassword}
                      onChange={(event) => {
                        setLoginPassword(event.target.value);
                        setLoginError("");
                        setNoticeMessage("");
                      }}
                      onKeyDown={(event) => event.key === "Enter" && void handleLogin()}
                      placeholder="Nhập mật khẩu"
                      className={`h-[44px] w-full rounded-[12px] border px-[16px] pr-[44px] text-[13px] text-black placeholder:text-[#a4a4a4] outline-none transition-colors focus:border-[#ee3224] ${mono} ${
                        loginError && !loginPassword ? "border-[#ee3224]" : "border-black"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((currentValue) => !currentValue)}
                      className="absolute top-1/2 right-[12px] -translate-y-1/2 cursor-pointer border-0 bg-transparent p-0"
                    >
                      {showPassword ? (
                        <EyeOff size={16} className="text-[#a4a4a4]" />
                      ) : (
                        <Eye size={16} className="text-[#a4a4a4]" />
                      )}
                    </button>
                  </div>
                </div>

                {loginError && <p className={`${mono} text-[12px] text-[#ee3224]`}>{loginError}</p>}

                <div className="rounded-[14px] border border-[rgba(4,38,153,0.08)] bg-[#f9fafb] px-4 py-3">
                  <p className={`${mono} text-[11px] leading-[18px] text-[#667085]`}>
                    Số điện thoại vẫn được lưu trong hồ sơ để fixer liên hệ, nhưng phiên bản đăng nhập này
                    dùng email và mật khẩu qua Supabase để ổn định hơn trên web và app.
                  </p>
                </div>

                <button
                  type="button"
                  disabled={isLoading}
                  onClick={() => void handleLogin()}
                  className="mt-1 h-[44px] cursor-pointer rounded-[12px] border-0 bg-[#ee3224] transition-colors hover:bg-[#d42b1e] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <span className={`${mono} text-[13px] font-[500] tracking-[0.88px] text-[#f0f0f1]`}>
                    {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
                  </span>
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="flex flex-col gap-[14px]">
                <div>
                  <label className={`${mono} mb-[6px] block text-[11px] font-[500] uppercase tracking-[0.88px] text-[#a4a4a4]`}>
                    Họ và tên
                  </label>
                  <input
                    type="text"
                    value={regName}
                    onChange={(event) => {
                      setRegName(event.target.value);
                      setRegError("");
                    }}
                    placeholder="Nguyễn Văn A"
                    className={`h-[44px] w-full rounded-[12px] border border-black px-[16px] text-[13px] text-black placeholder:text-[#a4a4a4] outline-none transition-colors focus:border-[#ee3224] ${mono}`}
                  />
                </div>

                <div>
                  <label className={`${mono} mb-[6px] block text-[11px] font-[500] uppercase tracking-[0.88px] text-[#a4a4a4]`}>
                    Số điện thoại
                  </label>
                  <input
                    type="tel"
                    value={regPhone}
                    onChange={(event) => {
                      setRegPhone(event.target.value);
                      setRegError("");
                    }}
                    placeholder="0901 234 567"
                    className={`h-[44px] w-full rounded-[12px] border border-black px-[16px] text-[13px] text-black placeholder:text-[#a4a4a4] outline-none transition-colors focus:border-[#ee3224] ${mono}`}
                  />
                </div>

                <div>
                  <label className={`${mono} mb-[6px] block text-[11px] font-[500] uppercase tracking-[0.88px] text-[#a4a4a4]`}>
                    Email
                  </label>
                  <input
                    type="email"
                    value={regEmail}
                    onChange={(event) => {
                      setRegEmail(event.target.value);
                      setRegError("");
                    }}
                    placeholder="email@example.com"
                    className={`h-[44px] w-full rounded-[12px] border border-black px-[16px] text-[13px] text-black placeholder:text-[#a4a4a4] outline-none transition-colors focus:border-[#ee3224] ${mono}`}
                  />
                </div>

                <div>
                  <label className={`${mono} mb-[6px] block text-[11px] font-[500] uppercase tracking-[0.88px] text-[#a4a4a4]`}>
                    Mật khẩu
                  </label>
                  <div className="relative">
                    <input
                      type={showRegisterPassword ? "text" : "password"}
                      value={regPassword}
                      onChange={(event) => {
                        setRegPassword(event.target.value);
                        setRegError("");
                      }}
                      placeholder="Ít nhất 6 ký tự"
                      className={`h-[44px] w-full rounded-[12px] border border-black px-[16px] pr-[44px] text-[13px] text-black placeholder:text-[#a4a4a4] outline-none transition-colors focus:border-[#ee3224] ${mono}`}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowRegisterPassword((currentValue) => !currentValue)
                      }
                      className="absolute top-1/2 right-[12px] -translate-y-1/2 cursor-pointer border-0 bg-transparent p-0"
                    >
                      {showRegisterPassword ? (
                        <EyeOff size={16} className="text-[#a4a4a4]" />
                      ) : (
                        <Eye size={16} className="text-[#a4a4a4]" />
                      )}
                    </button>
                  </div>
                  {regPassword.length > 0 && (
                    <div className="mt-[8px] flex items-center gap-[8px]">
                      <div className="h-[3px] flex-1 overflow-hidden rounded-full bg-[#e5e5e5]">
                        <div
                          className={`h-full rounded-full transition-all ${
                            regPassword.length >= 8
                              ? "w-full bg-[#22c55e]"
                              : regPassword.length >= 6
                                ? "w-2/3 bg-[#f59e0b]"
                                : "w-1/3 bg-[#ee3224]"
                          }`}
                        />
                      </div>
                      <span
                        className={`${mono} text-[10px] ${
                          regPassword.length >= 8
                            ? "text-[#22c55e]"
                            : regPassword.length >= 6
                              ? "text-[#f59e0b]"
                              : "text-[#ee3224]"
                        }`}
                      >
                        {regPassword.length >= 8
                          ? "Mạnh"
                          : regPassword.length >= 6
                            ? "Trung bình"
                            : "Yếu"}
                      </span>
                    </div>
                  )}
                </div>

                <div>
                  <label className={`${mono} mb-[6px] block text-[11px] font-[500] uppercase tracking-[0.88px] text-[#a4a4a4]`}>
                    Xác nhận mật khẩu
                  </label>
                  <input
                    type="password"
                    value={regConfirm}
                    onChange={(event) => {
                      setRegConfirm(event.target.value);
                      setRegError("");
                    }}
                    onKeyDown={(event) => event.key === "Enter" && void handleRegister()}
                    placeholder="Nhập lại mật khẩu"
                    className={`h-[44px] w-full rounded-[12px] border px-[16px] text-[13px] text-black placeholder:text-[#a4a4a4] outline-none transition-colors focus:border-[#ee3224] ${mono} ${
                      regConfirm && regConfirm !== regPassword
                        ? "border-[#ee3224]"
                        : "border-black"
                    }`}
                  />
                  {regConfirm && regConfirm !== regPassword && (
                    <p className={`${mono} mt-[4px] text-[11px] text-[#ee3224]`}>
                      Mật khẩu không khớp
                    </p>
                  )}
                </div>

                <label className="mt-[2px] flex items-start gap-[8px]">
                  <button
                    type="button"
                    onClick={() => {
                      setRegAgree((currentValue) => !currentValue);
                      setRegError("");
                    }}
                    className={`mt-[1px] flex size-[18px] shrink-0 items-center justify-center rounded-[4px] border transition-colors ${
                      regAgree
                        ? "border-[#ee3224] bg-[#ee3224]"
                        : "border-[#a4a4a4] bg-white"
                    }`}
                  >
                    {regAgree && <CheckCircle2 size={12} className="text-white" />}
                  </button>
                  <span className={`${mono} text-[12px] leading-[18px] text-[#4a5565]`}>
                    Tôi đồng ý với <span className="text-[#ee3224] underline">Điều khoản dịch vụ</span> và{" "}
                    <span className="text-[#ee3224] underline">Chính sách bảo mật</span> của ResQ
                  </span>
                </label>

                {regError && <p className={`${mono} text-[12px] text-[#ee3224]`}>{regError}</p>}

                <button
                  type="button"
                  disabled={isLoading}
                  onClick={() => void handleRegister()}
                  className="mt-1 h-[44px] cursor-pointer rounded-[12px] border-0 bg-[#ee3224] transition-colors hover:bg-[#d42b1e] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <span className={`${mono} text-[13px] font-[500] tracking-[0.88px] text-[#f0f0f1]`}>
                    {isLoading ? "Đang tạo tài khoản..." : "Tạo tài khoản"}
                  </span>
                </button>
              </div>
            </>
          )}

          <div className="mt-6 rounded-[16px] border border-[rgba(4,38,153,0.08)] bg-[#f9fafb] px-4 py-3">
            <p className={`${mono} text-[11px] leading-[18px] text-[#667085]`}>
              Đăng nhập email/mật khẩu đã được nối với Supabase cho cả khách hàng và fixer. Nếu bạn muốn bật Google hoặc Apple sau đó, chỉ cần cấu hình provider tương ứng trong Supabase Auth.
            </p>
          </div>

          {user?.email && (
            <p className={`${mono} mt-4 text-center text-[11px] text-[#99a1af]`}>
              Phiên hiện tại: {user.email}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

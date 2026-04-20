import { useLanguage } from "./LanguageContext";

export function LanguageToggle({
  compact = false,
  inverse = false,
}: {
  compact?: boolean;
  inverse?: boolean;
}) {
  const { language, setLanguage } = useLanguage();

  const wrapperClassName = compact
    ? "inline-flex rounded-full border p-1"
    : "inline-flex rounded-full border p-1.5";
  const toneClassName = inverse
    ? "border-white/16 bg-white/10 backdrop-blur text-white"
    : "border-black/8 bg-white/88 text-[#080b0d]";
  const pillClassName = compact
    ? "rounded-full px-2.5 py-1 text-[10px]"
    : "rounded-full px-3 py-1.5 text-[10px]";

  return (
    <div className={`${wrapperClassName} ${toneClassName}`}>
      {([
        ["vi", "VI"],
        ["en", "EN"],
      ] as const).map(([value, label]) => {
        const active = language === value;

        return (
          <button
            key={value}
            type="button"
            onClick={() => setLanguage(value)}
            className={`${pillClassName} resq-mono cursor-pointer uppercase tracking-[0.18em] transition-colors ${
              active
                ? inverse
                  ? "bg-white text-[#080b0d]"
                  : "bg-[#080b0d] text-white"
                : inverse
                  ? "text-white/72"
                  : "text-[#6b7280]"
            }`}
            aria-pressed={active}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}

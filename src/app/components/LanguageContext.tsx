import {
  createContext,
  startTransition,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export type Language = "vi" | "en";

interface LanguageContextValue {
  language: Language;
  setLanguage: (next: Language) => void;
  toggleLanguage: () => void;
}

const STORAGE_KEY = "resq-language";

const LanguageContext = createContext<LanguageContextValue | null>(null);

function getInitialLanguage(): Language {
  if (typeof window === "undefined") {
    return "vi";
  }

  const storedLanguage = window.localStorage.getItem(STORAGE_KEY);
  if (storedLanguage === "vi" || storedLanguage === "en") {
    return storedLanguage;
  }

  return window.navigator.language.toLowerCase().startsWith("en") ? "en" : "vi";
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(getInitialLanguage);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, language);
    document.documentElement.lang = language;
  }, [language]);

  const setLanguage = (next: Language) => {
    startTransition(() => {
      setLanguageState(next);
    });
  };

  const toggleLanguage = () => {
    setLanguage(language === "vi" ? "en" : "vi");
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider.");
  }

  return context;
}

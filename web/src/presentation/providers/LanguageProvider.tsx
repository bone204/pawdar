"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import en from "../i18n/locales/en.json";
import vi from "../i18n/locales/vi.json";

export type Locale = "en" | "vi";

type Dictionary = typeof en;

const dictionaries: Record<Locale, Dictionary> = { en, vi };

interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [locale, setLocaleState] = useState<Locale>("vi"); // Default to vi

  // Load locale from localStorage once mounted
  useEffect(() => {
    const savedLocale = localStorage.getItem("pawdar-locale") as Locale;
    if (savedLocale && (savedLocale === "en" || savedLocale === "vi")) {
      setLocaleState(savedLocale);
    }
  }, []);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem("pawdar-locale", newLocale);
  };

  // Helper function to resolve dot notation e.g., "auth.validation.required"
  const t = (key: string): string => {
    const keys = key.split(".");
    let current: any = dictionaries[locale];

    for (const k of keys) {
      if (current && typeof current === "object" && k in current) {
        current = current[k];
      } else {
        return key; // Fallback to key if not found
      }
    }

    return typeof current === "string" ? current : key;
  };

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useTranslation must be used within a LanguageProvider");
  }
  return context;
};

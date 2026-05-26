"use client";

import React from "react";
import { useTranslation, Locale } from "@/presentation/providers/LanguageProvider";

export const LanguageSwitcher: React.FC = () => {
  const { locale, setLocale } = useTranslation();

  const handleToggle = (lang: Locale) => {
    setLocale(lang);
  };

  return (
    <div className="inline-flex items-center p-1 bg-secondary rounded-xl border border-border select-none">
      <button
        onClick={() => handleToggle("vi")}
        className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all duration-300 ${
          locale === "vi"
            ? "bg-card text-primary shadow-[0_4px_12px_rgba(0,0,0,0.05)] scale-105"
            : "text-muted hover:text-foreground"
        }`}
      >
        VI 🇻🇳
      </button>
      <button
        onClick={() => handleToggle("en")}
        className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all duration-300 ${
          locale === "en"
            ? "bg-card text-primary shadow-[0_4px_12px_rgba(0,0,0,0.05)] scale-105"
            : "text-muted hover:text-foreground"
        }`}
      >
        EN 🇬🇧
      </button>
    </div>
  );
};

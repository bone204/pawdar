"use client";
 
import React, { useState, useRef, useEffect } from "react";
import { useTranslation, Locale } from "@/presentation/providers/LanguageProvider";
 
interface LanguageOption {
  code: Locale;
  label: string;
}
 
export const LanguageSwitcher: React.FC = () => {
  const { locale, setLocale, t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
 
  const languages: LanguageOption[] = [
    { code: "vi", label: t("common.langVi") },
    { code: "en", label: t("common.langEn") },
  ];
 
  const currentLanguage = languages.find((lang) => lang.code === locale) || languages[0];
 
  const handleSelect = (langCode: Locale) => {
    if (langCode === "vi" || langCode === "en") {
      setLocale(langCode);
    }
    setIsOpen(false);
  };
 
  const renderFlagIcon = (code: Locale) => {
    if (code === "vi") {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 3 2" className="w-5 h-3.5 rounded-xs shadow-[0_1px_2px_rgba(0,0,0,0.15)] object-cover shrink-0 select-none">
          <rect width="3" height="2" fill="#da251d"/>
          <polygon points="1.5,0.4 1.59,0.78 1.98,0.78 1.66,1.01 1.78,1.4 1.5,1.17 1.22,1.4 1.34,1.01 1.02,0.78 1.41,0.78" fill="#ffff00"/>
        </svg>
      );
    }
    // Cờ Anh quốc (GB)
    return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 30" className="w-5 h-3.5 rounded-xs shadow-[0_1px_2px_rgba(0,0,0,0.15)] object-cover shrink-0 select-none">
        <rect width="60" height="30" fill="#012169"/>
        <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6"/>
        <path d="M0,0 L60,30 M60,0 L0,30" stroke="#C8102E" strokeWidth="4"/>
        <path d="M0,15 H60 M30,0 V30" stroke="#fff" strokeWidth="10"/>
        <path d="M0,15 H60 M30,0 V30" stroke="#C8102E" strokeWidth="6"/>
      </svg>
    );
  };
 
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
 
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);
 
  return (
    <div className="relative select-none text-left" ref={dropdownRef}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="w-16 h-11 bg-secondary hover:bg-secondary/80 text-foreground border border-border rounded-full flex items-center justify-center gap-2 transition-all duration-300 active:scale-95 cursor-pointer focus:outline-none focus-visible:ring-4 focus-visible:ring-primary/20"
        aria-label="Select Language"
      >
        {renderFlagIcon(currentLanguage.code)}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="2.5"
          stroke="currentColor"
          className={`w-2.5 h-2.5 text-foreground/60 transition-transform duration-300 ${isOpen ? "rotate-180" : "rotate-0"}`}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>
 
      {/* Dropdown Menu Overlay - Hoạt động mượt mà cả khi mở và đóng */}
      <div
        className={`absolute right-0 mt-2 w-40 bg-card/95 backdrop-blur-lg border border-border shadow-[0_4px_24px_rgba(62,46,37,0.08)] dark:shadow-[0_4px_24px_rgba(0,0,0,0.3)] rounded-2xl p-1.5 z-50 transition-all duration-300 ease-out origin-top-right ${
          isOpen
            ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
            : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
        }`}
      >
        <div className="flex flex-col gap-1">
          {languages.map((lang) => {
            const isSelected = lang.code === locale;
            return (
              <button
                key={lang.code}
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelect(lang.code);
                }}
                className={`w-full px-3 py-2 flex items-center gap-3 rounded-xl text-xs font-bold text-left transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? "bg-primary/10 text-primary"
                    : "text-foreground/80 hover:bg-secondary hover:text-foreground"
                }`}
              >
                {renderFlagIcon(lang.code)}
                <span>{lang.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

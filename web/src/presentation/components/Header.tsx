"use client";
 
import React, { useState, useEffect } from "react";
import { useTranslation } from "@/presentation/providers/LanguageProvider";
import { Button } from "@/presentation/components/ui/Button";
import { LanguageSwitcher } from "@/presentation/components/ui/LanguageSwitcher";
import { ThemeToggle } from "@/presentation/components/ui/ThemeToggle";
import Link from "next/link";
 
export const Header: React.FC = () => {
  const { t } = useTranslation();
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
 
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Ẩn khi cuộn xuống, hiện lại ngay khi cuộn lên
      if (currentScrollY > lastScrollY && currentScrollY > 10) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      setLastScrollY(currentScrollY);
    };
 
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);
 
  return (
    <header
      className={`fixed top-6 left-0 right-0 z-50 transition-all duration-400 ease-in-out select-none ${
        isVisible ? "translate-y-0 opacity-100" : "-translate-y-28 opacity-0"
      }`}
    >
      <div className="container mx-auto px-6">
        <div className="bg-card/90 backdrop-blur-lg border border-border shadow-[0_4px_12px_rgba(62,46,37,0.05)] dark:shadow-[0_4px_12px_rgba(0,0,0,0.15)] rounded-full h-[76px] px-10 grid grid-cols-2 md:grid-cols-3 items-center transition-all duration-300">
          {/* Left Side: Logo */}
          <div className="flex justify-start items-center">
            <Link
              href="/"
              className="text-3xl font-black bg-linear-to-r from-primary to-amber-600 bg-clip-text text-transparent hover:scale-105 transition-transform duration-300 cursor-pointer select-none"
            >
              🐶 {t("common.appName")}
            </Link>
          </div>
          
          {/* Center: Navigation Links */}
          <nav className="hidden md:flex justify-center items-center gap-10 text-[15px] font-bold text-foreground/80">
            <span className="relative py-2 hover:text-primary cursor-pointer transition-colors duration-300 select-none group">
              {t("common.navServices")}
              <span className="absolute bottom-0 left-0 w-full h-[2.5px] bg-primary transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left rounded-full"></span>
            </span>
            <span className="relative py-2 hover:text-primary cursor-pointer transition-colors duration-300 select-none group">
              {t("common.navReviews")}
              <span className="absolute bottom-0 left-0 w-full h-[2.5px] bg-primary transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left rounded-full"></span>
            </span>
            <span className="relative py-2 hover:text-primary cursor-pointer transition-colors duration-300 select-none group">
              {t("common.navNews")}
              <span className="absolute bottom-0 left-0 w-full h-[2.5px] bg-primary transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left rounded-full"></span>
            </span>
          </nav>
 
          {/* Right Side: Switchers & Action Buttons */}
          <div className="flex justify-end items-center gap-8">
            <div className="flex items-center gap-4">
              <LanguageSwitcher />
              <ThemeToggle />
            </div>
            
            <div className="flex items-center gap-4">
              <Link href="/register" className="cursor-pointer">
                <Button variant="secondary" size="md" className="cursor-pointer select-none h-11 px-6 rounded-full">
                  {t("auth.register")}
                </Button>
              </Link>
              
              <Link href="/login" className="cursor-pointer">
                <Button variant="primary" size="md" className="cursor-pointer select-none h-11 px-6 rounded-full">
                  {t("auth.login")}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

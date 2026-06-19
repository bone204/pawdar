"use client";
 
import React, { useState, useEffect } from "react";
import { useTranslation } from "@/presentation/providers/LanguageProvider";
import { Button } from "@/presentation/components/ui/Button";
import { LanguageSwitcher } from "@/presentation/components/ui/LanguageSwitcher";
import { ThemeToggle } from "@/presentation/components/ui/ThemeToggle";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { APP_ROUTES } from "@/shared/constants/routes";
import { AppLogo } from "@/presentation/components/ui/AppLogo";
 
export const Header: React.FC = () => {
  const { t } = useTranslation();
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
 
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Close mobile menu on scroll
      if (currentScrollY > 10) {
        setIsMenuOpen(false);
      }

      // On mobile/tablet (< lg), always keep header visible
      if (window.innerWidth < 1024) {
        setIsVisible(true);
        setLastScrollY(currentScrollY);
        return;
      }

      // Hide header on scroll down, show on scroll up (desktop only)
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
      <div className="container mx-auto px-6 relative">
        <div className="bg-card/90 backdrop-blur-lg border border-border shadow-[0_4px_12px_rgba(62,46,37,0.05)] dark:shadow-[0_4px_12px_rgba(0,0,0,0.15)] rounded-full h-[76px] px-6 lg:px-10 grid grid-cols-2 lg:grid-cols-3 items-center transition-all duration-300">
          {/* Left Side: Logo */}
          <div className="flex justify-start items-center">
            <AppLogo />
          </div>
          
          {/* Center: Navigation Links (Desktop lg+) */}
          <nav className="hidden lg:flex justify-center items-center gap-8 text-[15px] font-bold text-foreground/80">
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
 
          {/* Right Side: Switchers & Action Buttons (Desktop lg+) */}
          <div className="hidden lg:flex justify-end items-center gap-4">
            <div className="flex items-center gap-3">
              <LanguageSwitcher />
              <ThemeToggle />
            </div>
            
            <div className="flex items-center gap-3">
              <Link href={APP_ROUTES.register} className="cursor-pointer">
                <Button variant="secondary" size="md" className="cursor-pointer select-none h-11 px-5 rounded-full text-sm whitespace-nowrap">
                  {t("auth.register")}
                </Button>
              </Link>
              
              <Link href={APP_ROUTES.login} className="cursor-pointer">
                <Button variant="primary" size="md" className="cursor-pointer select-none h-11 px-5 rounded-full text-sm whitespace-nowrap">
                  {t("auth.login")}
                </Button>
              </Link>
            </div>
          </div>

          {/* Hamburger Menu & Toggles (Mobile/Tablet < lg) */}
          <div className="flex lg:hidden justify-end items-center gap-2.5">
            <LanguageSwitcher />
            <ThemeToggle />
            
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-card border border-border text-foreground hover:text-primary hover:border-primary/30 transition-all duration-300 select-none cursor-pointer"
              aria-label="Toggle Menu"
            >
              <div className="relative flex w-5 h-5 flex-col justify-between items-center">
                <span
                  className={`h-0.5 w-5 bg-current rounded-full transition-transform duration-300 origin-center ${
                    isMenuOpen ? "rotate-45 translate-y-[9px]" : ""
                  }`}
                />
                <span
                  className={`h-0.5 w-5 bg-current rounded-full transition-opacity duration-300 ${
                    isMenuOpen ? "opacity-0" : ""
                  }`}
                />
                <span
                  className={`h-0.5 w-5 bg-current rounded-full transition-transform duration-300 origin-center ${
                    isMenuOpen ? "-rotate-45 translate-y-[-9px]" : ""
                  }`}
                />
              </div>
            </button>
          </div>
        </div>

        {/* Mobile/Tablet Dropdown Menu Drawer */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="lg:hidden absolute top-[90px] left-6 right-6 z-40 p-6 bg-card/95 backdrop-blur-xl border border-border rounded-4xl shadow-xl flex flex-col gap-6 text-center select-none"
            >
              {/* Navigation Links */}
              <nav className="flex flex-col gap-2 text-base font-bold text-foreground/80">
                <Link href="#" onClick={() => setIsMenuOpen(false)}>
                  <span className="block py-3 hover:text-primary cursor-pointer transition-colors duration-300 select-none rounded-xl hover:bg-muted/50">
                    {t("common.navServices")}
                  </span>
                </Link>
                <Link href="#" onClick={() => setIsMenuOpen(false)}>
                  <span className="block py-3 hover:text-primary cursor-pointer transition-colors duration-300 select-none rounded-xl hover:bg-muted/50">
                    {t("common.navReviews")}
                  </span>
                </Link>
                <Link href="#" onClick={() => setIsMenuOpen(false)}>
                  <span className="block py-3 hover:text-primary cursor-pointer transition-colors duration-300 select-none rounded-xl hover:bg-muted/50">
                    {t("common.navNews")}
                  </span>
                </Link>
              </nav>

              <div className="h-px bg-border/60" />

              {/* Action Buttons */}
              <div className="flex flex-col gap-3">
                <Link href={APP_ROUTES.register} onClick={() => setIsMenuOpen(false)} className="w-full cursor-pointer">
                  <Button variant="secondary" size="md" className="w-full cursor-pointer select-none h-12 rounded-full font-bold">
                    {t("auth.register")}
                  </Button>
                </Link>
                
                <Link href={APP_ROUTES.login} onClick={() => setIsMenuOpen(false)} className="w-full cursor-pointer">
                  <Button variant="primary" size="md" className="w-full cursor-pointer select-none h-12 rounded-full font-bold">
                    {t("auth.login")}
                  </Button>
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
};

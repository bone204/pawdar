"use client";

import React, { useState, useEffect } from "react";
import { useTranslation } from "@/presentation/providers/LanguageProvider";
import { Button } from "@/presentation/components/ui/Button";
import { IMAGES } from "@/shared/constants/images";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";

export const HeroSection: React.FC = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<"dog" | "cat">("dog");

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTab((prev) => (prev === "dog" ? "cat" : "dog"));
    }, 4000); // Đổi ảnh tự động mỗi 4 giây
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative min-h-[calc(100vh-80px)] overflow-hidden py-12 lg:py-20 flex items-center bg-radial from-primary/5 via-transparent to-transparent select-none">

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-12 xl:gap-20 items-center">
          
          {/* Left Column: Premium Content */}
          <div className="lg:col-span-6 flex flex-col items-center lg:items-start text-center lg:text-left gap-6 md:gap-8">
            <div className="hero-sub shadow-xs">
              {t("landing.heroTag")}
            </div>

            <h1 className="hero-title text-4xl sm:text-5xl md:text-6xl xl:text-7xl font-black tracking-tight leading-none">
              {t("landing.title")}
            </h1>

            <p className="hero-desc text-base sm:text-lg md:text-xl text-muted/90 max-w-xl font-light">
              {t("landing.subtitle")}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto mt-2">
              <Link href="/register" className="w-full sm:w-auto cursor-pointer">
                <Button size="lg" className="w-full sm:w-auto cursor-pointer select-none text-base font-bold shadow-md hover:shadow-lg transition-all rounded-full h-14 px-8">
                  {t("landing.ctaStart")}
                </Button>
              </Link>
              <Link href="/login" className="w-full sm:w-auto cursor-pointer">
                <Button variant="secondary" size="lg" className="w-full sm:w-auto cursor-pointer select-none text-base font-bold transition-all rounded-full h-14 px-8">
                  {t("landing.ctaLogin")}
                </Button>
              </Link>
            </div>
          </div>

          {/* Right Column: Dynamic Pet Switcher & Decorative Graphic */}
          <div className="lg:col-span-6 flex flex-col items-center justify-center relative w-full">
            
            {/* Interactive Image Frame with Decorative Background */}
            <div className="relative w-full max-w-[450px] sm:max-w-[500px] aspect-square flex items-center justify-center z-10">
              
              {/* Single massive decorative circle background */}
              <div className="absolute w-[108%] h-[108%] rounded-full bg-primary/10 dark:bg-primary/5 border border-primary/20 pointer-events-none -z-10 flex items-center justify-center">
                <div className="w-[85%] h-[85%] rounded-full border border-dashed border-primary/20" />
              </div>

              {/* Animated Pet Image Container */}
              <div className="relative w-full h-full rounded-full overflow-hidden bg-card/50 shadow-2xl border border-border/40">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    transition={{ duration: 0.35, ease: "easeInOut" }}
                    className="absolute inset-0 w-full h-full"
                  >
                    <Image
                      src={activeTab === "dog" ? IMAGES.dog : IMAGES.cat}
                      alt={activeTab === "dog" ? "Dog representation" : "Cat representation"}
                      fill
                      priority
                      className="object-cover transition-transform duration-500 hover:scale-105"
                      sizes="(max-width: 768px) 100vw, 500px"
                    />
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Interactive premium floating micro-elements */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-4 -left-4 z-20 p-3.5 rounded-2xl bg-card/90 backdrop-blur-md border border-border shadow-md flex items-center gap-3 select-none"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-success/10 text-success text-base">
                  🏥
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-[10px] font-bold text-muted uppercase tracking-wider leading-none mb-1">
                    {t("landing.badgeHealthTitle")}
                  </span>
                  <span className="text-xs font-extrabold text-foreground">
                    {t("landing.badgeHealthDesc")}
                  </span>
                </div>
              </motion.div>

              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                className="absolute bottom-4 -right-4 z-20 p-3.5 rounded-2xl bg-card/90 backdrop-blur-md border border-border shadow-md flex items-center gap-3 select-none"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary text-base">
                  ❤️
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-[10px] font-bold text-muted uppercase tracking-wider leading-none mb-1">
                    {t("landing.badgeCareTitle")}
                  </span>
                  <span className="text-xs font-extrabold text-foreground">
                    {t("landing.badgeCareDesc")}
                  </span>
                </div>
              </motion.div>

            </div>

          </div>

        </div>
      </div>
    </section>
  );
};

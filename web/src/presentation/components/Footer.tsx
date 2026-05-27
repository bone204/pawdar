"use client";

import React from "react";
import Link from "next/link";
import { useTranslation } from "@/presentation/providers/LanguageProvider";
import RotatingText from "@/presentation/components/ui/rotating-text";

export const Footer: React.FC = () => {
  const { t } = useTranslation();

  return (
    <footer className="relative select-none flex flex-col overflow-hidden border-t border-border bg-background pt-24 pb-12 transition-colors duration-500">
      <div className="container mx-auto px-6 relative z-10 flex flex-col gap-16 lg:gap-20">
        
        {/* Massive Headline Section */}
        <div className="group relative flex flex-col items-center justify-center text-center overflow-visible">
          {/* Subtle background text for depth */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 select-none pointer-events-none text-[22vw] font-black text-primary/2 dark:text-primary/1 blur-3xl">
            PAWDAR
          </div>

          <div className="relative flex flex-col items-center gap-4 md:flex-row md:gap-10">
            <span className="text-7xl font-black tracking-tighter text-foreground sm:text-8xl md:text-9xl lg:text-[11rem] xl:text-[12rem] transition-colors duration-300">
              PAWDAR
            </span>
            <div className="relative">
              <RotatingText
                texts={["COMPANION", "CARE & LOVE", "HEALTHY", "COMMUNITY", "SMART ALERTS", "HAPPY TAILS"]}
                mainClassName="px-6 py-3 sm:px-10 sm:py-5 bg-primary text-primary-foreground rounded-[2rem] sm:rounded-[3rem] text-2xl sm:text-4xl md:text-5xl lg:text-[5.5rem] xl:text-[6.5rem] font-black tracking-tighter shadow-[0_10px_30px_rgba(201,109,46,0.25)]"
                staggerFrom="last"
                initial={{ y: "100%", opacity: 0, rotate: 3 }}
                animate={{ y: 0, opacity: 1, rotate: 0 }}
                exit={{ y: "-120%", opacity: 0, rotate: -3 }}
                animatePresenceMode="popLayout"
                staggerDuration={0.02}
                splitLevelClassName="overflow-hidden py-2"
                transition={{ type: "spring", damping: 22, stiffness: 140 }}
                rotationInterval={3000}
                splitBy="characters"
              />
            </div>
          </div>
        </div>

        {/* Premium SaaS Grid */}
        <div className="w-full">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-y-16 gap-x-12 lg:gap-x-16 xl:gap-x-20">

            {/* Presence: 4/12 */}
            <div className="md:col-span-12 lg:col-span-4 flex flex-col gap-6 items-center md:items-start text-center md:text-left">
              <div className="space-y-4 w-full">
                <h4 className="text-[13px] font-bold text-muted uppercase tracking-widest text-center md:text-left">
                  {t("landing.contactInfo")}
                </h4>
                <div className="flex flex-col gap-3 max-w-md mx-auto md:mx-0">
                  {/* Email Card */}
                  <a
                    href="mailto:truongbmt4@gmail.com"
                    className="group flex items-center gap-4 p-3.5 rounded-2xl bg-card/30 border border-border/40 hover:border-primary/30 hover:bg-card/70 shadow-xs hover:shadow-md transition-all duration-300 select-none cursor-pointer text-left"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:scale-105 transition-transform duration-300">
                      <svg className="h-5 w-5 stroke-current fill-none" viewBox="0 0 24 24" strokeWidth="2">
                        <rect x="2" y="4" width="20" height="16" rx="2" />
                        <path d="M22 4l-10 8L2 4" />
                      </svg>
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-[10px] font-bold text-muted/80 uppercase tracking-widest leading-none mb-1">
                        Email
                      </span>
                      <span className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                        truongbmt4@gmail.com
                      </span>
                    </div>
                  </a>

                  {/* Developer Card */}
                  <div
                    className="group flex items-center gap-4 p-3.5 rounded-2xl bg-card/30 border border-border/40 hover:border-primary/30 hover:bg-card/70 shadow-xs hover:shadow-md transition-all duration-300 select-none text-left"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform duration-300">
                      <svg className="h-5 w-5 stroke-current fill-none" viewBox="0 0 24 24" strokeWidth="2">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-[10px] font-bold text-muted/80 uppercase tracking-widest leading-none mb-1">
                        Developer
                      </span>
                      <span className="text-sm font-semibold text-foreground">
                        Nguyễn Hữu Trường
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation 1: 2/12 */}
            <div className="md:col-span-6 lg:col-span-2 space-y-6 flex flex-col items-center md:items-start text-center md:text-left">
              <h4 className="text-[13px] font-bold text-muted uppercase tracking-widest text-center md:text-left">
                {t("landing.quickLinks")}
              </h4>
              <nav className="flex flex-col items-center md:items-start gap-4">
                {[
                  { href: "#", label: t("common.navServices") },
                  { href: "#", label: t("common.navReviews") },
                  { href: "#", label: t("common.navNews") },
                ].map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    className="group flex items-center gap-3 w-fit text-sm font-medium text-muted hover:text-foreground transition-all duration-300"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-primary opacity-0 -translate-x-4 transition-all duration-300 ease-out group-hover:opacity-100 group-hover:translate-x-0" />
                    <span className="-ml-4 transition-all duration-300 group-hover:ml-0 group-hover:text-foreground">
                      {link.label}
                    </span>
                  </Link>
                ))}
              </nav>
            </div>

            {/* Navigation 2: 2/12 */}
            <div className="md:col-span-6 lg:col-span-2 space-y-6 flex flex-col items-center md:items-start text-center md:text-left">
              <h4 className="text-[13px] font-bold text-muted uppercase tracking-widest text-center md:text-left">
                {t("landing.explore")}
              </h4>
              <nav className="flex flex-col items-center md:items-start gap-4">
                {[
                  { href: "/login", label: t("auth.login") },
                  { href: "/register", label: t("auth.register") },
                  { href: "#", label: t("landing.mobileApp") },
                ].map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    className="group flex items-center gap-3 w-fit text-sm font-medium text-muted hover:text-foreground transition-all duration-300"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-primary opacity-0 -translate-x-4 transition-all duration-300 ease-out group-hover:opacity-100 group-hover:translate-x-0" />
                    <span className="-ml-4 transition-all duration-300 group-hover:ml-0 group-hover:text-foreground">
                      {link.label}
                    </span>
                  </Link>
                ))}
              </nav>
            </div>

            {/* Right Column: Tech Stack (4/12) */}
            <div className="md:col-span-12 lg:col-span-4 flex flex-col gap-10 items-center md:items-start lg:items-end justify-start text-center md:text-left lg:text-right">
              {/* Trust Badges */}
              <div className="space-y-6 w-full lg:max-w-xs">
                <h4 className="text-[13px] font-bold text-muted uppercase tracking-wider text-center md:text-left lg:text-right">
                  {t("landing.techStack")}
                </h4>
                <div className="flex flex-wrap gap-2 justify-center md:justify-start lg:justify-end">
                  {["Next.js", "React 19", "Tailwind CSS", "TypeScript"].map((tech) => (
                    <span
                      key={tech}
                      className="px-4 py-1.5 text-[10px] font-bold text-foreground uppercase tracking-widest bg-card rounded-lg border border-border shadow-xs hover:border-primary/20 transition-all select-none"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </div>

          </div>

          {/* Copyright Section */}
          <div className="mt-16 pt-8 border-t border-border/40 text-sm font-medium text-muted/60">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
              <p className="text-center md:text-left">{t("landing.footer")}</p>
              <p className="opacity-50 text-[10px] uppercase tracking-widest text-center md:text-right">PAWDAR PORTFOLIO ECOSYSTEM</p>
            </div>
          </div>

        </div>
      </div>
    </footer>
  );
};

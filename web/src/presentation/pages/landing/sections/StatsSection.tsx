"use client";

import React from "react";
import { useTranslation } from "@/presentation/providers/LanguageProvider";
import { motion } from "framer-motion";

interface StatItem {
  key: string;
  icon: string;
  iconBgClass: string;
  iconTextClass: string;
  borderHoverClass: string;
}

export const StatsSection: React.FC = () => {
  const { t } = useTranslation();

  const stats: StatItem[] = [
    {
      key: "ActiveUsers",
      icon: "👥",
      iconBgClass: "bg-primary/10 dark:bg-primary/5",
      iconTextClass: "text-primary",
      borderHoverClass: "hover:border-primary/30",
    },
    {
      key: "PetsCared",
      icon: "🐾",
      iconBgClass: "bg-success/10 dark:bg-success/5",
      iconTextClass: "text-success",
      borderHoverClass: "hover:border-success/30",
    },
    {
      key: "PartnerVets",
      icon: "🩺",
      iconBgClass: "bg-danger/10 dark:bg-danger/5",
      iconTextClass: "text-danger",
      borderHoverClass: "hover:border-danger/30",
    },
    {
      key: "Rating",
      icon: "⭐",
      iconBgClass: "bg-primary/10 dark:bg-primary/5",
      iconTextClass: "text-primary",
      borderHoverClass: "hover:border-primary/30",
    },
  ];

  return (
    <section className="relative py-12 lg:py-16 select-none bg-linear-to-b from-transparent via-secondary/15 to-transparent border-y border-border/30 dark:border-border/10 transition-colors duration-300">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.key}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, ease: "easeOut", delay: index * 0.15 }}
              className={`group flex items-center gap-5 p-6 bg-card rounded-2xl border border-border/40 dark:border-border/10 shadow-[0_4px_20px_rgba(0,0,0,0.01)] hover:shadow-[0_12px_32px_rgba(201,109,46,0.06)] dark:hover:shadow-[0_12px_32px_rgba(0,0,0,0.2)] hover:-translate-y-1 transition-all duration-300 ${stat.borderHoverClass}`}
            >
              {/* Icon container with hover animation */}
              <div
                className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${stat.iconBgClass} ${stat.iconTextClass} text-2xl border border-border/20 dark:border-border/10 shadow-xs group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`}
              >
                {stat.icon}
              </div>

              {/* Text content container */}
              <div className="flex flex-col text-left">
                <span className="text-3xl font-black tracking-tight text-foreground leading-none font-sans">
                  {t(`landing.stats${stat.key}`)}
                </span>
                <span className="text-xs font-semibold uppercase tracking-wider text-muted mt-2 leading-tight">
                  {t(`landing.stats${stat.key}Label`)}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

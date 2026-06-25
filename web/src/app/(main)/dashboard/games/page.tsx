"use client";

import React from "react";
import Link from "next/link";
import { useTranslation } from "@/presentation/providers/LanguageProvider";
import { GamepadIcon } from "@/presentation/components/ui/Icons";
import { IMAGES } from "@/shared/constants/images";

export default function GamesPage() {
  const { t } = useTranslation();

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Hero Banner */}
      <div
        className="relative overflow-hidden rounded-3xl py-14 px-8 md:py-24 md:px-12 min-h-[220px] md:min-h-[280px]"
        style={{ transform: "translateZ(0)" }}
      >
        {/* Background Image Container filled 100% */}
        <div
          className="absolute inset-0 bg-cover bg-no-repeat z-0"
          style={{
            backgroundImage: `url(${IMAGES.gameBanner})`,
            backgroundPosition: "center 60%",
          }}
        />

        {/* Gradient overlay filled 100% */}
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/35 to-transparent from-0% via-40% to-75% dark:from-background dark:via-background/50 dark:to-transparent dark:from-0% dark:via-40% dark:to-75% z-10"></div>
                                                  
        <div className="relative z-20 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-4 text-center md:text-left max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-black text-primary tracking-wider uppercase">
              🐾 Pawdar Play
            </div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-foreground">
              {t("games.title")}
            </h1>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
              {t("games.subtitle")}
            </p>
          </div>
          <div className="shrink-0 flex items-center justify-center w-20 h-20 md:w-24 md:h-24 bg-card/70 border border-border rounded-2xl text-primary shadow-xs backdrop-blur-xs select-none">
            <GamepadIcon className="w-10 h-10 md:w-12 md:h-12 text-primary" />
          </div>
        </div>

        {/* Absolute Border Overlay on top (z-30) to clip edges perfectly and avoid browser aliasing leakage */}
        <div className="absolute inset-0 rounded-3xl border border-border pointer-events-none z-30"></div>
      </div>

      {/* Games List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Sudoku Game Card */}
        <div className="group relative overflow-hidden rounded-3xl border border-border bg-card hover:border-primary/40 hover:shadow-[0_12px_40px_rgba(201,109,46,0.08)] dark:hover:shadow-[0_12px_40px_rgba(0,0,0,0.3)] transition-all duration-500 flex flex-col h-full">
          {/* Visual Illustration Area */}
          <div className="relative h-44 w-full bg-gradient-to-br from-primary/5 via-secondary/40 to-primary/10 border-b border-border/60 flex items-center justify-center overflow-hidden select-none">
            {/* Glowing Decorative Blobs */}
            <div className="absolute w-36 h-36 rounded-full bg-primary/8 blur-2xl -top-10 -right-10 group-hover:scale-150 group-hover:bg-primary/12 transition-all duration-700 ease-out" />
            <div className="absolute w-36 h-36 rounded-full bg-secondary/60 blur-2xl -bottom-12 -left-12 group-hover:scale-125 transition-all duration-700 ease-out" />
            
            {/* Decorative Floating Symbols */}
            <span className="absolute text-[10px] font-mono font-bold text-primary/15 top-8 left-16 rotate-12 pointer-events-none">+</span>
            <span className="absolute text-[12px] font-mono font-bold text-primary/10 bottom-6 right-20 -rotate-12 pointer-events-none">?</span>
            <span className="absolute text-[14px] font-mono font-bold text-primary/15 top-12 right-12 rotate-45 pointer-events-none">9</span>
            <span className="absolute text-[10px] font-mono font-bold text-primary/10 bottom-10 left-10 -rotate-45 pointer-events-none">5</span>

            {/* Simulated Grid Preview */}
            <div className="relative z-10 grid grid-cols-3 gap-1.5 p-2 bg-card/60 backdrop-blur-xs border border-border/80 rounded-2xl w-28 h-28 shadow-[0_4px_20px_rgba(0,0,0,0.02)] group-hover:scale-105 group-hover:border-primary/25 group-hover:shadow-[0_8px_30px_rgba(0,0,0,0.05)] transition-all duration-500">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((val) => {
                const isSelected = val === 5;
                const isPrimary = val % 3 === 0;
                return (
                  <div
                    key={val}
                    className={`relative rounded-lg text-xs font-black flex items-center justify-center font-mono transition-all duration-300 ${
                      isSelected
                        ? "bg-primary text-primary-foreground shadow-sm shadow-primary/25 border border-primary"
                        : isPrimary
                        ? "bg-primary/5 text-primary border border-primary/10 group-hover:bg-primary/10"
                        : "bg-card text-foreground/85 border border-border/50 group-hover:border-border"
                    }`}
                  >
                    {isSelected ? (
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-foreground opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-foreground"></span>
                      </span>
                    ) : (
                      val
                    )}
                  </div>
                );
              })}
            </div>

            {/* Absolute Glassmorphic Badges */}
            <div className="absolute top-4 left-4 z-20">
              <span className="px-3 py-1.5 text-xs font-black tracking-wider font-mono rounded-xl bg-card/85 text-foreground border border-border/60 shadow-xs backdrop-blur-md">
                9x9
              </span>
            </div>
            <div className="absolute top-4 right-4 z-20">
              <span className="px-3 py-1.5 text-[10px] font-black tracking-widest uppercase rounded-xl bg-primary/10 text-primary border border-primary/20 shadow-xs backdrop-blur-md">
                {t("games.sudoku.genre")}
              </span>
            </div>
          </div>

          {/* Content Area */}
          <div className="p-6 flex flex-col flex-grow space-y-4">
            <div className="space-y-2">
              <h3 className="text-xl font-black text-foreground group-hover:text-primary transition-colors duration-300 leading-snug">
                {t("games.sudoku.title")}
              </h3>
              <p className="text-xs text-muted-foreground/80 leading-relaxed">
                {t("games.sudoku.description")}
              </p>
            </div>

            {/* Footer Row */}
            <div className="pt-4 mt-auto border-t border-border/50 flex items-center justify-between">
              <div className="flex items-center gap-2 text-[11px] text-muted-foreground font-semibold">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                {t("games.sudoku.features")}
              </div>
              <Link
                href="/dashboard/games/sudoku"
                className="group/btn inline-flex items-center gap-1.5 px-4.5 py-2.5 bg-primary text-primary-foreground font-black text-xs rounded-xl shadow-md hover:shadow-primary/15 hover:brightness-105 active:scale-95 transition-all cursor-pointer"
              >
                {t("games.sudoku.playNow")}
                <span className="group-hover/btn:translate-x-1 transition-transform duration-300">➔</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

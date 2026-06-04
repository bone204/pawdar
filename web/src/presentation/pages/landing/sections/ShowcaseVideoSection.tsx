"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { VIDEOS } from "@/shared/constants/videos";
import { useTranslation } from "@/presentation/providers/LanguageProvider";

export const ShowcaseVideoSection: React.FC = () => {
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);

  // Track scroll position of the section
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "center center"],
  });

  // Map scroll progress to width, opacity and border radius
  const widthScale = useTransform(scrollYProgress, [0.1, 0.85], ["50%", "100%"]);
  const opacity = useTransform(scrollYProgress, [0.05, 0.4], [0.3, 1]);
  const borderRadius = useTransform(scrollYProgress, [0.1, 0.85], ["48px", "24px"]);

  return (
    <section 
      ref={containerRef} 
      className="relative min-h-[90vh] py-20 flex flex-col items-center justify-center overflow-hidden bg-background"
    >
      <div className="section-center-header px-6">
        <span className="section-sub shadow-xs">
          {t("landing.videoBadge")}
        </span>
        <h2 className="section-title text-3xl sm:text-4xl md:text-5xl mt-3 mb-4">
          {t("landing.videoTitle")}
        </h2>
        <p className="section-desc text-base sm:text-lg">
          {t("landing.videoSubtitle")}
        </p>
      </div>

      {/* Animating Scroll Container */}
      <div className="container mx-auto px-6 flex justify-center items-center">
        <motion.div 
          style={{
            width: widthScale,
            opacity: opacity,
            borderRadius: borderRadius,
          }}
          className="relative w-full aspect-[16/9] overflow-hidden shadow-2xl border border-border/30 dark:border-border/10 bg-secondary/20 flex items-center justify-center"
        >
          <video 
            src={VIDEOS.showcase}
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
          />
          {/* Subtle vignette/gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-black/10 pointer-events-none" />
        </motion.div>
      </div>
    </section>
  );
};

export default ShowcaseVideoSection;

"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useTranslation } from "@/presentation/providers/LanguageProvider";
import { motion } from "framer-motion";

interface TestimonialItem {
  id: number;
  tagKey: string;
  storyKey: string;
  authorKey: string;
  petKey: string;
  avatar: string;
  tagColorClass: string;
  tagBgClass: string;
  glowClass: string;
}

const StarIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z" clipRule="evenodd" />
  </svg>
);

const QuoteIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.75-2-2-2H4c-1.25 0-2 .75-2 2v4c0 1.25.75 2 2 2h4l-4 6v4zm10 0c3 0 7-1 7-8V5c0-1.25-.75-2-2-2h-4c-1.25 0-2 .75-2 2v4c0 1.25.75 2 2 2h4l-4 6v4z" />
  </svg>
);

const ChevronLeftIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="m15 18-6-6 6-6" />
  </svg>
);

const ChevronRightIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="m9 18 6-6-6-6" />
  </svg>
);

function TestimonialMessageCard({
  item,
  isActive,
  t,
}: {
  item: TestimonialItem;
  isActive: boolean;
  t: (key: string) => string;
}) {
  return (
    <div
      className={`relative flex h-full min-h-[320px] md:min-h-[340px] flex-col items-center rounded-[2.5rem] border bg-card p-6 md:p-8 text-center transition-all duration-700 select-none ${
        isActive
          ? "border-primary/50 shadow-[0_20px_50px_rgba(201,109,46,0.15)] dark:shadow-[0_20px_50px_rgba(234,168,94,0.1)] scale-100"
          : "border-border/30 shadow-none opacity-40 dark:opacity-20 pointer-events-none scale-95"
      }`}
    >
      <QuoteIcon className="mb-4 h-8 w-8 shrink-0 text-primary/40" />

      {/* Story Tag */}
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border mb-4 ${item.tagBgClass} ${item.tagColorClass}`}>
        {t(`landing.${item.tagKey}`)}
      </span>

      <p className="mb-6 flex-1 text-center text-sm md:text-base font-semibold leading-relaxed text-foreground tracking-tight line-clamp-5 select-none">
        &ldquo;{t(`landing.${item.storyKey}`)}&rdquo;
      </p>

      {/* Rating stars */}
      <div className="mb-6 flex shrink-0 items-center justify-center gap-1">
        {Array.from({ length: 5 }).map((_, index) => (
          <StarIcon
            key={`star-${item.id}-${index}`}
            className="h-5 w-5 transition-colors duration-500 fill-amber-400 text-amber-400 drop-shadow-[0_0_4px_rgba(245,158,11,0.2)]"
          />
        ))}
      </div>

      {/* Profile info */}
      <div className="mt-auto flex w-full flex-row items-center justify-center gap-4 pt-6 border-t border-border/40 dark:border-border/10">
        <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-linear-to-tr from-primary/20 to-success/20 border border-border/50 shadow-xs">
          <span className="text-2xl select-none">{item.avatar}</span>
        </div>
        <div className="flex flex-col items-start text-left">
          <p className="text-sm font-bold text-foreground leading-none">{t(`landing.${item.authorKey}`)}</p>
          <p className="text-xs font-semibold text-muted mt-1.5">
            {t(`landing.${item.petKey}`)}
          </p>
        </div>
      </div>
    </div>
  );
}

export const TestimonialsSection: React.FC = () => {
  const { t } = useTranslation();

  const testimonials: TestimonialItem[] = [
    {
      id: 1,
      tagKey: "testimonial1Tag",
      storyKey: "testimonial1Story",
      authorKey: "testimonial1Author",
      petKey: "testimonial1Pet",
      avatar: "🐶",
      tagColorClass: "text-success border-success/30",
      tagBgClass: "bg-success/10 dark:bg-success/5",
      glowClass: "hover:shadow-success/5 hover:border-success/30",
    },
    {
      id: 2,
      tagKey: "testimonial2Tag",
      storyKey: "testimonial2Story",
      authorKey: "testimonial2Author",
      petKey: "testimonial2Pet",
      avatar: "🐕",
      tagColorClass: "text-primary border-primary/30",
      tagBgClass: "bg-primary/10 dark:bg-primary/5",
      glowClass: "hover:shadow-primary/5 hover:border-primary/30",
    },
    {
      id: 3,
      tagKey: "testimonial3Tag",
      storyKey: "testimonial3Story",
      authorKey: "testimonial3Author",
      petKey: "testimonial3Pet",
      avatar: "🐱",
      tagColorClass: "text-danger border-danger/30",
      tagBgClass: "bg-danger/10 dark:bg-danger/5",
      glowClass: "hover:shadow-danger/5 hover:border-danger/30",
    },
  ];

  // Duplicate items to ensure smooth 3D carousel loops (min 5 items)
  let displayItems = [...testimonials];
  if (displayItems.length > 1 && displayItems.length < 5) {
    const original = [...displayItems];
    while (displayItems.length < 5) {
      const clone = original[displayItems.length % original.length]!;
      displayItems.push({
        ...clone,
        id: clone.id + 10000 + displayItems.length,
      });
    }
  }

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const interactionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const pauseAutoPlay = useCallback(() => {
    setIsAutoPlaying(false);
    if (interactionTimeoutRef.current) {
      clearTimeout(interactionTimeoutRef.current);
    }
    interactionTimeoutRef.current = setTimeout(() => {
      setIsAutoPlaying(true);
    }, 8000);
  }, []);

  const handleNext = useCallback(() => {
    pauseAutoPlay();
    setCurrentIndex((prev) => (prev + 1) % displayItems.length);
  }, [displayItems.length, pauseAutoPlay]);

  const handlePrev = useCallback(() => {
    pauseAutoPlay();
    setCurrentIndex((prev) => (prev - 1 + displayItems.length) % displayItems.length);
  }, [displayItems.length, pauseAutoPlay]);

  useEffect(() => {
    if (displayItems.length <= 1 || !isAutoPlaying) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % displayItems.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [displayItems.length, isAutoPlaying]);

  return (
    <section className="relative py-20 select-none overflow-hidden transition-colors duration-300">
      {/* Background decoration elements */}
      <div className="absolute top-1/4 left-0 w-72 h-72 bg-primary/5 rounded-full blur-3xl -z-10 pointer-events-none" />
      <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-success/5 rounded-full blur-3xl -z-10 pointer-events-none" />

      <div className="container mx-auto px-6 z-10 relative">
        <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
          
          {/* Left Column: Editorial Text Content */}
          <div className="lg:col-span-5 flex flex-col items-center lg:items-start text-center lg:text-left">
            <motion.span 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="section-sub shadow-xs mb-4"
            >
              💬 {t("common.navReviews")}
            </motion.span>
            
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="section-title text-3xl sm:text-4xl md:text-5xl mt-4 mb-6"
            >
              {t("landing.testimonialsTitle")}
            </motion.h2>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="section-desc text-base sm:text-lg max-w-xl mb-8"
            >
              {t("landing.testimonialsSubtitle")}
            </motion.p>
          </div>

          {/* Right Column: Rotating 3D Deck Animation */}
          <div className="lg:col-span-7 flex flex-col items-center relative">
            <div 
              className="relative w-full max-w-sm md:max-w-md aspect-4/5 md:aspect-square flex items-center justify-center"
              style={{ perspective: "2000px" }}
            >
              {displayItems.map((item, index) => {
                const relativePosition = (index - currentIndex + displayItems.length) % displayItems.length;
                
                let x = 0;
                let y = 0;
                let scale = 0.6;
                let opacity = 0;
                let zIndex = 10;
                let rotateY = 0;
                let rotateZ = 0;

                if (relativePosition === 0) {
                  // Center (Active)
                  x = 0; y = 0; scale = 1; opacity = 1; zIndex = 30; rotateY = 0; rotateZ = 0;
                } else if (relativePosition === 1) {
                  // Right (Next)
                  x = 160; y = 0; scale = 0.85; opacity = 0.9; zIndex = 20; rotateY = -15; rotateZ = 2;
                } else if (relativePosition === displayItems.length - 1) {
                  // Left (Prev)
                  x = -160; y = 0; scale = 0.85; opacity = 0.9; zIndex = 20; rotateY = 15; rotateZ = -2;
                } else {
                  // Hidden
                  if (relativePosition === 2) {
                    x = 320; y = 0; scale = 0.7; opacity = 0; zIndex = 10;
                  } else {
                    x = -320; y = 0; scale = 0.7; opacity = 0; zIndex = 10;
                  }
                }

                return (
                  <motion.div
                    key={item.id}
                    initial={false}
                    animate={{ x, y, scale, opacity, zIndex, rotateY, rotateZ }}
                    transition={{ 
                      type: "spring",
                      stiffness: 260,
                      damping: 26,
                      mass: 1
                    }}
                    className="absolute w-full max-w-[280px] md:max-w-[340px] h-fit pointer-events-auto"
                    style={{ transformStyle: "preserve-3d" }}
                  >
                    <TestimonialMessageCard
                      item={item}
                      isActive={relativePosition === 0}
                      t={t}
                    />
                  </motion.div>
                );
              })}

              {/* Navigation Controls Floating Left & Right */}
              {displayItems.length > 1 && (
                <>
                  <button
                    onClick={handlePrev}
                    className="absolute left-[-20px] md:left-[-40px] top-1/2 -translate-y-1/2 p-3 rounded-full border border-border/60 bg-card text-foreground transition-all duration-300 hover:bg-primary hover:text-white z-40 cursor-pointer shadow-lg active:scale-95"
                    aria-label="Previous testimonial"
                  >
                    <ChevronLeftIcon className="w-5 h-5" />
                  </button>

                  <button
                    onClick={handleNext}
                    className="absolute right-[-20px] md:right-[-40px] top-1/2 -translate-y-1/2 p-3 rounded-full border border-border/60 bg-card text-foreground transition-all duration-300 hover:bg-primary hover:text-white z-40 cursor-pointer shadow-lg active:scale-95"
                    aria-label="Next testimonial"
                  >
                    <ChevronRightIcon className="w-5 h-5" />
                  </button>
                </>
              )}

              {/* Rotating Orbitals behind the cards */}
              <div className="absolute inset-0 -z-10 flex items-center justify-center pointer-events-none">
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
                  className="w-[125%] h-[125%] border border-primary/5 dark:border-primary/10 rounded-full" 
                />
                <motion.div 
                  animate={{ rotate: -360 }}
                  transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                  className="absolute w-[95%] h-[95%] border border-success/5 dark:border-success/10 rounded-full" 
                />
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

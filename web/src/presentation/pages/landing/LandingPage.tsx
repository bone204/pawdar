"use client";
 
import React from "react";
import { useTranslation } from "@/presentation/providers/LanguageProvider";
import { Header } from "@/presentation/components/Header";
import { Footer } from "@/presentation/components/Footer";
import { HeroSection } from "@/presentation/pages/landing/sections/HeroSection";
import { StatsSection } from "@/presentation/pages/landing/sections/StatsSection";
import { RadarShowcaseSection } from "@/presentation/pages/landing/sections/RadarShowcaseSection";
import { ShowcaseVideoSection } from "@/presentation/pages/landing/sections/ShowcaseVideoSection";
 
export const LandingPage: React.FC = () => {
  const { t } = useTranslation();
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
 
      {/* Main Content */}
      <main className="grow pt-20">
        <HeroSection />
        <StatsSection />
        <RadarShowcaseSection />
        <ShowcaseVideoSection />

        <section className="py-20 bg-secondary/30 transition-colors duration-300 select-none">
          <div className="container mx-auto px-6">
            <h2 className="text-3xl lg:text-4xl font-extrabold text-center mb-16 tracking-tight select-none">
              {t("landing.featuresTitle")}
            </h2>
            
            <div className="grid md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="group p-8 bg-card rounded-2xl border border-border shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-[0_20px_40px_rgba(217,106,38,0.08)] hover:-translate-y-2 transition-all duration-300 select-none">
                <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center text-xl font-bold mb-6 group-hover:scale-110 transition-transform duration-300">
                  🏥
                </div>
                <h3 className="text-xl font-bold mb-3 select-none">{t("landing.feature1Title")}</h3>
                <p className="text-sm text-muted leading-relaxed select-none">{t("landing.feature1Desc")}</p>
              </div>
 
              {/* Feature 2 */}
              <div className="group p-8 bg-card rounded-2xl border border-border shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-[0_20px_40px_rgba(217,106,38,0.08)] hover:-translate-y-2 transition-all duration-300 select-none">
                <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center text-xl font-bold mb-6 group-hover:scale-110 transition-transform duration-300">
                  🤝
                </div>
                <h3 className="text-xl font-bold mb-3 select-none">{t("landing.feature2Title")}</h3>
                <p className="text-sm text-muted leading-relaxed select-none">{t("landing.feature2Desc")}</p>
              </div>
 
              {/* Feature 3 */}
              <div className="group p-8 bg-card rounded-2xl border border-border shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-[0_20px_40px_rgba(217,106,38,0.08)] hover:-translate-y-2 transition-all duration-300 select-none">
                <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center text-xl font-bold mb-6 group-hover:scale-110 transition-transform duration-300">
                  ⏰
                </div>
                <h3 className="text-xl font-bold mb-3 select-none">{t("landing.feature3Title")}</h3>
                <p className="text-sm text-muted leading-relaxed select-none">{t("landing.feature3Desc")}</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

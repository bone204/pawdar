"use client";
 
import React from "react";
import { Header } from "@/presentation/components/Header";
import { Footer } from "@/presentation/components/Footer";
import { HeroSection } from "@/presentation/pages/landing/sections/HeroSection";
import { StatsSection } from "@/presentation/pages/landing/sections/StatsSection";
import { RadarShowcaseSection } from "@/presentation/pages/landing/sections/RadarShowcaseSection";
import { ShowcaseVideoSection } from "@/presentation/pages/landing/sections/ShowcaseVideoSection";
import { TestimonialsSection } from "@/presentation/pages/landing/sections/TestimonialsSection";
import { PetIdCreatorSection } from "@/presentation/pages/landing/sections/PetIdCreatorSection";
import { FAQSection } from "@/presentation/pages/landing/sections/FAQSection";
 
export const LandingPage: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
 
      {/* Main Content */}
      <main className="grow pt-20">
        <HeroSection />
        <StatsSection />
        <RadarShowcaseSection />
        <ShowcaseVideoSection />
        <TestimonialsSection />
        <PetIdCreatorSection />
        <FAQSection />
      </main>

      <Footer />
    </div>
  );
};

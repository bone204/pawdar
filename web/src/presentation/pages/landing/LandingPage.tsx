"use client";
 
import React, { useEffect } from "react";
import { Header } from "@/presentation/components/Header";
import { Footer } from "@/presentation/components/Footer";
import { HeroSection } from "@/presentation/pages/landing/sections/HeroSection";
import { StatsSection } from "@/presentation/pages/landing/sections/StatsSection";
import { RadarShowcaseSection } from "@/presentation/pages/landing/sections/RadarShowcaseSection";
import { ShowcaseVideoSection } from "@/presentation/pages/landing/sections/ShowcaseVideoSection";
import { TestimonialsSection } from "@/presentation/pages/landing/sections/TestimonialsSection";
import { PetIdCreatorSection } from "@/presentation/pages/landing/sections/PetIdCreatorSection";
import { FAQSection } from "@/presentation/pages/landing/sections/FAQSection";
import { useSelector } from "react-redux";
import { selectIsAuthenticated } from "@/infrastructure/rtk/auth.slice";
import { useRouter } from "next/navigation";
import { APP_ROUTES } from "@/shared/constants/routes";
 
export const LandingPage: React.FC = () => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      router.replace(APP_ROUTES.dashboard);
    }
  }, [isAuthenticated, router]);

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

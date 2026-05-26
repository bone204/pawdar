"use client";

import React from "react";
import { useTranslation } from "@/presentation/providers/LanguageProvider";
import { Button } from "@/presentation/components/ui/Button";
import { LanguageSwitcher } from "@/presentation/components/ui/LanguageSwitcher";
import { ThemeToggle } from "@/presentation/components/ui/ThemeToggle";
import Link from "next/link";

export const LandingPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-50 backdrop-blur-md bg-background/70 border-b border-border transition-colors duration-300 select-none">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-black bg-linear-to-r from-primary to-amber-500 bg-clip-text text-transparent hover:scale-105 transition-transform duration-300 cursor-pointer">
            🐶 {t("common.appName")}
          </Link>
          
          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            <ThemeToggle />
            <Link href="/login" className="cursor-pointer">
              <Button variant="secondary" size="sm" className="cursor-pointer select-none">
                {t("auth.login")}
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="grow">
        {/* Modern Hero Section */}
        <section className="relative overflow-hidden py-24 lg:py-32 bg-radial from-primary/5 via-transparent to-transparent select-none">
          <div className="container mx-auto px-6 text-center flex flex-col items-center gap-8 relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider animate-bounce select-none">
              🐾 New companionship awaits
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-black tracking-tight leading-none text-foreground select-none">
              {t("landing.title")}
            </h1>
            
            <p className="text-lg lg:text-xl text-muted max-w-2xl font-light select-none">
              {t("landing.subtitle")}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 mt-4 w-full sm:w-auto">
              <Link href="/register" className="cursor-pointer">
                <Button size="lg" className="w-full sm:w-auto cursor-pointer select-none">
                  {t("landing.ctaStart")}
                </Button>
              </Link>
              <Link href="/login" className="cursor-pointer">
                <Button variant="secondary" size="lg" className="w-full sm:w-auto cursor-pointer select-none">
                  {t("landing.ctaLogin")}
                </Button>
              </Link>
            </div>
          </div>
        </section>

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

      <footer className="py-8 bg-background border-t border-border transition-colors duration-300 text-center text-xs text-muted select-none">
        <div className="container mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 select-none">
          <div>{t("landing.footer")}</div>
          <div className="flex gap-4 select-none">
            <span className="hover:text-foreground cursor-pointer select-none">Privacy Policy</span>
            <span className="hover:text-foreground cursor-pointer select-none">Terms of Service</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

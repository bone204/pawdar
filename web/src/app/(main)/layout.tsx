"use client";

import React, { useState } from "react";
import { useTranslation } from "@/presentation/providers/LanguageProvider";
import { ThemeToggle } from "@/presentation/components/ui/ThemeToggle";
import { LanguageSwitcher } from "@/presentation/components/ui/LanguageSwitcher";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { APP_ROUTES } from "@/shared/constants/routes";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { t } = useTranslation();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const _onLogoutPressed = () => {
    localStorage.removeItem("pawdar-user");
    router.push(APP_ROUTES.login);
  };

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden transition-colors duration-300">
      {/* Sidebar Panel */}
      <aside
        className={`${
          isSidebarOpen ? "w-64" : "w-20"
        } shrink-0 bg-card border-r border-border flex flex-col justify-between p-6 transition-all duration-300 ease-out`}
      >
        <div className="flex flex-col gap-10">
          {/* Logo */}
          <div className="flex items-center justify-between">
            <Link href={APP_ROUTES.home} className="flex items-center gap-2 select-none">
              <span className="text-2xl">🐶</span>
              {isSidebarOpen && (
                <span className="font-black text-lg bg-gradient-to-r from-primary to-amber-500 bg-clip-text text-transparent">
                  {t("common.appName")}
                </span>
              )}
            </Link>
            
            {/* Toggle Arrow */}
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-1 hover:bg-secondary rounded-lg transition-colors cursor-pointer"
            >
              {isSidebarOpen ? "◀" : "▶"}
            </button>
          </div>

          {/* Nav Items */}
          <nav className="flex flex-col gap-2">
            <Link
              href={APP_ROUTES.dashboard}
              className="flex items-center gap-4 px-4 py-3 bg-primary/10 text-primary rounded-xl font-bold transition-all duration-300"
            >
              <span>📊</span>
              {isSidebarOpen && <span>{t("main.dashboard")}</span>}
            </Link>
          </nav>
        </div>

        {/* Logout at bottom */}
        <button
          onClick={_onLogoutPressed}
          className="flex items-center gap-4 px-4 py-3 text-muted hover:text-danger hover:bg-danger/10 rounded-xl font-medium transition-all duration-300 cursor-pointer"
        >
          <span>🚪</span>
          {isSidebarOpen && <span>{t("common.logout")}</span>}
        </button>
      </aside>

      {/* Main Container */}
      <div className="flex-grow flex flex-col min-w-0">
        {/* Topbar Header */}
        <header className="h-20 border-b border-border bg-card/50 backdrop-blur-md px-8 flex items-center justify-between shrink-0 transition-colors duration-300">
          <div className="font-bold text-lg select-none text-foreground">
            {t("main.dashboard")}
          </div>

          <div className="flex items-center gap-6">
            <LanguageSwitcher />
            <ThemeToggle />
            
            {/* User Initials Badge */}
            <div className="w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-sm shadow-[0_4px_12px_rgba(217,106,38,0.2)] select-none">
              PT
            </div>
          </div>
        </header>

        {/* Scrollable Dashboard View */}
        <main className="flex-grow overflow-y-auto p-8 bg-background">
          <div className="max-w-5xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

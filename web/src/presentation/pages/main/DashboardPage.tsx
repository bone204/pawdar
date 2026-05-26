"use client";

import React, { useEffect, useState } from "react";
import { useTranslation } from "@/presentation/providers/LanguageProvider";
import { Button } from "@/presentation/components/ui/Button";
import { useRouter } from "next/navigation";

export const DashboardPage: React.FC = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const [userName, setUserName] = useState("Chủ Thú Cưng");

  useEffect(() => {
    // Check if user session exists (simulation)
    const savedUser = localStorage.getItem("pawdar-user");
    if (!savedUser) {
      router.push("/login");
    } else {
      try {
        const userObj = JSON.parse(savedUser);
        if (userObj && userObj.name) {
          setUserName(userObj.name);
        }
      } catch (e) {
        // Fallback
      }
    }
  }, [router]);

  const _onLogoutPressed = () => {
    localStorage.removeItem("pawdar-user");
    router.push("/login");
  };

  return (
    <div className="flex flex-col gap-8 w-full select-none">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-8 bg-gradient-to-r from-primary to-indigo-600 rounded-3xl text-white shadow-lg">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">
            {t("main.welcome")}, {userName}! 👋
          </h1>
          <p className="text-sm opacity-90 mt-1.5 font-light">
            Here is what's happening with your pets today.
          </p>
        </div>
        <div className="shrink-0">
          <Button
            onClick={_onLogoutPressed}
            variant="ghost"
            className="bg-white/10 text-white hover:bg-white/20 border border-white/20 px-5 py-2.5 rounded-xl font-bold"
          >
            {t("common.logout")} 🚪
          </Button>
        </div>
      </div>

      {/* Analytics Cards */}
      <div>
        <h2 className="text-xl font-black mb-6 tracking-tight">{t("main.statsTitle")}</h2>
        
        <div className="grid sm:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="bg-card border border-border p-6 rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.01)] flex flex-col gap-4">
            <div className="text-2xl font-bold">🐶</div>
            <div className="text-sm text-muted font-medium">{t("main.activePets")}</div>
            <div className="text-3xl font-black text-primary">3</div>
          </div>
          
          {/* Card 2 */}
          <div className="bg-card border border-border p-6 rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.01)] flex flex-col gap-4">
            <div className="text-2xl font-bold">📅</div>
            <div className="text-sm text-muted font-medium">{t("main.appointments")}</div>
            <div className="text-3xl font-black text-indigo-500">2</div>
          </div>

          {/* Card 3 */}
          <div className="bg-card border border-border p-6 rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.01)] flex flex-col gap-4">
            <div className="text-2xl font-bold">💖</div>
            <div className="text-sm text-muted font-medium">{t("main.healthScore")}</div>
            <div className="text-3xl font-black text-emerald-500">96%</div>
          </div>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="bg-card border border-border p-8 rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.01)]">
        <h2 className="text-xl font-black mb-6 tracking-tight">{t("main.recentActivity")}</h2>
        
        <div className="flex flex-col gap-4">
          {/* Activity 1 */}
          <div className="flex items-center gap-4 p-4 hover:bg-secondary/40 rounded-xl transition-colors duration-300">
            <div className="w-10 h-10 bg-emerald-500/10 text-emerald-500 rounded-lg flex items-center justify-center font-bold">
              💉
            </div>
            <div className="text-sm font-medium text-foreground">
              {t("main.activity1")}
            </div>
          </div>

          {/* Activity 2 */}
          <div className="flex items-center gap-4 p-4 hover:bg-secondary/40 rounded-xl transition-colors duration-300">
            <div className="w-10 h-10 bg-indigo-500/10 text-indigo-500 rounded-lg flex items-center justify-center font-bold">
              🦷
            </div>
            <div className="text-sm font-medium text-foreground">
              {t("main.activity2")}
            </div>
          </div>

          {/* Activity 3 */}
          <div className="flex items-center gap-4 p-4 hover:bg-secondary/40 rounded-xl transition-colors duration-300">
            <div className="w-10 h-10 bg-amber-500/10 text-amber-500 rounded-lg flex items-center justify-center font-bold">
              🥗
            </div>
            <div className="text-sm font-medium text-foreground">
              {t("main.activity3")}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

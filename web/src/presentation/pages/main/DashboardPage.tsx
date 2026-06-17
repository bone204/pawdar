"use client";

import React, { useEffect } from "react";
import { useTranslation } from "@/presentation/providers/LanguageProvider";
import { Button } from "@/presentation/components/ui/Button";
import { useRouter } from "next/navigation";
import { APP_ROUTES } from "@/shared/constants/routes";
import { useSelector, useDispatch } from "react-redux";
import { selectCurrentUser, clearAuthState } from "@/infrastructure/rtk/auth.slice";

export const DashboardPage: React.FC = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const dispatch = useDispatch();
  const user = useSelector(selectCurrentUser);
  const userName = user?.fullName || "Chủ Thú Cưng";

  useEffect(() => {
    // Check if logged-in flag exists, if not redirect to login
    const loggedInFlag = localStorage.getItem("pawdar-logged-in");
    if (!loggedInFlag) {
      router.push(APP_ROUTES.login);
    }
  }, [router]);

  const _onLogoutPressed = () => {
    dispatch(clearAuthState());
    router.push(APP_ROUTES.login);
  };

  return (
    <div className="flex flex-col gap-8 w-full select-none">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-8 bg-linear-to-r from-primary to-amber-600 rounded-3xl text-white shadow-lg">
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
            variant="secondary"
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
            <div className="text-3xl font-black text-primary">2</div>
          </div>

          {/* Card 3 */}
          <div className="bg-card border border-border p-6 rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.01)] flex flex-col gap-4">
            <div className="text-2xl font-bold">💖</div>
            <div className="text-sm text-muted font-medium">{t("main.healthScore")}</div>
            <div className="text-3xl font-black text-success">96%</div>
          </div>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="bg-card border border-border p-8 rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.01)]">
        <h2 className="text-xl font-black mb-6 tracking-tight">{t("main.recentActivity")}</h2>
        
        <div className="flex flex-col gap-4">
          {/* Activity 1 */}
          <div className="flex items-center gap-4 p-4 hover:bg-secondary/40 rounded-xl transition-colors duration-300">
            <div className="w-10 h-10 bg-success/10 text-success rounded-lg flex items-center justify-center font-bold">
              💉
            </div>
            <div className="text-sm font-medium text-foreground">
              {t("main.activity1")}
            </div>
          </div>

          {/* Activity 2 */}
          <div className="flex items-center gap-4 p-4 hover:bg-secondary/40 rounded-xl transition-colors duration-300">
            <div className="w-10 h-10 bg-primary/10 text-primary rounded-lg flex items-center justify-center font-bold">
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

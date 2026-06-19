"use client";

import React, { useEffect } from "react";
import { useTranslation } from "@/presentation/providers/LanguageProvider";
import { Button } from "@/presentation/components/ui/Button";
import { useRouter } from "next/navigation";
import { APP_ROUTES } from "@/shared/constants/routes";
import { useSelector, useDispatch } from "react-redux";
import { selectCurrentUser, clearAuthState } from "@/infrastructure/rtk/auth.slice";

interface MockArticle {
  image: string;
  sourceKey: string;
  titleKey: string;
  descKey: string;
  url: string;
  publishedAt: string;
}

const MOCK_ARTICLES: MockArticle[] = [
  {
    image: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=600",
    sourceKey: "main.news1Source",
    titleKey: "main.news1Title",
    descKey: "main.news1Desc",
    url: "https://en.wikipedia.org/wiki/Dog",
    publishedAt: "2026-06-19T07:00:00Z"
  },
  {
    image: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=600",
    sourceKey: "main.news2Source",
    titleKey: "main.news2Title",
    descKey: "main.news2Desc",
    url: "https://en.wikipedia.org/wiki/Cat",
    publishedAt: "2026-06-18T05:30:00Z"
  },
  {
    image: "https://images.unsplash.com/photo-1533738363-b7f9aef128ce?auto=format&fit=crop&q=80&w=600",
    sourceKey: "main.news3Source",
    titleKey: "main.news3Title",
    descKey: "main.news3Desc",
    url: "https://en.wikipedia.org/wiki/Pet_adoption",
    publishedAt: "2026-06-17T09:15:00Z"
  }
];

export const DashboardPage: React.FC = () => {
  const { t, locale } = useTranslation();
  const router = useRouter();
  const dispatch = useDispatch();
  const user = useSelector(selectCurrentUser);
  const userName = user?.fullName || t("main.defaultOwnerName");

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

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString(locale === "vi" ? "vi-VN" : "en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch (e) {
      return dateString;
    }
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
            {t("main.welcomeSubtitle")}
          </p>
        </div>
        <div className="shrink-0">
          <Button
            onClick={_onLogoutPressed}
            variant="secondary"
            className="bg-white/10 text-white hover:bg-white/20 border border-white/20 px-5 py-2.5 rounded-xl font-bold"
          >
            {t("common.logout")}
          </Button>
        </div>
      </div>

      {/* Stats Cards Section */}
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

      {/* News Feed Section */}
      <div>
        <div className="flex flex-col gap-1 mb-6">
          <h2 className="text-xl font-black tracking-tight">{t("main.petNews")}</h2>
          <p className="text-sm text-muted-foreground">{t("main.petNewsDesc")}</p>
        </div>

        {/* Articles List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {MOCK_ARTICLES.map((article, idx) => (
            <article 
              key={idx}
              className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col h-full"
            >
              {/* Article Image */}
              <div className="relative w-full aspect-video overflow-hidden">
                <img 
                  src={article.image} 
                  alt={t(article.titleKey)}
                  className="object-cover w-full h-full hover:scale-105 transition-transform duration-500"
                />
              </div>

              {/* Article Content */}
              <div className="p-5 flex-grow flex flex-col">
                {/* Meta: Source & Date */}
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3 font-semibold">
                  <span className="bg-primary/10 text-primary px-2.5 py-0.5 rounded-full truncate max-w-[120px]">
                    {t(article.sourceKey)}
                  </span>
                  <span>•</span>
                  <span>{formatDate(article.publishedAt)}</span>
                </div>

                {/* Title */}
                <h3 className="font-extrabold text-base line-clamp-2 text-foreground mb-2 leading-snug hover:text-primary">
                  <a href={article.url} target="_blank" rel="noopener noreferrer">
                    {t(article.titleKey)}
                  </a>
                </h3>

                {/* Description */}
                <p className="text-xs text-muted-foreground line-clamp-3 mb-5 font-normal leading-relaxed">
                  {t(article.descKey)}
                </p>

                {/* Read More Link */}
                <a
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-auto inline-flex items-center justify-center text-xs font-bold text-primary bg-primary/5 hover:bg-primary hover:text-white px-4 py-2.5 rounded-xl transition-all duration-300 w-full"
                >
                  {t("main.readMore")}
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
};

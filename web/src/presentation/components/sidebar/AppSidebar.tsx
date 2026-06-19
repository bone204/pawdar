"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslation } from "@/presentation/providers/LanguageProvider";
import { APP_ROUTES } from "@/shared/constants/routes";
import { PawPrintIcon, LogOutIcon } from "@/presentation/components/ui/Icons";

export interface NavItem {
  id: string;
  label: string;
  route: string;
  icon: string | React.ReactNode;
}

export interface AppSidebarProps {
  navItems: NavItem[];
  title: string;
  userInitials: string;
  userName: string;
  userEmail?: string;
  onLogout: () => void;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
}

export function AppSidebar({
  navItems,
  title,
  userInitials,
  userName,
  userEmail,
  onLogout,
  isMobileMenuOpen,
  setIsMobileMenuOpen,
}: AppSidebarProps) {
  const pathname = usePathname();
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <>
      {/* ── Mobile & Tablet Drawer ────────────────────────────────────── */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-[100] flex">
          {/* Background Overlay */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 animate-in fade-in"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* Drawer Container */}
          <div className="relative flex w-72 max-w-[80vw] flex-col bg-card h-full p-5 border-r border-border shadow-2xl z-50 animate-in slide-in-from-left duration-300">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-border/80">
              <Link href={APP_ROUTES.dashboard} className="flex items-center gap-2 select-none group" onClick={() => setIsMobileMenuOpen(false)}>
                <PawPrintIcon className="w-7 h-7 text-primary group-hover:scale-110 transition-transform duration-300" />
                <span className="font-black text-2xl bg-linear-to-r from-primary to-amber-600 bg-clip-text text-transparent">
                  {title}
                </span>
              </Link>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-1.5 rounded-lg text-muted hover:text-foreground hover:bg-secondary/60 active:scale-95 transition-all cursor-pointer"
                type="button"
                aria-label="Close menu"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            </div>

            {/* Main Navigation */}
            <div className="flex-1 overflow-y-auto py-6 space-y-2">
              <p className="text-xs font-bold text-muted uppercase tracking-widest px-2 mb-3">
                {t("sidebar.main_menu")}
              </p>
              {navItems.map((item) => {
                const isActive = pathname.startsWith(item.route);
                return (
                  <Link
                    key={item.id}
                    href={item.route}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition-all border cursor-pointer active:scale-[0.98] ${
                      isActive
                        ? "bg-primary text-primary-foreground border-primary/20 shadow-[0_4px_12px_rgba(201,109,46,0.2)] dark:shadow-[0_4px_12px_rgba(234,168,94,0.25)]"
                        : "text-foreground bg-transparent hover:bg-secondary/40 border-transparent"
                    }`}
                  >
                    <span className="flex items-center justify-center w-6 h-6">{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>

            {/* Bottom Control Bar */}
            <div className="pt-4 border-t border-border/80 flex flex-col gap-4">
              <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-secondary/20 p-2.5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-bold shadow-sm">
                  {userInitials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-foreground truncate">{userName}</p>
                  {userEmail && <p className="text-xs text-muted truncate">{userEmail}</p>}
                </div>
              </div>
              <button
                onClick={() => {
                  onLogout();
                  setIsMobileMenuOpen(false);
                }}
                className="flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold text-danger bg-danger/10 hover:bg-danger/20 border border-danger/20 transition-all cursor-pointer active:scale-[0.98]"
              >
                <LogOutIcon className="w-5 h-5 text-danger/80" />
                <span>{t("common.logout")}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Desktop View ────────────────────────────────────────────── */}
      <aside
        className={`hidden md:flex flex-col bg-card border-r border-border transition-[width] duration-300 ease-in-out shrink-0 ${
          isExpanded ? "w-[270px]" : "w-[80px]"
        }`}
      >
        <div className="flex w-full flex-col items-center px-4 py-6 gap-4 flex-1 overflow-x-hidden">
          {/* Header Toggle Button */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={`group flex items-center ${
              isExpanded ? "justify-start px-3.5 gap-2.5" : "justify-center"
            } h-12 w-full rounded-xl transition-colors duration-300 cursor-pointer active:scale-[0.98] text-muted hover:text-foreground hover:bg-secondary/50 bg-transparent`}
            aria-label="Toggle menu"
          >
            <span className="flex items-center justify-center shrink-0 w-6 h-6 transition-transform">
              {isExpanded ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
              )}
            </span>
            
            <span
              className={`text-base font-bold truncate transition-all duration-300 ease-in-out ${
                isExpanded
                  ? "opacity-100 translate-x-0"
                  : "opacity-0 -translate-x-4 pointer-events-none max-w-0"
              }`}
            >
              {t("sidebar.close_menu")}
            </span>
          </button>

          {/* Divider */}
          <hr className="w-full border-border/60" />

          {/* Navigation Items */}
          <nav className="flex w-full flex-col gap-5">
            {navItems.map((item) => {
              const isActive = pathname.startsWith(item.route);
              return (
                <Link
                  key={item.id}
                  href={item.route}
                  title={isExpanded ? undefined : item.label}
                  className={`group flex items-center ${
                    isExpanded ? "justify-start px-3.5 gap-2.5" : "justify-center"
                  } h-12 w-full rounded-xl transition-colors duration-300 cursor-pointer active:scale-[0.98] ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-[0_4px_12px_rgba(201,109,46,0.2)] dark:shadow-[0_4px_12px_rgba(234,168,94,0.25)]"
                      : "text-muted hover:text-foreground hover:bg-secondary/50 bg-transparent"
                  }`}
                >
                  <span className="flex items-center justify-center shrink-0 w-6 h-6 transition-transform group-hover:scale-110">
                    {item.icon}
                  </span>
                  
                  <span
                    className={`text-base font-bold truncate transition-all duration-300 ease-in-out ${
                      isExpanded
                        ? "opacity-100 translate-x-0"
                        : "opacity-0 -translate-x-4 pointer-events-none max-w-0"
                    }`}
                  >
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer Logo */}
        <div className="w-full flex flex-col gap-3 mt-auto shrink-0 pt-6 border-t border-border/50 px-4 mb-6">
          <Link
            href={APP_ROUTES.dashboard}
            className="flex items-center h-12 w-full rounded-xl transition-colors duration-300 select-none group hover:bg-secondary/20"
          >
            <span className="flex items-center justify-center shrink-0 w-12 h-12 text-2xl group-hover:scale-110 transition-transform duration-300">
              <PawPrintIcon className="w-6 h-6 text-primary" />
            </span>
            
            <div
              className={`flex flex-1 items-center justify-between transition-all duration-300 ease-in-out overflow-hidden ${
                isExpanded
                  ? "opacity-100 translate-x-0"
                  : "opacity-0 -translate-x-4 pointer-events-none max-w-0"
              }`}
            >
              <span className="font-black text-2xl leading-none bg-linear-to-r from-primary to-amber-600 bg-clip-text text-transparent truncate">
                {title}
              </span>
              
              <span className="text-[10px] font-bold text-muted border border-border/80 px-2 py-0.5 rounded-lg ml-2 bg-secondary/20 whitespace-nowrap mt-1">
                Beta
              </span>
            </div>
          </Link>
        </div>
      </aside>
    </>
  );
}

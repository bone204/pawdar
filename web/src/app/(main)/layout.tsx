"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useTranslation } from "@/presentation/providers/LanguageProvider";
import { ThemeToggle } from "@/presentation/components/ui/ThemeToggle";
import { LanguageSwitcher } from "@/presentation/components/ui/LanguageSwitcher";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { APP_ROUTES } from "@/shared/constants/routes";
import { useDispatch, useSelector } from "react-redux";
import { clearAuthState, selectCurrentUser } from "@/infrastructure/rtk/auth.slice";
import { AppSidebar, NavItem } from "@/presentation/components/sidebar/AppSidebar";
import { HomeIcon, PawPrintIcon, UserIcon, LogOutIcon, TagIcon } from "@/presentation/components/ui/Icons";
import { useGetPetByIdQuery } from "@/infrastructure/rtk/api/pet.api";
import { TextField } from "@/presentation/components/ui/TextField";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { t } = useTranslation();
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useDispatch();
  const user = useSelector(selectCurrentUser);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileDropdownRef = useRef<HTMLDivElement>(null);

  const searchParams = useSearchParams();
  const initialSearch = searchParams?.get("search") || "";
  const [searchValue, setSearchValue] = useState(initialSearch);

  useEffect(() => {
    setSearchValue(searchParams?.get("search") || "");
  }, [searchParams]);

  useEffect(() => {
    if (pathname !== APP_ROUTES.dashboard) return;
    const h = setTimeout(() => {
      const currentParams = new URLSearchParams(window.location.search);
      if (searchValue) {
        currentParams.set("search", searchValue);
      } else {
        currentParams.delete("search");
      }
      const newQuery = currentParams.toString();
      router.push(`${APP_ROUTES.dashboard}${newQuery ? `?${newQuery}` : ""}`);
    }, 400);
    return () => clearTimeout(h);
  }, [searchValue, router, pathname]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };
    if (isProfileMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isProfileMenuOpen]);

  const _onLogoutPressed = () => {
    dispatch(clearAuthState());
    router.push(APP_ROUTES.login);
  };

  const userInitials = user && user.fullName
    ? user.fullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "PT";

  const displayAvatar = user?.avatarUrl && user.avatarUrl.startsWith("http")
    ? user.avatarUrl
    : null;

  const navItems: NavItem[] = [
    {
      id: "dashboard",
      label: t("main.dashboard") || "Trang chủ",
      route: APP_ROUTES.dashboard,
      icon: <HomeIcon className="w-5 h-5" />,
    },
    {
      id: "my-pets",
      label: t("main.myPets") || "Thú Cưng Của Tôi",
      route: APP_ROUTES.myPets,
      icon: <PawPrintIcon className="w-5 h-5" />,
    },
    {
      id: "breeds",
      label: t("main.breeds") || "Giống Loài Thú Cưng",
      route: APP_ROUTES.breeds,
      icon: <TagIcon className="w-5 h-5" />,
    },
    {
      id: "profile",
      label: t("common.profile") || "Hồ sơ cá nhân",
      route: APP_ROUTES.profile,
      icon: <UserIcon className="w-5 h-5" />,
    },
  ];

  // Check if current route is a pet detail page
  const petIdMatch = pathname.match(/^\/my-pets\/([^/]+)$/i);
  const activePetId = petIdMatch ? petIdMatch[1] : "";
  const { data: activePet } = useGetPetByIdQuery(activePetId, {
    skip: !activePetId,
  });

  // Determine top header title dynamically
  const getHeaderTitle = () => {
    if (activePetId) {
      return `${t("main.myPets")} / ${activePet?.name || "..."}`;
    }
    if (pathname.startsWith(APP_ROUTES.myPets)) {
      return t("main.myPets");
    }
    if (pathname.startsWith(APP_ROUTES.breeds)) {
      return t("main.breeds");
    }
    if (pathname.startsWith(APP_ROUTES.profile)) {
      return t("common.profile") || "Hồ sơ cá nhân";
    }
    return t("main.dashboard") || "Trang chủ";
  };

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden transition-colors duration-300">
      <AppSidebar
        navItems={navItems}
        title={t("common.appName") || "PAWDAR"}
        userInitials={userInitials}
        userName={user?.fullName || "Pawdar User"}
        userEmail={user?.email}
        onLogout={_onLogoutPressed}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />

      {/* Main Container */}
      <div className="flex-grow flex flex-col min-w-0">
        {/* Topbar Header */}
        <header className="h-20 border-b border-border bg-card/50 backdrop-blur-md px-4 md:px-8 flex items-center justify-between shrink-0 transition-colors duration-300 relative z-40">
          <div className="flex items-center gap-3">
            {/* Mobile Hamburger */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden p-2 -ml-2 rounded-xl text-foreground hover:bg-secondary/50 active:scale-95 transition-all cursor-pointer"
              aria-label="Open menu"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
            </button>
            {/* Back button for subpages */}
            {activePetId && (
              <button
                onClick={() => router.push("/my-pets")}
                className="p-2 rounded-xl text-foreground hover:text-primary hover:bg-secondary/50 active:scale-95 transition-all cursor-pointer flex items-center justify-center mr-1"
                aria-label="Back to My Pets"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" x2="5" y1="12" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
              </button>
            )}
            {pathname === APP_ROUTES.dashboard ? (
              <div className="w-56 md:w-80 select-none">
                <TextField
                  id="feed-search"
                  placeholder={t("posts.searchPlaceholder") || "Tìm kiếm bài viết..."}
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  className="w-full rounded-xl"
                  leftIcon={
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                  }
                />
              </div>
            ) : (
              <div className="font-bold text-lg select-none text-foreground hidden md:block">
                {getHeaderTitle()}
              </div>
            )}
            {/* App name on mobile top bar */}
            <div className="font-black text-lg text-foreground md:hidden select-none">
              {t("common.appName") || "PAWDAR"}
            </div>
          </div>

          <div className="flex items-center gap-3 md:gap-6">
            <LanguageSwitcher />
            <ThemeToggle />
            
            {/* User Profile Dropdown */}
            <div className="relative" ref={profileDropdownRef}>
              <button
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center font-bold text-sm shadow-[0_4px_12px_rgba(201,109,46,0.2)] dark:shadow-[0_4px_12px_rgba(234,168,94,0.25)] select-none shrink-0 cursor-pointer active:scale-95 transition-transform hover:brightness-110"
              >
                {displayAvatar ? (
                  <img
                    src={displayAvatar}
                    alt={user?.fullName || "User"}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="w-full h-full bg-primary text-primary-foreground flex items-center justify-center">
                    {userInitials}
                  </span>
                )}
              </button>
              
              {isProfileMenuOpen && (
                <div className="absolute top-14 right-0 w-64 bg-card border border-border shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.3)] rounded-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                  <div className="px-3 py-3 border-b border-border/50 mb-1">
                    <p className="text-sm font-bold truncate">{user?.fullName || "Pawdar User"}</p>
                    <p className="text-xs text-muted truncate mt-0.5">{user?.email || "No email"}</p>
                  </div>
                  
                  <Link
                    href={APP_ROUTES.profile}
                    className="flex items-center gap-3 w-full p-3 rounded-xl text-foreground hover:bg-secondary/50 transition-colors font-bold text-sm"
                    onClick={() => setIsProfileMenuOpen(false)}
                  >
                    <UserIcon className="w-5 h-5 text-muted-foreground" />
                    {t("common.profile") || "Hồ sơ cá nhân"}
                  </Link>
                  
                  <button
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      _onLogoutPressed();
                    }}
                    className="flex items-center gap-3 w-full p-3 rounded-xl text-danger hover:bg-danger/10 transition-colors font-bold text-sm cursor-pointer"
                  >
                    <LogOutIcon className="w-5 h-5 text-danger/80" />
                    {t("common.logout")}
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Scrollable Dashboard View */}
        <main className="flex-grow overflow-y-auto px-4 md:px-8 py-6 bg-background">
          <div className="w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

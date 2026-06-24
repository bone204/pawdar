"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useTranslation } from "@/presentation/providers/LanguageProvider";
import { ThemeToggle } from "@/presentation/components/ui/ThemeToggle";
import { LanguageSwitcher } from "@/presentation/components/ui/LanguageSwitcher";
import { useRouter, usePathname } from "next/navigation";
import { APP_ROUTES } from "@/shared/constants/routes";
import { useDispatch, useSelector } from "react-redux";
import { clearAuthState, selectCurrentUser } from "@/infrastructure/rtk/auth.slice";
import { AppSidebar, NavItem } from "@/presentation/components/sidebar/AppSidebar";
import { HomeIcon, PawPrintIcon, UserIcon, LogOutIcon, TagIcon } from "@/presentation/components/ui/Icons";
import { useGetPetByIdQuery } from "@/infrastructure/rtk/api/pet.api";
import { TextField } from "@/presentation/components/ui/TextField";
import { useSearchUsersQuery, useAcceptFriendRequestMutation, useDeclineFriendRequestMutation, useGetReceivedFriendRequestsQuery, useGetFriendsQuery } from "@/infrastructure/rtk/api/user.api";
import {
  useGetNotificationsQuery,
  useMarkAsReadMutation,
  useMarkAllAsReadMutation,
} from "@/infrastructure/rtk/api/notification.api";
import { SocketProvider } from "@/presentation/providers/SocketProvider";
import { authApi } from "@/infrastructure/rtk/api/auth.api";
import { breedApi } from "@/infrastructure/rtk/api/breed.api";
import { petApi } from "@/infrastructure/rtk/api/pet.api";
import { uploadApi } from "@/infrastructure/rtk/api/upload.api";
import { postApi } from "@/infrastructure/rtk/api/post.api";
import { userApi } from "@/infrastructure/rtk/api/user.api";
import { notificationApi } from "@/infrastructure/rtk/api/notification.api";

function LayoutContent({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation();
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useDispatch();
  const user = useSelector(selectCurrentUser);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  
  const profileDropdownRef = useRef<HTMLDivElement>(null);
  const notificationDropdownRef = useRef<HTMLDivElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [recentSearches, setRecentSearches] = useState<{ id: string; fullName: string; avatarUrl: string | null; email?: string }[]>([]);

  // Fetch Notifications
  const { data: notifications = [] } = useGetNotificationsQuery(undefined, {
    skip: !user,
  });

  const { data: receivedRequests = [] } = useGetReceivedFriendRequestsQuery(undefined, {
    skip: !user,
  });

  const { data: friendsList } = useGetFriendsQuery({ limit: 100 }, {
    skip: !user,
  });

  const [markAsRead] = useMarkAsReadMutation();
  const [markAllAsRead] = useMarkAllAsReadMutation();
  const [acceptFriendRequest] = useAcceptFriendRequestMutation();
  const [declineFriendRequest] = useDeclineFriendRequestMutation();

  const friends = friendsList?.items || [];
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("pawdar-recent-searches");
      if (saved) {
        try {
          setRecentSearches(JSON.parse(saved));
        } catch (e) {
          console.error("Failed to parse recent searches", e);
        }
      }
    }
  }, []);

  const addToRecentSearches = (targetUser: { id: string; fullName: string; avatarUrl: string | null; email?: string }) => {
    setRecentSearches((prev) => {
      const filtered = prev.filter((item) => item.id !== targetUser.id);
      const updated = [targetUser, ...filtered].slice(0, 5);
      localStorage.setItem("pawdar-recent-searches", JSON.stringify(updated));
      return updated;
    });
  };

  const removeFromRecentSearches = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setRecentSearches((prev) => {
      const updated = prev.filter((item) => item.id !== id);
      localStorage.setItem("pawdar-recent-searches", JSON.stringify(updated));
      return updated;
    });
  };

  const clearRecentSearches = (e: React.MouseEvent) => {
    e.stopPropagation();
    setRecentSearches([]);
    localStorage.removeItem("pawdar-recent-searches");
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const { data: searchUsersResult, isFetching: isSearching } = useSearchUsersQuery(
    debouncedQuery,
    { skip: !debouncedQuery.trim() }
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
      if (notificationDropdownRef.current && !notificationDropdownRef.current.contains(event.target as Node)) {
        setIsNotificationOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const _onLogoutPressed = () => {
    dispatch(clearAuthState());
    dispatch(authApi.util.resetApiState());
    dispatch(breedApi.util.resetApiState());
    dispatch(petApi.util.resetApiState());
    dispatch(uploadApi.util.resetApiState());
    dispatch(postApi.util.resetApiState());
    dispatch(userApi.util.resetApiState());
    dispatch(notificationApi.util.resetApiState());
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
            
            <div className="relative w-56 md:w-80 select-none" ref={searchContainerRef}>
              <TextField
                id="user-search"
                placeholder={t("common.searchUsersPlaceholder") || "Tìm kiếm người dùng..."}
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsSearchFocused(true);
                }}
                onFocus={() => setIsSearchFocused(true)}
                className="w-full rounded-xl"
                leftIcon={
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                }
              />
              
              {/* Lịch sử tìm kiếm gần đây */}
              {isSearchFocused && !searchQuery.trim() && recentSearches.length > 0 && (
                <div className="absolute top-full mt-2 left-0 w-64 md:w-80 bg-card border border-border shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.3)] rounded-2xl p-2.5 z-50 animate-in fade-in zoom-in-95 duration-200 origin-top">
                  <div className="flex items-center justify-between px-2 pb-2 mb-1.5 border-b border-border/50">
                    <span className="text-[10px] font-black text-muted uppercase tracking-wider">
                      {t("common.recentSearches") || "Tìm kiếm gần đây"}
                    </span>
                    <button
                      onClick={clearRecentSearches}
                      className="text-[10px] font-bold text-danger hover:underline cursor-pointer"
                    >
                      {t("common.clearAll") || "Xóa tất cả"}
                    </button>
                  </div>
                  <div className="flex flex-col gap-1">
                    {recentSearches.map((u) => {
                      const uInitials = u.fullName
                        ? u.fullName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
                        : "US";
                      const uAvatar = u.avatarUrl && u.avatarUrl.startsWith("http") ? u.avatarUrl : null;
                      return (
                        <div
                          key={u.id}
                          onClick={() => {
                            router.push(`/dashboard/profile/${u.id}`);
                            setIsSearchFocused(false);
                          }}
                          className="flex items-center justify-between w-full p-2 rounded-xl hover:bg-secondary/50 transition-colors cursor-pointer group"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center font-bold text-xs shrink-0 bg-primary/10 text-primary border border-primary/20">
                              {uAvatar ? (
                                <img src={uAvatar} alt={u.fullName} className="w-full h-full object-cover" />
                              ) : (
                                <span>{uInitials}</span>
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-bold truncate text-foreground">{u.fullName}</p>
                              {u.email && <p className="text-[10px] text-muted truncate mt-0.5">{u.email}</p>}
                            </div>
                          </div>
                          <button
                            onClick={(e) => removeFromRecentSearches(u.id, e)}
                            className="p-1 hover:bg-secondary rounded-lg text-muted hover:text-danger active:scale-95 transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
                            title="Xóa khỏi lịch sử"
                          >
                            ✕
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Search Results Dropdown */}
              {isSearchFocused && searchQuery.trim() && (
                <div className="absolute top-full mt-2 left-0 w-64 md:w-80 bg-card border border-border shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.3)] rounded-2xl p-2 z-50 max-h-80 overflow-y-auto animate-in fade-in zoom-in-95 duration-200 origin-top">
                  {isSearching ? (
                    <div className="flex items-center justify-center py-6">
                      <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  ) : !searchUsersResult || searchUsersResult.length === 0 ? (
                    <div className="p-4 text-center text-sm text-muted">
                      {t("common.noUsersFound") || "Không tìm thấy người dùng"}
                    </div>
                  ) : (
                    <div className="flex flex-col gap-1">
                      {searchUsersResult.map((u) => {
                        const uInitials = u.fullName
                          ? u.fullName
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .slice(0, 2)
                              .toUpperCase()
                          : "US";
                        const uAvatar = u.avatarUrl && u.avatarUrl.startsWith("http") ? u.avatarUrl : null;
                        
                        return (
                          <button
                            key={u.id}
                            onClick={() => {
                              router.push(`/dashboard/profile/${u.id}`);
                              addToRecentSearches({
                                id: u.id,
                                fullName: u.fullName,
                                avatarUrl: u.avatarUrl || null,
                                email: u.email || undefined
                              });
                              setSearchQuery("");
                              setIsSearchFocused(false);
                            }}
                            className="flex items-center gap-3 w-full p-2 rounded-xl text-left hover:bg-secondary/50 transition-colors cursor-pointer"
                          >
                            <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center font-bold text-xs shrink-0 bg-primary/10 text-primary border border-primary/20">
                              {uAvatar ? (
                                <img src={uAvatar} alt={u.fullName} className="w-full h-full object-cover" />
                              ) : (
                                <span>{uInitials}</span>
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-bold truncate text-foreground">{u.fullName}</p>
                              {u.email && <p className="text-[10px] text-muted truncate mt-0.5">{u.email}</p>}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* App name on mobile top bar */}
            <div className="font-black text-lg text-foreground md:hidden select-none">
              {t("common.appName") || "PAWDAR"}
            </div>
          </div>

          <div className="flex items-center gap-3 md:gap-6">
            <LanguageSwitcher />
            <ThemeToggle />

            {/* Realtime Notification Bell Dropdown */}
            <div className="relative" ref={notificationDropdownRef}>
              <button
                onClick={() => {
                  setIsNotificationOpen(!isNotificationOpen);
                  if (!isNotificationOpen && unreadCount > 0) {
                    markAllAsRead();
                  }
                }}
                className="w-11 h-11 bg-secondary text-foreground rounded-full border border-border transition-all duration-300 hover:scale-105 active:scale-95 focus:outline-none flex items-center justify-center cursor-pointer relative"
                aria-label="View notifications"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                  <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                  <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
                </svg>
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-danger text-white text-[10px] font-black rounded-full flex items-center justify-center px-1 animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.5)] border border-card">
                    {unreadCount}
                  </span>
                )}
              </button>

              {isNotificationOpen && (
                <div className="absolute top-14 right-0 w-80 md:w-96 bg-card border border-border shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.3)] rounded-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-200 origin-top-right flex flex-col max-h-[480px]">
                  <div className="flex items-center justify-between px-3 py-2.5 border-b border-border/50 shrink-0">
                    <span className="text-xs font-black uppercase tracking-wider text-muted-foreground">{t("notification.title") || "Thông báo"}</span>
                    {unreadCount > 0 && (
                      <button
                        onClick={() => markAllAsRead()}
                        className="text-[10px] font-bold text-primary hover:underline cursor-pointer"
                      >
                        {t("notification.markAllRead") || "Đánh dấu tất cả đã đọc"}
                      </button>
                    )}
                  </div>

                  <div className="overflow-y-auto flex-1 py-1.5 flex flex-col gap-1">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center text-xs text-muted-foreground font-medium">
                        {t("notification.empty") || "Không có thông báo nào."}
                      </div>
                    ) : (
                      notifications.map((n) => {
                        const senderName = n.sender?.fullName || "Ai đó";
                        const senderAvatar = n.sender?.avatarUrl && n.sender.avatarUrl.startsWith("http") ? n.sender.avatarUrl : null;
                        const sInitials = senderName.split(" ").map((x) => x[0]).join("").slice(0, 2).toUpperCase();

                        return (
                          <div
                            key={n.id}
                            onClick={() => {
                              if (!n.isRead) markAsRead(n.id);
                              if (n.senderId) {
                                router.push(`/dashboard/profile/${n.senderId}`);
                                setIsNotificationOpen(false);
                              }
                            }}
                            className={`flex items-start gap-3 p-3 rounded-xl hover:bg-secondary/40 transition-colors cursor-pointer relative ${!n.isRead ? "bg-primary/5" : ""}`}
                          >
                            <div className="w-9 h-9 rounded-full overflow-hidden flex items-center justify-center font-bold text-xs shrink-0 bg-primary/10 text-primary border border-primary/20 mt-0.5">
                              {senderAvatar ? (
                                <img src={senderAvatar} alt={senderName} className="w-full h-full object-cover" />
                              ) : (
                                <span>{sInitials}</span>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold text-foreground truncate">{n.title}</p>
                              <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">{n.content}</p>

                              {/* Hành động kết bạn trực tiếp trên thông báo */}
                              {n.type === "FRIEND_REQUEST" && n.senderId && (
                                <div className="flex items-center gap-2 mt-2">
                                  {receivedRequests.some((req) => {
                                    if (n.referenceId) {
                                      return req.id === n.referenceId;
                                    }
                                    return req.senderId === n.senderId && req.status === "PENDING";
                                  }) ? (
                                    <>
                                      <button
                                        onClick={async (e) => {
                                          e.stopPropagation();
                                          await acceptFriendRequest(n.senderId!);
                                          markAsRead(n.id);
                                        }}
                                        className="px-3 py-1.5 bg-primary text-primary-foreground font-black text-[10px] rounded-lg hover:brightness-110 active:scale-95 transition-all cursor-pointer"
                                      >
                                        {t("notification.accept") || "Chấp nhận"}
                                      </button>
                                      <button
                                        onClick={async (e) => {
                                          e.stopPropagation();
                                          await declineFriendRequest(n.senderId!);
                                          markAsRead(n.id);
                                        }}
                                        className="px-3 py-1.5 bg-secondary text-foreground font-black text-[10px] rounded-lg hover:bg-secondary-foreground/10 active:scale-95 transition-all cursor-pointer"
                                      >
                                        {t("notification.decline") || "Từ chối"}
                                      </button>
                                    </>
                                  ) : (
                                    <span className="text-[10px] font-bold italic py-1 text-muted-foreground">
                                      {friends.some((f) => f.id === n.senderId)
                                        ? t("notification.accepted") || "Đã đồng ý"
                                        : t("notification.declined") || "Đã từ chối"}
                                    </span>
                                  )}
                                </div>
                              )}

                              <span className="text-[9px] text-muted block mt-1.5">
                                {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(n.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            {!n.isRead && (
                              <span className="w-2 h-2 rounded-full bg-primary shrink-0 mt-2"></span>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>
            
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

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SocketProvider>
      <LayoutContent>{children}</LayoutContent>
    </SocketProvider>
  );
}


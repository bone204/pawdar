"use client";

import React, { useMemo, useState, useRef } from "react";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/presentation/providers/LanguageProvider";
import { useFriends } from "@/application/hooks/useUsers";
import { useCreateConversationMutation } from "@/infrastructure/rtk/api/chat.api";
import { openChat } from "@/infrastructure/rtk/slices/chat.slice";
import { APP_ROUTES } from "@/shared/constants/routes";
import { FriendDto } from "@/application/dto/user.dto";
import { motion, AnimatePresence } from "framer-motion";
import { TextField } from "@/presentation/components/ui/TextField";

function formatOfflineTime(lastActiveAt: string | null | undefined, t: any, locale: string): string {
  if (!lastActiveAt) return "";
  
  const now = new Date();
  const activeDate = new Date(lastActiveAt);
  const diffMs = now.getTime() - activeDate.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return t("common.justNow") || "vừa xong";
  if (diffMins < 60) return `${diffMins}m`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays < 7) return `${diffDays}d`;
  
  return activeDate.toLocaleDateString(locale === "vi" ? "vi-VN" : "en-US", {
    month: "short",
    day: "numeric",
  });
}

export function RightSidebar() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { t, locale } = useTranslation();
  const { data, isLoading } = useFriends({ limit: 100 });
  const [createConversation] = useCreateConversationMutation();

  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchActive, setIsSearchActive] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const handleFriendClick = async (friendId: string) => {
    try {
      const conv = await createConversation(friendId).unwrap();
      dispatch(openChat(conv.id));
    } catch (error) {
      console.error("Failed to create/get conversation", error);
      alert("Error: " + ((error as any)?.data?.message || (error as any)?.message || JSON.stringify(error)));
    }
  };

  // Lọc và sắp xếp bạn bè
  const sortedFriends = useMemo(() => {
    if (!data?.items) return [];
    
    return [...data.items].sort((a, b) => {
      // 1. Online lên đầu
      if (a.isOnline && !b.isOnline) return -1;
      if (!a.isOnline && b.isOnline) return 1;
      
      // 2. Nếu cả 2 đều offline, sắp xếp theo thời gian hoạt động gần nhất
      if (!a.isOnline && !b.isOnline) {
        const timeA = a.lastActiveAt ? new Date(a.lastActiveAt).getTime() : 0;
        const timeB = b.lastActiveAt ? new Date(b.lastActiveAt).getTime() : 0;
        return timeB - timeA;
      }
      
      // 3. Alphabetical fallback
      return a.fullName.localeCompare(b.fullName);
    });
  }, [data?.items]);

  const filteredFriends = useMemo(() => {
    if (!sortedFriends) return [];
    if (!searchQuery.trim()) return sortedFriends;
    return sortedFriends.filter((f) =>
      f.fullName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [sortedFriends, searchQuery]);

  return (
    <aside className="flex flex-col w-full h-full bg-background shrink-0">
      <div className="flex flex-col h-full overflow-hidden relative">
        
        {/* Header */}
        <div className="p-4 border-b border-border/50 shrink-0 flex items-center justify-between h-[60px] relative overflow-hidden">
          {/* Title Text (fades and moves left) */}
          <div className={`transition-all duration-300 flex items-center ${isSearchActive ? "opacity-0 -translate-x-10 pointer-events-none" : "opacity-100 translate-x-0"}`}>
            <h3 className="font-extrabold text-sm text-muted-foreground uppercase tracking-wider">
              {t("sidebar.contacts") || "Người liên hệ"}
            </h3>
          </div>

          {/* Expanding Search input bar (fades and moves in from right) */}
          <div 
            className={`absolute left-4 right-4 flex items-center transition-all duration-300 ${
              isSearchActive 
                ? "opacity-100 translate-x-0 pointer-events-auto" 
                : "opacity-0 translate-x-10 pointer-events-none"
            }`}
          >
            <TextField
              ref={searchInputRef}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("common.searchUsersPlaceholder") || "Tìm kiếm liên hệ..."}
              className="w-full text-xs"
              leftIcon={
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-muted"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
              }
              rightIcon={
                <button
                  type="button"
                  onClick={() => {
                    setIsSearchActive(false);
                    setSearchQuery("");
                  }}
                  className="text-muted hover:text-foreground cursor-pointer flex items-center justify-center w-5 h-5 rounded-full hover:bg-border/50"
                >
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              }
            />
          </div>

          {/* Search Trigger Button */}
          {!isSearchActive && (
            <button 
              onClick={() => {
                setIsSearchActive(true);
                setTimeout(() => searchInputRef.current?.focus(), 150);
              }}
              className="w-8 h-8 rounded-full hover:bg-secondary/60 flex items-center justify-center text-muted-foreground transition-colors cursor-pointer shrink-0"
              aria-label="Search contacts"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
              </svg>
            </button>
          )}
        </div>

        {/* Friends List */}
        <div className="flex-1 overflow-y-auto p-2 scrollbar-thin">
          {isLoading ? (
            <div className="space-y-2 p-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-3 w-full p-2 animate-pulse">
                  <div className="w-9 h-9 rounded-full bg-secondary shrink-0" />
                  <div className="h-3.5 bg-secondary rounded-md w-3/4" />
                </div>
              ))}
            </div>
          ) : filteredFriends.length === 0 ? (
            <div className="p-6 text-center text-xs text-muted font-medium">
              {t("sidebar.noFriendsYet") || "Bạn chưa có người liên hệ nào."}
            </div>
          ) : (
            <div className="flex flex-col gap-0.5">
              <AnimatePresence initial={false}>
                {filteredFriends.map((friend: FriendDto) => {
                  const fInitials = friend.fullName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase();
                  const fAvatar = friend.avatarUrl && friend.avatarUrl.startsWith("http") ? friend.avatarUrl : null;
                  
                  return (
                    <motion.div
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      key={friend.id}
                    >
                      <button
                        onClick={() => handleFriendClick(friend.id)}
                        className="flex items-center gap-3 w-full p-2.5 rounded-xl hover:bg-secondary/40 transition-colors cursor-pointer group text-left"
                      >
                        <div className="relative">
                          {/* Avatar */}
                          <div className="w-9 h-9 rounded-full overflow-hidden flex items-center justify-center font-bold text-xs shrink-0 bg-primary/10 text-primary border border-primary/20">
                            {fAvatar ? (
                              <img src={fAvatar} alt={friend.fullName} className="w-full h-full object-cover" />
                            ) : (
                              <span>{fInitials}</span>
                            )}
                          </div>
                          
                          {/* Online Status Indicator */}
                          {friend.isOnline && (
                            <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-success rounded-full border-2 border-background z-10" title={t("posts.online")} />
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0 flex items-center justify-between">
                          <p className="text-sm font-bold truncate text-foreground group-hover:text-primary transition-colors">
                            {friend.fullName}
                          </p>
                          
                          {/* Last Active Time for Offline Users */}
                          {!friend.isOnline && friend.lastActiveAt && (
                            <span className="text-[10px] font-bold text-muted ml-2 shrink-0">
                              {formatOfflineTime(friend.lastActiveAt, t, locale)}
                            </span>
                          )}
                        </div>
                      </button>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </div>


        
      </div>
    </aside>
  );
}

"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "@/presentation/providers/LanguageProvider";
import { selectCurrentUser } from "@/infrastructure/rtk/auth.slice";
import { useGetConversationsQuery, useGetMessagesQuery, useSendMessageMutation, useMarkAsReadMutation } from "@/infrastructure/rtk/api/chat.api";
import { useGetUserProfileQuery } from "@/infrastructure/rtk/api/user.api";
import { formatDistanceToNow, format } from "date-fns";
import { vi } from "date-fns/locale";
import { useChatFocus } from "@/application/hooks/useChatFocus";
import { useSocket } from "@/presentation/providers/SocketProvider";
import { closeChat } from "@/infrastructure/rtk/slices/chat.slice";

export function ChatWidget({ conversationId }: { conversationId: string }) {
  const router = useRouter();
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const currentUser = useSelector(selectCurrentUser);
  const { socket } = useSocket();

  const [messageText, setMessageText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const widgetRef = useRef<HTMLDivElement>(null);
  
  // Track if this specific widget is active/focused
  const [isWidgetActive, setIsWidgetActive] = useState(false);

  // Queries & Mutations
  const { data: conversations } = useGetConversationsQuery();
  const { data: messagesData, isLoading: isLoadingMessages } = useGetMessagesQuery({ conversationId, params: { limit: 50 } });
  const [sendMessage, { isLoading: isSending }] = useSendMessageMutation();
  const [markAsRead] = useMarkAsReadMutation();

  const conversation = conversations?.find(c => c.id === conversationId);
  const otherParticipant = conversation?.participants.find(p => p.userId !== currentUser?.id)?.user;
  const messages = messagesData?.data || [];

  const { data: userProfile } = useGetUserProfileQuery(otherParticipant?.id || "", { skip: !otherParticipant?.id });

  const [hasUnread, setHasUnread] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const isInitialMount = useRef(true);
  const prevMessagesLength = useRef(messages.length);

  // Track clicks inside/outside to determine widget focus
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (widgetRef.current?.contains(e.target as Node)) {
        setIsWidgetActive(true);
      } else {
        setIsWidgetActive(false);
      }
    };
    
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Scroll to bottom when new messages arrive or when un-minimized
  useEffect(() => {
    if (!isMinimized) {
      // Small timeout to allow the display:none to disappear before scrolling
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 50);
    }
  }, [messages.length, isMinimized]);

  // Handle unread status logic
  useEffect(() => {
    if (messages.length === 0) return;
    const lastMsg = messages[messages.length - 1];

    if (isInitialMount.current) {
      isInitialMount.current = false;
      if (lastMsg.senderId !== currentUser?.id && (!isWidgetActive || isMinimized)) {
        setHasUnread(true);
      }
      prevMessagesLength.current = messages.length;
      return;
    }

    if (messages.length > prevMessagesLength.current) {
      if (lastMsg.senderId !== currentUser?.id && (!isWidgetActive || isMinimized)) {
        setHasUnread(true);
      }
    }
    
    prevMessagesLength.current = messages.length;
  }, [messages, isWidgetActive, isMinimized, currentUser]);

  useEffect(() => {
    if (isWidgetActive) {
      setHasUnread(false);
      // Mark as read when focused
      markAsRead(conversationId).catch(console.error);
    }
  }, [isWidgetActive, conversationId, markAsRead]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!messageText.trim() || !currentUser || isSending) return;

    try {
      await sendMessage({
        conversationId,
        content: messageText.trim(),
        type: "TEXT"
      }).unwrap();

      setMessageText("");
    } catch (error) {
      console.error("Failed to send message", error);
    }
  };

  const fInitials = otherParticipant?.fullName
    ? otherParticipant.fullName.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()
    : "??";
  const fAvatar = otherParticipant?.avatarUrl && otherParticipant.avatarUrl.startsWith("http") ? otherParticipant.avatarUrl : null;

  const getStatusText = () => {
    if (userProfile?.isOnline) return t("common.active") || "Đang hoạt động";
    if (userProfile?.lastActiveAt) {
      try {
        return `${t("common.active") || "Hoạt động"} ${formatDistanceToNow(new Date(userProfile.lastActiveAt), { addSuffix: true, locale: vi })}`;
      } catch (e) {
        return "";
      }
    }
    return "";
  };

  return (
    <div 
      ref={widgetRef}
      className={`flex flex-col w-[360px] bg-card shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-border/50 rounded-t-xl overflow-hidden pointer-events-auto transition-all ${
        isMinimized ? "h-auto" : "h-[480px]"
      }`}
    >
      {/* Header */}
      <div 
        className={`p-2.5 border-b border-border flex items-center justify-between shrink-0 transition-colors cursor-pointer ${
          hasUnread ? "bg-primary text-primary-foreground" : "bg-secondary/30"
        }`}
        onClick={() => {
          setHasUnread(false);
          setIsMinimized(!isMinimized);
        }}
      >
        <div 
          className={`flex items-center gap-2 cursor-pointer max-w-[70%] px-2.5 py-1 -ml-2 rounded-lg transition-all duration-200 ${
            hasUnread ? "hover:bg-white/20" : "hover:bg-primary/15 dark:hover:bg-primary/20"
          }`}
          onClick={(e) => {
            e.stopPropagation();
            if (isMinimized) {
              setHasUnread(false);
              setIsMinimized(false);
            } else {
              router.push(`/dashboard/profile/${otherParticipant?.id}`);
            }
          }}
        >
          <div className="relative">
            <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center font-bold text-xs shrink-0 bg-primary/10 text-primary border border-primary/20">
              {fAvatar ? (
                <img src={fAvatar} alt={otherParticipant?.fullName || ""} className="w-full h-full object-cover" />
              ) : (
                <span>{fInitials}</span>
              )}
            </div>
            {userProfile?.isOnline && (
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-background rounded-full"></span>
            )}
          </div>
          <div className="flex flex-col min-w-0">
            <span className={`font-bold text-sm leading-tight truncate ${hasUnread ? "text-primary-foreground" : "text-foreground"}`}>
              {otherParticipant?.fullName || "Loading..."}
            </span>
            <span className={`text-[11px] truncate ${hasUnread ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
              {getStatusText()}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setHasUnread(false);
              setIsMinimized(!isMinimized);
            }}
            className={`w-7 h-7 rounded-full flex items-center justify-center cursor-pointer transition-all duration-200 ${
              hasUnread 
                ? "text-primary-foreground hover:bg-white/20" 
                : "text-muted-foreground hover:bg-primary/15 hover:text-primary dark:hover:bg-primary/20"
            }`}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>
          </button>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              dispatch(closeChat(conversationId));
            }}
            className={`w-7 h-7 rounded-full flex items-center justify-center cursor-pointer transition-all duration-200 ${
              hasUnread 
                ? "text-primary-foreground hover:bg-white/20" 
                : "text-muted-foreground hover:bg-primary/15 hover:text-primary dark:hover:bg-primary/20"
            }`}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className={`flex-1 overflow-y-auto p-3 scrollbar-thin bg-background/50 flex-col ${isMinimized ? "hidden" : "flex"}`}>
        {isLoadingMessages ? (
          <div className="flex flex-col gap-3">
            <div className="flex items-end gap-2 w-full">
              <div className="w-6 h-6 rounded-full bg-border/40 animate-pulse shrink-0"></div>
              <div className="h-10 w-[60%] bg-border/40 animate-pulse rounded-2xl rounded-bl-[4px]"></div>
            </div>
            <div className="flex justify-end w-full">
              <div className="h-14 w-[50%] bg-primary/20 animate-pulse rounded-2xl rounded-br-[4px]"></div>
            </div>
            <div className="flex items-end gap-2 w-full mt-2">
              <div className="w-6 h-6 rounded-full bg-border/40 animate-pulse shrink-0"></div>
              <div className="h-8 w-[40%] bg-border/40 animate-pulse rounded-2xl rounded-bl-[4px]"></div>
            </div>
          </div>
        ) : (
          messages.slice().map((msg, idx, arr) => {
            const isMine = msg.senderId === currentUser?.id;
            const prevMsg = idx > 0 ? arr[idx - 1] : null;
            const nextMsg = idx < arr.length - 1 ? arr[idx + 1] : null;

            const showTimeDivider = !prevMsg || (new Date(msg.createdAt).getTime() - new Date(prevMsg.createdAt).getTime() > 3600000);

            const isConsecutiveWithPrev = prevMsg && prevMsg.senderId === msg.senderId && !showTimeDivider;
            const isConsecutiveWithNext = nextMsg && nextMsg.senderId === msg.senderId && !(new Date(nextMsg.createdAt).getTime() - new Date(msg.createdAt).getTime() > 3600000);

            const showAvatar = !isMine && !isConsecutiveWithNext;
            
            const marginTopClass = idx === 0 ? "mt-0" : (isConsecutiveWithPrev ? "mt-0.5" : "mt-3");

            // Compute lastReadMessageId: last message I sent that the other person has read
            const myReadMessages = arr.filter(m => m.senderId === currentUser?.id && m.isRead);
            const lastReadMessageId = myReadMessages.length > 0 ? myReadMessages[myReadMessages.length - 1].id : null;
            const showReadReceipt = isMine && msg.id === lastReadMessageId;

            let borderRadiusClass = "rounded-2xl";
            if (isMine) {
              if (isConsecutiveWithPrev && isConsecutiveWithNext) {
                borderRadiusClass = "rounded-2xl rounded-r-[4px]"; // Middle
              } else if (isConsecutiveWithPrev && !isConsecutiveWithNext) {
                borderRadiusClass = "rounded-2xl rounded-tr-[4px]"; // Last
              } else if (!isConsecutiveWithPrev && isConsecutiveWithNext) {
                borderRadiusClass = "rounded-2xl rounded-br-[4px]"; // First
              } else {
                borderRadiusClass = "rounded-2xl"; // Single
              }
            } else {
              if (isConsecutiveWithPrev && isConsecutiveWithNext) {
                borderRadiusClass = "rounded-2xl rounded-l-[4px]"; // Middle
              } else if (isConsecutiveWithPrev && !isConsecutiveWithNext) {
                borderRadiusClass = "rounded-2xl rounded-tl-[4px]"; // Last
              } else if (!isConsecutiveWithPrev && isConsecutiveWithNext) {
                borderRadiusClass = "rounded-2xl rounded-bl-[4px]"; // First
              } else {
                borderRadiusClass = "rounded-2xl"; // Single
              }
            }
            
            return (
              <React.Fragment key={msg.id}>
                {showTimeDivider && (
                  <div className="flex justify-center w-full my-4">
                    <span className="text-[10px] text-muted-foreground/60 font-medium">
                      {format(new Date(msg.createdAt), "HH:mm, dd/MM/yyyy")}
                    </span>
                  </div>
                )}
                <div className={`flex flex-col w-full ${marginTopClass}`}>
                  <div 
                    className={`flex w-full gap-2 ${isMine ? "justify-end" : "justify-start"} items-center group`}
                  >
                    {isMine && (
                      <div className="transition-all duration-200 overflow-hidden whitespace-nowrap flex items-center max-w-0 opacity-0 group-hover:max-w-[50px] group-hover:opacity-100">
                        <span className="text-[10px] text-muted-foreground font-medium pr-1">{format(new Date(msg.createdAt), "HH:mm")}</span>
                      </div>
                    )}
                    
                    {!isMine && (
                      <div className="w-6 shrink-0 flex items-end self-end">
                        {showAvatar ? (
                          <div className="w-6 h-6 rounded-full overflow-hidden flex items-center justify-center bg-primary/10 text-primary text-[10px] font-bold border border-primary/20">
                            {fAvatar ? (
                              <img src={fAvatar} alt="avatar" className="w-full h-full object-cover" />
                            ) : (
                              <span>{fInitials}</span>
                            )}
                          </div>
                        ) : null}
                      </div>
                    )}
                    
                    <div className={`max-w-[80%] px-3 py-2 text-[13px] transition-all duration-300 ${borderRadiusClass} ${
                      isMine 
                        ? "bg-primary text-primary-foreground shadow-sm" 
                        : "bg-secondary text-foreground border border-border/50"
                    }`}>
                      <p className="whitespace-pre-wrap break-words leading-relaxed">{msg.content}</p>
                    </div>

                    {!isMine && (
                      <div className="transition-all duration-200 overflow-hidden whitespace-nowrap flex items-center max-w-0 opacity-0 group-hover:max-w-[50px] group-hover:opacity-100">
                        <span className="text-[10px] text-muted-foreground font-medium pl-1">{format(new Date(msg.createdAt), "HH:mm")}</span>
                      </div>
                    )}
                  </div>

                  {/* Read receipt avatar: always visible on last read message */}
                  {isMine && showReadReceipt && (
                    <div className="flex justify-end pr-1 mt-0.5 mb-0.5">
                      <div className="w-4 h-4 rounded-full overflow-hidden border border-background ring-1 ring-primary/20 flex items-center justify-center bg-primary/10 text-primary text-[8px] font-bold shrink-0">
                        {fAvatar ? (
                          <img src={fAvatar} alt="seen" className="w-full h-full object-cover" />
                        ) : (
                          <span>{fInitials}</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </React.Fragment>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className={`p-2 border-t border-border shrink-0 bg-card ${isMinimized ? "hidden" : "block"}`}>
        <form onSubmit={handleSend} className="flex items-center gap-1.5 relative">
          <input
            type="text"
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            placeholder={t("chat.typeMessage") || "Nhập tin nhắn..."}
            className="flex-1 bg-secondary/50 text-foreground text-sm rounded-full px-3.5 py-2 border border-border focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all pr-9"
          />
          <button
            type="submit"
            disabled={!messageText.trim() || isSending}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all absolute right-1 ${
              messageText.trim() && !isSending
                ? "text-primary hover:scale-105 active:scale-95 cursor-pointer"
                : "text-muted cursor-not-allowed"
            }`}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" x2="11" y1="2" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
          </button>
        </form>
      </div>
    </div>
  );
}

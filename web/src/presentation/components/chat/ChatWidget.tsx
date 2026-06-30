"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "@/presentation/providers/LanguageProvider";
import { selectCurrentUser } from "@/infrastructure/rtk/auth.slice";
import { useGetConversationsQuery, useGetMessagesQuery, useSendMessageMutation, useMarkAsReadMutation, useEditMessageMutation, useRevokeMessageMutation } from "@/infrastructure/rtk/api/chat.api";
import { useGetUserProfileQuery } from "@/infrastructure/rtk/api/user.api";
import { formatDistanceToNow, format } from "date-fns";
import { vi } from "date-fns/locale";
import { useChatFocus } from "@/application/hooks/useChatFocus";
import { useSocket } from "@/presentation/providers/SocketProvider";
import { closeChat } from "@/infrastructure/rtk/slices/chat.slice";
import { useUploadImageMutation } from "@/infrastructure/rtk/api/upload.api";

export function ChatWidget({ conversationId }: { conversationId: string }) {
  const router = useRouter();
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const currentUser = useSelector(selectCurrentUser);
  const { socket } = useSocket();

  const [messageText, setMessageText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const widgetRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  
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
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const isInitialMount = useRef(true);
  const prevMessagesLength = useRef(messages.length);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [uploadImage, { isLoading: isUploading }] = useUploadImageMutation();
  const [editMessage] = useEditMessageMutation();
  const [revokeMessage] = useRevokeMessageMutation();

  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const editingMessage = messages.find(m => m.id === editingMessageId);

  // Auto-resize textarea and control scrollbar visibility
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${Math.min(scrollHeight, 120)}px`;
      if (scrollHeight > 120) {
        textareaRef.current.style.overflowY = "auto";
      } else {
        textareaRef.current.style.overflowY = "hidden";
      }
    }
  }, [messageText]);

  // Clean up object URL
  useEffect(() => {
    return () => {
      if (imagePreviewUrl) {
        URL.revokeObjectURL(imagePreviewUrl);
      }
    };
  }, [imagePreviewUrl]);

  // Track clicks inside/outside to determine widget focus and close message options
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (headerRef.current?.contains(target)) {
        // Clicking header does not count as focus
        return;
      }

      if (widgetRef.current?.contains(target)) {
        setIsWidgetActive(true);
      } else {
        setIsWidgetActive(false);
      }

      // Close message options menu when clicking outside it
      if (!(e.target as HTMLElement).closest(".group\\/menu")) {
        setActiveMenuId(null);
      }
    };
    
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const focusInput = () => {
    textareaRef.current?.focus();
  };



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
      if (lastMsg.senderId !== currentUser?.id) {
        setIsMinimized(false);
        if (!isWidgetActive) {
          setHasUnread(true);
        }
      }
    }
    
    prevMessagesLength.current = messages.length;
  }, [messages, isWidgetActive, currentUser]);

  // Mark messages as read when the user actually focuses/clicks inside the widget
  useEffect(() => {
    if (isWidgetActive) {
      setHasUnread(false);
      markAsRead(conversationId).catch(console.error);
    }
  }, [isWidgetActive, conversationId, markAsRead]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!messageText.trim() && !selectedImage) return;
    if (!currentUser || isSending || isUploading) return;

    try {
      if (editingMessageId) {
        await editMessage({
          messageId: editingMessageId,
          body: { content: messageText.trim() }
        }).unwrap();
        
        setEditingMessageId(null);
        setMessageText("");
        setTimeout(focusInput, 50);
        return;
      }

      // 1. If there's an image, upload and send it first
      if (selectedImage) {
        const formData = new FormData();
        formData.append("file", selectedImage);
        const uploadRes = await uploadImage(formData).unwrap();
        
        await sendMessage({
          conversationId,
          content: uploadRes.url,
          type: "IMAGE"
        }).unwrap();
        
        handleRemoveImage();
      }

      // 2. If there's text, send the text message
      if (messageText.trim()) {
        await sendMessage({
          conversationId,
          content: messageText.trim(),
          type: "TEXT"
        }).unwrap();
        setMessageText("");
      }

      setTimeout(focusInput, 50);
    } catch (error) {
      console.error("Failed to send message", error);
    }
  };

  const handleImageUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    if (!file.type.startsWith("image/")) return;

    setSelectedImage(file);
    const url = URL.createObjectURL(file);
    setImagePreviewUrl(url);
    setTimeout(focusInput, 50);
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    if (imagePreviewUrl) {
      URL.revokeObjectURL(imagePreviewUrl);
      setImagePreviewUrl(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setTimeout(focusInput, 50);
  };

  const handleRevoke = async (messageId: string) => {
    try {
      await revokeMessage(messageId).unwrap();
    } catch (error) {
      console.error("Failed to revoke message", error);
    }
  };

  const handleEmojiClick = (emoji: string) => {
    const textarea = textareaRef.current;
    if (!textarea) {
      setMessageText(prev => prev + emoji);
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const before = text.substring(0, start);
    const after = text.substring(end, text.length);

    setMessageText(before + emoji + after);
    setShowEmojiPicker(false);

    // Set cursor position right after the inserted emoji
    const newCursorPos = start + emoji.length;
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 50);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const commonEmojis = ["👍", "❤️", "😊", "😂", "😮", "😢", "🐾", "🐶", "🐱", "🎉", "🔥", "✨"];

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
        ref={headerRef}
        className={`p-2.5 border-b border-border flex items-center justify-between shrink-0 transition-colors cursor-pointer rounded-t-[10px] ${
          hasUnread ? "bg-primary text-primary-foreground" : "bg-secondary/30"
        }`}
        onClick={() => {
          const nextMinimized = !isMinimized;
          setIsMinimized(nextMinimized);
        }}
      >
        <div 
          className={`flex items-center gap-2 cursor-pointer max-w-[70%] px-2.5 py-1 -ml-2 rounded-lg transition-all duration-200 ${
            hasUnread ? "hover:bg-white/20" : "hover:bg-primary/15 dark:hover:bg-primary/20"
          }`}
          onClick={(e) => {
            e.stopPropagation();
            if (isMinimized) {
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
                    
                    {isMine && !msg.isDeleted && (
                      <div className="relative group/menu flex items-center shrink-0">
                        <button
                          type="button"
                          className="opacity-0 group-hover:opacity-100 transition-all w-5 h-5 rounded-full hover:bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground cursor-pointer focus:outline-none shrink-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveMenuId(activeMenuId === msg.id ? null : msg.id);
                          }}
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>
                        </button>
                        
                        {activeMenuId === msg.id && (
                          <div className="absolute bottom-6 right-0 bg-card border border-border shadow-lg rounded-xl py-1 w-20 z-50 text-[11px] animate-in fade-in slide-in-from-bottom-1 duration-150">
                            {msg.type !== "IMAGE" && (
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingMessageId(msg.id);
                                  setMessageText(msg.content);
                                  setActiveMenuId(null);
                                }}
                                className="w-full text-left px-2.5 py-1 hover:bg-secondary transition-colors font-medium flex items-center gap-1.5 cursor-pointer"
                              >
                                Sửa
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => {
                                handleRevoke(msg.id);
                                setActiveMenuId(null);
                              }}
                              className="w-full text-left px-2.5 py-1 hover:bg-secondary text-destructive transition-colors font-medium flex items-center gap-1.5 cursor-pointer"
                            >
                              Thu hồi
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    <div className={`max-w-[80%] transition-all duration-300 ${borderRadiusClass} ${
                      msg.isDeleted
                        ? "bg-secondary/40 text-muted-foreground/80 italic border border-border/50 px-4 py-2.5 text-sm"
                        : msg.type === "IMAGE"
                          ? ""
                          : isMine
                            ? "bg-primary text-primary-foreground shadow-sm px-4 py-2.5 text-sm"
                            : "bg-secondary text-foreground border border-border/50 px-4 py-2.5 text-sm"
                    }`}>
                      {msg.isDeleted ? (
                        <span>{t("chat.revokedMessage") || "Tin nhắn đã bị thu hồi"}</span>
                      ) : msg.type === "IMAGE" ? (
                        <div className="overflow-hidden rounded-2xl border border-border/50 max-w-[200px] bg-secondary/20 shadow-sm">
                          <img src={msg.content} alt="sent image" className="w-full h-auto object-cover max-h-[250px] hover:opacity-90 transition-opacity" />
                        </div>
                      ) : (
                        <p className="whitespace-pre-wrap break-words leading-relaxed">
                          {msg.content}
                        </p>
                      )}
                    </div>

                    {!isMine && (
                      <div className="transition-all duration-200 overflow-hidden whitespace-nowrap flex items-center max-w-0 opacity-0 group-hover:max-w-[50px] group-hover:opacity-100">
                        <span className="text-[10px] text-muted-foreground font-medium pl-1">{format(new Date(msg.createdAt), "HH:mm")}</span>
                      </div>
                    )}
                  </div>

                  {/* Status row for isMine: read receipt avatar and/or edit indicator */}
                  {isMine && (msg.isEdited || showReadReceipt) && (
                    <div className="flex justify-end items-center gap-1.5 pr-1 mt-0.5 mb-0.5">
                      {msg.isEdited && !msg.isDeleted && (
                        <span className="text-[9px] text-muted-foreground/50 select-none font-normal">
                          {t("chat.edited") || "(đã chỉnh sửa)"}
                        </span>
                      )}
                      {showReadReceipt && (
                        <div className="w-4 h-4 rounded-full overflow-hidden border border-background ring-1 ring-primary/20 flex items-center justify-center bg-primary/10 text-primary text-[8px] font-bold shrink-0">
                          {fAvatar ? (
                            <img src={fAvatar} alt="seen" className="w-full h-full object-cover" />
                          ) : (
                            <span>{fInitials}</span>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Status row for !isMine: edit indicator */}
                  {!isMine && msg.isEdited && !msg.isDeleted && (
                    <div className="flex justify-start pl-10 mt-0.5 mb-0.5">
                      <span className="text-[9px] text-muted-foreground/50 select-none font-normal">
                        {t("chat.edited") || "(đã chỉnh sửa)"}
                      </span>
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
      <div className={`p-2 border-t border-border shrink-0 bg-card ${isMinimized ? "hidden" : "block"} relative`}>
        {editingMessageId && (
          <div className="mb-2 px-2.5 py-1.5 bg-secondary/50 rounded-xl flex flex-col gap-1 border border-border/50 text-xs text-muted-foreground animate-in fade-in duration-150">
            <div className="flex items-center justify-between w-full">
              <span className="font-semibold text-foreground/80">{t("chat.editingMessage") || "Đang chỉnh sửa tin nhắn"}</span>
              <button
                type="button"
                onClick={() => {
                  setEditingMessageId(null);
                  setMessageText("");
                  setTimeout(focusInput, 50);
                }}
                className="w-5 h-5 rounded-full bg-border/40 hover:bg-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            {editingMessage && (
              <p className="text-[11px] italic truncate max-w-[280px] text-muted-foreground/80">
                "{editingMessage.content}"
              </p>
            )}
          </div>
        )}
        {imagePreviewUrl && (
          <div className="mb-2 p-1 bg-secondary/30 rounded-lg flex items-center justify-between border border-border/50 animate-in fade-in slide-in-from-bottom-1 duration-150">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded overflow-hidden border border-border bg-card">
                <img src={imagePreviewUrl} alt="preview" className="w-full h-full object-cover" />
              </div>
              <span className="text-xs text-muted-foreground truncate max-w-[180px]">{selectedImage?.name}</span>
            </div>
            <button
              type="button"
              onClick={handleRemoveImage}
              className="w-5 h-5 rounded-full bg-border/40 hover:bg-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
        )}
        {showEmojiPicker && (
          <div className="absolute bottom-14 right-2 bg-card border border-border rounded-xl shadow-xl p-2.5 flex gap-2 z-50 animate-in fade-in slide-in-from-bottom-2 duration-200">
            {commonEmojis.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => handleEmojiClick(emoji)}
                className="hover:scale-125 transition-transform p-1 text-base cursor-pointer"
              >
                {emoji}
              </button>
            ))}
          </div>
        )}
        <form onSubmit={handleSend} className="flex items-end relative w-full gap-1.5">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />
          <div className="relative flex-1">
            <textarea
              ref={textareaRef}
              rows={1}
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsWidgetActive(true)}
              placeholder={t("chat.typeMessage") || "Nhập tin nhắn..."}
              className="w-full bg-secondary/50 text-foreground text-sm rounded-2xl pl-3.5 pr-[84px] py-2 border border-border focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all resize-none max-h-[120px] min-h-[36px] block leading-normal"
            />
            <div className="absolute right-1 bottom-1 flex items-center gap-0.5">
              <button
                type="button"
                onClick={handleImageUploadClick}
                disabled={isSending || isUploading}
                className="w-7 h-7 rounded-full flex items-center justify-center text-muted-foreground hover:bg-secondary hover:text-primary transition-colors cursor-pointer shrink-0"
              >
                {isUploading ? (
                  <span className="w-3.5 h-3.5 border-2 border-primary border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
                )}
              </button>
              <button
                type="button"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                disabled={isSending}
                className="w-7 h-7 rounded-full flex items-center justify-center text-muted-foreground hover:bg-secondary hover:text-primary transition-colors cursor-pointer shrink-0"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" x2="9.01" y1="9" y2="9"/><line x1="15" x2="15.01" y1="9" y2="9"/></svg>
              </button>
              <button
                type="submit"
                disabled={(!messageText.trim() && !selectedImage) || isSending || isUploading}
                className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                  (messageText.trim() || selectedImage) && !isSending && !isUploading
                    ? "text-primary hover:scale-105 active:scale-95 cursor-pointer"
                    : "text-muted cursor-not-allowed"
                }`}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" x2="11" y1="2" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

"use client";
import React, { useState, useEffect, useRef } from "react";
import type { PostResponseDto } from "@/infrastructure/rtk/api/post.api";
import { motion, AnimatePresence } from "framer-motion";
import { EditIcon, TrashIcon } from "@/presentation/components/ui/Icons";
import { useTranslation } from "@/presentation/providers/LanguageProvider";

interface PostCardProps {
  post: PostResponseDto;
  currentUserId?: string;
  onEdit: (post: PostResponseDto) => void;
  onDelete: (postId: string) => void;
}

export const PostCard: React.FC<PostCardProps> = ({
  post,
  currentUserId,
  onEdit,
  onDelete,
}) => {
  const { t, locale } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(Math.floor(Math.random() * 15) + 3);
  const [commentsCount] = useState(Math.floor(Math.random() * 8) + 1);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };
    if (showMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showMenu]);

  const isAuthor = currentUserId === post.userId;
  const displayAvatar = post.user.avatarUrl || "";
  
  const initials = post.user.fullName
    ? post.user.fullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "US";

  const formatPostTime = (dateStr: string) => {
    try {
      const now = new Date();
      const postDate = new Date(dateStr);
      const diffMs = now.getTime() - postDate.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);

      if (diffMins < 1) return t("posts.justNow");
      if (diffMins < 60) return t("posts.minutesAgo").replace("{count}", String(diffMins));
      if (diffHours < 24) return t("posts.hoursAgo").replace("{count}", String(diffHours));

      return postDate.toLocaleDateString(locale === "vi" ? "vi-VN" : "en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  const handleLike = () => {
    if (liked) {
      setLiked(false);
      setLikesCount((c) => c - 1);
    } else {
      setLiked(true);
      setLikesCount((c) => c + 1);
    }
  };

  const hasLongContent = post.content.length > 200;
  const displayContent =
    hasLongContent && !isExpanded
      ? `${post.content.slice(0, 200)}...`
      : post.content;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.3 }}
      className="w-full bg-card border border-border/70 rounded-2xl overflow-visible shadow-xs hover:shadow-sm transition-all duration-300 flex flex-col"
    >
      {/* Header */}
      <div className="p-5 flex items-center justify-between relative">
        <div className="flex items-center gap-3">
          {displayAvatar ? (
            <img
              src={displayAvatar}
              alt={post.user.fullName}
              className="w-10 h-10 rounded-full object-cover border border-border"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm border border-primary/20">
              {initials}
            </div>
          )}
          <div>
            <h4 className="font-extrabold text-sm text-foreground hover:text-primary transition-colors cursor-pointer flex items-center gap-1.5">
              {post.user.fullName}
              <span className="w-1.5 h-1.5 rounded-full bg-success/80" title={t("posts.online")}></span>
            </h4>
            <span className="text-[10px] text-muted font-bold uppercase tracking-wider block mt-0.5">
              {formatPostTime(post.createdAt)}
            </span>
          </div>
        </div>

        {/* Post Actions (3-dot dropdown) */}
        {isAuthor && (
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="w-8 h-8 rounded-full text-muted hover:text-foreground hover:bg-secondary/40 active:scale-95 transition-all flex items-center justify-center cursor-pointer"
              title="Tùy chọn"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="1" />
                <circle cx="12" cy="5" r="1" />
                <circle cx="12" cy="19" r="1" />
              </svg>
            </button>

            <AnimatePresence>
              {showMenu && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-48 bg-card border border-border shadow-lg rounded-2xl py-2 z-50 flex flex-col overflow-hidden"
                >
                  <button
                    onClick={() => {
                      onEdit(post);
                      setShowMenu(false);
                    }}
                    className="w-full px-4 py-2.5 text-left text-sm text-foreground hover:bg-secondary/40 flex items-center gap-2.5 transition-colors cursor-pointer"
                  >
                    <EditIcon size={14} />
                    <span>{t("posts.editOption")}</span>
                  </button>
                  <button
                    onClick={() => {
                      onDelete(post.id);
                      setShowMenu(false);
                    }}
                    className="w-full px-4 py-2.5 text-left text-sm text-danger hover:bg-danger/10 flex items-center gap-2.5 transition-colors cursor-pointer"
                  >
                    <TrashIcon size={14} />
                    <span>{t("posts.deleteOption")}</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Title & Body */}
      <div className="px-5 pb-4 flex flex-col gap-2.5">
        <h3 className="font-black text-lg text-foreground leading-snug">
          {post.title}
        </h3>
        <p className="text-sm text-foreground/80 whitespace-pre-wrap leading-relaxed font-normal">
          {displayContent}
          {hasLongContent && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-primary font-bold ml-1.5 hover:underline focus:outline-none text-xs"
            >
              {isExpanded ? t("posts.readLess") : t("posts.readMore")}
            </button>
          )}
        </p>
      </div>

      {/* Image Attachment */}
      {post.imageUrl && (
        <div className="w-full bg-secondary/10 overflow-hidden relative aspect-video max-h-[360px] border-y border-border/40">
          <img
            src={post.imageUrl}
            alt={post.title}
            className="w-full h-full object-cover hover:scale-101 transition-transform duration-500"
          />
        </div>
      )}

      {/* Likes & Comments Counters */}
      <div className="px-5 py-3 flex items-center justify-between text-xs text-muted font-bold border-t border-b border-border/30 bg-secondary/5">
        <div className="flex items-center gap-2">
          <span className="flex items-center justify-center w-5 h-5 rounded-full bg-rose-500 text-white shadow-xs">
            <svg xmlns="http://www.w3.org/2000/svg" width="9" height="9" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
          </span>
          <span className="text-foreground/75">{t("posts.likes").replace("{count}", String(likesCount))}</span>
        </div>
        <div className="text-foreground/75">
          <span>{t("posts.comments").replace("{count}", String(commentsCount))}</span>
        </div>
      </div>

      {/* Real Actions Footer */}
      <div className="px-3 py-2 flex items-center justify-between gap-2.5 text-xs font-bold text-muted border-t border-border/10">
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={handleLike}
          className={`flex-1 py-2.5 rounded-xl flex items-center justify-center gap-2 hover:bg-secondary/40 transition-colors cursor-pointer ${
            liked ? "text-primary bg-primary/5" : "hover:text-foreground"
          }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill={liked ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-4 h-4"
          >
            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
          </svg>
          {t("posts.like")}
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.96 }}
          className="flex-1 py-2.5 rounded-xl flex items-center justify-center gap-2 hover:text-foreground hover:bg-secondary/40 transition-colors cursor-pointer"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-4 h-4"
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          {t("posts.comment")}
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.96 }}
          className="flex-1 py-2.5 rounded-xl flex items-center justify-center gap-2 hover:text-foreground hover:bg-secondary/40 transition-colors cursor-pointer"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-4 h-4"
          >
            <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
            <polyline points="16 6 12 2 8 6" />
            <line x1="12" x2="12" y1="2" y2="15" />
          </svg>
          {t("posts.share")}
        </motion.button>
      </div>
    </motion.div>
  );
};

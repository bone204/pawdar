"use client";
import React, { useState, useEffect, useRef } from "react";
import { 
  type PostResponseDto, 
  useReactToPostMutation,
} from "@/infrastructure/rtk/api/post.api";
import { motion, AnimatePresence } from "framer-motion";
import { EditIcon, TrashIcon } from "@/presentation/components/ui/Icons";
import { useTranslation } from "@/presentation/providers/LanguageProvider";
import { ReactionsModal, REACTION_MAP } from "./ReactionsModal";
import { CommentsModal } from "./CommentsModal";
import { useSelector } from "react-redux";

interface PostCardProps {
  post: PostResponseDto;
  currentUserId?: string;
  onEdit: (post: PostResponseDto) => void;
  onDelete: (postId: string) => void;
}

const REACTION_OPTIONS = [
  { type: "LIKE", emoji: "👍", colorClass: "text-blue-500" },
  { type: "LOVE", emoji: "❤️", colorClass: "text-rose-500" },
  { type: "HAHA", emoji: "😆", colorClass: "text-amber-500" },
  { type: "WOW", emoji: "😮", colorClass: "text-amber-500" },
  { type: "SAD", emoji: "😢", colorClass: "text-sky-500" },
  { type: "ANGRY", emoji: "😡", colorClass: "text-red-500" },
];

interface ImageLightboxProps {
  isOpen: boolean;
  images: string[];
  initialIndex: number;
  onClose: () => void;
}

const ImageLightbox: React.FC<ImageLightboxProps> = ({
  isOpen,
  images,
  initialIndex,
  onClose,
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex, isOpen]);

  // Handle arrow key navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === "ArrowRight") {
        handleNext();
      } else if (e.key === "ArrowLeft") {
        handlePrev();
      } else if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, currentIndex]);

  if (!isOpen || images.length === 0) return null;

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md select-none">
        {/* Close Area */}
        <div className="absolute inset-0 cursor-zoom-out" onClick={onClose} />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 z-10 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 text-white flex items-center justify-center font-bold transition-all cursor-pointer text-lg"
          title="Đóng (Esc)"
        >
          ✕
        </button>

        {/* Previous Button */}
        {images.length > 1 && (
          <button
            onClick={handlePrev}
            className="absolute left-6 z-10 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 text-white flex items-center justify-center transition-all cursor-pointer text-lg"
            title="Ảnh trước"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
        )}

        {/* Image Container */}
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="relative max-w-5xl max-h-[80vh] px-4 flex items-center justify-center pointer-events-none"
        >
          <img
            src={images[currentIndex]}
            alt={`Image ${currentIndex + 1}`}
            className="max-w-full max-h-[80vh] object-contain rounded-2xl shadow-2xl pointer-events-auto"
          />
        </motion.div>

        {/* Next Button */}
        {images.length > 1 && (
          <button
            onClick={handleNext}
            className="absolute right-6 z-10 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 text-white flex items-center justify-center transition-all cursor-pointer text-lg"
            title="Ảnh sau"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
        )}

        {/* Counter Indicator */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-bold text-white/90">
          {currentIndex + 1} / {images.length}
        </div>
      </div>
    </AnimatePresence>
  );
};

export const PostCard: React.FC<PostCardProps> = ({
  post,
  currentUserId,
  onEdit,
  onDelete,
}) => {
  const { t, locale } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showReactionsPopover, setShowReactionsPopover] = useState(false);
  const [showReactionsModal, setShowReactionsModal] = useState(false);
  const [showComments, setShowComments] = useState(false);

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // Parse imageUrl into an array of URLs
  let imageUrls: string[] = [];
  if (post.imageUrl) {
    if (post.imageUrl.startsWith("[")) {
      try {
        imageUrls = JSON.parse(post.imageUrl);
      } catch {
        imageUrls = [post.imageUrl];
      }
    } else {
      imageUrls = post.imageUrl.split(",").filter(Boolean);
    }
  }

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  // Lấy user hiện tại từ auth state trong Redux
  const { user: currentUser } = useSelector((state: any) => state.auth);

  // Local state for instant reactions/comments updates (Optimistic UI)
  const [myReaction, setMyReaction] = useState<string | null>(post.myReaction || null);
  const [reactionsCount, setReactionsCount] = useState<number>(post.reactionsCount || 0);
  const [reactionStats, setReactionStats] = useState<Record<string, number>>(post.reactionStats || {});
  const [commentsCount, setCommentsCount] = useState<number>(post.commentsCount || 0);

  const menuRef = useRef<HTMLDivElement>(null);

  // RTK Mutations
  const [reactToPost] = useReactToPostMutation();

  useEffect(() => {
    setMyReaction(post.myReaction || null);
    setReactionsCount(post.reactionsCount || 0);
    setReactionStats(post.reactionStats || {});
    setCommentsCount(post.commentsCount || 0);
  }, [post]);

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

  const handleReact = async (type: string) => {
    setShowReactionsPopover(false);
    
    // Save old states for rollback
    const oldMyReaction = myReaction;
    const oldStats = { ...reactionStats };
    const oldCount = reactionsCount;

    // Optimistic UI updates
    if (myReaction === type) {
      // Toggle off
      setMyReaction(null);
      setReactionsCount((c) => Math.max(0, c - 1));
      setReactionStats((prev) => ({
        ...prev,
        [type]: Math.max(0, (prev[type] || 0) - 1),
      }));
    } else {
      // Change reaction or new reaction
      setMyReaction(type);
      // Only increase total count if this is a brand-new reaction (no previous reaction)
      if (!oldMyReaction) {
        setReactionsCount((c) => c + 1);
      }
      setReactionStats((prev) => {
        const next = { ...prev };
        if (oldMyReaction) {
          next[oldMyReaction] = Math.max(0, (next[oldMyReaction] || 0) - 1);
        }
        next[type] = (next[type] || 0) + 1;
        return next;
      });
    }

    try {
      await reactToPost({ id: post.id, type }).unwrap();
    } catch {
      // Rollback on failure
      setMyReaction(oldMyReaction);
      setReactionsCount(oldCount);
      setReactionStats(oldStats);
    }
  };

  const handleLikeClick = () => {
    if (myReaction) {
      // If already reacted, clicking the button removes it
      handleReact(myReaction);
    } else {
      // Default reaction is LIKE
      handleReact("LIKE");
    }
  };



  const showPopover = () => {
    setShowReactionsPopover(true);
  };

  const hidePopover = () => {
    setShowReactionsPopover(false);
  };

  const hasLongContent = post.content.length > 200;
  const displayContent =
    hasLongContent && !isExpanded
      ? `${post.content.slice(0, 200)}...`
      : post.content;

  // Find active reaction properties
  const activeReactionMeta = myReaction ? REACTION_MAP[myReaction] : null;

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
            <h4 className="font-extrabold text-sm text-foreground hover:text-primary transition-colors cursor-pointer flex items-center gap-1.5 flex-wrap">
              {post.user.fullName}
              <span className="w-1.5 h-1.5 rounded-full bg-success/80" title={t("posts.online")}></span>
              {post.status === "rejected" && (
                <span className="text-[10px] bg-red-500/10 text-red-500 px-2 py-0.5 rounded-md font-bold uppercase tracking-wider">
                  Bị từ chối 🚫
                </span>
              )}
              {post.status === "pending" && (
                <span className="text-[10px] bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded-md font-bold uppercase tracking-wider animate-pulse">
                  Đang kiểm duyệt ⏳
                </span>
              )}
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

        {post.status === "rejected" && post.moderationReason && (
          <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-4 mt-2">
            <h5 className="text-xs font-bold text-red-500 flex items-center gap-1.5">
              <span>⚠️</span> Lý do kiểm duyệt (AI Moderation):
            </h5>
            <p className="text-xs text-red-500/80 mt-1 leading-relaxed font-semibold">
              {post.moderationReason}
            </p>
          </div>
        )}
      </div>

      {/* Images Grid Layout */}
      {imageUrls.length > 0 && (
        <div className={`w-full overflow-hidden relative border-t border-border/40 ${
          post.status === "rejected" ? "rounded-b-2xl border-b-0" : "border-b border-border/40"
        }`}>
          {imageUrls.length === 1 && (
            <div 
              onClick={() => openLightbox(0)}
              className="w-full aspect-video max-h-[360px] cursor-zoom-in"
            >
              <img
                src={imageUrls[0]}
                alt={post.title}
                className="w-full h-full object-cover hover:brightness-95 transition-all duration-300"
              />
            </div>
          )}

          {imageUrls.length === 2 && (
            <div className="grid grid-cols-2 gap-1 aspect-video cursor-zoom-in">
              {imageUrls.map((url, idx) => (
                <div 
                  key={idx} 
                  onClick={() => openLightbox(idx)}
                  className="w-full h-full overflow-hidden"
                >
                  <img
                    src={url}
                    alt={`Attachment ${idx + 1}`}
                    className="w-full h-full object-cover hover:brightness-95 hover:scale-[1.01] transition-all duration-300"
                  />
                </div>
              ))}
            </div>
          )}

          {imageUrls.length === 3 && (
            <div className="grid grid-cols-3 gap-1 aspect-video cursor-zoom-in">
              <div 
                onClick={() => openLightbox(0)}
                className="col-span-2 h-full overflow-hidden"
              >
                <img
                  src={imageUrls[0]}
                  alt="Attachment 1"
                  className="w-full h-full object-cover hover:brightness-95 hover:scale-[1.01] transition-all duration-300"
                />
              </div>
              <div className="flex flex-col gap-1 h-full">
                {imageUrls.slice(1, 3).map((url, idx) => (
                  <div 
                    key={idx + 1} 
                    onClick={() => openLightbox(idx + 1)}
                    className="w-full h-[calc(50%-2px)] overflow-hidden"
                  >
                    <img
                      src={url}
                      alt={`Attachment ${idx + 2}`}
                      className="w-full h-full object-cover hover:brightness-95 hover:scale-[1.01] transition-all duration-300"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {imageUrls.length >= 4 && (
            <div className="grid grid-cols-2 gap-1 aspect-video cursor-zoom-in">
              {imageUrls.slice(0, 3).map((url, idx) => (
                <div 
                  key={idx} 
                  onClick={() => openLightbox(idx)}
                  className="w-full h-full overflow-hidden"
                >
                  <img
                    src={url}
                    alt={`Attachment ${idx + 1}`}
                    className="w-full h-full object-cover hover:brightness-95 hover:scale-[1.01] transition-all duration-300"
                  />
                </div>
              ))}
              <div 
                onClick={() => openLightbox(3)}
                className="w-full h-full overflow-hidden relative group"
              >
                <img
                  src={imageUrls[3]}
                  alt="Attachment 4"
                  className="w-full h-full object-cover hover:scale-[1.01] transition-transform duration-300"
                />
                {imageUrls.length > 4 ? (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white text-xl font-black group-hover:bg-black/50 transition-colors">
                    +{imageUrls.length - 3}
                  </div>
                ) : (
                  <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors" />
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Likes & Comments Counters */}
      {post.status !== "rejected" && (
        <div className="px-5 py-3 flex items-center justify-between text-xs text-muted font-bold border-t border-b border-border/30 bg-secondary/5 select-none">
          {/* Hover/click stats to open reactions modal */}
          <div 
            className="flex items-center gap-1.5 cursor-pointer"
            onClick={() => reactionsCount > 0 && setShowReactionsModal(true)}
          >
            {reactionsCount > 0 && (
              <div className="flex items-center -space-x-1.5 mr-0.5">
                {Object.entries(reactionStats)
                  .filter(([_, count]) => count > 0)
                  .sort((a, b) => b[1] - a[1])
                  .slice(0, 3)
                  .map(([type]) => (
                    <span 
                      key={type} 
                      className="flex items-center justify-center w-5 h-5 rounded-full bg-card border border-border shadow-xs text-xs"
                    >
                      {REACTION_MAP[type]?.emoji || "👍"}
                    </span>
                  ))}
              </div>
            )}
            <span className={`text-foreground/75 font-black ${reactionsCount > 0 ? "hover:underline" : ""}`}>
              {reactionsCount === 0 
                ? `0 ${t("posts.like").toLowerCase()}` 
                : t("posts.reactions").replace("{count}", String(reactionsCount))}
            </span>
          </div>
          
          <div 
            className="text-foreground/75 cursor-pointer hover:underline"
            onClick={() => setShowComments(!showComments)}
          >
            <span>{t("posts.comments").replace("{count}", String(commentsCount))}</span>
          </div>
        </div>
      )}

      {/* Real Actions Footer */}
      {post.status !== "rejected" && (
        <div className="px-3 py-2 flex items-center justify-between gap-2.5 text-xs font-bold text-muted border-t border-border/10 relative">
          
          {/* Multi-Reactions Hover Tooltip */}
          <AnimatePresence>
            {showReactionsPopover && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.9 }}
                animate={{ opacity: 1, y: -45, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.9 }}
                transition={{ type: "spring", stiffness: 350, damping: 25 }}
                onMouseEnter={showPopover}
                onMouseLeave={hidePopover}
                className="absolute left-4 bg-card/90 backdrop-blur-md border border-border shadow-xl rounded-full px-2 py-1.5 z-40 flex items-center gap-2"
              >
                {REACTION_OPTIONS.map((opt) => (
                  <motion.button
                    key={opt.type}
                    whileHover={{ scale: 1.35, y: -5 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleReact(opt.type)}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xl cursor-pointer hover:bg-secondary/50 transition-colors"
                    title={opt.type}
                  >
                    {opt.emoji}
                  </motion.button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Reaction Button (Direct click or hover trigger) */}
          <div
            onMouseEnter={showPopover}
            onMouseLeave={hidePopover}
            className="flex-1 relative"
          >
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={handleLikeClick}
              className={`w-full py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer font-bold ${
                activeReactionMeta
                  ? `${activeReactionMeta.colorClass} ${activeReactionMeta.bgClass} border border-current/20 hover:brightness-95`
                  : "text-muted hover:text-foreground hover:bg-secondary/40 font-semibold"
              }`}
            >
              {activeReactionMeta ? (
                <span className="text-base leading-none">{activeReactionMeta.emoji}</span>
              ) : (
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
                  <path d="M7 10v12" />
                  <path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z" />
                </svg>
              )}
              {activeReactionMeta ? t(activeReactionMeta.labelKey) : t("posts.like")}
            </motion.button>
          </div>

          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={() => setShowComments(true)}
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
      )}

      {/* Reactions List Modal */}
      <ReactionsModal
        isOpen={showReactionsModal}
        onClose={() => setShowReactionsModal(false)}
        postId={post.id}
        reactionsCount={reactionsCount}
        reactionStats={reactionStats}
      />

      {/* Comments List Modal */}
      <CommentsModal
        isOpen={showComments}
        onClose={() => setShowComments(false)}
        post={post}
        currentUser={currentUser}
      />

      {/* Lightbox Modal */}
      <ImageLightbox
        isOpen={lightboxOpen}
        images={imageUrls}
        initialIndex={lightboxIndex}
        onClose={() => setLightboxOpen(false)}
      />
    </motion.div>
  );
};

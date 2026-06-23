"use client";
import React, { useState, useEffect, useRef } from "react";
import { Modal } from "@/presentation/components/ui/Modal";
import {
  useGetPostCommentsQuery,
  useCreatePostCommentMutation,
  useDeletePostCommentMutation,
  PostResponseDto,
  PostCommentDto,
  useReactToPostMutation,
} from "@/infrastructure/rtk/api/post.api";
import { useTranslation } from "@/presentation/providers/LanguageProvider";
import { REACTION_MAP } from "./ReactionsModal";
import { motion, AnimatePresence } from "framer-motion";

interface CommentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: PostResponseDto;
  currentUser: any;
}

const REACTION_OPTIONS = [
  { type: "LIKE", emoji: "👍", colorClass: "text-blue-500" },
  { type: "LOVE", emoji: "❤️", colorClass: "text-rose-500" },
  { type: "HAHA", emoji: "😆", colorClass: "text-amber-500" },
  { type: "WOW", emoji: "😮", colorClass: "text-amber-500" },
  { type: "SAD", emoji: "😢", colorClass: "text-sky-500" },
  { type: "ANGRY", emoji: "😡", colorClass: "text-red-500" },
];

export const CommentsModal: React.FC<CommentsModalProps> = ({
  isOpen,
  onClose,
  post,
  currentUser,
}) => {
  const { t, locale } = useTranslation();

  const [commentText, setCommentText] = useState("");
  const [replyText, setReplyText] = useState("");
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [expandedReplies, setExpandedReplies] = useState<Record<string, boolean>>({});
  const [showReactionsPopover, setShowReactionsPopover] = useState(false);

  // Reaction Optimistic states inside modal
  const [myReaction, setMyReaction] = useState<string | null>(post.myReaction || null);
  const [reactionsCount, setReactionsCount] = useState<number>(post.reactionsCount || 0);
  const [reactionStats, setReactionStats] = useState<Record<string, number>>(post.reactionStats || {});

  const { data: commentsData, isLoading: isCommentsLoading } = useGetPostCommentsQuery(
    { postId: post.id, limit: 100 },
    { skip: !isOpen }
  );

  const [createComment, { isLoading: isSubmitting }] = useCreatePostCommentMutation();
  const [deleteComment] = useDeletePostCommentMutation();
  const [reactToPost] = useReactToPostMutation();

  const commentsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMyReaction(post.myReaction || null);
    setReactionsCount(post.reactionsCount || 0);
    setReactionStats(post.reactionStats || {});
  }, [post, isOpen]);

  const handleReact = async (type: string) => {
    setShowReactionsPopover(false);
    const oldMyReaction = myReaction;
    const oldStats = { ...reactionStats };
    const oldCount = reactionsCount;

    if (myReaction === type) {
      setMyReaction(null);
      setReactionsCount((c) => Math.max(0, c - 1));
      setReactionStats((prev) => ({
        ...prev,
        [type]: Math.max(0, (prev[type] || 0) - 1),
      }));
    } else {
      setMyReaction(type);
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
      setMyReaction(oldMyReaction);
      setReactionsCount(oldCount);
      setReactionStats(oldStats);
    }
  };

  const handleLikeClick = () => {
    if (myReaction) {
      handleReact(myReaction);
    } else {
      handleReact("LIKE");
    }
  };

  const formatCommentTime = (dateStr: string) => {
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

  const handleSendComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || isSubmitting) return;

    try {
      await createComment({
        postId: post.id,
        content: commentText.trim(),
        lang: locale,
      }).unwrap();
      setCommentText("");
      setTimeout(() => {
        commentsEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } catch (err) {
      console.error("Failed to post comment:", err);
    }
  };

  const handleSendReply = async (e: React.FormEvent, parentId: string) => {
    e.preventDefault();
    if (!replyText.trim() || isSubmitting) return;

    try {
      await createComment({
        postId: post.id,
        content: replyText.trim(),
        parentId,
        lang: locale,
      }).unwrap();
      setReplyText("");
      setReplyingToId(null);
      setExpandedReplies((prev) => ({ ...prev, [parentId]: true }));
    } catch (err) {
      console.error("Failed to post reply:", err);
    }
  };

  const handleDelete = async (commentId: string) => {
    try {
      await deleteComment({ commentId, postId: post.id }).unwrap();
    } catch (err) {
      console.error("Failed to delete comment:", err);
    }
  };

  const toggleReplies = (commentId: string) => {
    setExpandedReplies((prev) => ({ ...prev, [commentId]: !prev[commentId] }));
  };

  const CommentSkeleton = () => (
    <div className="flex gap-3 py-3 animate-pulse">
      <div className="w-9 h-9 rounded-full bg-border/60 shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="bg-border/60 h-4 rounded w-1/4" />
        <div className="bg-border/40 h-10 rounded-2xl w-full" />
        <div className="flex gap-2">
          <div className="bg-border/60 h-3 rounded w-12" />
          <div className="bg-border/60 h-3 rounded w-12" />
        </div>
      </div>
    </div>
  );

  const activeReactionMeta = myReaction ? REACTION_MAP[myReaction] : null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t("posts.commentsTitle")}
      maxWidth="3xl"
      scrollable={false}
    >
      <div className="flex-1 flex flex-col min-h-0 -mx-6 -mb-6">
        {/* Scrollable Area */}
        <div className="flex-grow overflow-y-auto px-6 pb-4 space-y-4 scrollbar-thin">
          {/* Post content inside Modal */}
          <div className="w-full flex flex-col gap-3.5 mt-2">
            
            {/* Post Header */}
            <div className="flex items-center justify-between relative">
              <div className="flex items-center gap-3">
                <img
                  src={post.user.avatarUrl || "/default-avatar.png"}
                  alt={post.user.fullName}
                  className="w-10 h-10 rounded-full object-cover border border-border"
                />
                <div>
                  <h4 className="font-extrabold text-sm text-foreground flex items-center gap-1.5">
                    {post.user.fullName}
                    <span className="w-1.5 h-1.5 rounded-full bg-success/80"></span>
                  </h4>
                  <span className="text-[10px] text-muted font-bold uppercase tracking-wider block mt-0.5">
                    {formatCommentTime(post.createdAt)}
                  </span>
                </div>
              </div>
            </div>

            {/* Post Title & Content */}
            <div className="flex flex-col gap-2">
              <h3 className="font-black text-base text-foreground leading-snug">
                {post.title}
              </h3>
              <p className="text-sm text-foreground/85 whitespace-pre-wrap leading-relaxed font-normal">
                {post.content}
              </p>
            </div>

            {/* Post Image Attachment */}
            {post.imageUrl && (
              <div className="w-full bg-secondary/10 overflow-hidden relative aspect-video max-h-[380px] rounded-xl border border-border/40">
                <img
                  src={post.imageUrl}
                  alt={post.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Counters Line */}
            <div className="flex items-center justify-between text-xs text-muted font-bold py-1 border-t border-b border-border/25 select-none mt-2">
              <div className="flex items-center gap-1">
                {reactionsCount > 0 && (
                  <div className="flex items-center -space-x-1 mr-1">
                    {Object.entries(reactionStats)
                      .filter(([_, count]) => count > 0)
                      .map(([type]) => (
                        <span key={type} className="text-xs">
                          {REACTION_MAP[type]?.emoji}
                        </span>
                      ))}
                  </div>
                )}
                <span>
                  {reactionsCount === 0 
                    ? `0 ${t("posts.like").toLowerCase()}` 
                    : t("posts.reactions").replace("{count}", String(reactionsCount))}
                </span>
              </div>
              <div>
                <span>{post.commentsCount} {t("posts.comment").toLowerCase()}</span>
              </div>
            </div>

            {/* Post Action Buttons (Like / Comment / Share) */}
            <div className="flex items-center justify-between gap-2.5 text-xs font-bold text-muted relative pt-1">
              
              {/* Reactions Hover Popover */}
              <AnimatePresence>
                {showReactionsPopover && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.9 }}
                    animate={{ opacity: 1, y: -45, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.9 }}
                    onMouseEnter={() => setShowReactionsPopover(true)}
                    onMouseLeave={() => setShowReactionsPopover(false)}
                    className="absolute left-2 bg-card border border-border shadow-xl rounded-full px-2 py-1.5 z-45 flex items-center gap-2"
                  >
                    {REACTION_OPTIONS.map((opt) => (
                      <button
                        key={opt.type}
                        onClick={() => handleReact(opt.type)}
                        className="w-8 h-8 rounded-full flex items-center justify-center text-xl cursor-pointer hover:bg-secondary/50 transition-colors"
                      >
                        {opt.emoji}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Like Button */}
              <div
                onMouseEnter={() => setShowReactionsPopover(true)}
                onMouseLeave={() => setShowReactionsPopover(false)}
                className="flex-1"
              >
                <button
                  onClick={handleLikeClick}
                  className={`w-full h-10 rounded-xl flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer font-bold ${
                    activeReactionMeta
                      ? `${activeReactionMeta.colorClass} ${activeReactionMeta.bgClass} border border-current/10`
                      : "border border-transparent hover:bg-secondary/40"
                  }`}
                >
                  {activeReactionMeta ? (
                    <span className="text-base">{activeReactionMeta.emoji}</span>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M7 10v12" /><path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z" /></svg>
                  )}
                  {activeReactionMeta ? t(activeReactionMeta.labelKey) : t("posts.like")}
                </button>
              </div>

              {/* Comment Button */}
              <button
                className="flex-1 h-10 border border-transparent rounded-xl flex items-center justify-center gap-2 hover:bg-secondary/40 cursor-pointer"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
                {t("posts.comment")}
              </button>

              {/* Share Button */}
              <button
                className="flex-1 h-10 border border-transparent rounded-xl flex items-center justify-center gap-2 hover:bg-secondary/40 cursor-pointer"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" /><polyline points="16 6 12 2 8 6" /><line x1="12" x2="12" y1="2" y2="15" /></svg>
                {t("posts.share")}
              </button>
            </div>
          </div>

          <div className="border-t border-border/40 my-1" />

          {/* Comments List */}
          <div className="space-y-4 pt-1">
            {isCommentsLoading ? (
              <>
                <CommentSkeleton />
                <CommentSkeleton />
              </>
            ) : commentsData?.items && commentsData.items.length > 0 ? (
              commentsData.items.map((comment) => {
                const isMyComment = currentUser && comment.userId === currentUser.id;
                const hasReplies = comment.replies && comment.replies.length > 0;
                const isExpanded = !!expandedReplies[comment.id];

                return (
                  <div key={comment.id} className="group flex flex-col gap-1">
                    {/* Top Level Comment */}
                    <div className="flex gap-3">
                      <img
                        src={comment.user.avatarUrl || "/default-avatar.png"}
                        alt={comment.user.fullName}
                        className="w-9 h-9 rounded-full object-cover border border-border shrink-0"
                      />
                      <div className="flex-1 flex flex-col">
                        {/* Bubble */}
                        <div className="bg-secondary/40 rounded-2xl px-4 py-2.5 max-w-[90%] relative">
                          <span className="font-bold text-xs text-foreground block mb-0.5">
                            {comment.user.fullName}
                          </span>
                          
                          {/* Approved status handling for AI Moderation */}
                          {comment.isApproved ? (
                            <p className="text-sm text-foreground whitespace-pre-wrap">
                              {comment.content}
                            </p>
                          ) : (
                            <div className="space-y-1">
                              <p className="text-sm text-muted-foreground/60 italic line-through">
                                {comment.content}
                              </p>
                              {isMyComment && (
                                <div className="mt-1 bg-destructive/10 text-destructive text-[11px] p-2 rounded-lg border border-destructive/20 font-medium">
                                  ⚠️ {t("posts.commentModerationWarning")}
                                  {comment.moderationReason && (
                                    <div className="mt-0.5 opacity-90 font-normal">
                                      {t("posts.moderationReason").replace("{reason}", comment.moderationReason)}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Actions line */}
                        <div className="flex items-center gap-3 mt-1 ml-2 text-xs text-muted-foreground">
                          <span>
                            {formatCommentTime(comment.createdAt)}
                          </span>
                          {comment.isApproved && currentUser && (
                            <button
                              onClick={() => {
                                setReplyingToId(comment.id);
                                setReplyText("");
                              }}
                              className="font-semibold text-primary hover:underline cursor-pointer"
                            >
                              {t("posts.reply")}
                            </button>
                          )}
                          {isMyComment && (
                            <button
                              onClick={() => handleDelete(comment.id)}
                              className="font-medium text-destructive/80 hover:text-destructive hover:underline cursor-pointer transition-colors"
                            >
                              {t("posts.deleteComment")}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Replies Container */}
                    <div className="pl-12 space-y-3 mt-2">
                      {/* Replies List */}
                      {hasReplies && isExpanded && (
                        comment.replies!.map((reply) => {
                          const isMyReply = currentUser && reply.userId === currentUser.id;
                          return (
                            <div key={reply.id} className="flex gap-2.5">
                              <img
                                src={reply.user.avatarUrl || "/default-avatar.png"}
                                alt={reply.user.fullName}
                                className="w-7 h-7 rounded-full object-cover border border-border shrink-0"
                              />
                              <div className="flex-1 flex flex-col">
                                <div className="bg-secondary/20 rounded-xl px-3.5 py-2 max-w-[90%]">
                                  <span className="font-bold text-xs text-foreground block mb-0.5">
                                    {reply.user.fullName}
                                  </span>
                                  {reply.isApproved ? (
                                    <p className="text-sm text-foreground whitespace-pre-wrap">
                                      {reply.content}
                                    </p>
                                  ) : (
                                    <div className="space-y-1">
                                      <p className="text-sm text-muted-foreground/60 italic line-through">
                                        {reply.content}
                                      </p>
                                      {isMyReply && (
                                        <div className="mt-1 bg-destructive/10 text-destructive text-[11px] p-2 rounded-lg border border-destructive/20 font-medium">
                                          ⚠️ {t("posts.commentModerationWarning")}
                                          {reply.moderationReason && (
                                            <div className="mt-0.5 opacity-90 font-normal">
                                              {t("posts.moderationReason").replace("{reason}", reply.moderationReason)}
                                            </div>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                                <div className="flex items-center gap-3 mt-1 ml-1 text-[11px] text-muted-foreground">
                                  <span>
                                    {formatCommentTime(reply.createdAt)}
                                  </span>
                                  {isMyReply && (
                                    <button
                                      onClick={() => handleDelete(reply.id)}
                                      className="font-medium text-destructive/80 hover:text-destructive hover:underline cursor-pointer transition-colors"
                                    >
                                      {t("posts.deleteComment")}
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}

                      {/* Toggle Collapse/Expand replies button */}
                      {hasReplies && (
                        <button
                          onClick={() => toggleReplies(comment.id)}
                          className="flex items-center gap-1.5 text-xs text-primary font-bold hover:underline cursor-pointer mt-1"
                        >
                          <svg
                            className={`w-3.5 h-3.5 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                          </svg>
                          {isExpanded
                            ? t("posts.hideReplies")
                            : t("posts.showReplies").replace("{count}", String(comment.replies!.length))}
                        </button>
                      )}

                      {/* Reply Input Form */}
                      {replyingToId === comment.id && (
                        <form
                          onSubmit={(e) => handleSendReply(e, comment.id)}
                          className="flex gap-2 items-center mt-2 mr-[10%]"
                        >
                          <input
                            type="text"
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            placeholder={t("posts.writeReplyPlaceholder")}
                            className="flex-1 bg-secondary/30 border border-border/40 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-foreground"
                            autoFocus
                          />
                          <button
                            type="submit"
                            disabled={!replyText.trim() || isSubmitting}
                            className="bg-primary text-white text-[11px] font-bold px-3 py-1.5 rounded-xl cursor-pointer hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                          >
                            {t("posts.reply")}
                          </button>
                          <button
                            type="button"
                            onClick={() => setReplyingToId(null)}
                            className="text-[11px] text-muted hover:underline cursor-pointer"
                          >
                            {t("posts.cancel")}
                          </button>
                        </form>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 text-sm text-muted">
                {t("posts.noCommentsYet")}
              </div>
            )}
            <div ref={commentsEndRef} />
          </div>
        </div>

        {/* Input Bar (Sticky at Bottom) */}
        <form
          onSubmit={handleSendComment}
          className="border-t border-border/40 bg-card p-4 px-6 flex gap-3 items-center"
        >
          <img
            src={currentUser?.avatarUrl || "/default-avatar.png"}
            alt={currentUser?.fullName || "User"}
            className="w-9 h-9 rounded-full object-cover border border-border shrink-0"
          />
          <div className="flex-1 flex gap-2">
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder={t("posts.writeCommentPlaceholder")}
              className="flex-1 bg-secondary/20 border border-border/40 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground placeholder:text-muted-foreground/60"
            />
            <button
              type="submit"
              disabled={!commentText.trim() || isSubmitting}
              className="bg-primary text-white font-bold px-4 py-2 rounded-xl cursor-pointer hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center shrink-0"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              )}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

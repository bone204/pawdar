"use client";

import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useSearchParams } from "next/navigation";
import { selectCurrentUser } from "@/infrastructure/rtk/auth.slice";
import { Button } from "@/presentation/components/ui/Button";
import { AnimatePresence, motion } from "framer-motion";
import { useTranslation } from "@/presentation/providers/LanguageProvider";
import {
  useGetApprovedPostsQuery,
  useDeletePostMutation,
  type PostResponseDto,
} from "@/infrastructure/rtk/api/post.api";
import { PostCard } from "./components/PostCard";
import { PostFormModal } from "./components/PostFormModal";
import { Toast } from "@/presentation/pages/main/pets/MyPetsPage";

// Deletion Confirm Dialog
interface DeleteDialogProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading: boolean;
}

const DeleteDialog: React.FC<DeleteDialogProps> = ({
  isOpen,
  onConfirm,
  onCancel,
  isLoading,
}) => {
  const { t } = useTranslation();
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCancel} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.18 }}
        className="relative w-full max-w-sm bg-card border border-border rounded-3xl p-6 shadow-2xl z-10 text-center"
      >
        <div className="mb-5">
          <div className="text-4xl mb-3">🗑️</div>
          <h3 className="text-lg font-black text-foreground mb-2">{t("posts.deleteTitle")}</h3>
          <p className="text-sm text-muted leading-relaxed">
            {t("posts.deleteConfirm")}
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl border border-border text-sm font-bold text-foreground hover:bg-secondary/40 transition-colors cursor-pointer"
          >
            {t("posts.cancel")}
          </button>
          <Button
            id="confirm-delete-post"
            variant="primary"
            onClick={onConfirm}
            isLoading={isLoading}
            className="flex-1 bg-danger text-white hover:bg-danger/90 border-danger/10 shadow-none"
          >
            {t("posts.confirmDelete")}
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export const DashboardPage: React.FC = () => {
  const { t } = useTranslation();
  const user = useSelector(selectCurrentUser);
  const searchParams = useSearchParams();
  const search = searchParams?.get("search") || "";

  const [page, setPage] = useState(1);
  const limit = 6;

  // Modals / Dialogs / Toast states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<PostResponseDto | null>(null);
  const [deletingPostId, setDeletingPostId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Fetch approved posts
  const { data, isLoading, isFetching, isError } = useGetApprovedPostsQuery({
    page,
    limit,
    search: search || undefined,
  });

  const [deletePost, { isLoading: isDeleting }] = useDeletePostMutation();

  // Reset page when search term changes
  useEffect(() => {
    setPage(1);
  }, [search]);

  const posts = data?.items ?? [];
  const totalPages = data?.totalPages ?? 1;

  const _showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const _onEditPost = (post: PostResponseDto) => {
    setEditingPost(post);
    setIsFormOpen(true);
  };

  const _onDeletePost = (postId: string) => {
    setDeletingPostId(postId);
  };

  const _onConfirmDelete = async () => {
    if (!deletingPostId) return;
    try {
      await deletePost(deletingPostId).unwrap();
      setDeletingPostId(null);
      _showToast(t("api.codes.delete_post_successful"));
    } catch (err) {
      console.error("Failed to delete post", err);
    }
  };

  const _onOpenCreateModal = () => {
    setEditingPost(null);
    setIsFormOpen(true);
  };

  const userInitials = user?.fullName
    ? user.fullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "US";

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col gap-4 select-none py-2">
      
      {/* Facebook-style Write Post Trigger Card */}
      <div className="w-full bg-card border border-border/70 rounded-2xl p-5 shadow-xs flex flex-col gap-4">
        <div className="flex items-center gap-3">
          {user?.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={user.fullName}
              className="w-10 h-10 rounded-full object-cover border border-border"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm border border-primary/20">
              {userInitials}
            </div>
          )}
          <button
            onClick={_onOpenCreateModal}
            className="flex-grow text-left px-5 py-3 rounded-xl bg-secondary/50 hover:bg-secondary/80 text-foreground/80 border border-border/65 font-semibold text-sm transition-all duration-200 cursor-pointer"
          >
            {t("posts.writePlaceholder").replace("{name}", user?.fullName || t("posts.writePlaceholderDefault"))}
          </button>
        </div>
        <div className="flex items-center justify-start border-t border-border/40 pt-3">
          <button
            onClick={_onOpenCreateModal}
            className="flex items-center gap-2 hover:bg-secondary/40 text-muted-foreground hover:text-primary transition-all duration-200 py-1.5 px-4 rounded-xl font-bold text-xs cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-primary"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
            {t("posts.attachImage")}
          </button>
        </div>
      </div>

      {/* Posts List */}
      {isLoading ? (
        <div className="flex flex-col gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-card border border-border/70 rounded-2xl overflow-hidden animate-pulse flex flex-col">
              <div className="p-5 flex items-center gap-3 border-b border-border/20">
                <div className="w-10 h-10 rounded-full bg-secondary/80" />
                <div className="flex flex-col gap-2 flex-grow">
                  <div className="h-4 bg-secondary/85 rounded-md w-1/4" />
                  <div className="h-3 bg-secondary/60 rounded-md w-1/6" />
                </div>
              </div>
              <div className="p-5 flex flex-col gap-3">
                <div className="h-5 bg-secondary/80 rounded-md w-3/4" />
                <div className="h-4 bg-secondary/65 rounded-md w-full" />
              </div>
              <div className="w-full aspect-video bg-secondary/40" />
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center justify-center p-12 bg-card border border-border/70 rounded-2xl text-center">
          <span className="text-4xl mb-3">⚠️</span>
          <h3 className="text-base font-bold text-foreground">{t("posts.loadError")}</h3>
          <p className="text-xs text-muted mt-1">{t("posts.checkNetwork")}</p>
        </div>
      ) : posts.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-16 bg-card border border-border/70 rounded-2xl text-center">
          <span className="text-5xl mb-4 select-none">🔍</span>
          <h3 className="text-lg font-bold text-foreground">
            {search ? t("posts.noResultsSearch") : t("posts.noResultsFeed")}
          </h3>
          <p className="text-sm text-muted mt-1.5">
            {search ? t("posts.tryOtherKeywords") : t("posts.beFirst")}
          </p>
          {!search && (
            <Button
              variant="primary"
              onClick={_onOpenCreateModal}
              className="mt-5 px-6 py-2.5 rounded-xl text-sm"
            >
              {t("posts.writeNow")}
            </Button>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <AnimatePresence mode="popLayout">
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                currentUserId={user?.id}
                onEdit={_onEditPost}
                onDelete={_onDeletePost}
              />
            ))}
          </AnimatePresence>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-6 border-t border-border/40 pt-5 mt-2">
              <Button
                variant="secondary"
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page === 1}
                className="rounded-xl px-4 py-2 text-xs font-bold active:scale-95 transition-transform"
              >
                {t("posts.prevPage")}
              </Button>
              <span className="text-xs font-bold text-foreground text-center">
                {t("posts.pageIndicator").replace("{page}", String(page)).replace("{totalPages}", String(totalPages))}
              </span>
              <Button
                variant="secondary"
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                disabled={page === totalPages}
                className="rounded-xl px-4 py-2 text-xs font-bold active:scale-95 transition-transform"
              >
                {t("posts.nextPage")}
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Modals & Dialogs */}
      <AnimatePresence>
        {isFormOpen && (
          <PostFormModal
            isOpen={isFormOpen}
            editingPost={editingPost}
            onClose={() => {
              setIsFormOpen(false);
              setEditingPost(null);
            }}
            onSuccess={_showToast}
          />
        )}
        
        {deletingPostId && (
          <DeleteDialog
            isOpen={!!deletingPostId}
            onConfirm={_onConfirmDelete}
            onCancel={() => setDeletingPostId(null)}
            isLoading={isDeleting}
          />
        )}

        {toastMessage && (
          <Toast message={toastMessage} onDismiss={() => setToastMessage(null)} />
        )}
      </AnimatePresence>

    </div>
  );
};

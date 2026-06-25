"use client";

import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "@/presentation/providers/LanguageProvider";
import { Button } from "@/presentation/components/ui/Button";
import { TextField } from "@/presentation/components/ui/TextField";
import { EditProfileModal } from "./components/EditProfileModal";
import { useUploadImageMutation } from "@/infrastructure/rtk/api/upload.api";
import {
  useGetMyProfileQuery,
  useGetUserProfileQuery,
  useUpdateProfileMutation,
  useSendFriendRequestMutation,
  useAcceptFriendRequestMutation,
  useDeclineFriendRequestMutation,
  useUnfriendMutation,
  useGetFriendsQuery,
  useGetReceivedFriendRequestsQuery,
  useGetSentFriendRequestsQuery,
} from "@/infrastructure/rtk/api/user.api";
import {
  useGetMyPostsQuery,
  useGetApprovedPostsQuery,
  useDeletePostMutation,
  useCreatePostMutation,
  useUpdatePostMutation,
  type PostResponseDto,
} from "@/infrastructure/rtk/api/post.api";
import { PostCard } from "@/presentation/pages/main/dashboard/components/PostCard";
import { PostFormModal } from "@/presentation/pages/main/dashboard/components/PostFormModal";
import { motion, AnimatePresence } from "framer-motion";
import { useSelector, useDispatch } from "react-redux";
import { selectCurrentUser, updateUser } from "@/infrastructure/rtk/auth.slice";
import { useRouter } from "next/navigation";

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
            variant="danger"
            onClick={onConfirm}
            isLoading={isLoading}
            className="flex-1 shadow-none rounded-xl"
          >
            {t("posts.confirmDelete")}
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

interface ProfilePageProps {
  userId?: string;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ userId }) => {
  const { t } = useTranslation();
  const router = useRouter();
  const currentUser = useSelector(selectCurrentUser);
  const dispatch = useDispatch();

  const isMe = !userId || userId === currentUser?.id;
  const targetId = userId || currentUser?.id || "";

  // Queries
  const {
    data: profile,
    isLoading: isProfileLoading,
    isError: isProfileError,
    refetch: refetchProfile,
  } = isMe
    ? useGetMyProfileQuery(undefined, { skip: !targetId })
    : useGetUserProfileQuery(targetId, { skip: !targetId });

  // Friends search and pagination for side card
  const [friendsSearch, setFriendsSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const friendsLimit = 6;

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(friendsSearch);
    }, 400);
    return () => clearTimeout(handler);
  }, [friendsSearch]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (friendsMenuRef.current && !friendsMenuRef.current.contains(event.target as Node)) {
        setIsFriendsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const { data: friendsData, isFetching: isFriendsLoading } = useGetFriendsQuery(
    {
      search: debouncedSearch || undefined,
      page: 1,
      limit: friendsLimit,
    },
    { skip: !profile }
  );

  const { data: receivedRequests, refetch: refetchReceived } = useGetReceivedFriendRequestsQuery(
    undefined,
    { skip: !isMe }
  );
  const { data: sentRequests, refetch: refetchSent } = useGetSentFriendRequestsQuery(
    undefined,
    { skip: !isMe }
  );

  // Post Query for right column
  const [postsPage, setPostsPage] = useState(1);
  const postsLimit = 5;
  
  const { data: myPostsData, isLoading: isMyPostsLoading } = useGetMyPostsQuery({
    page: postsPage,
    limit: postsLimit,
  }, { skip: !isMe });

  const { data: otherPostsData, isLoading: isOtherPostsLoading } = useGetApprovedPostsQuery({
    page: postsPage,
    limit: postsLimit,
    userId: targetId,
  }, { skip: isMe });

  const postsData = isMe ? myPostsData : otherPostsData;
  const isPostsLoading = isMe ? isMyPostsLoading : isOtherPostsLoading;

  // Mutations
  const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation();
  const [sendFriendRequest, { isLoading: isSendingReq }] = useSendFriendRequestMutation();
  const [acceptFriendRequest, { isLoading: isAccepting }] = useAcceptFriendRequestMutation();
  const [declineFriendRequest, { isLoading: isDeclining }] = useDeclineFriendRequestMutation();
  const [unfriend, { isLoading: isUnfriending }] = useUnfriendMutation();
  const [deletePost, { isLoading: isDeletingPost }] = useDeletePostMutation();

  // State
  const [isEditing, setIsEditing] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);

  // Post Modals states
  const [isPostFormOpen, setIsPostFormOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<PostResponseDto | null>(null);
  const [deletingPostId, setDeletingPostId] = useState<string | null>(null);

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const [uploadImage] = useUploadImageMutation();

  const [isFriendsMenuOpen, setIsFriendsMenuOpen] = useState(false);
  const friendsMenuRef = useRef<HTMLDivElement>(null);

  const _showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleAvatarClick = () => {
    if (isMe) {
      avatarInputRef.current?.click();
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const uploadRes = await uploadImage(formData).unwrap();
      
      await updateProfile({
        fullName: profile?.fullName || "",
        avatarUrl: uploadRes.url,
      }).unwrap();

      dispatch(updateUser({
        avatarUrl: uploadRes.url,
      }));

      _showToast(t("pets.updateSuccess"));
      refetchProfile();
    } catch (err) {
      console.error("Failed to upload avatar", err);
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleCoverClick = () => {
    if (isMe) {
      coverInputRef.current?.click();
    }
  };

  const handleCoverChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingCover(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const uploadRes = await uploadImage(formData).unwrap();

      await updateProfile({
        fullName: profile?.fullName || "",
        coverUrl: uploadRes.url,
      }).unwrap();

      dispatch(updateUser({
        coverUrl: uploadRes.url,
      }));

      _showToast(t("profile.updateCoverSuccess"));
      refetchProfile();
    } catch (err) {
      console.error("Failed to upload cover image", err);
    } finally {
      setIsUploadingCover(false);
    }
  };

  // Friend actions
  const handleSendRequest = async () => {
    if (!profile) return;
    try {
      await sendFriendRequest(profile.id).unwrap();
      _showToast(t("friends.sendSuccess"));
      refetchProfile();
      if (isMe) refetchSent();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAcceptRequest = async (senderId: string) => {
    try {
      await acceptFriendRequest(senderId).unwrap();
      _showToast(t("friends.acceptSuccess"));
      refetchProfile();
      if (isMe) refetchReceived();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeclineRequest = async (senderId: string) => {
    try {
      await declineFriendRequest(senderId).unwrap();
      _showToast(t("friends.declineSuccess"));
      refetchProfile();
      if (isMe) {
        refetchReceived();
        refetchSent();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUnfriend = async () => {
    if (!profile) return;
    try {
      await unfriend(profile.id).unwrap();
      _showToast(t("friends.unfriendSuccess"));
      refetchProfile();
    } catch (err) {
      console.error(err);
    }
  };

  // Post Actions
  const handleEditPost = (post: PostResponseDto) => {
    setEditingPost(post);
    setIsPostFormOpen(true);
  };

  const handleDeletePost = (postId: string) => {
    setDeletingPostId(postId);
  };

  const handleConfirmDeletePost = async () => {
    if (!deletingPostId) return;
    try {
      await deletePost(deletingPostId).unwrap();
      setDeletingPostId(null);
      _showToast(t("api.codes.delete_post_successful") || "Xóa bài đăng thành công!");
    } catch (err) {
      console.error("Failed to delete post", err);
    }
  };

  const handleOpenCreatePostModal = () => {
    setEditingPost(null);
    setIsPostFormOpen(true);
  };

  if (isProfileLoading) {
    return (
      <div className="w-full max-w-4xl mx-auto py-8 animate-pulse">
        <div className="bg-card border border-border rounded-3xl p-8 mb-8 flex flex-col md:flex-row items-center gap-8">
          <div className="w-32 h-32 bg-secondary rounded-full" />
          <div className="flex-grow space-y-4 w-full">
            <div className="h-8 bg-secondary rounded-xl w-1/3 mx-auto md:mx-0" />
            <div className="h-4 bg-secondary rounded-lg w-1/2 mx-auto md:mx-0" />
            <div className="h-10 bg-secondary rounded-lg w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (isProfileError || !profile) {
    return (
      <div className="w-full max-w-xl mx-auto py-16 text-center bg-card border border-border rounded-3xl p-8">
        <span className="text-5xl mb-4 block">⚠️</span>
        <h3 className="text-xl font-black text-foreground mb-2">{t("profile.errorLoad")}</h3>
        <Button variant="primary" className="mt-4 rounded-xl" onClick={() => refetchProfile()}>
          {t("main.retry")}
        </Button>
      </div>
    );
  }

  const userInitials = profile.fullName
    ? profile.fullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "PT";

  const displayAvatar = profile.avatarUrl && profile.avatarUrl.startsWith("http")
    ? profile.avatarUrl
    : null;

  const displayCover = profile.coverUrl && profile.coverUrl.startsWith("http")
    ? profile.coverUrl
    : null;

  const myPosts = postsData?.items ?? [];
  const totalPostsPages = postsData?.totalPages ?? 1;

  return (
    <div className="w-full select-none py-2">
      {/* Profile Card Header */}
      <div className="relative bg-card border border-border rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.02)] mb-8 transition-all duration-300">
        {/* Cover Image Section */}
        <div className="relative h-48 md:h-64 w-full bg-gradient-to-r from-violet-500 via-purple-500 to-pink-500 group/cover rounded-t-[23px] overflow-hidden">
          {displayCover && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={displayCover}
              alt="Cover"
              className="w-full h-full object-cover rounded-t-[23px]"
            />
          )}
          {isMe && (
            <>
              <input type="file" ref={coverInputRef} onChange={handleCoverChange} className="hidden" accept="image/*" />
              <button
                onClick={handleCoverClick}
                disabled={isUploadingCover}
                className="absolute top-4 right-4 bg-black/60 hover:bg-black/80 text-white text-xs font-bold px-3 py-1.5 rounded-xl backdrop-blur-sm transition-all flex items-center gap-1.5 cursor-pointer"
              >
                {isUploadingCover ? (
                  <>
                    <span className="animate-spin">⏳</span>
                    <span>{t("common.loading")}</span>
                  </>
                ) : (
                  <>
                    <span>📸</span>
                    <span>{t("profile.changeCover")}</span>
                  </>
                )}
              </button>
            </>
          )}
        </div>

        <div className="p-6 md:p-8 pt-0 relative">
          {/* Glow effect */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col md:flex-row items-center md:items-end gap-6 md:gap-10 relative z-10 -mt-20 md:-mt-28">
            {/* Avatar Container */}
            <div className="relative shrink-0">
              <div className={`relative ${isMe ? "cursor-pointer group" : ""}`} onClick={handleAvatarClick}>
                <input type="file" ref={avatarInputRef} onChange={handleAvatarChange} className="hidden" accept="image/*" />
                {displayAvatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={displayAvatar}
                    alt={profile.fullName}
                    className="w-36 h-36 md:w-44 md:h-44 rounded-[2.5rem] object-cover border-4 border-card shadow-lg transition-all group-hover:brightness-90"
                  />
                ) : (
                  <div className="w-36 h-36 md:w-44 md:h-44 rounded-[2.5rem] bg-gradient-to-tr from-primary to-orange-400 text-white font-black text-4xl md:text-5xl flex items-center justify-center border-4 border-card shadow-lg transition-all group-hover:brightness-90">
                    {userInitials}
                  </div>
                )}

                {isMe && (
                  <div className={`absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white text-xs font-bold transition-opacity rounded-[2.5rem] select-none border-4 border-transparent ${
                    isUploadingAvatar ? "opacity-100 pointer-events-none" : "opacity-0 group-hover:opacity-100"
                  }`}>
                    {isUploadingAvatar ? (
                      <span className="animate-spin text-xl">⏳</span>
                    ) : (
                      <>
                        <span>{t("profile.changeAvatar")}</span>
                        <span>📸</span>
                      </>
                    )}
                  </div>
                )}
              </div>

              {profile.role === "admin" && (
                <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-red-500 text-white text-[9px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border-2 border-card z-20">
                  Admin
                </span>
              )}
            </div>

            {/* User Info details */}
            <div className="flex-grow text-center md:text-left flex flex-col md:flex-row justify-between items-center md:items-end gap-6 w-full md:pb-2">
              <div className="flex flex-col gap-2 flex-grow max-w-xl">
                <div className="flex items-center justify-center md:justify-start gap-2.5 flex-wrap">
                  <h2 className="text-2xl md:text-3xl font-black text-foreground leading-tight">
                    {profile.fullName}
                  </h2>
                  {profile.role === "admin" && (
                    <span className="bg-primary/10 text-primary text-[10px] font-black uppercase px-2 py-0.5 rounded-lg">
                      PRO
                    </span>
                  )}
                </div>

                {profile.bio ? (
                  <p className="text-sm text-foreground/80 italic leading-relaxed mt-1">
                    "{profile.bio}"
                  </p>
                ) : (
                  <p className="text-xs text-muted/80 italic mt-1">{t("profile.noBio")}</p>
                )}
              </div>

              {/* Action buttons */}
              <div className="shrink-0 flex flex-col gap-3 w-full md:w-auto mt-2 md:mt-0">
                {isMe ? (
                  <Button
                    variant="primary"
                    onClick={() => setIsEditing(!isEditing)}
                    className="rounded-2xl font-black text-sm px-6 py-2.5 shadow-md active:scale-95 transition-transform"
                  >
                    {t("profile.editProfile")} ✏️
                  </Button>
                ) : (
                  <div className="w-full flex md:flex-col gap-2">
                    {profile.friendship?.status === "NONE" && (
                      <Button
                        variant="primary"
                        onClick={handleSendRequest}
                        isLoading={isSendingReq}
                        className="w-full rounded-2xl text-sm font-black active:scale-95 transition-transform"
                      >
                        {t("friends.sendRequest")}
                      </Button>
                    )}

                    {profile.friendship?.status === "PENDING_SENT" && (
                      <Button
                        variant="danger-outline"
                        onClick={() => handleDeclineRequest(profile.id)}
                        isLoading={isDeclining}
                        className="w-full rounded-2xl text-sm font-black active:scale-95 transition-transform"
                      >
                        {t("friends.cancel")}
                      </Button>
                    )}

                    {profile.friendship?.status === "PENDING_RECEIVED" && (
                      <div className="flex gap-2 w-full md:min-w-[280px]">
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleAcceptRequest(profile.id)}
                          isLoading={isAccepting}
                          className="flex-1 rounded-2xl text-xs font-bold active:scale-95 transition-transform flex items-center justify-center gap-1.5 py-2 px-3 whitespace-nowrap"
                        >
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                          <span>{t("notification.accept") || "Đồng ý"}</span>
                        </Button>
                        <Button
                          variant="danger-outline"
                          size="sm"
                          onClick={() => handleDeclineRequest(profile.id)}
                          isLoading={isDeclining}
                          className="flex-1 rounded-2xl text-xs font-bold active:scale-95 transition-transform flex items-center justify-center gap-1.5 py-2 px-3 whitespace-nowrap shadow-xs"
                        >
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                            <line x1="18" x2="6" y1="6" y2="18" />
                            <line x1="6" x2="18" y1="6" y2="18" />
                          </svg>
                          <span>{t("notification.decline") || "Từ chối"}</span>
                        </Button>
                      </div>
                    )}

                    {profile.friendship?.status === "FRIENDS" && (
                      <div className="relative w-full" ref={friendsMenuRef}>
                        <Button
                          variant="neutral"
                          onClick={() => setIsFriendsMenuOpen(!isFriendsMenuOpen)}
                          className="w-full rounded-2xl text-sm font-black active:scale-95 transition-transform flex items-center justify-center gap-1.5 py-2.5"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-success">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                          <span>{t("profile.statsFriends") || "Bạn bè"}</span>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="2.5"
                            stroke="currentColor"
                            className={`w-3 h-3 text-foreground/60 transition-transform duration-300 ${isFriendsMenuOpen ? "rotate-180" : "rotate-0"}`}
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                          </svg>
                        </Button>

                        {/* Dropdown Menu */}
                        <div
                          className={`absolute right-0 mt-2 w-full bg-card border border-border shadow-[0_4px_24px_rgba(62,46,37,0.08)] dark:shadow-[0_4px_24px_rgba(0,0,0,0.3)] rounded-2xl p-1.5 z-50 transition-all duration-300 ease-out origin-top-right ${
                            isFriendsMenuOpen
                              ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
                              : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
                          }`}
                        >
                          <button
                            onClick={() => {
                              setIsFriendsMenuOpen(false);
                              handleUnfriend();
                            }}
                            disabled={isUnfriending}
                            className="w-full px-3.5 py-2.5 flex items-center gap-2.5 rounded-xl text-xs font-bold text-left text-danger hover:bg-danger/10 active:bg-danger/15 transition-all duration-200 cursor-pointer"
                          >
                            <span className="text-sm">💔</span>
                            <span>{t("friends.unfriend") || "Hủy kết bạn"}</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2-Column Facebook style Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (Info, Pets, Friends list) - occupies 5/12 cols */}
        <div className="lg:col-span-5 flex flex-col gap-6 w-full">
          {/* Personal Info Card */}
          <div className="bg-card border border-border rounded-3xl p-5 shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex flex-col gap-4">
            <h3 className="text-base font-black text-foreground">{t("profile.contactInfo")}</h3>
            <div className="flex flex-col gap-3 font-semibold text-foreground/80">
              <div className="flex items-center gap-3 bg-secondary/20 px-3.5 py-2.5 rounded-xl text-xs">
                <span className="text-base">✉️</span>
                <div>
                  <span className="block text-[9px] text-muted font-bold uppercase tracking-wider leading-none">{t("profile.email")}</span>
                  <span className="text-xs mt-1 block truncate max-w-[200px]">{profile.email}</span>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-secondary/20 px-3.5 py-2.5 rounded-xl text-xs">
                <span className="text-base">📍</span>
                <div>
                  <span className="block text-[9px] text-muted font-bold uppercase tracking-wider leading-none">{t("profile.address")}</span>
                  <span className="text-xs mt-1 block">{profile.address || t("profile.noAddress")}</span>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-secondary/20 px-3.5 py-2.5 rounded-xl text-xs">
                <span className="text-base">📞</span>
                <div>
                  <span className="block text-[9px] text-muted font-bold uppercase tracking-wider leading-none">{t("profile.phone")}</span>
                  <span className="text-xs mt-1 block">{profile.phoneNumber || t("profile.noPhone")}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Pets Side Card */}
          <div className="bg-card border border-border rounded-3xl p-5 shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-foreground">🐾 {t("profile.petsTab")} ({profile.pets.length})</h3>
              {isMe && (
                <button onClick={() => router.push("/my-pets")} className="text-xs font-bold text-primary hover:underline">
                  {t("profile.manage")}
                </button>
              )}
            </div>
            {profile.pets.length === 0 ? (
              <p className="text-xs text-muted py-2 italic font-bold">{t("pets.noResults")}</p>
            ) : (
              <div className="grid grid-cols-3 gap-3">
                {profile.pets.slice(0, 6).map((pet) => {
                  const petImage = pet.avatarUrl && pet.avatarUrl.startsWith("http")
                    ? pet.avatarUrl
                    : pet.petType === "dog"
                    ? "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=200&auto=format&fit=crop"
                    : "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=200&auto=format&fit=crop";
                  return (
                    <div
                      key={pet.id}
                      onClick={() => isMe ? router.push(`/my-pets/${pet.id}`) : null}
                      className="flex flex-col items-center gap-1.5 cursor-pointer group"
                    >
                      <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-secondary border border-border/50">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={petImage} alt={pet.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      </div>
                      <span className="text-[11px] font-black text-foreground truncate max-w-full">{pet.name}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Friends Side Card */}
          <div className="bg-card border border-border rounded-3xl p-5 shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex flex-col gap-4">
            <h3 className="text-base font-black text-foreground">🤝 {t("profile.statsFriends")} ({profile.stats.friends})</h3>
            {isFriendsLoading ? (
              <div className="grid grid-cols-3 gap-3 animate-pulse">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="aspect-square bg-secondary rounded-2xl" />
                ))}
              </div>
            ) : !friendsData || friendsData.items.length === 0 ? (
              <p className="text-xs text-muted py-2 italic font-bold">{t("friends.noFriends")}</p>
            ) : (
              <div className="grid grid-cols-3 gap-3">
                {friendsData.items.slice(0, 6).map((friend) => {
                  const friendInitials = friend.fullName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase();
                  return (
                    <div
                      key={friend.id}
                      onClick={() => router.push(`/dashboard/profile/${friend.id}`)}
                      className="flex flex-col items-center gap-1.5 cursor-pointer group"
                    >
                      <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-secondary border border-border/50 flex items-center justify-center">
                        {friend.avatarUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={friend.avatarUrl} alt={friend.fullName} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-tr from-primary/80 to-orange-400 text-white font-black text-xs flex items-center justify-center">
                            {friendInitials}
                          </div>
                        )}
                      </div>
                      <span className="text-[11px] font-black text-foreground truncate max-w-full">{friend.fullName}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column (User Posts Feed) - occupies 7/12 cols */}
        <div className="lg:col-span-7 flex flex-col gap-4 w-full">
          {/* Write Post Trigger Card */}
          {isMe && (
            <div className="w-full bg-card border border-border/70 rounded-2xl p-5 shadow-xs flex flex-col gap-4">
              <div className="flex items-center gap-3">
                {profile?.avatarUrl ? (
                  <img
                    src={profile.avatarUrl}
                    alt={profile.fullName}
                    className="w-10 h-10 rounded-full object-cover border border-border"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm border border-primary/20">
                    {userInitials}
                  </div>
                )}
                <button
                  onClick={handleOpenCreatePostModal}
                  className="flex-grow text-left px-5 py-3 rounded-xl bg-secondary/50 hover:bg-secondary/80 text-foreground/80 border border-border/65 font-semibold text-sm transition-all duration-200 cursor-pointer"
                >
                  {t("posts.writePlaceholder").replace("{name}", profile?.fullName || t("posts.writePlaceholderDefault"))}
                </button>
              </div>
              <div className="flex items-center justify-start border-t border-border/40 pt-3">
                <button
                  onClick={handleOpenCreatePostModal}
                  className="flex items-center gap-2 hover:bg-secondary/40 text-muted-foreground hover:text-primary transition-all duration-200 py-1.5 px-4 rounded-xl font-bold text-xs cursor-pointer"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-primary"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
                  {t("posts.attachImage")}
                </button>
              </div>
            </div>
          )}

          {/* Posts List */}
          {isPostsLoading ? (
            <div className="flex flex-col gap-4">
              {[...Array(2)].map((_, i) => (
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
                  </div>
                </div>
              ))}
            </div>
          ) : myPosts.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-16 bg-card border border-border/70 rounded-2xl text-center">
              <span className="text-5xl mb-4 select-none">🔍</span>
              <h3 className="text-lg font-bold text-foreground">{t("posts.noPostsYet")}</h3>
              <p className="text-sm text-muted mt-1.5">
                {isMe ? t("posts.shareFirstPost") : t("posts.noPostsUser")}
              </p>
              {isMe && (
                <Button
                  variant="primary"
                  onClick={handleOpenCreatePostModal}
                  className="mt-5 px-6 py-2.5 rounded-xl text-sm"
                >
                  {t("posts.writeNow")}
                </Button>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <AnimatePresence mode="popLayout">
                {myPosts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    currentUserId={currentUser?.id}
                    onEdit={handleEditPost}
                    onDelete={handleDeletePost}
                  />
                ))}
              </AnimatePresence>

              {/* Pagination */}
              {totalPostsPages > 1 && (
                <div className="flex items-center justify-center gap-6 border-t border-border/40 pt-5 mt-2">
                  <Button
                    variant="secondary"
                    onClick={() => setPostsPage((p) => Math.max(p - 1, 1))}
                    disabled={postsPage === 1}
                    className="rounded-xl px-4 py-2 text-xs font-bold active:scale-95 transition-transform"
                  >
                    {t("posts.prevPage")}
                  </Button>
                  <span className="text-xs font-bold text-foreground text-center">
                    {t("posts.pageIndicator")
                      .replace("{page}", String(postsPage))
                      .replace("{totalPages}", String(totalPostsPages))}
                  </span>
                  <Button
                    variant="secondary"
                    onClick={() => setPostsPage((p) => Math.min(p + 1, totalPostsPages))}
                    disabled={postsPage === totalPostsPages}
                    className="rounded-xl px-4 py-2 text-xs font-bold active:scale-95 transition-transform"
                  >
                    {t("posts.nextPage")}
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Edit Profile Form Modal */}
      {isMe && (
        <EditProfileModal
          isOpen={isEditing}
          onClose={() => setIsEditing(false)}
          profile={profile}
          onSuccess={_showToast}
        />
      )}

      {/* Edit Post Modal & Delete Confirm Dialog */}
      <AnimatePresence>
        {isPostFormOpen && (
          <PostFormModal
            isOpen={isPostFormOpen}
            editingPost={editingPost}
            onClose={() => {
              setIsPostFormOpen(false);
              setEditingPost(null);
            }}
            onSuccess={_showToast}
          />
        )}
        
        {deletingPostId && (
          <DeleteDialog
            isOpen={!!deletingPostId}
            onConfirm={handleConfirmDeletePost}
            onCancel={() => setDeletingPostId(null)}
            isLoading={isDeletingPost}
          />
        )}

        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] bg-foreground text-background text-sm font-bold px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 cursor-pointer select-none"
            onClick={() => setToast(null)}
          >
            <span>✓</span>
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

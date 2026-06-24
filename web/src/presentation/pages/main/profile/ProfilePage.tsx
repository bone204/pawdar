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
import { motion, AnimatePresence } from "framer-motion";
import { useSelector, useDispatch } from "react-redux";
import { selectCurrentUser, updateUser } from "@/infrastructure/rtk/auth.slice";
import { useRouter } from "next/navigation";

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

  // Friends search and pagination
  const [friendsSearch, setFriendsSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [friendsPage, setFriendsPage] = useState(1);
  const friendsLimit = 6;

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(friendsSearch);
      setFriendsPage(1);
    }, 400);
    return () => clearTimeout(handler);
  }, [friendsSearch]);

  const { data: friendsData, isFetching: isFriendsLoading } = useGetFriendsQuery(
    {
      search: debouncedSearch || undefined,
      page: friendsPage,
      limit: friendsLimit,
    },
    { skip: !isMe && !profile } // only fetch if profile is loaded or if viewing own profile
  );

  const { data: receivedRequests, refetch: refetchReceived } = useGetReceivedFriendRequestsQuery(
    undefined,
    { skip: !isMe }
  );
  const { data: sentRequests, refetch: refetchSent } = useGetSentFriendRequestsQuery(
    undefined,
    { skip: !isMe }
  );

  // Mutations
  const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation();
  const [sendFriendRequest, { isLoading: isSendingReq }] = useSendFriendRequestMutation();
  const [acceptFriendRequest, { isLoading: isAccepting }] = useAcceptFriendRequestMutation();
  const [declineFriendRequest, { isLoading: isDeclining }] = useDeclineFriendRequestMutation();
  const [unfriend, { isLoading: isUnfriending }] = useUnfriendMutation();

  // State
  const [activeTab, setActiveTab] = useState<"pets" | "friends" | "requests">("pets");
  const [isEditing, setIsEditing] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [uploadImage] = useUploadImageMutation();

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

      _showToast(t("pets.updateSuccess")); // or a new string like "Cập nhật ảnh đại diện thành công!"
      refetchProfile();
    } catch (err) {
      console.error("Failed to upload avatar", err);
    } finally {
      setIsUploadingAvatar(false);
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

  return (
    <div className="w-full max-w-4xl mx-auto py-4">
      {/* Profile Card Header */}
      <div className="relative bg-card border border-border rounded-3xl p-6 md:p-8 shadow-[0_4px_20px_rgba(0,0,0,0.02)] mb-8 overflow-hidden transition-all duration-300">
        {/* Glow effect */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-8 relative z-10">
          {/* Avatar */}
          <div className={`relative shrink-0 ${isMe ? "cursor-pointer group" : ""}`} onClick={handleAvatarClick}>
            <input type="file" ref={avatarInputRef} onChange={handleAvatarChange} className="hidden" accept="image/*" />
            {displayAvatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={displayAvatar}
                alt={profile.fullName}
                className="w-28 h-28 md:w-32 md:h-32 rounded-full object-cover border-4 border-background shadow-md transition-all group-hover:brightness-90"
              />
            ) : (
              <div className="w-28 h-28 md:w-32 md:h-32 rounded-full bg-gradient-to-tr from-primary to-orange-400 text-white font-black text-3xl md:text-4xl flex items-center justify-center border-4 border-background shadow-md transition-all group-hover:brightness-90">
                {userInitials}
              </div>
            )}

            {isMe && (
              <div className={`absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white text-[10px] md:text-xs font-bold transition-opacity rounded-full select-none border-4 border-transparent ${
                isUploadingAvatar ? "opacity-100 pointer-events-none" : "opacity-0 group-hover:opacity-100"
              }`}>
                {isUploadingAvatar ? (
                  <span className="animate-spin text-lg">⏳</span>
                ) : (
                  <>
                    <span>Thay đổi</span>
                    <span>📸</span>
                  </>
                )}
              </div>
            )}

            {profile.role === "admin" && (
              <span className="absolute bottom-0 right-0 bg-red-500 text-white text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border-2 border-background z-20">
                Admin
              </span>
            )}
          </div>

          {/* User Info details */}
          <div className="flex-grow text-center md:text-left flex flex-col gap-3">
            <div>
              <h2 className="text-2xl font-black text-foreground leading-tight">
                {profile.fullName}
              </h2>
              <p className="text-sm text-muted mt-1 font-medium">{profile.email}</p>
            </div>

            {profile.bio ? (
              <p className="text-sm text-foreground/80 bg-secondary/30 p-3.5 rounded-2xl italic leading-relaxed">
                "{profile.bio}"
              </p>
            ) : (
              <p className="text-xs text-muted/80 italic">{t("profile.noBio")}</p>
            )}

            {/* Sub-info list */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-6 gap-y-2 mt-2 text-xs text-muted-foreground font-semibold">
              <span className="flex items-center gap-1.5">
                📍 {profile.address || t("profile.noAddress")}
              </span>
              <span className="flex items-center gap-1.5">
                📞 {profile.phoneNumber || t("profile.noPhone")}
              </span>
            </div>

            {/* Stats list */}
            <div className="flex justify-center md:justify-start gap-8 mt-4 pt-4 border-t border-border/50">
              <div className="text-center md:text-left">
                <span className="block text-xl font-black text-foreground">{profile.stats.pets}</span>
                <span className="text-[11px] font-bold text-muted uppercase tracking-wider">
                  {t("profile.statsPets")}
                </span>
              </div>
              <div className="text-center md:text-left">
                <span className="block text-xl font-black text-foreground">{profile.stats.friends}</span>
                <span className="text-[11px] font-bold text-muted uppercase tracking-wider">
                  {t("profile.statsFriends")}
                </span>
              </div>
              <div className="text-center md:text-left">
                <span className="block text-xl font-black text-foreground">{profile.stats.posts}</span>
                <span className="text-[11px] font-bold text-muted uppercase tracking-wider">
                  {t("profile.statsPosts")}
                </span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="shrink-0 flex flex-col gap-3 w-full md:w-auto">
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
                    variant="secondary"
                    onClick={() => handleDeclineRequest(profile.id)}
                    isLoading={isDeclining}
                    className="w-full rounded-2xl text-sm font-black active:scale-95 transition-transform text-danger hover:bg-danger/5"
                  >
                    {t("friends.cancel")}
                  </Button>
                )}

                {profile.friendship?.status === "PENDING_RECEIVED" && (
                  <div className="flex flex-col gap-2 w-full">
                    <Button
                      variant="primary"
                      onClick={() => handleAcceptRequest(profile.id)}
                      isLoading={isAccepting}
                      className="w-full rounded-2xl text-sm font-black active:scale-95 transition-transform"
                    >
                      {t("friends.accept")}
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => handleDeclineRequest(profile.id)}
                      isLoading={isDeclining}
                      className="w-full rounded-2xl text-sm font-black active:scale-95 transition-transform text-danger hover:bg-danger/5"
                    >
                      {t("friends.decline")}
                    </Button>
                  </div>
                )}

                {profile.friendship?.status === "FRIENDS" && (
                  <Button
                    variant="secondary"
                    onClick={handleUnfriend}
                    isLoading={isUnfriending}
                    className="w-full rounded-2xl text-sm font-black active:scale-95 transition-transform text-danger border-danger/30 hover:bg-danger/5"
                  >
                    {t("friends.unfriend")}
                  </Button>
                )}
              </div>
            )}
          </div>
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

      {/* Tabs navigation */}
      <div className="flex border-b border-border mb-6">
        <button
          onClick={() => setActiveTab("pets")}
          className={`px-5 py-3.5 text-sm font-black transition-all cursor-pointer border-b-2 -mb-[2px] ${
            activeTab === "pets"
              ? "border-primary text-primary"
              : "border-transparent text-muted hover:text-foreground"
          }`}
        >
          {t("profile.petsTab")} ({profile.pets.length})
        </button>

        {isMe && (
          <>
            <button
              onClick={() => setActiveTab("friends")}
              className={`px-5 py-3.5 text-sm font-black transition-all cursor-pointer border-b-2 -mb-[2px] ${
                activeTab === "friends"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted hover:text-foreground"
              }`}
            >
              {t("profile.friendsTab")} ({profile.stats.friends})
            </button>
            <button
              onClick={() => setActiveTab("requests")}
              className={`px-5 py-3.5 text-sm font-black transition-all cursor-pointer border-b-2 -mb-[2px] ${
                activeTab === "requests"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted hover:text-foreground"
              }`}
            >
              {t("profile.requestsTab")} ({(receivedRequests?.length || 0) + (sentRequests?.length || 0)})
            </button>
          </>
        )}
      </div>

      {/* Tab Contents */}
      <div>
        {/* PETS TAB */}
        {activeTab === "pets" && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {profile.pets.length === 0 ? (
              <div className="col-span-full py-16 text-center bg-card border border-border rounded-3xl">
                <span className="text-4xl block mb-2">🐾</span>
                <p className="text-sm font-bold text-muted">{t("pets.noResults")}</p>
                {isMe && (
                  <Button
                    variant="primary"
                    className="mt-4 text-xs rounded-xl"
                    onClick={() => router.push("/my-pets")}
                  >
                    + {t("pets.addPet")}
                  </Button>
                )}
              </div>
            ) : (
              profile.pets.map((pet) => {
                const ageYears = pet.ageMonths != null ? (pet.ageMonths / 12).toFixed(1) : null;
                const petImage = pet.avatarUrl && pet.avatarUrl.startsWith("http")
                  ? pet.avatarUrl
                  : pet.petType === "dog"
                  ? "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=400&auto=format&fit=crop"
                  : "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400&auto=format&fit=crop";

                return (
                  <div
                    key={pet.id}
                    className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => isMe ? router.push(`/my-pets/${pet.id}`) : null}
                  >
                    <div className="relative aspect-square w-full bg-secondary">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={petImage} alt={pet.name} className="w-full h-full object-cover" />
                      <span className="absolute top-3 left-3 text-[11px] font-black bg-primary/95 text-white px-2 py-0.5 rounded-lg shadow-sm">
                        {pet.petType === "dog" ? "🐶" : "🐱"}
                      </span>
                    </div>
                    <div className="p-4">
                      <h4 className="font-black text-base text-foreground leading-tight">{pet.name}</h4>
                      <div className="flex gap-4 mt-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        <span>{pet.gender === "male" ? "♂" : pet.gender === "female" ? "♀" : "?"}</span>
                        <span>•</span>
                        <span>{ageYears ? `${ageYears}y` : "—"}</span>
                        <span>•</span>
                        <span>{pet.weightKg ? `${pet.weightKg}kg` : "—"}</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* FRIENDS TAB */}
        {activeTab === "friends" && isMe && (
          <div className="flex flex-col gap-6">
            {/* Search filter */}
            <div className="max-w-md w-full">
              <TextField
                id="friends-search"
                placeholder={t("friends.searchFriends")}
                value={friendsSearch}
                onChange={(e) => setFriendsSearch(e.target.value)}
                leftIcon={
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-muted"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                }
              />
            </div>

            {/* List */}
            {isFriendsLoading ? (
              <div className="grid md:grid-cols-2 gap-4 animate-pulse">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-20 bg-secondary rounded-2xl" />
                ))}
              </div>
            ) : !friendsData || friendsData.items.length === 0 ? (
              <div className="py-16 text-center bg-card border border-border rounded-3xl">
                <span className="text-4xl block mb-2">🤝</span>
                <p className="text-sm font-bold text-muted">{t("friends.noFriends")}</p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <div className="grid md:grid-cols-2 gap-4">
                  {friendsData.items.map((friend) => {
                    const friendInitials = friend.fullName
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase();

                    return (
                      <div
                        key={friend.id}
                        className="bg-card border border-border rounded-2xl p-4 flex items-center gap-4 hover:border-primary/30 transition-all cursor-pointer shadow-sm"
                        onClick={() => router.push(`/dashboard/profile/${friend.id}`)}
                      >
                        {friend.avatarUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={friend.avatarUrl}
                            alt={friend.fullName}
                            className="w-12 h-12 rounded-full object-cover shrink-0"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-primary/80 to-orange-400 text-white font-black text-sm flex items-center justify-center shrink-0">
                            {friendInitials}
                          </div>
                        )}
                        <div className="flex-grow min-w-0">
                          <h4 className="font-bold text-sm text-foreground truncate">{friend.fullName}</h4>
                          <p className="text-xs text-muted truncate mt-0.5">{friend.email}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Pagination */}
                {friendsData.totalPages > 1 && (
                  <div className="flex items-center justify-center gap-4 border-t border-border/50 pt-4 mt-2">
                    <Button
                      variant="secondary"
                      disabled={friendsPage === 1}
                      onClick={() => setFriendsPage((p) => p - 1)}
                      className="px-3 py-1.5 text-xs rounded-xl"
                    >
                      ←
                    </Button>
                    <span className="text-xs font-bold text-foreground">
                      {friendsPage} / {friendsData.totalPages}
                    </span>
                    <Button
                      variant="secondary"
                      disabled={friendsPage === friendsData.totalPages}
                      onClick={() => setFriendsPage((p) => p + 1)}
                      className="px-3 py-1.5 text-xs rounded-xl"
                    >
                      →
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* FRIEND REQUESTS TAB */}
        {activeTab === "requests" && isMe && (
          <div className="grid md:grid-cols-2 gap-8">
            {/* Received Requests */}
            <div className="flex flex-col gap-4">
              <h3 className="font-black text-base text-foreground flex items-center gap-2">
                📥 {t("friends.receivedTitle")} ({(receivedRequests?.length || 0)})
              </h3>

              {!receivedRequests || receivedRequests.length === 0 ? (
                <div className="p-6 text-center bg-card border border-border rounded-2xl text-xs font-bold text-muted">
                  {t("friends.noReceived")}
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {receivedRequests.map((req) => {
                    const sender = req.sender;
                    if (!sender) return null;
                    const senderInitials = sender.fullName
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase();

                    return (
                      <div
                        key={req.id}
                        className="bg-card border border-border rounded-2xl p-4 flex items-center justify-between gap-4 shadow-sm hover:border-primary/20"
                      >
                        <div
                          className="flex items-center gap-3 min-w-0 cursor-pointer"
                          onClick={() => router.push(`/dashboard/profile/${sender.id}`)}
                        >
                          {sender.avatarUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={sender.avatarUrl}
                              alt={sender.fullName}
                              className="w-10 h-10 rounded-full object-cover shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary/80 to-orange-400 text-white font-black text-xs flex items-center justify-center shrink-0">
                              {senderInitials}
                            </div>
                          )}
                          <div className="min-w-0">
                            <h4 className="font-bold text-xs text-foreground truncate">{sender.fullName}</h4>
                            <p className="text-[10px] text-muted truncate">{sender.email}</p>
                          </div>
                        </div>

                        <div className="flex gap-1.5 shrink-0">
                          <button
                            onClick={() => handleAcceptRequest(sender.id)}
                            className="px-3 py-1.5 bg-primary text-white text-xs font-bold rounded-xl shadow-sm hover:brightness-105 active:scale-95 transition-all cursor-pointer"
                          >
                            {t("friends.accept")}
                          </button>
                          <button
                            onClick={() => handleDeclineRequest(sender.id)}
                            className="px-3 py-1.5 border border-border text-foreground hover:bg-secondary/40 text-xs font-bold rounded-xl active:scale-95 transition-all cursor-pointer text-danger"
                          >
                            {t("friends.decline")}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Sent Requests */}
            <div className="flex flex-col gap-4">
              <h3 className="font-black text-base text-foreground flex items-center gap-2">
                📤 {t("friends.sentTitle")} ({(sentRequests?.length || 0)})
              </h3>

              {!sentRequests || sentRequests.length === 0 ? (
                <div className="p-6 text-center bg-card border border-border rounded-2xl text-xs font-bold text-muted">
                  {t("friends.noSent")}
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {sentRequests.map((req) => {
                    const receiver = req.receiver;
                    if (!receiver) return null;
                    const receiverInitials = receiver.fullName
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase();

                    return (
                      <div
                        key={req.id}
                        className="bg-card border border-border rounded-2xl p-4 flex items-center justify-between gap-4 shadow-sm hover:border-primary/20"
                      >
                        <div
                          className="flex items-center gap-3 min-w-0 cursor-pointer"
                          onClick={() => router.push(`/dashboard/profile/${receiver.id}`)}
                        >
                          {receiver.avatarUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={receiver.avatarUrl}
                              alt={receiver.fullName}
                              className="w-10 h-10 rounded-full object-cover shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary/80 to-orange-400 text-white font-black text-xs flex items-center justify-center shrink-0">
                              {receiverInitials}
                            </div>
                          )}
                          <div className="min-w-0">
                            <h4 className="font-bold text-xs text-foreground truncate">{receiver.fullName}</h4>
                            <p className="text-[10px] text-muted truncate">{receiver.email}</p>
                          </div>
                        </div>

                        <button
                          onClick={() => handleDeclineRequest(receiver.id)}
                          className="px-3 py-1.5 border border-border text-foreground hover:bg-secondary/40 text-xs font-bold rounded-xl active:scale-95 transition-all cursor-pointer text-danger shrink-0"
                        >
                          {t("friends.cancel")}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Toast Notification */}
      <AnimatePresence>
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

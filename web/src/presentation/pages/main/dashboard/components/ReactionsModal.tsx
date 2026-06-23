"use client";
import React, { useState } from "react";
import { Modal } from "@/presentation/components/ui/Modal";
import { useGetPostReactionsQuery } from "@/infrastructure/rtk/api/post.api";
import { useTranslation } from "@/presentation/providers/LanguageProvider";

interface ReactionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  postId: string;
  reactionsCount: number;
  reactionStats: Record<string, number>;
}

export const REACTION_MAP: Record<string, { emoji: string; labelKey: string; colorClass: string; bgClass: string }> = {
  LIKE: { emoji: "👍", labelKey: "posts.like", colorClass: "text-blue-500", bgClass: "bg-blue-500/10" },
  LOVE: { emoji: "❤️", labelKey: "posts.love", colorClass: "text-rose-500", bgClass: "bg-rose-500/10" },
  HAHA: { emoji: "😆", labelKey: "posts.haha", colorClass: "text-amber-500", bgClass: "bg-amber-500/10" },
  WOW: { emoji: "😮", labelKey: "posts.wow", colorClass: "text-amber-500", bgClass: "bg-amber-500/10" },
  SAD: { emoji: "😢", labelKey: "posts.sad", colorClass: "text-sky-500", bgClass: "bg-sky-500/10" },
  ANGRY: { emoji: "😡", labelKey: "posts.angry", colorClass: "text-red-500", bgClass: "bg-red-500/10" },
};

export const ReactionsModal: React.FC<ReactionsModalProps> = ({
  isOpen,
  onClose,
  postId,
  reactionsCount,
  reactionStats,
}) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<string>("ALL");
  const [page, setPage] = useState<number>(1);

  const { data, isLoading } = useGetPostReactionsQuery(
    {
      postId,
      type: activeTab === "ALL" ? undefined : activeTab,
      page,
      limit: 50,
    },
    { skip: !isOpen }
  );

  const tabs = [
    { type: "ALL", label: t("posts.all"), count: reactionsCount, emoji: null },
    ...Object.entries(REACTION_MAP).map(([type, meta]) => ({
      type,
      label: meta.labelKey,
      count: reactionStats[type] || 0,
      emoji: meta.emoji,
      colorClass: meta.colorClass,
    })),
  ].filter((tab) => tab.type === "ALL" || tab.count > 0);

  const handleTabChange = (type: string) => {
    setActiveTab(type);
    setPage(1);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t("posts.reactionsTitle")} maxWidth="md">
      <div className="flex flex-col gap-0 max-h-[65vh]">
        {/* Reaction Tabs — underline style */}
        <div className="flex items-center gap-0 overflow-x-auto scrollbar-none border-b border-border/40 mb-3">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.type;
            const meta = tab.type !== "ALL" ? REACTION_MAP[tab.type] : null;
            return (
              <button
                key={tab.type}
                onClick={() => handleTabChange(tab.type)}
                className={`relative px-4 py-2.5 text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer shrink-0 ${
                  isActive
                    ? `${meta?.colorClass ?? "text-primary"} after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:rounded-full after:bg-current`
                    : "text-muted hover:text-foreground"
                }`}
              >
                {tab.emoji && <span className="text-sm leading-none">{tab.emoji}</span>}
                <span>{tab.type === "ALL" ? tab.label : t(tab.label)}</span>
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${
                    isActive
                      ? `${meta?.bgClass ?? "bg-primary/10"} ${meta?.colorClass ?? "text-primary"}`
                      : "bg-border/50 text-muted"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Reactions List */}
        <div className="flex-1 overflow-y-auto flex flex-col gap-1 min-h-[220px] scrollbar-thin">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="flex items-center gap-3 px-2 py-2.5 rounded-xl animate-pulse">
                <div className="w-10 h-10 rounded-full bg-border/40 shrink-0" />
                <div className="flex flex-col gap-1.5 flex-1">
                  <div className="h-3.5 w-28 bg-border/40 rounded-md" />
                  <div className="h-2.5 w-16 bg-border/30 rounded-md" />
                </div>
                <div className="w-7 h-7 rounded-full bg-border/30 shrink-0" />
              </div>
            ))
          ) : data && data.items.length > 0 ? (
            data.items.map((item) => {
              const reactionMeta = REACTION_MAP[item.type];
              const initials = item.user.fullName
                ? item.user.fullName
                    .split(" ")
                    .map((n: string) => n[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()
                : "US";

              return (
                <div
                  key={item.id}
                  className="flex items-center justify-between px-2 py-2.5 rounded-xl hover:bg-border/20 transition-colors duration-150 group"
                >
                  <div className="flex items-center gap-3">
                    {item.user.avatarUrl ? (
                      <img
                        src={item.user.avatarUrl}
                        alt={item.user.fullName}
                        className="w-10 h-10 rounded-full object-cover border border-border shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm border border-primary/20 shrink-0">
                        {initials}
                      </div>
                    )}
                    <div>
                      <h4 className="font-bold text-sm text-foreground group-hover:text-primary transition-colors leading-snug">
                        {item.user.fullName}
                      </h4>
                      <span className="text-[10px] text-muted block mt-0.5">
                        {new Date(item.createdAt).toLocaleDateString("vi-VN")}
                      </span>
                    </div>
                  </div>

                  {reactionMeta && (
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-base ${reactionMeta.bgClass} shrink-0`}
                      title={t(reactionMeta.labelKey)}
                    >
                      {reactionMeta.emoji}
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="flex flex-col items-center justify-center py-14 text-center">
              <span className="text-4xl mb-2 select-none">🐾</span>
              <p className="text-sm font-bold text-muted">{t("posts.noResultsSearch")}</p>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

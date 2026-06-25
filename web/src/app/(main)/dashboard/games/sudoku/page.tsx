"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/presentation/providers/LanguageProvider";
import { Button } from "@/presentation/components/ui/Button";
import {
  useGetSudokuStagesQuery,
  useGetSudokuLeaderboardQuery,
} from "@/infrastructure/rtk/api/game.api";
import { SudokuStageDto } from "@/application/dto/game.dto";
import SudokuGame from "./components/SudokuGame";

export default function SudokuPage() {
  const { t } = useTranslation();
  const router = useRouter();

  const [selectedStage, setSelectedStage] = useState<SudokuStageDto | null>(null);

  // RTK Query Hooks for selection view
  const { data: stages = [], isLoading: isLoadingStages } = useGetSudokuStagesQuery();
  const { data: leaderboard = [], isFetching: isLoadingLeaderboard } = useGetSudokuLeaderboardQuery();

  // Helper formatting for time on leaderboard
  const formatTime = (secs: number) => {
    const minutes = Math.floor(secs / 60);
    const seconds = secs % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  // Sort stages by stageNumber to guarantee they are progressive
  const sortedStages = [...stages].sort((a, b) => a.stageNumber - b.stageNumber);

  // If a stage is selected, render the game detail in its own view
  if (selectedStage) {
    return (
      <SudokuGame
        stage={selectedStage}
        onBack={() => setSelectedStage(null)}
      />
    );
  }

  // Giao diện Chọn màn chơi (Stage Selection View)
  return (
    <div className="w-full space-y-8 animate-in fade-in duration-500 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-card/60 backdrop-blur-md border border-border p-6 rounded-3xl shadow-xs">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push("/dashboard/games")}
            className="p-3 rounded-2xl text-foreground hover:text-primary hover:bg-secondary/50 active:scale-95 transition-all cursor-pointer border border-border flex items-center justify-center bg-card/45"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" x2="5" y1="12" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
          </button>
          <div>
            <h1 className="text-2xl font-black text-foreground">{t("games.sudoku.title")}</h1>
            <p className="text-xs text-muted-foreground">Vượt qua các màn chơi từ dễ đến khó để rèn luyện trí tuệ</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* List of Stages */}
        <div className="lg:col-span-8 space-y-6">
          <h2 className="text-lg font-black text-foreground flex items-center gap-2">
            <span>🎮 Màn chơi có sẵn</span>
            <span className="text-xs font-medium px-2 py-0.5 rounded bg-primary/10 text-primary">
              {sortedStages.length} màn
            </span>
          </h2>

          {isLoadingStages ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-40 rounded-3xl border border-border bg-card animate-pulse" />
              ))}
            </div>
          ) : sortedStages.length === 0 ? (
            <div className="p-12 text-center border border-border rounded-3xl bg-card/50 text-muted-foreground">
              Không tìm thấy màn chơi nào.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {sortedStages.map((stage) => (
                <div
                  key={stage.id}
                  className="group relative overflow-hidden rounded-3xl border border-border bg-card p-6 flex flex-col justify-between h-44 hover:border-primary/30 hover:shadow-lg transition-all duration-300"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-extrabold text-foreground group-hover:text-primary transition-colors">
                        Màn {stage.stageNumber}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        Độ khó: <span className="uppercase font-bold text-primary">{t(`games.sudoku.${stage.difficulty}`)}</span>
                      </p>
                    </div>

                    {stage.isCompleted ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-wider">
                        🏆 Đã Vượt Qua
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-secondary text-muted-foreground text-[10px] font-black uppercase tracking-wider">
                        Sẵn Sàng
                      </span>
                    )}
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-[10px] text-muted-foreground font-medium">
                      Bảng 9x9 Cổ Điển
                    </span>
                    <Button
                      onClick={() => setSelectedStage(stage)}
                      variant={stage.isCompleted ? "neutral" : "primary"}
                      size="sm"
                      className="rounded-xl font-black text-xs px-4"
                    >
                      {stage.isCompleted ? "Chơi Lại" : "Chinh Phục"}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Leaderboard Column */}
        <div className="lg:col-span-4 bg-card border border-border p-6 rounded-3xl space-y-6 shadow-xs">
          <div className="space-y-1">
            <h2 className="text-lg font-black text-foreground">🏆 Bảng Xếp Hạng</h2>
            <p className="text-xs text-muted-foreground">Những người giải nhanh nhất trên toàn hệ thống</p>
          </div>

          {isLoadingLeaderboard ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 bg-secondary rounded-xl animate-pulse" />
              ))}
            </div>
          ) : leaderboard.length === 0 ? (
            <div className="p-8 text-center text-xs text-muted-foreground">
              Chưa có kỷ lục nào được ghi nhận. Hãy trở thành người đầu tiên!
            </div>
          ) : (
            <div className="divide-y divide-border/50">
              {leaderboard.map((item, index) => {
                const rankIcon = index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : `${index + 1}`;
                return (
                  <div key={item.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                    <div className="flex items-center gap-3">
                      <span className="w-5 text-center text-sm font-black text-foreground">{rankIcon}</span>
                      <div className="w-8 h-8 rounded-full overflow-hidden border border-border bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                        {item.user.avatarUrl ? (
                          <img src={item.user.avatarUrl} alt={item.user.fullName} className="w-full h-full object-cover" />
                        ) : (
                          item.user.fullName.slice(0, 2).toUpperCase()
                        )}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-foreground line-clamp-1">{item.user.fullName}</p>
                        <p className="text-[10px] text-muted-foreground">Màn {item.stage.stageNumber} • {item.mistakes} lỗi</p>
                      </div>
                    </div>
                    <span className="text-xs font-black font-mono text-primary bg-primary/5 px-2.5 py-1 rounded-lg">
                      {formatTime(item.timeTaken)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

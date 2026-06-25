"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useTranslation } from "@/presentation/providers/LanguageProvider";
import { Button } from "@/presentation/components/ui/Button";
import {
  useGetSudokuStageByIdQuery,
  useSubmitSudokuRecordMutation,
} from "@/infrastructure/rtk/api/game.api";
import { SudokuStageDto } from "@/application/dto/game.dto";

type Cell = {
  value: number;
  isOriginal: boolean;
  isError: boolean;
};

interface SudokuGameProps {
  stage: SudokuStageDto;
  onBack: () => void;
}

export default function SudokuGame({ stage, onBack }: SudokuGameProps) {
  const { t } = useTranslation();

  const [board, setBoard] = useState<Cell[][]>([]);
  const [solution, setSolution] = useState<number[][]>([]);
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);
  const [mistakes, setMistakes] = useState(0);
  const [timer, setTimer] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [gameStatus, setGameStatus] = useState<"playing" | "won" | "lost">("playing");
  const [history, setHistory] = useState<{ row: number; col: number; prevValue: number; prevError: boolean }[]>([]);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // RTK Query Hooks
  const { data: stageDetail, isFetching: isLoadingStage } = useGetSudokuStageByIdQuery(stage.id);
  const [submitRecord] = useSubmitSudokuRecordMutation();

  // Load selected stage details into local state
  useEffect(() => {
    if (stageDetail) {
      const initialBoard: Cell[][] = (stageDetail.board as number[][]).map((row) =>
        row.map((val) => ({
          value: val,
          isOriginal: val !== 0,
          isError: false,
        }))
      );
      setBoard(initialBoard);
      setSolution(stageDetail.solution as number[][]);
      setSelectedCell(null);
      setMistakes(0);
      setTimer(0);
      setGameStatus("playing");
      setIsPaused(false);
      setHistory([]);
    }
  }, [stageDetail]);

  // Timer Effect
  useEffect(() => {
    if (gameStatus === "playing" && !isPaused && !isLoadingStage) {
      timerRef.current = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameStatus, isPaused, isLoadingStage]);

  // Submit record when game finishes
  const hasSubmitted = useRef<string | null>(null);
  useEffect(() => {
    if (
      (gameStatus === "won" || gameStatus === "lost") &&
      hasSubmitted.current !== `${stage.id}-${gameStatus}`
    ) {
      hasSubmitted.current = `${stage.id}-${gameStatus}`;
      submitRecord({
        stageId: stage.id,
        timeTaken: timer,
        mistakes,
        status: gameStatus,
      }).catch((err) => console.error("Failed to submit record", err));
    }
  }, [gameStatus, stage.id, timer, mistakes, submitRecord]);

  // Initialize selected stage again (Restart)
  const initGame = () => {
    const initialBoard: Cell[][] = (stageDetail?.board || stage.board as number[][]).map((row) =>
      row.map((val) => ({
        value: val,
        isOriginal: val !== 0,
        isError: false,
      }))
    );
    setBoard(initialBoard);
    setSelectedCell(null);
    setMistakes(0);
    setTimer(0);
    setGameStatus("playing");
    setIsPaused(false);
    setHistory([]);
    hasSubmitted.current = null;
  };

  // Check Game Win Condition
  const checkWin = (currentBoard: Cell[][]) => {
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (currentBoard[r][c].value !== solution[r][c] || currentBoard[r][c].isError) {
          return false;
        }
      }
    }
    return true;
  };

  // Cell Number Input Logic
  const handleNumberInput = useCallback(
    (num: number) => {
      if (!selectedCell || gameStatus !== "playing" || isPaused || isLoadingStage) return;
      const { row, col } = selectedCell;
      const cell = board[row][col];

      if (cell.isOriginal) return;

      const expectedValue = solution[row][col];
      const isCorrect = num === expectedValue;

      // Update Board State
      const newBoard = board.map((r, ri) =>
        r.map((c, ci) => {
          if (ri === row && ci === col) {
            return {
              value: num,
              isOriginal: false,
              isError: !isCorrect,
            };
          }
          return c;
        })
      );

      // Record History for Undo
      setHistory((prev) => [
        ...prev,
        {
          row,
          col,
          prevValue: cell.value,
          prevError: cell.isError,
        },
      ]);

      setBoard(newBoard);

      if (!isCorrect) {
        setMistakes((prev) => {
          const nextMistakes = prev + 1;
          if (nextMistakes >= 3) {
            setGameStatus("lost");
          }
          return nextMistakes;
        });
      } else {
        if (checkWin(newBoard)) {
          setGameStatus("won");
        }
      }
    },
    [selectedCell, board, solution, gameStatus, isPaused, isLoadingStage]
  );

  // Keyboard Event Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= "1" && e.key <= "9") {
        handleNumberInput(parseInt(e.key));
      } else if (e.key === "Backspace" || e.key === "Delete") {
        handleErase();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleNumberInput]);

  // Erase Current Selection
  const handleErase = () => {
    if (!selectedCell || gameStatus !== "playing" || isPaused || isLoadingStage) return;
    const { row, col } = selectedCell;
    const cell = board[row][col];

    if (cell.isOriginal || cell.value === 0) return;

    const newBoard = board.map((r, ri) =>
      r.map((c, ci) => {
        if (ri === row && ci === col) {
          return {
            value: 0,
            isOriginal: false,
            isError: false,
          };
        }
        return c;
      })
    );

    setHistory((prev) => [
      ...prev,
      {
        row,
        col,
        prevValue: cell.value,
        prevError: cell.isError,
      },
    ]);

    setBoard(newBoard);
  };

  // Undo Last Action
  const handleUndo = () => {
    if (history.length === 0 || gameStatus !== "playing" || isPaused || isLoadingStage) return;
    const lastAction = history[history.length - 1];

    const newBoard = board.map((r, ri) =>
      r.map((c, ci) => {
        if (ri === lastAction.row && ci === lastAction.col) {
          return {
            value: lastAction.prevValue,
            isOriginal: false,
            isError: lastAction.prevError,
          };
        }
        return c;
      })
    );

    setBoard(newBoard);
    setHistory((prev) => prev.slice(0, -1));
  };

  // Helper formatting for time
  const formatTime = (secs: number) => {
    const minutes = Math.floor(secs / 60);
    const seconds = secs % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  // Highlights check helpers
  const isHighlightedRelation = (row: number, col: number) => {
    if (!selectedCell) return false;
    const { row: sRow, col: sCol } = selectedCell;

    if (row === sRow || col === sCol) return true;
    if (Math.floor(row / 3) === Math.floor(sRow / 3) && Math.floor(col / 3) === Math.floor(sCol / 3)) return true;

    return false;
  };

  const isSameValue = (value: number) => {
    if (!selectedCell || value === 0) return false;
    const { row, col } = selectedCell;
    return board[row][col].value === value;
  };

  return (
    <div className="max-w-5xl mx-auto w-full space-y-6 animate-in fade-in duration-500 pb-10">
      {/* Game Header */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-card/65 backdrop-blur-md border border-border p-6 rounded-3xl shadow-xs">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-3 rounded-2xl text-foreground hover:text-primary hover:bg-secondary/50 active:scale-95 transition-all cursor-pointer border border-border flex items-center justify-center bg-card/45"
            aria-label="Back to Stage List"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" x2="5" y1="12" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
          </button>
          <div>
            <h1 className="text-xl md:text-2xl font-black text-foreground">
              Sudoku - Màn {stage.stageNumber}
            </h1>
            <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">
              Độ khó: <span className="text-primary">{t(`games.sudoku.${stage.difficulty}`)}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6 bg-card/85 dark:bg-card/75 border border-border/80 px-6 py-2.5 rounded-2xl shadow-xs">
          {/* Mistakes Counter */}
          <div className="flex flex-col items-center">
            <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
              {t("games.sudoku.mistakes")}
            </span>
            <span className="text-xs md:text-sm font-black text-danger">
              {mistakes} / 3
            </span>
          </div>

          <div className="h-6 w-px bg-border"></div>

          {/* Time Counter */}
          <div className="flex flex-col items-center">
            <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
              {t("games.sudoku.timer")}
            </span>
            <span className="text-xs md:text-sm font-black font-mono text-foreground">
              {formatTime(timer)}
            </span>
          </div>
        </div>
      </div>

      {isLoadingStage ? (
        <div className="flex flex-col items-center justify-center py-20 bg-card border border-border rounded-3xl min-h-[400px]">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-sm text-muted-foreground">Đang tải ma trận màn chơi...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center justify-center">
          {/* Sudoku Board Column */}
          <div className="lg:col-span-7 flex flex-col items-center lg:items-end">
            <div className="relative w-full aspect-square max-w-[460px] bg-card border-2 border-foreground rounded-3xl p-1 shadow-md overflow-hidden">
              {/* Pause Screen Overlay */}
              {isPaused && (
                <div className="absolute inset-0 bg-background/95 backdrop-blur-md flex flex-col items-center justify-center gap-4 z-20">
                  <p className="text-lg font-bold text-foreground">Game is Paused</p>
                  <Button onClick={() => setIsPaused(false)} variant="primary" size="md">
                    {t("games.sudoku.resume")}
                  </Button>
                </div>
              )}

              {/* Main Board Grid */}
              <div className="grid grid-cols-9 h-full w-full select-none rounded-[20px] overflow-hidden">
                {board.map((row, rIndex) =>
                  row.map((cell, cIndex) => {
                    const isSelected = selectedCell?.row === rIndex && selectedCell?.col === cIndex;
                    const isRel = isHighlightedRelation(rIndex, cIndex);
                    const isValMatch = isSameValue(cell.value);

                    // Border styles for 3x3 box boundaries
                    const borderRight = (cIndex + 1) % 3 === 0 && cIndex !== 8 ? "border-r-2 border-r-foreground" : "border-r border-r-border/40";
                    const borderBottom = (rIndex + 1) % 3 === 0 && rIndex !== 8 ? "border-b-2 border-b-foreground" : "border-b border-b-border/40";

                    // Grid background colors for highlights
                    let bgClass = "bg-card";
                    if (isSelected) {
                      bgClass = "bg-primary/20 dark:bg-primary/30";
                    } else if (isValMatch) {
                      bgClass = "bg-primary/10 dark:bg-primary/20";
                    } else if (isRel) {
                      bgClass = "bg-secondary/40 dark:bg-secondary/20";
                    }

                    // Number text colors
                    let textClass = "text-foreground font-bold";
                    if (cell.isOriginal) {
                      textClass = "text-foreground font-black font-mono";
                    } else if (cell.isError) {
                      textClass = "text-danger font-bold font-mono animate-pulse";
                    } else if (cell.value !== 0) {
                      textClass = "text-primary font-bold font-mono";
                    }

                    return (
                      <div
                        key={`${rIndex}-${cIndex}`}
                        onClick={() => {
                          if (gameStatus === "playing" && !isPaused) {
                            setSelectedCell({ row: rIndex, col: cIndex });
                          }
                        }}
                        className={`h-full w-full flex items-center justify-center cursor-pointer text-base md:text-lg transition-colors select-none ${borderRight} ${borderBottom} ${bgClass} ${textClass}`}
                      >
                        {cell.value !== 0 ? cell.value : ""}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Game Controls & Keyboard Column */}
          <div className="lg:col-span-5 space-y-6 max-w-[360px] w-full mx-auto lg:mx-0">
            {/* Action Buttons Toolbar */}
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={handleUndo}
                disabled={history.length === 0}
                className="flex flex-col items-center justify-center p-3 rounded-3xl bg-card border border-border text-foreground hover:bg-secondary/50 active:scale-95 transition-all disabled:opacity-40 cursor-pointer"
              >
                <span className="text-lg">⎌</span>
                <span className="text-[10px] font-bold mt-1 text-muted-foreground uppercase">{t("games.sudoku.undo")}</span>
              </button>

              <button
                onClick={handleErase}
                className="flex flex-col items-center justify-center p-3 rounded-3xl bg-card border border-border text-foreground hover:bg-secondary/50 active:scale-95 transition-all cursor-pointer"
              >
                <span className="text-lg">⌫</span>
                <span className="text-[10px] font-bold mt-1 text-muted-foreground uppercase">{t("games.sudoku.erase")}</span>
              </button>

              <button
                onClick={() => setIsPaused((prev) => !prev)}
                className="flex flex-col items-center justify-center p-3 rounded-3xl bg-card border border-border text-foreground hover:bg-secondary/50 active:scale-95 transition-all cursor-pointer"
              >
                <span className="text-lg">{isPaused ? "▶" : "⏸"}</span>
                <span className="text-[10px] font-bold mt-1 text-muted-foreground uppercase">
                  {isPaused ? t("games.sudoku.resume") : t("games.sudoku.pause")}
                </span>
              </button>
            </div>

            {/* NumPad Input */}
            <div className="bg-card border border-border p-5 rounded-3xl space-y-4">
              <h3 className="text-xs uppercase font-bold tracking-wider text-muted-foreground">
                Bàn phím nhập số
              </h3>
              <div className="grid grid-cols-3 gap-2.5">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                  <button
                    key={num}
                    onClick={() => handleNumberInput(num)}
                    className="h-12 flex items-center justify-center text-lg font-black font-mono border border-border rounded-2xl hover:bg-primary/5 hover:border-primary/30 active:scale-95 transition-all cursor-pointer"
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>

            {/* Restart Option */}
            <Button
              onClick={initGame}
              variant="neutral"
              className="w-full py-4 text-xs font-black uppercase tracking-wider text-muted-foreground rounded-3xl"
            >
              🔄 Chơi Lại Từ Đầu
            </Button>
          </div>
        </div>
      )}

      {/* Victory Modal */}
      {gameStatus === "won" && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border p-8 rounded-3xl max-w-sm w-full text-center space-y-5 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center text-3xl mx-auto">
              🏆
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-black text-foreground">{t("games.sudoku.victory")}</h2>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Bạn đã giải quyết thành công <strong>Màn {stage.stageNumber}</strong> ở độ khó <strong className="uppercase text-primary">{t(`games.sudoku.${stage.difficulty}`)}</strong>.
                <br />
                Thời gian: <strong>{formatTime(timer)}</strong>
              </p>
            </div>
            <div className="flex flex-col gap-2 pt-2">
              <Button onClick={onBack} variant="primary" className="w-full">
                Về Danh Sách Màn
              </Button>
              <Button onClick={initGame} variant="neutral" className="w-full">
                {t("games.sudoku.newGame")}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Defeat Modal */}
      {gameStatus === "lost" && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border p-8 rounded-3xl max-w-sm w-full text-center space-y-5 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-danger/10 text-danger rounded-full flex items-center justify-center text-3xl mx-auto">
              ☠️
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-black text-foreground">Trò chơi kết thúc!</h2>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {t("games.sudoku.defeat")}
              </p>
            </div>
            <div className="flex flex-col gap-2 pt-2">
              <Button onClick={onBack} variant="primary" className="w-full">
                Về Danh Sách Màn
              </Button>
              <Button onClick={initGame} variant="neutral" className="w-full">
                Chơi Lại Màn Này
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

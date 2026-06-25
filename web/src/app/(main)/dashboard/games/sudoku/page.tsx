"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/presentation/providers/LanguageProvider";
import { Button } from "@/presentation/components/ui/Button";

type Difficulty = "easy" | "medium" | "hard";
type Cell = {
  value: number;
  isOriginal: boolean;
  isError: boolean;
};

// Simple Sudoku generator & solver using Backtracking
const generateSudoku = (difficulty: Difficulty) => {
  const grid = Array(9)
    .fill(null)
    .map(() => Array(9).fill(0));

  const isValid = (g: number[][], r: number, c: number, val: number) => {
    for (let i = 0; i < 9; i++) {
      if (g[r][i] === val) return false;
      if (g[i][c] === val) return false;
      const boxRow = Math.floor(r / 3) * 3 + Math.floor(i / 3);
      const boxCol = Math.floor(c / 3) * 3 + (i % 3);
      if (g[boxRow][boxCol] === val) return false;
    }
    return true;
  };

  const solve = (g: number[][]): boolean => {
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (g[r][c] === 0) {
          const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9].sort(() => Math.random() - 0.5);
          for (const num of nums) {
            if (isValid(g, r, c, num)) {
              g[r][c] = num;
              if (solve(g)) return true;
              g[r][c] = 0;
            }
          }
          return false;
        }
      }
    }
    return true;
  };

  solve(grid);

  const solution = grid.map((row) => [...row]);

  // Remove cells based on difficulty
  let cellsToRemove = 35;
  if (difficulty === "medium") cellsToRemove = 45;
  if (difficulty === "hard") cellsToRemove = 54;

  const initial = grid.map((row) => [...row]);
  let removed = 0;
  while (removed < cellsToRemove) {
    const r = Math.floor(Math.random() * 9);
    const c = Math.floor(Math.random() * 9);
    if (initial[r][c] !== 0) {
      initial[r][c] = 0;
      removed++;
    }
  }

  return { initial, solution };
};

export default function SudokuPage() {
  const { t } = useTranslation();
  const router = useRouter();

  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [board, setBoard] = useState<Cell[][]>([]);
  const [solution, setSolution] = useState<number[][]>([]);
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);
  const [mistakes, setMistakes] = useState(0);
  const [timer, setTimer] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [gameStatus, setGameStatus] = useState<"playing" | "won" | "lost">("playing");
  const [history, setHistory] = useState<{ row: number; col: number; prevValue: number; prevError: boolean }[]>([]);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize game
  const initGame = useCallback((diff: Difficulty) => {
    const { initial, solution: sol } = generateSudoku(diff);
    const initialBoard: Cell[][] = initial.map((row) =>
      row.map((val) => ({
        value: val,
        isOriginal: val !== 0,
        isError: false,
      }))
    );

    setBoard(initialBoard);
    setSolution(sol);
    setSelectedCell(null);
    setMistakes(0);
    setTimer(0);
    setGameStatus("playing");
    setIsPaused(false);
    setHistory([]);
  }, []);

  useEffect(() => {
    initGame(difficulty);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [initGame, difficulty]);

  // Timer Effect
  useEffect(() => {
    if (gameStatus === "playing" && !isPaused) {
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
  }, [gameStatus, isPaused]);

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
      if (!selectedCell || gameStatus !== "playing" || isPaused) return;
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
    [selectedCell, board, solution, gameStatus, isPaused]
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
    if (!selectedCell || gameStatus !== "playing" || isPaused) return;
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
    if (history.length === 0 || gameStatus !== "playing" || isPaused) return;
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

    // If we undo an error cell, and the error was corrected to another error or empty
    // We shouldn't reduce mistakes count dynamically, mistakes count counts total cumulative incorrect input attempts.

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

    // Check same row, col, or 3x3 box
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
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500 pb-10">
      {/* Game Header */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-card/60 backdrop-blur-md border border-border p-5 rounded-2xl shadow-xs">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push("/dashboard/games")}
            className="p-2.5 rounded-xl text-foreground hover:text-primary hover:bg-secondary/50 active:scale-95 transition-all cursor-pointer border border-border flex items-center justify-center bg-card/45"
            aria-label="Back to Arcade"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" x2="5" y1="12" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
          </button>
          <div>
            <h1 className="text-xl md:text-2xl font-black text-foreground">{t("games.sudoku.title")}</h1>
            <p className="text-xs text-muted-foreground">{t("games.sudoku.howToPlay")}</p>
          </div>
        </div>

        <div className="flex items-center gap-6 bg-card/85 dark:bg-card/75 border border-border/80 px-6 py-2.5 rounded-xl shadow-xs">
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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Sudoku Board Column */}
        <div className="lg:col-span-8 flex flex-col items-center">
          <div className="relative w-full aspect-square max-w-[460px] bg-card border-2 border-foreground rounded-2xl p-1 shadow-md overflow-hidden">
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
            <div className="grid grid-cols-9 h-full w-full select-none">
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
        <div className="lg:col-span-4 space-y-6">
          {/* Difficulty Selector */}
          <div className="bg-card border border-border p-5 rounded-2xl space-y-3">
            <h3 className="text-xs uppercase font-bold tracking-wider text-muted-foreground">
              {t("games.sudoku.difficulty")}
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {(["easy", "medium", "hard"] as Difficulty[]).map((diff) => (
                <button
                  key={diff}
                  onClick={() => {
                    setDifficulty(diff);
                    initGame(diff);
                  }}
                  className={`py-2 px-3 text-xs font-black rounded-xl border transition-all active:scale-95 cursor-pointer uppercase tracking-wider ${
                    difficulty === diff
                      ? "bg-primary border-primary text-primary-foreground shadow-sm"
                      : "border-border hover:bg-secondary/50 text-muted-foreground"
                  }`}
                >
                  {t(`games.sudoku.${diff}`)}
                </button>
              ))}
            </div>
          </div>

          {/* Edit Control Toolbar */}
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={handleUndo}
              disabled={history.length === 0}
              className="flex flex-col items-center justify-center p-3 rounded-2xl bg-card border border-border text-foreground hover:bg-secondary/50 active:scale-95 transition-all disabled:opacity-40 cursor-pointer"
            >
              <span className="text-lg">⎌</span>
              <span className="text-[10px] font-bold mt-1 text-muted-foreground uppercase">{t("games.sudoku.undo")}</span>
            </button>

            <button
              onClick={handleErase}
              className="flex flex-col items-center justify-center p-3 rounded-2xl bg-card border border-border text-foreground hover:bg-secondary/50 active:scale-95 transition-all cursor-pointer"
            >
              <span className="text-lg">⌫</span>
              <span className="text-[10px] font-bold mt-1 text-muted-foreground uppercase">{t("games.sudoku.erase")}</span>
            </button>

            <button
              onClick={() => setIsPaused((prev) => !prev)}
              className="flex flex-col items-center justify-center p-3 rounded-2xl bg-card border border-border text-foreground hover:bg-secondary/50 active:scale-95 transition-all cursor-pointer"
            >
              <span className="text-lg">{isPaused ? "▶" : "⏸"}</span>
              <span className="text-[10px] font-bold mt-1 text-muted-foreground uppercase">
                {isPaused ? t("games.sudoku.resume") : t("games.sudoku.pause")}
              </span>
            </button>
          </div>

          {/* NumPad Input */}
          <div className="bg-card border border-border p-5 rounded-2xl space-y-4">
            <h3 className="text-xs uppercase font-bold tracking-wider text-muted-foreground">
              Input Keyboard
            </h3>
            <div className="grid grid-cols-3 gap-2.5">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                <button
                  key={num}
                  onClick={() => handleNumberInput(num)}
                  className="h-12 flex items-center justify-center text-lg font-black font-mono border border-border rounded-xl hover:bg-primary/5 hover:border-primary/30 active:scale-95 transition-all cursor-pointer"
                >
                  {num}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <Button
            onClick={() => initGame(difficulty)}
            variant="neutral"
            className="w-full py-4 text-xs font-black uppercase tracking-wider text-muted-foreground rounded-2xl"
          >
            🔄 {t("games.sudoku.newGame")}
          </Button>
        </div>
      </div>

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
                You successfully solved the puzzle on <strong className="uppercase text-primary">{difficulty}</strong> mode.
                <br />
                Final time: <strong>{formatTime(timer)}</strong>
              </p>
            </div>
            <div className="flex flex-col gap-2 pt-2">
              <Button onClick={() => initGame(difficulty)} variant="primary" className="w-full">
                {t("games.sudoku.newGame")}
              </Button>
              <Button onClick={() => router.push("/dashboard/games")} variant="neutral" className="w-full">
                Back to Arcade
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
              <h2 className="text-xl font-black text-foreground">Defeat!</h2>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {t("games.sudoku.defeat")}
              </p>
            </div>
            <div className="flex flex-col gap-2 pt-2">
              <Button onClick={() => initGame(difficulty)} variant="primary" className="w-full">
                {t("games.sudoku.newGame")}
              </Button>
              <Button onClick={() => router.push("/dashboard/games")} variant="neutral" className="w-full">
                Back to Arcade
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

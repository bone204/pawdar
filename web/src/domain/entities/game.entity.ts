// Pure domain entities for Game

export interface SudokuStageEntity {
  id: string;
  difficulty: "easy" | "medium" | "hard";
  stageNumber: number;
  board: number[][];
  isCompleted: boolean;
}

export interface SudokuStageDetailEntity {
  id: string;
  difficulty: "easy" | "medium" | "hard";
  stageNumber: number;
  board: number[][];
  solution: number[][];
}

export interface SudokuLeaderboardEntity {
  id: string;
  timeTaken: number;
  mistakes: number;
  createdAt: string;
  user: {
    fullName: string;
    avatarUrl: string | null;
  };
  stage: {
    stageNumber: number;
  };
}

export interface SudokuStageDto {
  id: string;
  difficulty: "easy" | "medium" | "hard";
  stageNumber: number;
  board: number[][];
  isCompleted: boolean;
}

export interface SudokuStageDetailDto {
  id: string;
  difficulty: "easy" | "medium" | "hard";
  stageNumber: number;
  board: number[][];
  solution: number[][];
}

export interface CreateSudokuRecordDto {
  stageId: string;
  timeTaken: number;
  mistakes: number;
  status: "won" | "lost";
}

export interface SudokuLeaderboardDto {
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

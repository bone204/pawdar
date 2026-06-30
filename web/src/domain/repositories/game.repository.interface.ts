import { SudokuStageEntity, SudokuStageDetailEntity, SudokuLeaderboardEntity } from "../entities/game.entity";

export interface IGameRepository {
  getSudokuStages(): Promise<SudokuStageEntity[]>;
  getSudokuStageDetail(id: string): Promise<SudokuStageDetailEntity>;
  createSudokuRecord(stageId: string, timeTaken: number, mistakes: number, status: 'won' | 'lost'): Promise<void>;
  getSudokuLeaderboard(difficulty?: string): Promise<SudokuLeaderboardEntity[]>;
}

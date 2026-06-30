import { IGameRepository } from "../repositories/game.repository.interface";

export class GetSudokuStagesUseCase {
  constructor(private readonly repo: IGameRepository) {}
  execute() { return this.repo.getSudokuStages(); }
}

export class GetSudokuStageDetailUseCase {
  constructor(private readonly repo: IGameRepository) {}
  execute(id: string) { return this.repo.getSudokuStageDetail(id); }
}

export class CreateSudokuRecordUseCase {
  constructor(private readonly repo: IGameRepository) {}
  execute(stageId: string, timeTaken: number, mistakes: number, status: 'won' | 'lost') { return this.repo.createSudokuRecord(stageId, timeTaken, mistakes, status); }
}

export class GetSudokuLeaderboardUseCase {
  constructor(private readonly repo: IGameRepository) {}
  execute(difficulty?: string) { return this.repo.getSudokuLeaderboard(difficulty); }
}

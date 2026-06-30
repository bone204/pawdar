import { IGameRepository } from "@/domain/repositories/game.repository.interface";
import { SudokuStageEntity, SudokuStageDetailEntity, SudokuLeaderboardEntity } from "@/domain/entities/game.entity";
import { gameMapper } from "@/application/mappers/game.mapper";
import { gameApi } from "@/infrastructure/rtk/api/game.api";
import { store } from "@/infrastructure/rtk/store";

export class RtkGameRepository implements IGameRepository {
  async getSudokuStages(): Promise<SudokuStageEntity[]> {
    const res = await store.dispatch(gameApi.endpoints.getSudokuStages.initiate());
    if ("error" in res) throw res.error;
    return gameMapper.toStageEntities(res.data!);
  }

  async getSudokuStageDetail(id: string): Promise<SudokuStageDetailEntity> {
    const res = await store.dispatch(gameApi.endpoints.getSudokuStageById.initiate(id));
    if ("error" in res) throw res.error;
    return gameMapper.toStageDetailEntity(res.data!);
  }

  async createSudokuRecord(stageId: string, timeTaken: number, mistakes: number, status: "won" | "lost"): Promise<void> {
    const res = await store.dispatch(gameApi.endpoints.submitSudokuRecord.initiate({ stageId, timeTaken, mistakes, status }));
    if ("error" in res) throw res.error;
  }

  async getSudokuLeaderboard(difficulty?: string): Promise<SudokuLeaderboardEntity[]> {
    const res = await store.dispatch(gameApi.endpoints.getSudokuLeaderboard.initiate(difficulty || undefined));
    if ("error" in res) throw res.error;
    return gameMapper.toLeaderboardEntities(res.data!);
  }
}

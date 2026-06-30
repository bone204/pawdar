import { SudokuStageDto, SudokuStageDetailDto, SudokuLeaderboardDto } from "../dto/game.dto";
import { SudokuStageEntity, SudokuStageDetailEntity, SudokuLeaderboardEntity } from "../../domain/entities/game.entity";

export const gameMapper = {
  toStageEntity(dto: SudokuStageDto): SudokuStageEntity {
    return {
      id: dto.id,
      difficulty: dto.difficulty,
      stageNumber: dto.stageNumber,
      board: dto.board,
      isCompleted: dto.isCompleted,
    };
  },

  toStageEntities(dtos: SudokuStageDto[]): SudokuStageEntity[] {
    return dtos.map(gameMapper.toStageEntity);
  },

  toStageDetailEntity(dto: SudokuStageDetailDto): SudokuStageDetailEntity {
    return {
      id: dto.id,
      difficulty: dto.difficulty,
      stageNumber: dto.stageNumber,
      board: dto.board,
      solution: dto.solution,
    };
  },

  toLeaderboardEntity(dto: SudokuLeaderboardDto): SudokuLeaderboardEntity {
    return {
      id: dto.id,
      timeTaken: dto.timeTaken,
      mistakes: dto.mistakes,
      createdAt: dto.createdAt,
      user: dto.user,
      stage: dto.stage,
    };
  },

  toLeaderboardEntities(dtos: SudokuLeaderboardDto[]): SudokuLeaderboardEntity[] {
    return dtos.map(gameMapper.toLeaderboardEntity);
  }
};

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateSudokuRecordDto } from '../dto/create-record.dto';
import { ResponseCode } from '../../../common/constants/response-codes';

@Injectable()
export class SudokuService {
  constructor(private readonly prisma: PrismaService) {}

  async findStages(userId: string) {
    const stages = await this.prisma.sudokuStage.findMany({
      orderBy: [
        { stageNumber: 'asc' },
      ],
    });

    const userWonRecords = await this.prisma.sudokuRecord.findMany({
      where: {
        userId,
        status: 'won',
      },
      select: {
        stageId: true,
      },
    });

    const wonStageIds = new Set(userWonRecords.map((r) => r.stageId));

    return stages.map((stage) => ({
      id: stage.id,
      difficulty: stage.difficulty,
      stageNumber: stage.stageNumber,
      board: stage.board,
      isCompleted: wonStageIds.has(stage.id),
    }));
  }

  async findStageById(id: string) {
    const stage = await this.prisma.sudokuStage.findUnique({
      where: { id },
    });

    if (!stage) {
      throw new NotFoundException({
        code: ResponseCode.SUDOKU_STAGE_NOT_FOUND,
        message: `Sudoku stage with id "${id}" not found`,
      });
    }

    return stage;
  }

  async createRecord(userId: string, dto: CreateSudokuRecordDto) {
    await this.findStageById(dto.stageId);

    const record = await this.prisma.sudokuRecord.create({
      data: {
        userId,
        stageId: dto.stageId,
        timeTaken: dto.timeTaken,
        mistakes: dto.mistakes,
        status: dto.status,
      },
      include: {
        stage: {
          select: {
            difficulty: true,
            stageNumber: true,
          },
        },
      },
    });

    return record;
  }

  async getLeaderboard(difficulty?: string) {
    const whereClause: any = {
      status: 'won',
    };

    if (difficulty && difficulty !== 'all') {
      whereClause.stage = {
        difficulty,
      };
    }

    const leaderboard = await this.prisma.sudokuRecord.findMany({
      where: whereClause,
      take: 10,
      orderBy: {
        timeTaken: 'asc',
      },
      include: {
        user: {
          select: {
            fullName: true,
            avatarUrl: true,
          },
        },
        stage: {
          select: {
            stageNumber: true,
          },
        },
      },
    });

    return leaderboard.map((item) => ({
      id: item.id,
      timeTaken: item.timeTaken,
      mistakes: item.mistakes,
      createdAt: item.createdAt,
      user: {
        fullName: item.user.fullName,
        avatarUrl: item.user.avatarUrl,
      },
      stage: {
        stageNumber: item.stage.stageNumber,
      },
    }));
  }
}

import { Controller, Get, Post, Body, Param, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { SudokuService } from '../services/sudoku.service';
import { CreateSudokuRecordDto } from '../dto/create-record.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import type { CurrentUserPayload } from '../../auth/decorators/current-user.decorator';
import { ResponseCode } from '../../../common/constants/response-codes';

@ApiTags('games/sudoku')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('games/sudoku')
export class SudokuController {
  constructor(private readonly sudokuService: SudokuService) {}

  @Get('stages')
  @ApiOperation({ summary: 'Get list of all Sudoku stages with user progress' })
  @ApiResponse({ status: 200, description: 'List of stages retrieved successfully' })
  async getStages(@CurrentUser() user: CurrentUserPayload) {
    const data = await this.sudokuService.findStages(user.id);
    return {
      success: true,
      code: ResponseCode.GET_SUDOKU_STAGES_SUCCESSFUL,
      data,
    };
  }

  @Get('stages/:id')
  @ApiOperation({ summary: 'Get details of a specific Sudoku stage (board & solution)' })
  @ApiResponse({ status: 200, description: 'Stage details retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Stage not found' })
  async getStage(@Param('id') id: string) {
    const data = await this.sudokuService.findStageById(id);
    return {
      success: true,
      code: ResponseCode.GET_SUDOKU_STAGE_DETAIL_SUCCESSFUL,
      data,
    };
  }

  @Post('records')
  @ApiOperation({ summary: 'Submit a new Sudoku record (won/lost stats)' })
  @ApiResponse({ status: 201, description: 'Record created successfully' })
  async createRecord(
    @CurrentUser() user: CurrentUserPayload,
    @Body() createRecordDto: CreateSudokuRecordDto,
  ) {
    const data = await this.sudokuService.createRecord(user.id, createRecordDto);
    return {
      success: true,
      code: ResponseCode.SUBMIT_SUDOKU_RECORD_SUCCESSFUL,
      data,
    };
  }

  @Get('leaderboard')
  @ApiOperation({ summary: 'Get the fastest solved Sudoku records' })
  @ApiResponse({ status: 200, description: 'Leaderboard retrieved successfully' })
  async getLeaderboard(@Query('difficulty') difficulty?: string) {
    const data = await this.sudokuService.getLeaderboard(difficulty);
    return {
      success: true,
      code: ResponseCode.GET_SUDOKU_LEADERBOARD_SUCCESSFUL,
      data,
    };
  }
}

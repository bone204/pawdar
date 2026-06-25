import { IsString, IsInt, IsIn, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSudokuRecordDto {
  @ApiProperty({ description: 'The ID of the Sudoku stage' })
  @IsString()
  stageId: string;

  @ApiProperty({ description: 'Time taken in seconds' })
  @IsInt()
  @Min(0)
  timeTaken: number;

  @ApiProperty({ description: 'Number of mistakes' })
  @IsInt()
  @Min(0)
  mistakes: number;

  @ApiProperty({ description: 'Game resolution status: won or lost' })
  @IsString()
  @IsIn(['won', 'lost'])
  status: string;
}

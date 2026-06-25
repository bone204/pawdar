import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { SudokuController } from './controllers/sudoku.controller';
import { SudokuService } from './services/sudoku.service';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [SudokuController],
  providers: [SudokuService],
  exports: [SudokuService],
})
export class GameModule {}

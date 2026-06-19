import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { BreedController } from './controllers/breed.controller';
import { BreedService } from './services/breed.service';
import { BreedSyncService } from './services/breed-sync.service';
import { BreedRepository } from './repositories/breed.repository';

@Module({
  imports: [PrismaModule],
  controllers: [BreedController],
  providers: [BreedService, BreedSyncService, BreedRepository],
  exports: [BreedService],
})
export class BreedModule {}

import { Module } from '@nestjs/common';
import { EncyclopediaController } from './controllers/encyclopedia.controller';
import { EncyclopediaService } from './services/encyclopedia.service';
import { EncyclopediaRepository } from './repositories/encyclopedia.repository';

@Module({
  controllers: [EncyclopediaController],
  providers: [EncyclopediaService, EncyclopediaRepository],
  exports: [EncyclopediaService],
})
export class EncyclopediaModule {}

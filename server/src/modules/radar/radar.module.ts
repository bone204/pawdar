import { Module } from '@nestjs/common';
import { RadarController } from './controllers/radar.controller';
import { RadarService } from './services/radar.service';
import { RadarRepository } from './repositories/radar.repository';

@Module({
  controllers: [RadarController],
  providers: [RadarService, RadarRepository],
  exports: [RadarService],
})
export class RadarModule {}

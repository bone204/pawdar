import { Module } from '@nestjs/common';
import { HealthModule } from './modules/health/health.module';
import { AuthModule } from './modules/auth/auth.module';
import { EncyclopediaModule } from './modules/encyclopedia/encyclopedia.module';
import { RadarModule } from './modules/radar/radar.module';

@Module({
  imports: [HealthModule, AuthModule, EncyclopediaModule, RadarModule],
  controllers: [],
  providers: [],
})
export class AppModule {}

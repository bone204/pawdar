import { Module } from '@nestjs/common';
import { AuthModule } from './modules/auth/auth.module';
import { PrismaModule } from './modules/prisma/prisma.module';
import { BreedModule } from './modules/breed/breed.module';

@Module({
  imports: [AuthModule, PrismaModule, BreedModule],
  controllers: [],
  providers: [],
})
export class AppModule {}


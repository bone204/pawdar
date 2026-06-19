import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { PetController } from './controllers/pet.controller';
import { PetService } from './services/pet.service';
import { PetRepository } from './repositories/pet.repository';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [PetController],
  providers: [PetService, PetRepository],
  exports: [PetService],
})
export class PetModule {}

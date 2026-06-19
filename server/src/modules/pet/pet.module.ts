import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { PetController } from './controllers/pet.controller';
import { PetGalleryController } from './controllers/pet-gallery.controller';
import { PetService } from './services/pet.service';
import { PetGalleryService } from './services/pet-gallery.service';
import { PetRepository } from './repositories/pet.repository';
import { PetGalleryRepository } from './repositories/pet-gallery.repository';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [PetController, PetGalleryController],
  providers: [PetService, PetGalleryService, PetRepository, PetGalleryRepository],
  exports: [PetService, PetGalleryService],
})
export class PetModule {}

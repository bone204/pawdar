import { Injectable, NotFoundException } from '@nestjs/common';
import { PetGalleryRepository } from '../repositories/pet-gallery.repository';
import { PetService } from './pet.service';
import { CreateGalleryDto } from '../dto/create-gallery.dto';
import { UpdateGalleryDto } from '../dto/update-gallery.dto';
import type { CurrentUserPayload } from '../../auth/decorators/current-user.decorator';
import { ResponseCode } from '../../../common/constants/response-codes';

@Injectable()
export class PetGalleryService {
  constructor(
    private readonly petGalleryRepository: PetGalleryRepository,
    private readonly petService: PetService,
  ) {}

  async create(petId: string, user: CurrentUserPayload, data: CreateGalleryDto) {
    // Verify pet exists and user has permission
    await this.petService.findById(petId, user);
    return this.petGalleryRepository.create(petId, data);
  }

  async findAllByPetId(petId: string, user: CurrentUserPayload) {
    // Verify pet exists and user has permission
    await this.petService.findById(petId, user);
    return this.petGalleryRepository.findAllByPetId(petId);
  }

  async findById(petId: string, id: string, user: CurrentUserPayload) {
    // Verify pet exists and user has permission
    await this.petService.findById(petId, user);

    const galleryItem = await this.petGalleryRepository.findById(id);
    if (!galleryItem || galleryItem.petId !== petId) {
      throw new NotFoundException({
        code: ResponseCode.GALLERY_NOT_FOUND,
        message: 'Gallery image not found',
      });
    }
    return galleryItem;
  }

  async update(petId: string, id: string, user: CurrentUserPayload, data: UpdateGalleryDto) {
    // Verify pet exists, user has permission, and gallery item belongs to pet
    await this.findById(petId, id, user);
    return this.petGalleryRepository.update(id, data);
  }

  async delete(petId: string, id: string, user: CurrentUserPayload) {
    // Verify pet exists, user has permission, and gallery item belongs to pet
    await this.findById(petId, id, user);
    return this.petGalleryRepository.delete(id);
  }
}

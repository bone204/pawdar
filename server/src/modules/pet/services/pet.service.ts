import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PetRepository, PetFindOptions } from '../repositories/pet.repository';
import { CreatePetDto } from '../dto/create-pet.dto';
import { UpdatePetDto } from '../dto/update-pet.dto';
import type { CurrentUserPayload } from '../../auth/decorators/current-user.decorator';
import { ResponseCode } from '../../../common/constants/response-codes';

@Injectable()
export class PetService {
  constructor(private readonly petRepository: PetRepository) {}

  async create(user: CurrentUserPayload, data: CreatePetDto) {
    return this.petRepository.create(user.id, data);
  }

  async findAll(options?: PetFindOptions) {
    return this.petRepository.findAll(options);
  }

  async findMe(user: CurrentUserPayload, options?: PetFindOptions) {
    return this.petRepository.findByUserId(user.id, options);
  }

  async findById(id: string, user: CurrentUserPayload) {
    const pet = await this.petRepository.findById(id);
    if (!pet) {
      throw new NotFoundException({ code: ResponseCode.PET_NOT_FOUND, message: 'Pet not found' });
    }
    if (pet.userId !== user.id && user.role !== 'admin') {
      throw new ForbiddenException({
        code: ResponseCode.FORBIDDEN_PET_ACCESS,
        message: 'You do not have permission to access this pet',
      });
    }
    return pet;
  }

  async update(id: string, user: CurrentUserPayload, data: UpdatePetDto) {
    await this.findById(id, user);
    return this.petRepository.update(id, data);
  }

  async softDelete(id: string, user: CurrentUserPayload) {
    await this.findById(id, user);
    return this.petRepository.softDelete(id);
  }
}

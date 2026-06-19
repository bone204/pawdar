// Mappers for breed: convert between DTOs and Domain Entities

import { BreedEntity } from "@/domain/entities/breed.entity";
import { BreedResponseDto } from "../dto/breed.dto";

export const breedMapper = {
  toEntity(dto: BreedResponseDto): BreedEntity {
    return {
      id: dto.id,
      petType: dto.petType,
      name: dto.name,
      nameEn: dto.nameEn,
      description: dto.description,
      temperament: dto.temperament,
      origin: dto.origin,
      lifeSpan: dto.lifeSpan,
      weightKg: dto.weightKg,
      imageUrl: dto.imageUrl,
      wikipediaUrl: dto.wikipediaUrl,
      isTranslated: dto.isTranslated,
    };
  },

  toEntities(dtos: BreedResponseDto[]): BreedEntity[] {
    return dtos.map(this.toEntity);
  },
};

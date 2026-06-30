import { PetResponseDto } from "../dto/pet.dto";
import { PetEntity } from "../../domain/entities/pet.entity";

export const petMapper = {
  toEntity(dto: PetResponseDto): PetEntity {
    return {
      id: dto.id,
      name: dto.name,
      petType: dto.petType,
      breedId: dto.breedId,
      gender: dto.gender,
      ageMonths: dto.ageMonths,
      weightKg: dto.weightKg,
      description: dto.description,
      avatarUrl: dto.avatarUrl,
      userId: dto.userId,
      createdAt: dto.createdAt,
      updatedAt: dto.updatedAt,
      breed: dto.breed,
    };
  },

  toEntities(dtos: PetResponseDto[]): PetEntity[] {
    return dtos.map(petMapper.toEntity);
  }
};

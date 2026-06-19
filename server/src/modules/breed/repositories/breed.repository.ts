import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Breed } from '@prisma/client';

@Injectable()
export class BreedRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(petType?: string): Promise<Breed[]> {
    return this.prisma.breed.findMany({
      where: petType ? { petType } : undefined,
      orderBy: { nameEn: 'asc' },
    });
  }

  async findById(id: string): Promise<Breed | null> {
    return this.prisma.breed.findUnique({ where: { id } });
  }

  async upsert(data: {
    id: string;
    petType: string;
    nameEn: string;
    descriptionEn?: string | null;
    temperamentEn?: string | null;
    originEn?: string | null;
    lifeSpan?: string | null;
    weightKg?: string | null;
    imageUrl?: string | null;
    wikipediaUrl?: string | null;
  }): Promise<Breed> {
    return this.prisma.breed.upsert({
      where: { id: data.id },
      create: {
        ...data,
        isTranslated: false,
      },
      update: {
        nameEn: data.nameEn,
        descriptionEn: data.descriptionEn,
        temperamentEn: data.temperamentEn,
        originEn: data.originEn,
        lifeSpan: data.lifeSpan,
        weightKg: data.weightKg,
        imageUrl: data.imageUrl,
        wikipediaUrl: data.wikipediaUrl,
      },
    });
  }

  async updateTranslation(
    id: string,
    translation: {
      nameVi: string;
      descriptionVi?: string | null;
      temperamentVi?: string | null;
      originVi?: string | null;
    },
  ): Promise<Breed> {
    return this.prisma.breed.update({
      where: { id },
      data: {
        ...translation,
        isTranslated: true,
      },
    });
  }

  async countUntranslated(): Promise<number> {
    return this.prisma.breed.count({ where: { isTranslated: false } });
  }
}

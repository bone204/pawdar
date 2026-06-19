import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Breed } from '@prisma/client';

@Injectable()
export class BreedRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(options: {
    petType?: string;
    search?: string;
    page: number;
    limit: number;
  }): Promise<{ items: Breed[]; total: number }> {
    const { petType, search, page, limit } = options;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (petType) {
      where.petType = petType;
    }
    if (search) {
      where.OR = [
        { nameEn: { contains: search, mode: 'insensitive' } },
        { nameVi: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.breed.findMany({
        where,
        skip,
        take: limit,
        orderBy: { nameEn: 'asc' },
      }),
      this.prisma.breed.count({ where }),
    ]);

    return { items, total };
  }

  async findById(id: string): Promise<Breed | null> {
    return this.prisma.breed.findUnique({ where: { id } });
  }

  async deleteAll(): Promise<void> {
    await this.prisma.breed.deleteMany({});
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

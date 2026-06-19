import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UserPet } from '@prisma/client';
import { CreatePetDto } from '../dto/create-pet.dto';
import { UpdatePetDto } from '../dto/update-pet.dto';

export interface PetFindOptions {
  petType?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedPets {
  items: UserPet[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Injectable()
export class PetRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, data: CreatePetDto): Promise<UserPet> {
    return this.prisma.userPet.create({
      data: {
        userId,
        name: data.name,
        petType: data.petType,
        breedId: data.breedId,
        gender: data.gender,
        ageMonths: data.ageMonths,
        weightKg: data.weightKg,
        description: data.description,
        avatarUrl: data.avatarUrl,
      },
    });
  }

  async findAll(options: PetFindOptions = {}): Promise<PaginatedPets> {
    const { petType, search, page = 1, limit = 8 } = options;
    const skip = (page - 1) * limit;

    const where: any = { deletedAt: null };
    if (petType) where.petType = petType;
    if (search) {
      where.name = { contains: search, mode: 'insensitive' };
    }

    const [items, total] = await Promise.all([
      this.prisma.userPet.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.userPet.count({ where }),
    ]);

    return { items, total, page, limit, totalPages: Math.max(1, Math.ceil(total / limit)) };
  }

  async findByUserId(userId: string, options: PetFindOptions = {}): Promise<PaginatedPets> {
    const { petType, search, page = 1, limit = 8 } = options;
    const skip = (page - 1) * limit;

    const where: any = { userId, deletedAt: null };
    if (petType) where.petType = petType;
    if (search) {
      where.name = { contains: search, mode: 'insensitive' };
    }

    const [items, total] = await Promise.all([
      this.prisma.userPet.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.userPet.count({ where }),
    ]);

    return { items, total, page, limit, totalPages: Math.max(1, Math.ceil(total / limit)) };
  }

  async findById(id: string): Promise<any | null> {
    return this.prisma.userPet.findFirst({
      where: { id, deletedAt: null },
      include: {
        gallery: {
          orderBy: { capturedAt: 'desc' },
        },
      },
    });
  }

  async update(id: string, data: UpdatePetDto): Promise<UserPet> {
    return this.prisma.userPet.update({
      where: { id },
      data: {
        name: data.name,
        petType: data.petType,
        breedId: data.breedId,
        gender: data.gender,
        ageMonths: data.ageMonths,
        weightKg: data.weightKg,
        description: data.description,
        avatarUrl: data.avatarUrl,
      },
    });
  }

  async softDelete(id: string): Promise<UserPet> {
    return this.prisma.userPet.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}

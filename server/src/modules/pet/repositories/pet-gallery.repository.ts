import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { PetGallery } from '@prisma/client';
import { CreateGalleryDto } from '../dto/create-gallery.dto';
import { UpdateGalleryDto } from '../dto/update-gallery.dto';

@Injectable()
export class PetGalleryRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(petId: string, data: CreateGalleryDto): Promise<PetGallery> {
    return this.prisma.petGallery.create({
      data: {
        petId,
        imageUrl: data.imageUrl,
        description: data.description,
        capturedAt: new Date(data.capturedAt),
      },
    });
  }

  async findAllByPetId(petId: string): Promise<PetGallery[]> {
    return this.prisma.petGallery.findMany({
      where: { petId },
      orderBy: { capturedAt: 'desc' },
    });
  }

  async findById(id: string): Promise<PetGallery | null> {
    return this.prisma.petGallery.findUnique({
      where: { id },
    });
  }

  async update(id: string, data: UpdateGalleryDto): Promise<PetGallery> {
    const updateData: any = {};
    if (data.imageUrl !== undefined) updateData.imageUrl = data.imageUrl;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.capturedAt !== undefined) updateData.capturedAt = new Date(data.capturedAt);

    return this.prisma.petGallery.update({
      where: { id },
      data: updateData,
    });
  }

  async delete(id: string): Promise<PetGallery> {
    return this.prisma.petGallery.delete({
      where: { id },
    });
  }
}

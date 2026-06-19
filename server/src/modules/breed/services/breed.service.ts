import { Injectable, NotFoundException } from '@nestjs/common';
import { BreedRepository } from '../repositories/breed.repository';
import { BreedSyncService } from './breed-sync.service';
import { ResponseCode } from '../../../common/constants/response-codes';

export interface BreedResponseItem {
  id: string;
  petType: string;
  name: string;          // Localized name (VI or EN)
  nameEn: string;        // Always English
  description: string | null;
  temperament: string | null;
  origin: string | null;
  lifeSpan: string | null;
  weightKg: string | null;
  imageUrl: string | null;
  wikipediaUrl: string | null;
  isTranslated: boolean;
}

@Injectable()
export class BreedService {
  constructor(
    private readonly breedRepository: BreedRepository,
    private readonly breedSyncService: BreedSyncService,
  ) {}

  async findAll(options: {
    petType?: string;
    search?: string;
    page: number;
    limit: number;
    lang: 'vi' | 'en';
  }): Promise<{ items: BreedResponseItem[]; total: number; page: number; limit: number }> {
    const { petType, search, page, limit, lang } = options;
    const { items, total } = await this.breedRepository.findAll({
      petType,
      search,
      page,
      limit,
    });
    return {
      items: items.map((b) => this.mapToResponse(b, lang)),
      total,
      page,
      limit,
    };
  }

  async findById(id: string, lang: 'vi' | 'en' = 'vi'): Promise<BreedResponseItem> {
    const breed = await this.breedRepository.findById(id);
    if (!breed) {
      throw new NotFoundException({
        code: ResponseCode.BREED_NOT_FOUND,
        message: `Breed with id "${id}" not found`,
      });
    }
    return this.mapToResponse(breed, lang);
  }

  async syncAll(): Promise<{ cats: number; dogs: number }> {
    return this.breedSyncService.syncAll();
  }

  // ──────────────────────────────────────────────────────────
  // Private: Map DB record to localized response shape
  // ──────────────────────────────────────────────────────────
  private mapToResponse(breed: any, lang: 'vi' | 'en'): BreedResponseItem {
    const useVi = lang === 'vi';
    return {
      id: breed.id,
      petType: breed.petType,
      nameEn: breed.nameEn,
      // Fallback to EN if VI is not yet translated
      name: (useVi ? breed.nameVi : breed.nameEn) ?? breed.nameEn,
      description: (useVi ? breed.descriptionVi : breed.descriptionEn) ?? breed.descriptionEn,
      temperament: (useVi ? breed.temperamentVi : breed.temperamentEn) ?? breed.temperamentEn,
      origin: (useVi ? breed.originVi : breed.originEn) ?? breed.originEn,
      lifeSpan: breed.lifeSpan,
      weightKg: breed.weightKg,
      imageUrl: breed.imageUrl,
      wikipediaUrl: breed.wikipediaUrl,
      isTranslated: breed.isTranslated,
    };
  }
}

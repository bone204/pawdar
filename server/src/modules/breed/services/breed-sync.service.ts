import { Injectable, Logger } from '@nestjs/common';
import { BreedRepository } from '../repositories/breed.repository';
import 'dotenv/config';

interface CatApiBreed {
  id: string;
  name: string;
  description?: string;
  temperament?: string;
  origin?: string;
  life_span?: string;
  weight?: { metric?: string };
  image?: { url?: string };
  wikipedia_url?: string;
}

interface DogApiBreed {
  id: number;
  name: string;
  breed_group?: string;
  temperament?: string;
  origin?: string;
  life_span?: string;
  weight?: { metric?: string };
  image?: { url?: string };
  description?: string;
  bred_for?: string;
  history?: string;
}

@Injectable()
export class BreedSyncService {
  private readonly logger = new Logger(BreedSyncService.name);

  constructor(private readonly breedRepository: BreedRepository) {}

  async syncAll(): Promise<{ cats: number; dogs: number }> {
    const [catsCount, dogsCount] = await Promise.all([
      this.syncCatBreeds(),
      this.syncDogBreeds(),
    ]);
    return { cats: catsCount, dogs: dogsCount };
  }

  // ──────────────────────────────────────────────────────────
  // Private: Sync cat breeds from The Cat API
  // ──────────────────────────────────────────────────────────
  private async syncCatBreeds(): Promise<number> {
    const apiKey = process.env.CAT_API_KEY;
    const headers: Record<string, string> = {};
    if (apiKey) headers['x-api-key'] = apiKey;

    this.logger.log('Fetching cat breeds from The Cat API...');

    let page = 0;
    const limit = 100;
    let totalSynced = 0;
    let hasMore = true;

    while (hasMore) {
      const url = `https://api.thecatapi.com/v1/breeds?limit=${limit}&page=${page}`;
      let breeds: CatApiBreed[] = [];
      try {
        const response = await fetch(url, { headers });
        if (!response.ok) {
          throw new Error(`Cat API error: ${response.status} ${response.statusText}`);
        }
        breeds = await response.json();
      } catch (error) {
        this.logger.warn(`Failed to fetch from Cat API at page ${page}: ${error.message}.`);
        break;
      }

      if (breeds.length === 0) {
        hasMore = false;
        break;
      }

      for (const breed of breeds) {
        await this.breedRepository.upsert({
          id: `cat_${breed.id}`,
          petType: 'cat',
          nameEn: breed.name,
          descriptionEn: breed.description ?? null,
          temperamentEn: breed.temperament ?? null,
          originEn: breed.origin ?? null,
          lifeSpan: breed.life_span ?? null,
          weightKg: breed.weight?.metric ?? null,
          imageUrl: breed.image?.url ?? null,
          wikipediaUrl: breed.wikipedia_url ?? null,
        });
      }

      totalSynced += breeds.length;
      this.logger.log(`Synced page ${page}: ${breeds.length} cat breeds`);

      hasMore = breeds.length === limit;
      page++;
    }

    this.logger.log(`Total cat breeds synced: ${totalSynced}`);
    return totalSynced;
  }

  // ──────────────────────────────────────────────────────────
  // Private: Sync dog breeds from The Dog API (paginated)
  // ──────────────────────────────────────────────────────────
  private async syncDogBreeds(): Promise<number> {
    const apiKey = process.env.DOG_API_KEY;
    const headers: Record<string, string> = {};
    if (apiKey) headers['x-api-key'] = apiKey;

    this.logger.log('Fetching dog breeds from The Dog API...');

    let page = 0;
    const limit = 100;
    let totalSynced = 0;
    let hasMore = true;

    while (hasMore) {
      const url = `https://api.thedogapi.com/v1/breeds?limit=${limit}&page=${page}`;
      const response = await fetch(url, { headers });

      if (!response.ok) {
        throw new Error(`Dog API error: ${response.status} ${response.statusText}`);
      }

      const breeds: DogApiBreed[] = await response.json();

      if (breeds.length === 0) {
        hasMore = false;
        break;
      }

      for (const breed of breeds) {
        // Construct descriptionEn using description, bred_for, or history fallback
        let descriptionEn = breed.description ?? null;
        if (!descriptionEn && breed.bred_for) {
          descriptionEn = `Bred for: ${breed.bred_for}.`;
          if (breed.breed_group) {
            descriptionEn += ` Belongs to the ${breed.breed_group} breed group.`;
          }
        } else if (!descriptionEn && breed.breed_group) {
          descriptionEn = `A dog breed belonging to the ${breed.breed_group} group.`;
        }

        await this.breedRepository.upsert({
          id: `dog_${breed.id}`,
          petType: 'dog',
          nameEn: breed.name,
          descriptionEn,
          temperamentEn: breed.temperament ?? null,
          originEn: breed.origin ?? null,
          lifeSpan: breed.life_span ?? null,
          weightKg: breed.weight?.metric ?? null,
          imageUrl: breed.image?.url ?? null,
          wikipediaUrl: null,
        });
      }

      totalSynced += breeds.length;
      this.logger.log(`Synced page ${page}: ${breeds.length} dog breeds`);

      // Stop if we got fewer than the limit (last page)
      hasMore = breeds.length === limit;
      page++;
    }

    this.logger.log(`Total dog breeds synced: ${totalSynced}`);
    return totalSynced;
  }
}

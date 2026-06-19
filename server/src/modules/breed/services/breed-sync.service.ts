import { Injectable, Logger } from '@nestjs/common';
import { BreedRepository } from '../repositories/breed.repository';
import 'dotenv/config';

interface NinjaDogBreed {
  name: string;
  image_link: string;
  good_with_children: number;
  good_with_other_dogs: number;
  shedding: number;
  grooming: number;
  drooling: number;
  coat_length: number;
  good_with_strangers: number;
  playfulness: number;
  protectiveness: number;
  trainability: number;
  energy: number;
  barking: number;
  min_life_expectancy: number;
  max_life_expectancy: number;
  max_height_male: number;
  max_height_female: number;
  max_weight_male: number;
  max_weight_female: number;
  min_height_male: number;
  min_height_female: number;
  min_weight_male: number;
  min_weight_female: number;
}

interface NinjaCatBreed {
  name: string;
  image_link: string;
  origin?: string;
  length?: string;
  family_friendly: number;
  shedding: number;
  general_health: number;
  playfulness: number;
  children_friendly: number;
  grooming: number;
  intelligence: number;
  other_pets_friendly: number;
  min_weight: number;
  max_weight: number;
  min_life_expectancy: number;
  max_life_expectancy: number;
}

@Injectable()
export class BreedSyncService {
  private readonly logger = new Logger(BreedSyncService.name);

  constructor(private readonly breedRepository: BreedRepository) {}

  async syncAll(): Promise<{ cats: number; dogs: number }> {
    this.logger.log('Starting breed sync process via API Ninjas...');
    
    // Step 1: Delete all existing breed data to start fresh
    this.logger.log('Deleting all current breed records in DB...');
    await this.breedRepository.deleteAll();
    this.logger.log('DB clean complete!');

    // Step 2: Fetch and save new breed records
    const [catsCount, dogsCount] = await Promise.all([
      this.syncCatBreeds(),
      this.syncDogBreeds(),
    ]);

    return { cats: catsCount, dogs: dogsCount };
  }

  // ──────────────────────────────────────────────────────────
  // Private: Sync cat breeds from API Ninjas (/v1/cats)
  // ──────────────────────────────────────────────────────────
  private async syncCatBreeds(): Promise<number> {
    const apiKey = process.env.API_NINJAS_KEY;
    if (!apiKey) {
      this.logger.error('API_NINJAS_KEY is not defined in .env file!');
      return 0;
    }

    this.logger.log('Fetching cat breeds from API Ninjas...');
    let offset = 0;
    let totalSynced = 0;
    let hasMore = true;

    while (hasMore) {
      const url = `https://api.api-ninjas.com/v1/cats?min_weight=1&offset=${offset}`;
      let breeds: NinjaCatBreed[] = [];
      try {
        const response = await fetch(url, {
          headers: { 'X-Api-Key': apiKey },
        });
        if (!response.ok) {
          throw new Error(`API Ninjas Cats error: ${response.status} ${response.statusText}`);
        }
        breeds = await response.json();
      } catch (error) {
        this.logger.error(`Failed to fetch from API Ninjas Cats at offset ${offset}: ${error.message}`);
        break;
      }

      if (!breeds || breeds.length === 0) {
        hasMore = false;
        break;
      }

      for (const breed of breeds) {
        const id = `cat_${breed.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
        
        // Generate description
        const descriptionEn = `An elegant ${breed.name} cat breed originating from ${breed.origin || 'unknown'}. Characteristics: intelligence level ${breed.intelligence}/5, playfulness ${breed.playfulness}/5, grooming need ${breed.grooming}/5, general health score ${breed.general_health}/5.`;
        
        // Generate temperament
        const temperamentEn = `Playful: ${breed.playfulness}/5, Intelligent: ${breed.intelligence}/5, Family Friendly: ${breed.family_friendly}/5`;

        await this.breedRepository.upsert({
          id,
          petType: 'cat',
          nameEn: breed.name,
          descriptionEn,
          temperamentEn,
          originEn: breed.origin ?? null,
          lifeSpan: `${breed.min_life_expectancy} - ${breed.max_life_expectancy} years`,
          weightKg: `${Math.round(breed.min_weight * 0.453592)} - ${Math.round(breed.max_weight * 0.453592)}`, // API Ninjas weight is in lbs, convert to kg
          imageUrl: breed.image_link ?? null,
          wikipediaUrl: `https://en.wikipedia.org/wiki/${encodeURIComponent(breed.name)}`,
        });
      }

      totalSynced += breeds.length;
      this.logger.log(`Synced cats offset ${offset}: ${breeds.length} breeds`);
      
      hasMore = breeds.length === 20;
      offset += breeds.length;
    }

    this.logger.log(`Total cat breeds synced: ${totalSynced}`);
    return totalSynced;
  }

  // ──────────────────────────────────────────────────────────
  // Private: Sync dog breeds from API Ninjas (/v1/dogs)
  // ──────────────────────────────────────────────────────────
  private async syncDogBreeds(): Promise<number> {
    const apiKey = process.env.API_NINJAS_KEY;
    if (!apiKey) {
      this.logger.error('API_NINJAS_KEY is not defined in .env file!');
      return 0;
    }

    this.logger.log('Fetching dog breeds from API Ninjas...');
    let offset = 0;
    let totalSynced = 0;
    let hasMore = true;

    while (hasMore) {
      const url = `https://api.api-ninjas.com/v1/dogs?min_weight=1&offset=${offset}`;
      let breeds: NinjaDogBreed[] = [];
      try {
        const response = await fetch(url, {
          headers: { 'X-Api-Key': apiKey },
        });
        if (!response.ok) {
          throw new Error(`API Ninjas Dogs error: ${response.status} ${response.statusText}`);
        }
        breeds = await response.json();
      } catch (error) {
        this.logger.error(`Failed to fetch from API Ninjas Dogs at offset ${offset}: ${error.message}`);
        break;
      }

      if (!breeds || breeds.length === 0) {
        hasMore = false;
        break;
      }

      for (const breed of breeds) {
        const id = `dog_${breed.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;

        // Generate description
        const descriptionEn = `A wonderful ${breed.name} dog breed. Characteristics: energy level ${breed.energy}/5, playfulness ${breed.playfulness}/5, protectiveness ${breed.protectiveness}/5, barking frequency ${breed.barking}/5.`;

        // Generate temperament
        const temperamentEn = `Playful: ${breed.playfulness}/5, Trainable: ${breed.trainability}/5, Protectiveness: ${breed.protectiveness}/5`;

        // Convert lbs to kg
        const minKg = Math.round(breed.min_weight_male * 0.453592);
        const maxKg = Math.round(breed.max_weight_male * 0.453592);

        await this.breedRepository.upsert({
          id,
          petType: 'dog',
          nameEn: breed.name,
          descriptionEn,
          temperamentEn,
          originEn: null, // API Ninjas Dogs does not have origin
          lifeSpan: `${breed.min_life_expectancy} - ${breed.max_life_expectancy} years`,
          weightKg: `${minKg} - ${maxKg}`,
          imageUrl: breed.image_link ?? null,
          wikipediaUrl: `https://en.wikipedia.org/wiki/${encodeURIComponent(breed.name)}`,
        });
      }

      totalSynced += breeds.length;
      this.logger.log(`Synced dogs offset ${offset}: ${breeds.length} breeds`);

      hasMore = breeds.length === 20;
      offset += breeds.length;
    }

    this.logger.log(`Total dog breeds synced: ${totalSynced}`);
    return totalSynced;
  }
}

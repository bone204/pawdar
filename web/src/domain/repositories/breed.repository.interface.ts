// Repository interface for breeds - domain layer contract

import { BreedEntity } from "../entities/breed.entity";

export interface IBreedRepository {
  getBreeds(options: {
    petType?: string;
    lang?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<{ items: BreedEntity[]; total: number; page: number; limit: number }>;
}

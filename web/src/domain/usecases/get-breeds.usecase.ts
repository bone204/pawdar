// Get breeds use case - single responsibility: retrieve pet breeds

import { IBreedRepository } from "../repositories/breed.repository.interface";
import { BreedEntity } from "../entities/breed.entity";

export class GetBreedsUseCase {
  constructor(private readonly breedRepository: IBreedRepository) {}

  async execute(options: {
    petType?: string;
    lang?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<{ items: BreedEntity[]; total: number; page: number; limit: number }> {
    return this.breedRepository.getBreeds(options);
  }
}

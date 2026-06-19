// Breed repository implementation using RTK Query

import { IBreedRepository } from "@/domain/repositories/breed.repository.interface";
import { BreedEntity } from "@/domain/entities/breed.entity";
import { breedMapper } from "@/application/mappers/breed.mapper";
import { breedApi } from "@/infrastructure/rtk/api/breed.api";
import { store } from "@/infrastructure/rtk/store";

export class RtkBreedRepository implements IBreedRepository {
  async getBreeds(options: {
    petType?: string;
    lang?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<{ items: BreedEntity[]; total: number; page: number; limit: number }> {
    const result = await store.dispatch(
      breedApi.endpoints.getBreeds.initiate(options)
    );

    if ("error" in result) {
      const err = result.error as { code: string; message: string };
      throw new Error(err.code ?? "get_breeds_failed");
    }

    const { items, total, page, limit } = result.data!;
    return {
      items: breedMapper.toEntities(items),
      total,
      page,
      limit,
    };
  }
}

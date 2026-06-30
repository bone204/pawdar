import { IPetRepository } from "@/domain/repositories/pet.repository.interface";
import { PetEntity, PaginatedPetEntity } from "@/domain/entities/pet.entity";
import { petMapper } from "@/application/mappers/pet.mapper";
import { petApi } from "@/infrastructure/rtk/api/pet.api";
import { store } from "@/infrastructure/rtk/store";

export class RtkPetRepository implements IPetRepository {
  async getMyPets(params?: { page?: number; limit?: number; search?: string; petType?: "cat" | "dog" }): Promise<PaginatedPetEntity> {
    const res = await store.dispatch(petApi.endpoints.getPetsMe.initiate(params || {}));
    if ("error" in res) throw res.error;
    return {
      items: petMapper.toEntities(res.data!.items),
      total: res.data!.total,
      page: res.data!.page,
      limit: res.data!.limit,
      totalPages: res.data!.totalPages,
    };
  }

  async getPetById(id: string): Promise<PetEntity> {
    const res = await store.dispatch(petApi.endpoints.getPetById.initiate(id));
    if ("error" in res) throw res.error;
    return petMapper.toEntity(res.data!);
  }

  async createPet(body: Partial<PetEntity>): Promise<PetEntity> {
    const res = await store.dispatch(petApi.endpoints.createPet.initiate(body as any));
    if ("error" in res) throw res.error;
    return petMapper.toEntity(res.data!);
  }

  async updatePet(id: string, body: Partial<PetEntity>): Promise<PetEntity> {
    const res = await store.dispatch(petApi.endpoints.updatePet.initiate({ id, body: body as any }));
    if ("error" in res) throw res.error;
    return petMapper.toEntity(res.data!);
  }

  async deletePet(id: string): Promise<void> {
    const res = await store.dispatch(petApi.endpoints.deletePet.initiate(id));
    if ("error" in res) throw res.error;
  }
}

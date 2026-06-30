import { PetEntity, PaginatedPetEntity } from "../entities/pet.entity";

export interface IPetRepository {
  getMyPets(params?: { page?: number; limit?: number; search?: string; petType?: "cat" | "dog" }): Promise<PaginatedPetEntity>;
  getPetById(id: string): Promise<PetEntity>;
  createPet(body: Partial<PetEntity>): Promise<PetEntity>;
  updatePet(id: string, body: Partial<PetEntity>): Promise<PetEntity>;
  deletePet(id: string): Promise<void>;
}

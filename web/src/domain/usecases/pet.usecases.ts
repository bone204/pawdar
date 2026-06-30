import { IPetRepository } from "../repositories/pet.repository.interface";
import { PetEntity } from "../entities/pet.entity";

export class GetMyPetsUseCase {
  constructor(private readonly repo: IPetRepository) {}
  execute(params?: { page?: number; limit?: number; search?: string; petType?: "cat" | "dog" }) { return this.repo.getMyPets(params); }
}

export class GetPetByIdUseCase {
  constructor(private readonly repo: IPetRepository) {}
  execute(id: string) { return this.repo.getPetById(id); }
}

export class CreatePetUseCase {
  constructor(private readonly repo: IPetRepository) {}
  execute(body: Partial<PetEntity>) { return this.repo.createPet(body); }
}

export class UpdatePetUseCase {
  constructor(private readonly repo: IPetRepository) {}
  execute(id: string, body: Partial<PetEntity>) { return this.repo.updatePet(id, body); }
}

export class DeletePetUseCase {
  constructor(private readonly repo: IPetRepository) {}
  execute(id: string) { return this.repo.deletePet(id); }
}

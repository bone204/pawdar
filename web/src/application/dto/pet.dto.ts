export interface PetResponseDto {
  id: string;
  userId: string;
  name: string;
  breedId?: string | null;
  petType: "cat" | "dog";
  gender: "male" | "female" | "unknown";
  ageMonths?: number | null;
  weightKg?: number | null;
  description?: string | null;
  avatarUrl?: string | null;
  createdAt: string;
  updatedAt: string;
  breed?: {
    id: string;
    name: string;
  } | null;
  gallery?: PetGalleryResponseDto[];
}

export interface PetGalleryResponseDto {
  id: string;
  petId: string;
  imageUrl: string;
  description?: string | null;
  capturedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateGalleryRequestDto {
  petId: string;
  body: {
    imageUrl: string;
    description?: string;
    capturedAt: string;
  };
}

export interface UpdateGalleryRequestDto {
  petId: string;
  id: string;
  body: {
    imageUrl?: string;
    description?: string;
    capturedAt?: string;
  };
}

export interface DeleteGalleryRequestDto {
  petId: string;
  id: string;
}

export interface PaginatedPetResponseDto {
  items: PetResponseDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface GetPetsQueryDto {
  petType?: "cat" | "dog";
  search?: string;
  page?: number;
  limit?: number;
}

export interface CreatePetRequestDto {
  name: string;
  petType: "cat" | "dog";
  breedId?: string;
  gender: "male" | "female" | "unknown";
  ageMonths?: number;
  weightKg?: number;
  description?: string;
  avatarUrl?: string;
}

export interface UpdatePetRequestDto {
  id: string;
  body: Partial<CreatePetRequestDto>;
}

// Pure domain entities for Pet

export interface PetEntity {
  id: string;
  name: string;
  petType: "cat" | "dog";
  breedId?: string | null;
  gender: "male" | "female" | "unknown";
  ageMonths?: number | null;
  weightKg?: number | null;
  description?: string | null;
  avatarUrl?: string | null;
  userId: string;
  createdAt: string;
  updatedAt: string;
  breed?: {
    id: string;
    name: string;
  } | null;
  gallery?: PetGalleryEntity[];
}

export interface PetGalleryEntity {
  id: string;
  petId: string;
  imageUrl: string;
  description?: string | null;
  capturedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedPetEntity {
  items: PetEntity[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

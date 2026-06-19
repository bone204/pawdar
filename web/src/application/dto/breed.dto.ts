// Data Transfer Objects for breed API communication

export interface BreedResponseDto {
  id: string;
  petType: string;
  name: string;
  nameEn: string;
  description: string | null;
  temperament: string | null;
  origin: string | null;
  lifeSpan: string | null;
  weightKg: string | null;
  imageUrl: string | null;
  wikipediaUrl: string | null;
  isTranslated: boolean;
}

export interface GetBreedsQueryDto {
  petType?: string;
  lang?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedBreedResponseDto {
  items: BreedResponseDto[];
  total: number;
  page: number;
  limit: number;
}

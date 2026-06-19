// Pure domain entity for breed

export interface BreedEntity {
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

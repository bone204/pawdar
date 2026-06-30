import { useMemo } from "react";
import { useGetBreedsQuery, useGetBreedByIdQuery } from "@/infrastructure/rtk/api/breed.api";

// We don't have a mapper or entity for Breed defined yet, so we can just use the DTOs directly or map them identically for now.
// For the sake of consistency, let's map them if needed or just return them since the UI expects Breed objects.

export const useBreeds = (params?: { petType?: string; search?: string; page?: number; limit?: number }, skip = false) => {
  const { data, isLoading, error, refetch } = useGetBreedsQuery(params || {}, { skip });
  return { data, isLoading, error, refetch };
};

export const useBreedDetail = (id: string, skip = false) => {
  const { data, isLoading, error } = useGetBreedByIdQuery(id, { skip });
  return { data, isLoading, error };
};

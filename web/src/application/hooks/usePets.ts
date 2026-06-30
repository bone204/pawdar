import { useMemo } from "react";
import { 
  useGetPetsMeQuery, 
  useGetPetByIdQuery, 
  useCreatePetMutation, 
  useUpdatePetMutation, 
  useDeletePetMutation,
  useCreatePetGalleryMutation,
  useUpdatePetGalleryMutation,
  useDeletePetGalleryMutation
} from "@/infrastructure/rtk/api/pet.api";
import { petMapper } from "@/application/mappers/pet.mapper";
import { PetEntity, PetGalleryEntity } from "@/domain/entities/pet.entity";

export const usePets = () => {
  const [createMutation, { isLoading: isCreating }] = useCreatePetMutation();
  const [updateMutation, { isLoading: isUpdating }] = useUpdatePetMutation();
  const [deleteMutation, { isLoading: isDeleting }] = useDeletePetMutation();
  const [createGalleryMutation, { isLoading: isCreatingGallery }] = useCreatePetGalleryMutation();
  const [updateGalleryMutation, { isLoading: isUpdatingGallery }] = useUpdatePetGalleryMutation();
  const [deleteGalleryMutation, { isLoading: isDeletingGallery }] = useDeletePetGalleryMutation();

  const createPet = async (body: Partial<PetEntity>) => {
    const res = await createMutation(body as any).unwrap();
    return petMapper.toEntity(res);
  };

  const updatePet = async (id: string, body: Partial<PetEntity>) => {
    const res = await updateMutation({ id, body: body as any }).unwrap();
    return petMapper.toEntity(res);
  };

  const deletePet = async (id: string) => {
    await deleteMutation(id).unwrap();
  };

  const createPetGallery = async (petId: string, body: Partial<PetGalleryEntity>) => {
    const res = await createGalleryMutation({ petId, body: body as any }).unwrap();
    // Assuming petMapper has a toGalleryEntity, but if not we can return the raw for now.
    return res;
  };

  const updatePetGallery = async (petId: string, id: string, body: Partial<PetGalleryEntity>) => {
    const res = await updateGalleryMutation({ petId, id, body: body as any }).unwrap();
    return res;
  };

  const deletePetGallery = async (petId: string, id: string) => {
    await deleteGalleryMutation({ petId, id }).unwrap();
  };

  return {
    createPet,
    updatePet,
    deletePet,
    createPetGallery,
    updatePetGallery,
    deletePetGallery,
    isCreating,
    isUpdating,
    isDeleting,
    isCreatingGallery,
    isUpdatingGallery,
    isDeletingGallery
  };
};

export const useMyPets = (params?: { page?: number; limit?: number; search?: string; petType?: "cat" | "dog" }) => {
  const { data: dtoData, isLoading, isFetching, error, refetch } = useGetPetsMeQuery(params || {});

  const data = useMemo(() => {
    if (!dtoData) return undefined;
    return {
      items: petMapper.toEntities(dtoData.items),
      total: dtoData.total,
      page: dtoData.page,
      limit: dtoData.limit,
      totalPages: dtoData.totalPages,
    };
  }, [dtoData]);

  return { data, isLoading, isFetching, error, refetch };
};

export const usePetDetail = (id: string, skip = false) => {
  const { data: dto, isLoading, error } = useGetPetByIdQuery(id, { skip });
  const data = useMemo(() => (dto ? petMapper.toEntity(dto) : undefined), [dto]);
  return { data, isLoading, error };
};

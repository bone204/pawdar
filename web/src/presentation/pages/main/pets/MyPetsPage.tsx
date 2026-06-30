"use client";

import React, { useEffect, useState } from "react";
import { useTranslation } from "@/presentation/providers/LanguageProvider";
import { Button } from "@/presentation/components/ui/Button";
import { TextField } from "@/presentation/components/ui/TextField";
import { PlusIcon, EditIcon, TrashIcon } from "@/presentation/components/ui/Icons";
import { usePets, useMyPets, usePetDetail } from "@/application/hooks/usePets";
import { useBreedDetail } from "@/application/hooks/useBreeds";
import { useRouter, useSearchParams } from "next/navigation";
import { PetEntity } from "@/domain/entities/pet.entity";
import { motion, AnimatePresence } from "framer-motion";
import { PetFormModal } from "./modal/PetFormModal";

// ──────────────────────────────────────────────────────────────────────────────
// Delete Confirm Dialog
// ──────────────────────────────────────────────────────────────────────────────

interface DeleteDialogProps {
  isOpen: boolean;
  petName: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading: boolean;
}

const DeleteDialog: React.FC<DeleteDialogProps> = ({ isOpen, petName, onConfirm, onCancel, isLoading }) => {
  const { t } = useTranslation();
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCancel} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.18 }}
        className="relative w-full max-w-sm bg-card border border-border rounded-3xl p-6 shadow-2xl z-10"
      >
        <div className="text-center mb-5">
          <div className="text-4xl mb-3">🗑️</div>
          <h3 className="text-lg font-black text-foreground mb-2">{t("pets.deleteConfirmTitle")}</h3>
          <p className="text-sm text-muted leading-relaxed">
            {t("pets.deleteConfirmDesc").replace("{name}", petName)}
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl border border-border text-sm font-bold text-foreground hover:bg-secondary/40 transition-colors cursor-pointer"
          >
            {t("pets.cancel")}
          </button>
          <Button
            id="confirm-delete-pet"
            variant="primary"
            onClick={onConfirm}
            isLoading={isLoading}
            className="flex-1 bg-danger text-white hover:bg-danger/90 border-danger/10 shadow-none"
          >
            {t("pets.confirmDelete")}
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

// ──────────────────────────────────────────────────────────────────────────────
// Breed Name Renderer
// ──────────────────────────────────────────────────────────────────────────────

const BreedName: React.FC<{ breedId: string }> = ({ breedId }) => {
  const { data, isLoading, error: isError } = useBreedDetail(breedId, !breedId);

  if (isLoading) {
    return <p className="text-xs text-muted mt-0.5 font-medium animate-pulse">Đang tải...</p>;
  }

  if (isError || !data?.name) {
    return <p className="text-xs text-muted mt-0.5 font-medium">{breedId}</p>;
  }

  return <p className="text-xs text-muted mt-0.5 font-medium">{data.name}</p>;
};

// ──────────────────────────────────────────────────────────────────────────────
// Pet Card
// ──────────────────────────────────────────────────────────────────────────────

interface PetCardProps {
  pet: PetEntity;
  onEdit: (pet: PetEntity) => void;
  onDelete: (pet: PetEntity) => void;
  t: (key: string) => string;
}

const PetCard: React.FC<PetCardProps> = ({ pet, onEdit, onDelete, t }) => {
  const router = useRouter();
  const ageYears = pet.ageMonths != null ? (pet.ageMonths / 12).toFixed(1) : null;
  const displayImage = pet.avatarUrl && pet.avatarUrl.startsWith("http")
    ? pet.avatarUrl
    : pet.petType === "dog"
    ? "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=400&auto=format&fit=crop"
    : "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400&auto=format&fit=crop";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8, scale: 0.96 }}
      transition={{ duration: 0.25 }}
      onClick={() => router.push(`/my-pets/${pet.id}`)}
      className="group bg-card border border-border hover:border-primary/40 rounded-3xl overflow-hidden shadow-[0_4px_12px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_30px_rgba(201,109,46,0.07)] dark:hover:shadow-[0_12px_30px_rgba(234,168,94,0.09)] transition-all duration-300 cursor-pointer"
    >
      {/* Image */}
      <div className="relative w-full aspect-square bg-secondary overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={displayImage}
          alt={pet.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {/* Type badge */}
        <span className="absolute top-3 left-3 text-xs font-bold bg-primary/90 text-white px-2.5 py-1 rounded-lg backdrop-blur-sm shadow-sm">
          {pet.petType === "dog" ? "🐶" : "🐱"} {pet.petType === "dog" ? t("pets.typeDog") : t("pets.typeCat")}
        </span>
        {/* Actions overlay */}
        <div className="absolute top-3 right-3 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(pet);
            }}
            className="w-8 h-8 rounded-xl bg-white/90 dark:bg-neutral-800/90 backdrop-blur-sm border border-border/60 flex items-center justify-center text-foreground hover:text-primary hover:border-primary/40 shadow-sm cursor-pointer transition-all active:scale-95"
            title="Edit"
          >
            <EditIcon size={14} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(pet);
            }}
            className="w-8 h-8 rounded-xl bg-white/90 dark:bg-neutral-800/90 backdrop-blur-sm border border-border/60 flex items-center justify-center text-foreground hover:text-danger hover:border-danger/40 shadow-sm cursor-pointer transition-all active:scale-95"
            title="Delete"
          >
            <TrashIcon size={14} />
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col gap-3">
        <div>
          <h3 className="text-lg font-black text-foreground group-hover:text-primary transition-colors leading-tight">
            {pet.name}
          </h3>
          {pet.breedId && <BreedName breedId={pet.breedId} />}
        </div>

        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-secondary/40 rounded-xl py-2 px-1">
            <div className="text-[10px] font-bold uppercase tracking-widest text-muted">
              {t("pets.genderShort")}
            </div>
            <div className="text-xs font-bold text-foreground mt-0.5">
              {pet.gender === "male" ? "♂" : pet.gender === "female" ? "♀" : "?"}
            </div>
          </div>
          <div className="bg-secondary/40 rounded-xl py-2 px-1">
            <div className="text-[10px] font-bold uppercase tracking-widest text-muted">
              {t("pets.ageShort")}
            </div>
            <div className="text-xs font-bold text-foreground mt-0.5">
              {ageYears != null ? `${ageYears}y` : "—"}
            </div>
          </div>
          <div className="bg-secondary/40 rounded-xl py-2 px-1">
            <div className="text-[10px] font-bold uppercase tracking-widest text-muted">
              {t("pets.weightShort")}
            </div>
            <div className="text-xs font-bold text-foreground mt-0.5">
              {pet.weightKg != null ? `${pet.weightKg}kg` : "—"}
            </div>
          </div>
        </div>

        {pet.description && (
          <p className="text-xs text-muted leading-relaxed line-clamp-2">{pet.description}</p>
        )}
      </div>
    </motion.div>
  );
};

// ──────────────────────────────────────────────────────────────────────────────
// Toast
// ──────────────────────────────────────────────────────────────────────────────

interface ToastProps {
  message: string;
  onDismiss: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, onDismiss }) => (
  <motion.div
    initial={{ opacity: 0, y: 20, scale: 0.95 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={{ opacity: 0, y: 20, scale: 0.95 }}
    className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] bg-foreground text-background text-sm font-bold px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 cursor-pointer select-none"
    onClick={onDismiss}
  >
    <span>✓</span>
    {message}
  </motion.div>
);

// ──────────────────────────────────────────────────────────────────────────────
// Main Page Component
// ──────────────────────────────────────────────────────────────────────────────

export const MyPetsPage: React.FC = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const editPetId = searchParams?.get("edit");

  const [petType, setPetType] = useState<"dog" | "cat" | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const limit = 8;

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPet, setEditingPet] = useState<PetEntity | null>(null);
  const [deletingPet, setDeletingPet] = useState<PetEntity | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const { deletePet, isDeleting } = usePets();

  const { data: queriedEditPet } = usePetDetail(editPetId || "", !editPetId);

  // Open modal if edit parameter is present in URL
  useEffect(() => {
    if (editPetId && queriedEditPet) {
      setEditingPet(queriedEditPet);
      setIsFormOpen(true);
    }
  }, [editPetId, queriedEditPet]);

  // Debounce search
  useEffect(() => {
    const h = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1);
    }, 400);
    return () => clearTimeout(h);
  }, [searchQuery]);

  const { data, isFetching, error: isError } = useMyPets({
    petType,
    search: debouncedSearch || undefined,
    page,
    limit,
  });

  const pets = data?.items ?? [];
  const totalPages = data?.totalPages ?? 1;
  const total = data?.total ?? 0;

  const isTotallyEmpty = !isFetching && !isError && total === 0 && !searchQuery && !petType;

  // Check if we have multiple types of pets to show the filter
  const hasMultipleTypes = React.useMemo(() => {
    if (petType !== undefined) return true;
    const hasDog = pets.some((p) => p.petType === "dog");
    const hasCat = pets.some((p) => p.petType === "cat");
    return hasDog && hasCat;
  }, [pets, petType]);

  // Handlers
  const _onFilterChange = (type: "dog" | "cat" | undefined) => {
    setPetType(type);
    setPage(1);
  };

  const _onSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const _onAddPet = () => {
    setEditingPet(null);
    setIsFormOpen(true);
  };

  const _onEditPet = (pet: PetEntity) => {
    setEditingPet(pet);
    setIsFormOpen(true);
  };

  const _onCloseForm = () => {
    setIsFormOpen(false);
    setEditingPet(null);
    if (editPetId) {
      router.replace("/my-pets");
    }
  };

  const _onDeletePet = (pet: PetEntity) => {
    setDeletingPet(pet);
  };

  const _onConfirmDelete = async () => {
    if (!deletingPet) return;
    try {
      await deletePet(deletingPet.id);
      setDeletingPet(null);
      _showToast(t("pets.deleteSuccess"));
    } catch (err) {
      console.error("Delete error", err);
    }
  };

  const _showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const _onPrevPage = () => { if (page > 1) setPage((p) => p - 1); };
  const _onNextPage = () => { if (page < totalPages) setPage((p) => p + 1); };

  return (
    <div className="flex flex-col gap-8 w-full select-none py-2">
      {/* Filter & Search */}
      {!isTotallyEmpty && (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-card border border-border rounded-3xl shadow-[0_4px_12px_rgba(0,0,0,0.01)] transition-colors duration-300">
          <div className="flex flex-col md:flex-row md:items-center gap-4 flex-1">
            <div className="w-full md:max-w-sm">
              <TextField
                id="pet-search"
                placeholder={t("pets.searchPlaceholder")}
                value={searchQuery}
                onChange={_onSearchChange}
                className="w-full rounded-xl"
                leftIcon={
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                }
              />
            </div>
            {hasMultipleTypes && (
              <div className="flex gap-2">
                {([undefined, "dog", "cat"] as const).map((type) => (
                  <Button
                    key={String(type)}
                    variant={petType === type ? "primary" : "secondary"}
                    onClick={() => _onFilterChange(type)}
                    className="rounded-xl px-4 py-2 text-sm font-bold active:scale-95 transition-transform"
                  >
                    {type === undefined ? t("pets.filterAll") : type === "dog" ? t("pets.filterDogs") : t("pets.filterCats")}
                  </Button>
                ))}
              </div>
            )}
          </div>
          <Button
            id="add-pet-btn"
            variant="primary"
            onClick={_onAddPet}
            className="shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm"
          >
            <PlusIcon size={16} />
            {t("pets.addPet")}
          </Button>
        </div>
      )}

      {/* Content */}
      {isFetching ? (
        // Shimmer skeleton
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-card border border-border rounded-3xl overflow-hidden animate-pulse">
              <div className="w-full aspect-square bg-secondary/70" />
              <div className="p-4 flex flex-col gap-3">
                <div className="h-5 bg-secondary/70 rounded-lg w-3/4" />
                <div className="h-3 bg-secondary/50 rounded-lg w-1/2" />
                <div className="grid grid-cols-3 gap-2">
                  {[...Array(3)].map((_, j) => (
                    <div key={j} className="h-12 bg-secondary/50 rounded-xl" />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center justify-center p-16 bg-card border border-border rounded-3xl text-center">
          <span className="text-4xl mb-4">⚠️</span>
          <h3 className="text-lg font-bold text-foreground">{t("pets.errorLoad")}</h3>
        </div>
      ) : pets.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-16 bg-card border border-border rounded-3xl text-center">
          <span className="text-5xl mb-4 select-none">{debouncedSearch || petType ? "🔍" : "🐾"}</span>
          <h3 className="text-lg font-bold text-foreground mb-2">
            {debouncedSearch || petType ? t("pets.noResultsSearch") : t("pets.noResults")}
          </h3>
          {!debouncedSearch && !petType && (
            <Button
              id="empty-add-pet-btn"
              variant="primary"
              onClick={_onAddPet}
              className="mt-4 flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm"
            >
              <PlusIcon size={16} />
              {t("pets.addPet")}
            </Button>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          <AnimatePresence mode="popLayout">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {pets.map((pet) => (
                <PetCard
                  key={pet.id}
                  pet={pet}
                  onEdit={_onEditPet}
                  onDelete={_onDeletePet}
                  t={t}
                />
              ))}
            </div>
          </AnimatePresence>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-6 border-t border-border/60 pt-6 mt-2">
              <Button
                variant="secondary"
                onClick={_onPrevPage}
                disabled={page === 1}
                className="rounded-xl px-4 py-2 text-xs font-bold active:scale-95 transition-transform"
              >
                ← {t("pets.prevPage")}
              </Button>
              <span className="text-xs font-bold text-foreground min-w-[90px] text-center">
                {t("pets.pageIndicator")
                  .replace("{page}", String(page))
                  .replace("{totalPages}", String(totalPages))}
              </span>
              <Button
                variant="secondary"
                onClick={_onNextPage}
                disabled={page === totalPages}
                className="rounded-xl px-4 py-2 text-xs font-bold active:scale-95 transition-transform"
              >
                {t("pets.nextPage")} →
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      <AnimatePresence>
        {isFormOpen && (
          <PetFormModal
            isOpen={isFormOpen}
            editingPet={editingPet}
            onClose={_onCloseForm}
            onSuccess={_showToast}
          />
        )}
        {deletingPet && (
          <DeleteDialog
            isOpen={!!deletingPet}
            petName={deletingPet.name}
            onConfirm={_onConfirmDelete}
            onCancel={() => setDeletingPet(null)}
            isLoading={isDeleting}
          />
        )}
        {toast && <Toast message={toast} onDismiss={() => setToast(null)} />}
      </AnimatePresence>
    </div>
  );
};

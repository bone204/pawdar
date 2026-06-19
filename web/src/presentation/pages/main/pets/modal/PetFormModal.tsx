"use client";

import React, { useEffect, useState } from "react";
import { useTranslation } from "@/presentation/providers/LanguageProvider";
import { Button } from "@/presentation/components/ui/Button";
import { TextField } from "@/presentation/components/ui/TextField";
import { Modal } from "@/presentation/components/ui/Modal";
import {
  useCreatePetMutation,
  useUpdatePetMutation,
} from "@/infrastructure/rtk/api/pet.api";
import { useUploadImageMutation } from "@/infrastructure/rtk/api/upload.api";
import { useGetBreedsQuery } from "@/infrastructure/rtk/api/breed.api";
import type { PetResponseDto, CreatePetRequestDto } from "@/application/dto/pet.dto";

interface PetFormValues {
  name: string;
  petType: "dog" | "cat";
  breedId: string;
  gender: "male" | "female" | "unknown";
  ageMonths: string;
  weightKg: string;
  description: string;
  avatarUrl: string;
}

const EMPTY_FORM: PetFormValues = {
  name: "",
  petType: "dog",
  breedId: "",
  gender: "male",
  ageMonths: "",
  weightKg: "",
  description: "",
  avatarUrl: "",
};

export interface PetFormModalProps {
  isOpen: boolean;
  editingPet: PetResponseDto | null;
  onClose: () => void;
  onSuccess: (msg: string) => void;
}

export const PetFormModal: React.FC<PetFormModalProps> = ({ isOpen, editingPet, onClose, onSuccess }) => {
  const { t } = useTranslation();
  const [createPet, { isLoading: isCreating }] = useCreatePetMutation();
  const [updatePet, { isLoading: isUpdating }] = useUpdatePetMutation();
  const [uploadImage] = useUploadImageMutation();
  const [form, setForm] = useState<PetFormValues>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof PetFormValues, string>>>({});
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const { data: breedsData } = useGetBreedsQuery({
    petType: form.petType,
    limit: 100,
  });

  // Reset breed when changing petType manually
  useEffect(() => {
    if (editingPet) {
      if (form.petType !== editingPet.petType) {
        setForm((prev) => ({ ...prev, breedId: "" }));
      }
    } else {
      setForm((prev) => ({ ...prev, breedId: "" }));
    }
  }, [form.petType]);

  useEffect(() => {
    if (editingPet) {
      setForm({
        name: editingPet.name,
        petType: editingPet.petType,
        breedId: editingPet.breedId ?? "",
        gender: editingPet.gender,
        ageMonths: editingPet.ageMonths != null ? String(editingPet.ageMonths) : "",
        weightKg: editingPet.weightKg != null ? String(editingPet.weightKg) : "",
        description: editingPet.description ?? "",
        avatarUrl: editingPet.avatarUrl ?? "",
      });
      setPreviewUrl(editingPet.avatarUrl ?? "");
    } else {
      setForm(EMPTY_FORM);
      setPreviewUrl("");
    }
    setSelectedFile(null);
    setErrors({});
  }, [editingPet, isOpen]);

  const _onFieldChange = (field: keyof PetFormValues, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const _validate = (): boolean => {
    const newErrors: Partial<Record<keyof PetFormValues, string>> = {};
    if (!form.name.trim()) newErrors.name = t("auth.validation.required");
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const _uploadToCloudinary = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await uploadImage(formData).unwrap();
    return res.url;
  };

  const _onSubmit = async () => {
    if (!_validate()) return;
    setIsUploadingImage(true);
    try {
      let finalAvatarUrl = form.avatarUrl;
      if (selectedFile) {
        finalAvatarUrl = await _uploadToCloudinary(selectedFile);
      }

      const payload: CreatePetRequestDto = {
        name: form.name.trim(),
        petType: form.petType,
        breedId: form.breedId.trim() || undefined,
        gender: form.gender,
        ageMonths: form.ageMonths ? parseFloat(form.ageMonths) : undefined,
        weightKg: form.weightKg ? parseFloat(form.weightKg) : undefined,
        description: form.description.trim() || undefined,
        avatarUrl: finalAvatarUrl.trim() || undefined,
      };

      if (editingPet) {
        await updatePet({ id: editingPet.id, body: payload }).unwrap();
        onSuccess(t("pets.updateSuccess"));
      } else {
        await createPet(payload).unwrap();
        onSuccess(t("pets.createSuccess"));
      }
      onClose();
    } catch (err) {
      console.error("Pet save error", err);
    } finally {
      setIsUploadingImage(false);
    }
  };

  const isLoading = isCreating || isUpdating || isUploadingImage;
  const title = editingPet ? t("pets.editTitle") : t("pets.createTitle");

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="3xl">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        {/* Left Column: Avatar selection (2/5 cols) */}
        <div className="md:col-span-2 flex flex-col gap-4">
          <label className="text-xs font-semibold text-foreground/80 tracking-wide uppercase">Ảnh đại diện</label>
          <div className="relative group border-2 border-dashed border-border hover:border-primary/50 rounded-3xl aspect-square flex flex-col items-center justify-center bg-secondary/20 overflow-hidden cursor-pointer transition-all duration-300">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setSelectedFile(file);
                  setPreviewUrl(URL.createObjectURL(file));
                }
              }}
              className="absolute inset-0 opacity-0 cursor-pointer z-10"
            />
            {previewUrl ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={previewUrl}
                  alt="Pet Preview"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-bold transition-opacity duration-300 pointer-events-none">
                  Thay đổi ảnh 📸
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center text-center p-4 text-muted select-none">
                <div className="text-4xl mb-2">📸</div>
                <span className="text-xs font-bold text-foreground">Chọn ảnh cho bé</span>
                <span className="text-[10px] mt-1 text-muted/80">Hỗ trợ JPG, PNG</span>
              </div>
            )}
          </div>
          {previewUrl && (
            <button
              type="button"
              onClick={() => {
                setSelectedFile(null);
                setPreviewUrl("");
                _onFieldChange("avatarUrl", "");
              }}
              className="text-xs font-bold text-danger hover:underline self-center transition-colors cursor-pointer"
            >
              Xóa ảnh hiện tại
            </button>
          )}
        </div>

        {/* Right Column: Fields (3/5 cols) */}
        <div className="md:col-span-3 flex flex-col gap-4">
          {/* Name */}
          <TextField
            id="pet-name"
            label={t("pets.labelName")}
            value={form.name}
            onChange={(e) => _onFieldChange("name", e.target.value)}
            placeholder="Max"
            error={errors.name}
          />

          {/* Pet Type */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-foreground/80 tracking-wide uppercase">{t("pets.labelType")}</label>
            <div className="grid grid-cols-2 gap-2">
              {(["dog", "cat"] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => _onFieldChange("petType", type)}
                  className={`py-3 rounded-xl border text-sm font-bold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                    form.petType === type
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-background text-muted/80 hover:text-foreground"
                  }`}
                >
                  <span>{type === "dog" ? "🐶" : "🐱"}</span>
                  {type === "dog" ? t("pets.typeDog") : t("pets.typeCat")}
                </button>
              ))}
            </div>
          </div>

          {/* Gender */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-foreground/80 tracking-wide uppercase">{t("pets.labelGender")}</label>
            <div className="grid grid-cols-3 gap-2">
              {(["male", "female", "unknown"] as const).map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => _onFieldChange("gender", g)}
                  className={`py-3 rounded-xl border text-sm font-bold flex items-center justify-center cursor-pointer transition-all ${
                    form.gender === g
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-background text-muted/80 hover:text-foreground"
                  }`}
                >
                  {g === "male" ? t("pets.genderMale") : g === "female" ? t("pets.genderFemale") : t("pets.genderUnknown")}
                </button>
              ))}
            </div>
          </div>

          {/* Breed */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-foreground/80 tracking-wide uppercase select-none">
              {t("pets.labelBreed")}
            </label>
            <select
              id="pet-breed"
              value={form.breedId}
              onChange={(e) => _onFieldChange("breedId", e.target.value)}
              className="w-full px-4 py-3 bg-input border border-border focus:border-primary focus:ring-4 focus:ring-primary/20 text-foreground rounded-xl transition-all duration-300 outline-none cursor-pointer text-sm"
            >
              <option value="">{t("pets.unknownBreed")}</option>
              {form.breedId && !breedsData?.items?.some((b) => b.id === form.breedId) && (
                <option value={form.breedId}>{form.breedId}</option>
              )}
              {breedsData?.items?.map((breed) => (
                <option key={breed.id} value={breed.id}>
                  {breed.name}
                </option>
              ))}
            </select>
          </div>

          {/* Age & Weight */}
          <div className="grid grid-cols-2 gap-3">
            <TextField
              id="pet-age"
              label={t("pets.labelAge")}
              type="number"
              min="0"
              step="1"
              value={form.ageMonths}
              onChange={(e) => _onFieldChange("ageMonths", e.target.value)}
              placeholder="12"
            />
            <TextField
              id="pet-weight"
              label={t("pets.labelWeight")}
              type="number"
              min="0"
              step="0.1"
              value={form.weightKg}
              onChange={(e) => _onFieldChange("weightKg", e.target.value)}
              placeholder="5.5"
            />
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-foreground/80 tracking-wide uppercase">{t("pets.labelDesc")}</label>
            <textarea
              id="pet-desc"
              rows={3}
              value={form.description}
              onChange={(e) => _onFieldChange("description", e.target.value)}
              placeholder="Năng động, thích chơi đùa..."
              className="w-full px-4 py-3 bg-input border border-border focus:border-primary focus:ring-4 focus:ring-primary/20 text-foreground rounded-xl transition-all duration-300 outline-none resize-none text-sm"
            />
          </div>
        </div>
      </div>

      {/* Action Button at the bottom (spans full width) */}
      <div className="mt-6 pt-4 border-t border-border flex justify-end">
        <Button
          id="pet-form-submit"
          variant="primary"
          onClick={_onSubmit}
          isLoading={isLoading}
          className="w-full md:w-auto md:px-8 py-3 rounded-2xl"
        >
          {t("pets.saveChanges")}
        </Button>
      </div>
    </Modal>
  );
};

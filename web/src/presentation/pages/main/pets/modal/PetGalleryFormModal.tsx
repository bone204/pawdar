"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/presentation/components/ui/Button";
import { TextField } from "@/presentation/components/ui/TextField";
import { Modal } from "@/presentation/components/ui/Modal";
import { usePets } from "@/application/hooks/usePets";
import { useUpload } from "@/application/hooks/useUpload";
import { PetGalleryEntity } from "@/domain/entities/pet.entity";

interface PetGalleryFormValues {
  description: string;
  capturedAt: string;
  imageUrl: string;
}

const getTodayString = () => {
  const today = new Date();
  return today.toISOString().split("T")[0];
};

const EMPTY_FORM: PetGalleryFormValues = {
  description: "",
  capturedAt: getTodayString(),
  imageUrl: "",
};

export interface PetGalleryFormModalProps {
  isOpen: boolean;
  petId: string;
  editingImage: PetGalleryEntity | null;
  onClose: () => void;
  onSuccess: (msg: string) => void;
}

export const PetGalleryFormModal: React.FC<PetGalleryFormModalProps> = ({
  isOpen,
  petId,
  editingImage,
  onClose,
  onSuccess,
}) => {
  const { createPetGallery, updatePetGallery, isCreatingGallery: isCreating, isUpdatingGallery: isUpdating } = usePets();
  const { uploadImage } = useUpload();

  const [form, setForm] = useState<PetGalleryFormValues>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof PetGalleryFormValues, string>>>({});
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  useEffect(() => {
    if (editingImage) {
      // capturedAt format for input type="date" must be YYYY-MM-DD
      const dateStr = editingImage.capturedAt
        ? new Date(editingImage.capturedAt).toISOString().split("T")[0]
        : getTodayString();

      setForm({
        description: editingImage.description ?? "",
        capturedAt: dateStr,
        imageUrl: editingImage.imageUrl,
      });
      setPreviewUrl(editingImage.imageUrl);
    } else {
      setForm({
        ...EMPTY_FORM,
        capturedAt: getTodayString(),
      });
      setPreviewUrl("");
    }
    setSelectedFile(null);
    setErrors({});
  }, [editingImage, isOpen]);

  const _onFieldChange = (field: keyof PetGalleryFormValues, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const _validate = (): boolean => {
    const newErrors: Partial<Record<keyof PetGalleryFormValues, string>> = {};
    if (!previewUrl && !selectedFile) {
      newErrors.imageUrl = "Vui lòng chọn hoặc tải ảnh lên";
    }
    if (!form.capturedAt) {
      newErrors.capturedAt = "Vui lòng chọn ngày chụp";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const _uploadToCloudinary = async (file: File): Promise<string> => {
    return await uploadImage(file);
  };

  const _onSubmit = async () => {
    if (!_validate()) return;
    setIsUploadingImage(true);
    try {
      let finalImageUrl = form.imageUrl;
      if (selectedFile) {
        finalImageUrl = await _uploadToCloudinary(selectedFile);
      }

      const body = {
        imageUrl: finalImageUrl,
        description: form.description.trim() || undefined,
        capturedAt: new Date(form.capturedAt).toISOString(),
      };

      if (editingImage) {
        await updatePetGallery(petId, editingImage.id, body);
        onSuccess("Đã cập nhật ảnh thư viện thành công ✨");
      } else {
        await createPetGallery(petId, body);
        onSuccess("Đã thêm ảnh vào thư viện thành công ✨");
      }
      onClose();
    } catch (err) {
      console.error("Gallery save error", err);
    } finally {
      setIsUploadingImage(false);
    }
  };

  const isLoading = isCreating || isUpdating || isUploadingImage;
  const title = editingImage ? "Chỉnh sửa thông tin ảnh" : "Thêm ảnh vào thư viện";

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="2xl">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        {/* Left Column: Image Selection */}
        <div className="md:col-span-2 flex flex-col gap-4">
          <label className="text-xs font-semibold text-foreground/80 tracking-wide uppercase">Bức ảnh</label>
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
              disabled={isLoading}
            />
            {previewUrl ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={previewUrl}
                  alt="Gallery Preview"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-bold transition-opacity duration-300 pointer-events-none">
                  Thay đổi ảnh 📸
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center text-center p-4 text-muted select-none">
                <div className="text-4xl mb-2">📸</div>
                <span className="text-xs font-bold text-foreground">Chọn ảnh</span>
                <span className="text-[10px] mt-1 text-muted/80">Hỗ trợ JPG, PNG</span>
              </div>
            )}
          </div>
          {errors.imageUrl && <p className="text-xs font-bold text-danger mt-1">{errors.imageUrl}</p>}
        </div>

        {/* Right Column: Fields */}
        <div className="md:col-span-3 flex flex-col gap-4">
          {/* Captured At */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-foreground/80 tracking-wide uppercase select-none">
              Ngày chụp
            </label>
            <input
              type="date"
              id="gallery-captured-at"
              value={form.capturedAt}
              onChange={(e) => _onFieldChange("capturedAt", e.target.value)}
              className="w-full px-4 py-3 bg-input border border-border focus:border-primary focus:ring-4 focus:ring-primary/20 text-foreground rounded-xl transition-all duration-300 outline-none cursor-pointer text-sm"
              disabled={isLoading}
            />
            {errors.capturedAt && <p className="text-xs font-bold text-danger mt-1">{errors.capturedAt}</p>}
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-foreground/80 tracking-wide uppercase">Mô tả bức ảnh</label>
            <textarea
              id="gallery-desc"
              rows={4}
              value={form.description}
              onChange={(e) => _onFieldChange("description", e.target.value)}
              placeholder="Bé đang vui chơi ở công viên..."
              className="w-full px-4 py-3 bg-input border border-border focus:border-primary focus:ring-4 focus:ring-primary/20 text-foreground rounded-xl transition-all duration-300 outline-none resize-none text-sm"
              disabled={isLoading}
            />
          </div>
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-border flex justify-end">
        <Button
          id="gallery-form-submit"
          variant="primary"
          onClick={_onSubmit}
          isLoading={isLoading}
          className="w-full md:w-auto md:px-8 py-3 rounded-2xl"
        >
          {editingImage ? "Lưu thay đổi" : "Thêm ảnh"}
        </Button>
      </div>
    </Modal>
  );
};

"use client";

import React, { useEffect, useState } from "react";
import { Modal } from "@/presentation/components/ui/Modal";
import { Button } from "@/presentation/components/ui/Button";
import { TextField } from "@/presentation/components/ui/TextField";
import { useTranslation } from "@/presentation/providers/LanguageProvider";
import { useUploadImageMutation } from "@/infrastructure/rtk/api/upload.api";
import {
  useCreatePostMutation,
  useUpdatePostMutation,
  type PostResponseDto,
} from "@/infrastructure/rtk/api/post.api";

export interface PostFormModalProps {
  isOpen: boolean;
  editingPost: PostResponseDto | null;
  onClose: () => void;
  onSuccess: (msg: string) => void;
}

interface PostFormValues {
  title: string;
  content: string;
  imageUrl: string;
}

const EMPTY_FORM: PostFormValues = {
  title: "",
  content: "",
  imageUrl: "",
};

export const PostFormModal: React.FC<PostFormModalProps> = ({
  isOpen,
  editingPost,
  onClose,
  onSuccess,
}) => {
  const { locale, t } = useTranslation();
  const [createPost, { isLoading: isCreating }] = useCreatePostMutation();
  const [updatePost, { isLoading: isUpdating }] = useUpdatePostMutation();
  const [uploadImage] = useUploadImageMutation();

  const [form, setForm] = useState<PostFormValues>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof PostFormValues, string>>>({});
  const [existingUrls, setExistingUrls] = useState<string[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  
  // AI Moderation error warning state
  const [moderationError, setModerationError] = useState<string | null>(null);

  useEffect(() => {
    if (editingPost) {
      let urls: string[] = [];
      if (editingPost.imageUrl) {
        if (editingPost.imageUrl.startsWith("[")) {
          try {
            urls = JSON.parse(editingPost.imageUrl);
          } catch {
            urls = [editingPost.imageUrl];
          }
        } else {
          urls = editingPost.imageUrl.split(",").filter(Boolean);
        }
      }
      setForm({
        title: editingPost.title,
        content: editingPost.content,
        imageUrl: editingPost.imageUrl ?? "",
      });
      setExistingUrls(urls);
    } else {
      setForm(EMPTY_FORM);
      setExistingUrls([]);
    }
    setSelectedFiles([]);
    setPreviewUrls([]);
    setErrors({});
    setModerationError(null);
  }, [editingPost, isOpen]);

  useEffect(() => {
    if (!isOpen) {
      previewUrls.forEach((url) => URL.revokeObjectURL(url));
    }
  }, [isOpen]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const totalCount = existingUrls.length + selectedFiles.length + files.length;
    if (totalCount > 10) {
      alert(t("posts.maxImagesReached"));
      return;
    }

    const newFiles = [...selectedFiles, ...files];
    setSelectedFiles(newFiles);

    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setPreviewUrls((prev) => [...prev, ...newPreviews]);
    if (moderationError) setModerationError(null);
  };

  const removeExistingImage = (index: number) => {
    setExistingUrls((prev) => prev.filter((_, i) => i !== index));
    if (moderationError) setModerationError(null);
  };

  const removeNewImage = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    URL.revokeObjectURL(previewUrls[index]);
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
    if (moderationError) setModerationError(null);
  };

  const _onFieldChange = (field: keyof PostFormValues, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
    if (moderationError) setModerationError(null); // Clear AI warning when typing
  };

  const _validate = (): boolean => {
    const newErrors: Partial<Record<keyof PostFormValues, string>> = {};
    if (!form.title.trim()) newErrors.title = t("posts.titleRequired");
    if (!form.content.trim()) newErrors.content = t("posts.contentRequired");
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
    setModerationError(null);
    try {
      const uploadPromises = selectedFiles.map((file) => _uploadToCloudinary(file));
      const newUploadedUrls = await Promise.all(uploadPromises);

      const allUrls = [...existingUrls, ...newUploadedUrls];
      const finalImageUrl = allUrls.length > 0 ? JSON.stringify(allUrls) : "";

      const payload = {
        title: form.title.trim(),
        content: form.content.trim(),
        imageUrl: finalImageUrl || undefined,
        lang: locale,
      };

      if (editingPost) {
        await updatePost({ id: editingPost.id, body: payload }).unwrap();
        onSuccess(t("api.codes.update_post_successful"));
      } else {
        await createPost(payload).unwrap();
        onSuccess(t("api.codes.create_post_successful"));
      }
      onClose();
    } catch (err: any) {
      console.error("Post save error", err);
      // Capture AI moderation rejection message
      if (err.code === "post_moderation_failed" || err.data?.error?.code === "post_moderation_failed") {
        setModerationError(err.message || err.data?.error?.message || t("api.codes.post_moderation_failed"));
      } else {
        setModerationError(t("api.codes.unknown_error"));
      }
    } finally {
      setIsUploadingImage(false);
    }
  };

  const isLoading = isCreating || isUpdating || isUploadingImage;
  const modalTitle = editingPost ? t("posts.editTitle") : t("posts.createTitle");

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={modalTitle} maxWidth="2xl">
      <div className="flex flex-col gap-5 select-none">
        
        {/* AI Moderation Warning Alert */}
        {moderationError && (
          <div className="p-4 bg-danger/10 border border-danger/20 rounded-2xl flex items-start gap-3 text-sm text-danger animate-bounce">
            <span className="text-lg">🚨</span>
            <div className="flex-1">
              <h5 className="font-extrabold mb-0.5">{t("posts.moderationFailed")}</h5>
              <p className="font-medium text-xs leading-relaxed">{moderationError}</p>
            </div>
          </div>
        )}

        {/* Title input */}
        <TextField
          id="post-title"
          label={t("posts.postTitleLabel")}
          placeholder={t("posts.postTitlePlaceholder")}
          value={form.title}
          onChange={(e) => _onFieldChange("title", e.target.value)}
          error={errors.title}
        />

        {/* Content input */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="post-content" className="text-xs font-semibold text-foreground/80 tracking-wide uppercase select-none">
            {t("posts.postContentLabel")}
          </label>
          <textarea
            id="post-content"
            rows={5}
            placeholder={t("posts.postContentPlaceholder")}
            value={form.content}
            onChange={(e) => _onFieldChange("content", e.target.value)}
            className={`w-full px-4 py-3 bg-input border ${
              errors.content
                ? "border-danger focus:ring-danger/20"
                : "border-border focus:border-primary focus:ring-primary/20"
            } text-foreground rounded-xl transition-all duration-300 outline-none resize-none focus:ring-4 text-sm`}
          />
          {errors.content && (
            <span className="text-xs text-danger font-medium select-none animate-pulse">
              {errors.content}
            </span>
          )}
        </div>

        {/* Image Attachment Section */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-foreground/80 tracking-wide uppercase">{t("posts.imageLabel")}</label>
          
          {(existingUrls.length > 0 || previewUrls.length > 0) ? (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 border border-border/85 p-3.5 rounded-2xl bg-secondary/10">
              {/* Existing Images */}
              {existingUrls.map((url, idx) => (
                <div key={`existing-${idx}`} className="relative aspect-square rounded-xl overflow-hidden group border border-border/80">
                  <img src={url} alt="Post image" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeExistingImage(idx)}
                    className="absolute top-1.5 right-1.5 bg-black/60 hover:bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-bold transition-all shadow-md cursor-pointer z-10"
                    title="Remove"
                  >
                    ✕
                  </button>
                </div>
              ))}
              {/* New Previews */}
              {previewUrls.map((url, idx) => (
                <div key={`new-${idx}`} className="relative aspect-square rounded-xl overflow-hidden group border border-border/80">
                  <img src={url} alt="Post preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeNewImage(idx)}
                    className="absolute top-1.5 right-1.5 bg-black/60 hover:bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-bold transition-all shadow-md cursor-pointer z-10"
                    title="Remove"
                  >
                    ✕
                  </button>
                </div>
              ))}
              {/* Add more button */}
              {(existingUrls.length + previewUrls.length < 10) && (
                <div className="relative aspect-square rounded-xl border-2 border-dashed border-border hover:border-primary/50 flex flex-col items-center justify-center bg-secondary/20 hover:bg-secondary/30 transition-all cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
                  />
                  <div className="text-xl mb-1 text-muted">➕</div>
                  <span className="text-[10px] font-black text-foreground/80">{t("posts.addMoreImages")}</span>
                </div>
              )}
            </div>
          ) : (
            <div className="relative group border-2 border-dashed border-border hover:border-primary/50 rounded-2xl aspect-video flex flex-col items-center justify-center bg-secondary/20 overflow-hidden cursor-pointer transition-all duration-300">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer z-10"
              />
              <div className="flex flex-col items-center text-center p-4 text-muted select-none">
                <div className="text-3xl mb-1.5">🖼️</div>
                <span className="text-xs font-bold text-foreground">{t("posts.addImage")}</span>
                <span className="text-[10px] mt-0.5 text-muted/80">{t("posts.imageFormats")}</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="mt-4 pt-4 border-t border-border flex justify-end">
          <Button
            id="post-form-submit"
            variant="primary"
            onClick={_onSubmit}
            isLoading={isLoading}
            className="w-full md:w-auto md:px-8 py-3 rounded-2xl"
          >
            {t("posts.submit")}
          </Button>
        </div>

      </div>
    </Modal>
  );
};

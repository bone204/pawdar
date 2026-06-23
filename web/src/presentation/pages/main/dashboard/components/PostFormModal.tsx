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
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  
  // AI Moderation error warning state
  const [moderationError, setModerationError] = useState<string | null>(null);

  useEffect(() => {
    if (editingPost) {
      setForm({
        title: editingPost.title,
        content: editingPost.content,
        imageUrl: editingPost.imageUrl ?? "",
      });
      setPreviewUrl(editingPost.imageUrl ?? "");
    } else {
      setForm(EMPTY_FORM);
      setPreviewUrl("");
    }
    setSelectedFile(null);
    setErrors({});
    setModerationError(null);
  }, [editingPost, isOpen]);

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
      let finalImageUrl = form.imageUrl;
      if (selectedFile) {
        finalImageUrl = await _uploadToCloudinary(selectedFile);
      }

      const payload = {
        title: form.title.trim(),
        content: form.content.trim(),
        imageUrl: finalImageUrl.trim() || undefined,
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
          
          <div className="relative group border-2 border-dashed border-border hover:border-primary/50 rounded-2xl aspect-video flex flex-col items-center justify-center bg-secondary/20 overflow-hidden cursor-pointer transition-all duration-300">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setSelectedFile(file);
                  setPreviewUrl(URL.createObjectURL(file));
                  if (moderationError) setModerationError(null);
                }
              }}
              className="absolute inset-0 opacity-0 cursor-pointer z-10"
            />
            {previewUrl ? (
              <>
                <img
                  src={previewUrl}
                  alt="Post Attachment Preview"
                  className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-bold transition-opacity duration-300 pointer-events-none">
                  {t("posts.changeImage")}
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center text-center p-4 text-muted select-none">
                <div className="text-3xl mb-1.5">🖼️</div>
                <span className="text-xs font-bold text-foreground">{t("posts.addImage")}</span>
                <span className="text-[10px] mt-0.5 text-muted/80">{t("posts.imageFormats")}</span>
              </div>
            )}
          </div>

          {previewUrl && (
            <button
              type="button"
              onClick={() => {
                setSelectedFile(null);
                setPreviewUrl("");
                _onFieldChange("imageUrl", "");
              }}
              className="text-xs font-bold text-danger hover:underline self-center transition-colors cursor-pointer mt-1"
            >
              {t("posts.removeImage")}
            </button>
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

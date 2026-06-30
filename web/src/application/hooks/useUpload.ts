import { useUploadImageMutation } from "@/infrastructure/rtk/api/upload.api";

export const useUpload = () => {
  const [uploadMutation, { isLoading: isUploading }] = useUploadImageMutation();

  const uploadImage = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await uploadMutation(formData).unwrap();
    return res.url;
  };

  return { uploadImage, isUploading };
};

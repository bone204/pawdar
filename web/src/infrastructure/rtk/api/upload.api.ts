import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithAuth } from "@/infrastructure/http/base-query";
import { API_ENDPOINTS } from "@/infrastructure/api/endpoints";

export const uploadApi = createApi({
  reducerPath: "uploadApi",
  baseQuery: baseQueryWithAuth,
  endpoints: (builder) => ({
    uploadImage: builder.mutation<{ url: string }, FormData>({
      query: (body) => ({
        url: API_ENDPOINTS.upload.image,
        method: "POST",
        body,
      }),
    }),
  }),
});

export const { useUploadImageMutation } = uploadApi;

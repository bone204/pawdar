// Redux store configuration

import { configureStore } from "@reduxjs/toolkit";
import { authApi } from "@/infrastructure/rtk/api/auth.api";
import { breedApi } from "@/infrastructure/rtk/api/breed.api";
import { petApi } from "@/infrastructure/rtk/api/pet.api";
import { uploadApi } from "@/infrastructure/rtk/api/upload.api";
import authReducer from "@/infrastructure/rtk/auth.slice";

export const store = configureStore({
  reducer: {
    [authApi.reducerPath]: authApi.reducer,
    [breedApi.reducerPath]: breedApi.reducer,
    [petApi.reducerPath]: petApi.reducer,
    [uploadApi.reducerPath]: uploadApi.reducer,
    auth: authReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      authApi.middleware,
      breedApi.middleware,
      petApi.middleware,
      uploadApi.middleware
    ),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

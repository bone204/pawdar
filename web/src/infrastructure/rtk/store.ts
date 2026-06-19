// Redux store configuration

import { configureStore } from "@reduxjs/toolkit";
import { authApi } from "@/infrastructure/rtk/api/auth.api";
import { breedApi } from "@/infrastructure/rtk/api/breed.api";
import authReducer from "@/infrastructure/rtk/auth.slice";

export const store = configureStore({
  reducer: {
    [authApi.reducerPath]: authApi.reducer,
    [breedApi.reducerPath]: breedApi.reducer,
    auth: authReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(authApi.middleware, breedApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

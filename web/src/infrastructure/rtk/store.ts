// Redux store configuration

import { configureStore } from "@reduxjs/toolkit";
import { authApi } from "@/infrastructure/rtk/api/auth.api";
import { breedApi } from "@/infrastructure/rtk/api/breed.api";
import { petApi } from "@/infrastructure/rtk/api/pet.api";
import { uploadApi } from "@/infrastructure/rtk/api/upload.api";
import { postApi } from "@/infrastructure/rtk/api/post.api";
import { userApi } from "@/infrastructure/rtk/api/user.api";
import { notificationApi } from "@/infrastructure/rtk/api/notification.api";
import { gameApi } from "@/infrastructure/rtk/api/game.api";
import { chatApi } from "@/infrastructure/rtk/api/chat.api";
import authReducer from "@/infrastructure/rtk/auth.slice";

export const store = configureStore({
  reducer: {
    [authApi.reducerPath]: authApi.reducer,
    [breedApi.reducerPath]: breedApi.reducer,
    [petApi.reducerPath]: petApi.reducer,
    [uploadApi.reducerPath]: uploadApi.reducer,
    [postApi.reducerPath]: postApi.reducer,
    [userApi.reducerPath]: userApi.reducer,
    [notificationApi.reducerPath]: notificationApi.reducer,
    [gameApi.reducerPath]: gameApi.reducer,
    [chatApi.reducerPath]: chatApi.reducer,
    auth: authReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      authApi.middleware,
      breedApi.middleware,
      petApi.middleware,
      uploadApi.middleware,
      postApi.middleware,
      userApi.middleware,
      notificationApi.middleware,
      gameApi.middleware,
      chatApi.middleware
    ),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

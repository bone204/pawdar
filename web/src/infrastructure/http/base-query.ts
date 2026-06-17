import { BaseQueryFn, FetchArgs, FetchBaseQueryError, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_ENDPOINTS } from "@/infrastructure/api/endpoints";
import { setAuthenticatedSession, clearAuthState } from "@/infrastructure/rtk/auth.slice";
import { env } from "@/shared/config/env";
import { RootState } from "@/infrastructure/rtk/store";
import { ApiSuccessResponse } from "@/application/dto/auth.dto";

// Create raw query with automatic Authorization header and credentials: "include" for HTTP-only cookies
export const rawBaseQuery = fetchBaseQuery({
  baseUrl: env.apiBaseUrl,
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth?.accessToken;
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    headers.set("Content-Type", "application/json");
    return headers;
  },
  credentials: "include",
});

// Mutex for preventing multiple refresh calls simultaneously
let isRefreshing = false;
type RefreshCallback = (success: boolean) => void;
let refreshSubscribers: RefreshCallback[] = [];

const subscribeTokenRefresh = (cb: RefreshCallback) => {
  refreshSubscribers.push(cb);
};

const onTokenRefreshed = (success: boolean) => {
  refreshSubscribers.forEach((cb) => cb(success));
  refreshSubscribers = [];
};

const refreshAccessToken = async (
  api: Parameters<BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError>>[1],
  extraOptions: Parameters<BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError>>[2],
): Promise<boolean> => {
  try {
    const refreshResult = await rawBaseQuery(
      {
        url: API_ENDPOINTS.auth.refresh,
        method: "POST",
      },
      api,
      extraOptions,
    );

    if (refreshResult.data) {
      const envelope = refreshResult.data as ApiSuccessResponse<{ accessToken: string }>;
      const state = api.getState() as RootState;
      
      let user = state.auth?.user;
      if (!user) {
        // Fallback to localStorage if state is not hydrated yet
        const savedUser = localStorage.getItem("pawdar-user");
        if (savedUser) {
          try {
            user = JSON.parse(savedUser);
          } catch (e) {
            // Ignored
          }
        }
      }

      if (user) {
        api.dispatch(
          setAuthenticatedSession({
            accessToken: envelope.data.accessToken,
            user,
          }),
        );
        return true;
      }
    }
  } catch (error) {
    console.error("Token refresh failed", error);
  }

  api.dispatch(clearAuthState());
  return false;
};

export const baseQueryWithAuth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions,
) => {
  let result = await rawBaseQuery(args, api, extraOptions);

  // If unauthorized error, try to refresh token
  if (result.error && result.error.status === 401) {
    if (!isRefreshing) {
      isRefreshing = true;
      const success = await refreshAccessToken(api, extraOptions);
      isRefreshing = false;
      onTokenRefreshed(success);

      if (success) {
        result = await rawBaseQuery(args, api, extraOptions);
      }
    } else {
      // Wait for refresh to complete, then retry
      const success = await new Promise<boolean>((resolve) => {
        subscribeTokenRefresh((success) => resolve(success));
      });
      if (success) {
        result = await rawBaseQuery(args, api, extraOptions);
      }
    }
  }

  return result;
};

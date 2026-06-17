"use client";

import React, { useEffect, useState } from "react";
import { Provider, useDispatch } from "react-redux";
import { store } from "@/infrastructure/rtk/store";
import { useRefreshMutation } from "@/infrastructure/rtk/api/auth.api";
import { clearAuthState } from "@/infrastructure/rtk/auth.slice";

interface ReduxProviderProps {
  children: React.ReactNode;
}

const AuthInitializer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const dispatch = useDispatch();
  const [refresh] = useRefreshMutation();
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const loggedInFlag = localStorage.getItem("pawdar-logged-in");
      if (loggedInFlag === "true") {
        try {
          // Perform silent refresh to get initial accessToken
          await refresh().unwrap();
        } catch (error) {
          console.error("Failed to restore session on initialization", error);
          dispatch(clearAuthState());
        }
      }
      setIsInitializing(false);
    };

    initializeAuth();
  }, [refresh, dispatch]);

  if (isInitializing) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-background select-none">
        <div className="flex flex-col items-center gap-3">
          <span className="text-5xl animate-bounce">🐾</span>
          <div className="text-xs text-muted animate-pulse font-bold tracking-widest uppercase mt-2">
            Loading Pawdar...
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export const ReduxProvider: React.FC<ReduxProviderProps> = ({ children }) => {
  return (
    <Provider store={store}>
      <AuthInitializer>{children}</AuthInitializer>
    </Provider>
  );
};

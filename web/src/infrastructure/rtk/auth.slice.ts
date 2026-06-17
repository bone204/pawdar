import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { UserDto } from "@/application/dto/auth.dto";

interface AuthState {
  accessToken: string | null;
  user: UserDto | null;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  accessToken: null,
  user: null,
  isAuthenticated: false,
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuthenticatedSession: (
      state,
      action: PayloadAction<{ accessToken: string; user: UserDto }>,
    ) => {
      state.accessToken = action.payload.accessToken;
      state.user = action.payload.user;
      state.isAuthenticated = true;
      // Save user & logged-in state to localStorage to survive page reload (not the accessToken itself)
      localStorage.setItem("pawdar-logged-in", "true");
      localStorage.setItem("pawdar-user", JSON.stringify(action.payload.user));
    },
    clearAuthState: (state) => {
      state.accessToken = null;
      state.user = null;
      state.isAuthenticated = false;
      localStorage.removeItem("pawdar-logged-in");
      localStorage.removeItem("pawdar-user");
    },
  },
});

export const { setAuthenticatedSession, clearAuthState } = authSlice.actions;

export const selectAuth = (state: { auth: AuthState }) => state.auth;
export const selectCurrentUser = (state: { auth: AuthState }) => state.auth.user;
export const selectIsAuthenticated = (state: { auth: AuthState }) => state.auth.isAuthenticated;

export default authSlice.reducer;

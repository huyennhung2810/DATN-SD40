import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type {
  AuthUser,
  LoginRequest,
  RegisterRequest,
} from "../../models/auth";
import { AUTH_STORAGE_KEYS } from "../../models/auth";

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoggedIn: boolean;
  loading: boolean;
  error: string | null;
}

// Khôi phục state từ localStorage khi app khởi động
const storedUser = localStorage.getItem(AUTH_STORAGE_KEYS.USER);
const initialState: AuthState = {
  user: storedUser ? JSON.parse(storedUser) : null,
  accessToken: localStorage.getItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN),
  refreshToken: localStorage.getItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN),
  isLoggedIn: !!localStorage.getItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN),
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // Trigger actions (handled by Saga)
    login: (
      state,
      _action: PayloadAction<{ data: LoginRequest; navigate: () => void }>,
    ) => {
      state.loading = true;
      state.error = null;
    },
    loginAdmin: (
      state,
      _action: PayloadAction<{ data: LoginRequest; navigate: () => void }>,
    ) => {
      state.loading = true;
      state.error = null;
    },
    register: (
      state,
      _action: PayloadAction<{ data: RegisterRequest; navigate: () => void }>,
    ) => {
      state.loading = true;
      state.error = null;
    },
    logout: (state) => {
      state.loading = true;
    },

    // Result actions
    loginSuccess: (
      state,
      action: PayloadAction<{
        user: AuthUser;
        accessToken: string;
        refreshToken: string;
      }>,
    ) => {
      const { user, accessToken, refreshToken } = action.payload;
      state.user = user;
      state.accessToken = accessToken;
      state.refreshToken = refreshToken;
      state.isLoggedIn = true;
      state.loading = false;
      state.error = null;

      // Lưu vào localStorage
      localStorage.setItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN, accessToken);
      localStorage.setItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
      localStorage.setItem(AUTH_STORAGE_KEYS.USER, JSON.stringify(user));
    },
    authFailed: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    logoutSuccess: (state) => {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.isLoggedIn = false;
      state.loading = false;
      state.error = null;

      // Xóa khỏi localStorage
      localStorage.removeItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN);
      localStorage.removeItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN);
      localStorage.removeItem(AUTH_STORAGE_KEYS.USER);
    },
    registerSuccess: (state) => {
      state.loading = false;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const authActions = authSlice.actions;
export default authSlice.reducer;

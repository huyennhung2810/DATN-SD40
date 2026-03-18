import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type {
  AuthUser,
  LoginRequest,
  RegisterRequest,
} from "../../models/auth";
import { AUTH_STORAGE_KEYS } from "../../models/auth";

interface AuthState {
  user: AuthUser | null;
  isLoggedIn: boolean;
  loading: boolean;
  error: string | null;
}

// Khôi phục trạng thái an toàn từ localStorage
const getInitialState = (): AuthState => {
  try {
    const accessToken = localStorage.getItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN);
    const storedUser = localStorage.getItem(AUTH_STORAGE_KEYS.USER);
    return {
      user: storedUser ? JSON.parse(storedUser) : null,
      isLoggedIn: !!accessToken,
      loading: false,
      error: null,
    };
  } catch (e) {
    return { user: null, isLoggedIn: false, loading: false, error: null };
  }
};

const authSlice = createSlice({
  name: "auth",
  initialState: getInitialState(),
  reducers: {
    // Actions khởi chạy (Triggers cho Saga)
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

    // Actions cập nhật State (Results từ Saga hoặc Interceptor)
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
      state.isLoggedIn = true;
      state.loading = false;
      state.error = null;

      localStorage.setItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN, accessToken);
      localStorage.setItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
      localStorage.setItem(AUTH_STORAGE_KEYS.USER, JSON.stringify(user));
    },

    authFailed: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Hàm dọn dẹp dùng chung cho cả Logout chủ động và bị ép buộc (Token hết hạn)
    logoutAction: (state) => {
      state.user = null;
      state.isLoggedIn = false;
      state.loading = false;
      state.error = null;
      localStorage.removeItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN);
      localStorage.removeItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN);
      localStorage.removeItem(AUTH_STORAGE_KEYS.USER);
    },

    registerSuccess: (state) => {
      state.loading = false;
    },

    clearError: (state) => {
      state.error = null;
    },
  },
});

export const authActions = authSlice.actions;
export default authSlice.reducer;

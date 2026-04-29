import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type {
  AuthUser,
  LoginRequest,
  RegisterRequest,
} from "../../models/auth";
import { AUTH_STORAGE_KEYS } from "../../models/auth";
import { isTokenExpired } from "../../constants/jwt";

interface AuthState {
  user: AuthUser | null;
  isLoggedIn: boolean;
  loading: boolean;
  error: string | null;
}

// Admin dùng sessionStorage (cô lập theo tab), Client dùng localStorage
const ADMIN_ROLES = ["ADMIN", "STAFF"];

const getAuthStorage = (user?: AuthUser | null): Storage => {
  if (user?.roles?.some((r) => ADMIN_ROLES.includes(r))) return sessionStorage;
  return localStorage;
};

const clearAllStorage = (key: string) => {
  sessionStorage.removeItem(key);
  localStorage.removeItem(key);
};

const isAdminUser = (user: AuthUser | null): boolean =>
  !!user?.roles?.some((r) => ADMIN_ROLES.includes(r));

const readStoredUser = (storage: Storage): AuthUser | null => {
  const rawUser = storage.getItem(AUTH_STORAGE_KEYS.USER);
  if (!rawUser) return null;
  return JSON.parse(rawUser) as AuthUser;
};

const isAdminAreaPath = (): boolean => {
  if (typeof window === "undefined") return false;
  const path = window.location.pathname;
  return !(
    path.startsWith("/client") ||
    path.startsWith("/login") ||
    path.startsWith("/register") ||
    path.startsWith("/forgot-password") ||
    path.startsWith("/oauth2/redirect") ||
    path.startsWith("/payment/vnpay-return")
  );
};

// Khôi phục trạng thái an toàn – ưu tiên sessionStorage (admin tab)
const getInitialState = (): AuthState => {
  try {
    const adminArea = isAdminAreaPath();
    const sessionUser = readStoredUser(sessionStorage);
    const localUser = readStoredUser(localStorage);

    const storage =
      adminArea
        ? isAdminUser(sessionUser)
          ? sessionStorage
          : isAdminUser(localUser)
            ? localStorage
            : sessionStorage
        : localStorage;

    const accessToken = storage.getItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN);
    const refreshToken = storage.getItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN);
    const user = readStoredUser(storage);

    if (!accessToken && !refreshToken) {
      if (adminArea && localUser && !isAdminUser(localUser)) {
        sessionStorage.removeItem(AUTH_STORAGE_KEYS.USER);
      } else {
        clearAllStorage(AUTH_STORAGE_KEYS.USER);
      }
      return { user: null, isLoggedIn: false, loading: false, error: null };
    }

    if (accessToken && isTokenExpired(accessToken)) {
      if (refreshToken && user) {
        storage.removeItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN);
        return {
          user,
          isLoggedIn: true,
          loading: false,
          error: null,
        };
      }
      storage.removeItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN);
      storage.removeItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN);
      storage.removeItem(AUTH_STORAGE_KEYS.USER);
      return { user: null, isLoggedIn: false, loading: false, error: null };
    }

    return {
      user,
      isLoggedIn: !!user,
      loading: false,
      error: null,
    };
  } catch (e) {
    console.error("Lỗi khôi phục trạng thái auth:", e);
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
      _action: PayloadAction<{
        data: LoginRequest;
        navigate: (role: string) => void;
      }>,
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
    logout: (
      state,
      _action: PayloadAction<{ isAdmin?: boolean } | undefined>,
    ) => {
      state.loading = true;
    },

    // Actions cập nhật State (Results từ Saga hoặc Interceptor)
    loginSuccess: (
      state,
      action: PayloadAction<{
        user: AuthUser;
        accessToken: string;
        refreshToken?: string;
      }>,
    ) => {
      const { user, accessToken, refreshToken } = action.payload;
      state.user = user;
      state.isLoggedIn = true;
      state.loading = false;
      state.error = null;

      // Admin/Staff → sessionStorage (cô lập tab), Customer → localStorage
      const storage = getAuthStorage(user);
      storage.setItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN, accessToken);
      storage.setItem(AUTH_STORAGE_KEYS.USER, JSON.stringify(user));
      if (refreshToken) {
        storage.setItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
      }
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
      // Xóa cả 2 storage để đảm bảo sạch hoàn toàn trong tab hiện tại
      clearAllStorage(AUTH_STORAGE_KEYS.ACCESS_TOKEN);
      clearAllStorage(AUTH_STORAGE_KEYS.REFRESH_TOKEN);
      clearAllStorage(AUTH_STORAGE_KEYS.USER);
    },

    registerSuccess: (state) => {
      state.loading = false;
    },

    clearError: (state) => {
      state.error = null;
    },

    setUserImage: (state, action: PayloadAction<string | undefined>) => {
      if (state.user) {
        state.user.image = action.payload;
        const storage = getAuthStorage(state.user);
        storage.setItem(AUTH_STORAGE_KEYS.USER, JSON.stringify(state.user));
      }
    },
  },
});

export const authActions = authSlice.actions;
export default authSlice.reducer;

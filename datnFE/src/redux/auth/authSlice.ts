import type { PayloadAction } from "@reduxjs/toolkit";
import { createSlice } from "@reduxjs/toolkit";
import type { CurrentUser, LoginPayload, UpdateProfilePayload, ChangePasswordPayload } from "../../models/auth";
import { getAccessToken, getRefreshToken, setTokens as saveTokens, clearTokens } from "../../utils/authStorage";

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: CurrentUser | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  accessToken: getAccessToken(),
  refreshToken: getRefreshToken(),
  user: null,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    bootstrap: (state) => {
      state.accessToken = getAccessToken();
      state.refreshToken = getRefreshToken();
    },
    setUser: (state, action: PayloadAction<CurrentUser | null>) => {
      state.user = action.payload;
    },
    login: (state, _action: PayloadAction<{ payload: LoginPayload; onSuccess?: () => void }>) => {
      state.loading = true;
      state.error = null;
    },
    loginSuccess: (state, action: PayloadAction<{ accessToken: string; refreshToken: string }>) => {
      state.loading = false;
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      saveTokens(action.payload.accessToken, action.payload.refreshToken);
    },
    loginFailed: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    fetchMe: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchMeSuccess: (state, action: PayloadAction<CurrentUser>) => {
      state.loading = false;
      state.user = action.payload;
    },
    fetchMeFailed: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.user = null;
      state.error = action.payload;
    },
    updateProfile: (state, _action: PayloadAction<{ payload: UpdateProfilePayload; onSuccess?: () => void }>) => {
      state.loading = true;
      state.error = null;
    },
    updateProfileSuccess: (state, action: PayloadAction<CurrentUser>) => {
      state.loading = false;
      state.user = action.payload;
    },
    updateProfileFailed: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    changePassword: (state, _action: PayloadAction<{ payload: ChangePasswordPayload; onSuccess?: () => void }>) => {
      state.loading = true;
      state.error = null;
    },
    changePasswordSuccess: (state) => {
      state.loading = false;
    },
    changePasswordFailed: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    logout: (state, _action: PayloadAction<{ onDone?: () => void } | undefined>) => {
      state.loading = true;
      state.error = null;
    },
    logoutDone: (state) => {
      state.loading = false;
      state.accessToken = null;
      state.refreshToken = null;
      state.user = null;
      clearTokens();
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const authActions = authSlice.actions;
export default authSlice.reducer;

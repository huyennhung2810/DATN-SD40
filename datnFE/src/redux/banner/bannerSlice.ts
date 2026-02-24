import type { BannerSearchParams, BannerRequest, BannerResponse } from "../../models/banner";
import type { PayloadAction } from "@reduxjs/toolkit";
import { createSlice } from "@reduxjs/toolkit";
import type { PageResponse } from "../../models/base";

interface BannerState {
  list: BannerResponse[];
  loading: boolean;
  error: string | null;
  totalElements: number;
  totalPages: number;
  currentBanner: BannerResponse | null;
}

const initialState: BannerState = {
  list: [],
  loading: false,
  error: null,
  totalElements: 0,
  totalPages: 0,
  currentBanner: null,
};

const bannerSlice = createSlice({
  name: "banner",
  initialState,
  reducers: {
    getAll: (state, _action: PayloadAction<BannerSearchParams>) => {
      state.loading = true;
      state.error = null;
    },

    getBannerById: (state, _action: PayloadAction<string>) => {
      state.loading = true;
      state.error = null;
    },

    getBannerByIdSuccess: (state, action: PayloadAction<BannerResponse>) => {
      state.loading = false;
      state.currentBanner = action.payload;
    },

    addBanner: (state, _action: PayloadAction<BannerRequest>) => {
      state.loading = true;
    },

    updateBanner: (state, _action: PayloadAction<BannerRequest>) => {
      state.loading = true;
    },

    deleteBanner: (state, _action: PayloadAction<string>) => {
      state.loading = true;
    },

    updateBannerStatus: (state, _action: PayloadAction<{ id: string; status: string }>) => {
      state.loading = true;
    },

    fetchSuccess: (state, action: PayloadAction<PageResponse<BannerResponse>>) => {
      state.loading = false;
      state.list = action.payload.data;
      state.totalElements = action.payload.totalElements;
      state.totalPages = action.payload.totalPages;
      state.error = null;
    },

    actionSuccess: (state) => {
      state.loading = false;
      state.error = null;
    },

    actionFailed: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    resetCurrentBanner: (state) => {
      state.currentBanner = null;
      state.error = null;
    },
  },
});

export const bannerActions = bannerSlice.actions;
export const bannerReducer = bannerSlice.reducer;
export default bannerReducer;

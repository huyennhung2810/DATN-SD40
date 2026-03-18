import type { BrandPageParams, BrandRequest, BrandResponse } from "../../models/brand";
import type { PayloadAction } from "@reduxjs/toolkit";
import { createSlice } from "@reduxjs/toolkit";
import type { PageResponse } from "../../models/base";

interface BrandState {
  list: BrandResponse[];
  loading: boolean;
  error: string | null;
  totalElements: number;
  totalPages: number;
  currentBrand: BrandResponse | null;
}

const initialState: BrandState = {
  list: [],
  loading: false,
  error: null,
  totalElements: 0,
  totalPages: 0,
  currentBrand: null,
};

const brandSlice = createSlice({
  name: "brand",
  initialState,
  reducers: {
    getAll: (state, _action: PayloadAction<BrandPageParams>) => {
      state.loading = true;
      state.error = null;
    },

    getBrandById: (state, _action: PayloadAction<string>) => {
      state.loading = true;
      state.error = null;
    },

    getBrandByIdSuccess: (state, action: PayloadAction<BrandResponse>) => {
      state.loading = false;
      state.currentBrand = action.payload;
    },

    addBrand: (state, _action: PayloadAction<BrandRequest>) => {
      state.loading = true;
    },

    updateBrand: (state, _action: PayloadAction<BrandRequest>) => {
      state.loading = true;
    },

    setCurrentBrand: (state, action: PayloadAction<BrandResponse | null>) => {
      state.currentBrand = action.payload;
    },

    deleteBrand: (state, _action: PayloadAction<string>) => {
      state.loading = true;
    },

    fetchSuccess: (state, action: PayloadAction<PageResponse<BrandResponse>>) => {
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

    resetCurrentBrand: (state) => {
      state.currentBrand = null;
      state.error = null;
    },
  },
});

export const brandActions = brandSlice.actions;
export const brandReducer = brandSlice.reducer;
export default brandReducer;

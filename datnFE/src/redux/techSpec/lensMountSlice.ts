import type { LensMountSearchParams, LensMountRequest, LensMountResponse } from "../../api/lensMountApi";
import type { PayloadAction } from "@reduxjs/toolkit";
import { createSlice } from "@reduxjs/toolkit";
import type { PageResponse } from "../../models/base";

interface LensMountState {
  list: LensMountResponse[];
  loading: boolean;
  error: string | null;
  totalElements: number;
  totalPages: number;
  currentItem: LensMountResponse | null;
}

const initialState: LensMountState = {
  list: [],
  loading: false,
  error: null,
  totalElements: 0,
  totalPages: 0,
  currentItem: null,
};

const lensMountSlice = createSlice({
  name: "lensMount",
  initialState,
  reducers: {
    getAll: (state, _action: PayloadAction<LensMountSearchParams>) => {
      state.loading = true;
      state.error = null;
    },

    getById: (state, _action: PayloadAction<string>) => {
      state.loading = true;
      state.error = null;
    },

    getByIdSuccess: (state, action: PayloadAction<LensMountResponse>) => {
      state.loading = false;
      state.currentItem = action.payload;
    },

    create: (state, _action: PayloadAction<LensMountRequest>) => {
      state.loading = true;
    },

    update: (state, _action: PayloadAction<LensMountRequest>) => {
      state.loading = true;
    },

    setCurrentItem: (state, action: PayloadAction<LensMountResponse | null>) => {
      state.currentItem = action.payload;
    },

    delete: (state, _action: PayloadAction<string>) => {
      state.loading = true;
    },

    fetchSuccess: (state, action: PayloadAction<PageResponse<LensMountResponse>>) => {
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

    resetCurrentItem: (state) => {
      state.currentItem = null;
      state.error = null;
    },
  },
});

export const lensMountActions = lensMountSlice.actions;
export const lensMountReducer = lensMountSlice.reducer;
export default lensMountReducer;


import type { ResolutionSearchParams, ResolutionRequest, ResolutionResponse } from "../../api/resolutionApi";
import type { PayloadAction } from "@reduxjs/toolkit";
import { createSlice } from "@reduxjs/toolkit";
import type { PageResponse } from "../../models/base";

interface ResolutionState {
  list: ResolutionResponse[];
  loading: boolean;
  error: string | null;
  totalElements: number;
  totalPages: number;
  currentItem: ResolutionResponse | null;
}

const initialState: ResolutionState = {
  list: [],
  loading: false,
  error: null,
  totalElements: 0,
  totalPages: 0,
  currentItem: null,
};

const resolutionSlice = createSlice({
  name: "resolution",
  initialState,
  reducers: {
    getAll: (state, _action: PayloadAction<ResolutionSearchParams>) => {
      state.loading = true;
      state.error = null;
    },

    getById: (state, _action: PayloadAction<string>) => {
      state.loading = true;
      state.error = null;
    },

    getByIdSuccess: (state, action: PayloadAction<ResolutionResponse>) => {
      state.loading = false;
      state.currentItem = action.payload;
    },

    create: (state, _action: PayloadAction<ResolutionRequest>) => {
      state.loading = true;
    },

    update: (state, _action: PayloadAction<ResolutionRequest>) => {
      state.loading = true;
    },

    setCurrentItem: (state, action: PayloadAction<ResolutionResponse | null>) => {
      state.currentItem = action.payload;
    },

    delete: (state, _action: PayloadAction<string>) => {
      state.loading = true;
    },

    fetchSuccess: (state, action: PayloadAction<PageResponse<ResolutionResponse>>) => {
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

export const resolutionActions = resolutionSlice.actions;
export const resolutionReducer = resolutionSlice.reducer;
export default resolutionReducer;


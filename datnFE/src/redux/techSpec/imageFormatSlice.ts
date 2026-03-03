import type { ImageFormatSearchParams, ImageFormatRequest, ImageFormatResponse } from "../../api/imageFormatApi";
import type { PayloadAction } from "@reduxjs/toolkit";
import { createSlice } from "@reduxjs/toolkit";
import type { PageResponse } from "../../models/base";

interface ImageFormatState {
  list: ImageFormatResponse[];
  loading: boolean;
  error: string | null;
  totalElements: number;
  totalPages: number;
  currentItem: ImageFormatResponse | null;
}

const initialState: ImageFormatState = {
  list: [],
  loading: false,
  error: null,
  totalElements: 0,
  totalPages: 0,
  currentItem: null,
};

const imageFormatSlice = createSlice({
  name: "imageFormat",
  initialState,
  reducers: {
    getAll: (state, _action: PayloadAction<ImageFormatSearchParams>) => {
      state.loading = true;
      state.error = null;
    },

    getById: (state, _action: PayloadAction<string>) => {
      state.loading = true;
      state.error = null;
    },

    getByIdSuccess: (state, action: PayloadAction<ImageFormatResponse>) => {
      state.loading = false;
      state.currentItem = action.payload;
    },

    create: (state, _action: PayloadAction<ImageFormatRequest>) => {
      state.loading = true;
    },

    update: (state, _action: PayloadAction<ImageFormatRequest>) => {
      state.loading = true;
    },

    setCurrentItem: (state, action: PayloadAction<ImageFormatResponse | null>) => {
      state.currentItem = action.payload;
    },

    delete: (state, _action: PayloadAction<string>) => {
      state.loading = true;
    },

    fetchSuccess: (state, action: PayloadAction<PageResponse<ImageFormatResponse>>) => {
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

export const imageFormatActions = imageFormatSlice.actions;
export const imageFormatReducer = imageFormatSlice.reducer;
export default imageFormatReducer;


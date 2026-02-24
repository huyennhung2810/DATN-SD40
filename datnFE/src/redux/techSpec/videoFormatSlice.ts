import type { VideoFormatSearchParams, VideoFormatRequest, VideoFormatResponse } from "../../api/videoFormatApi";
import type { PayloadAction } from "@reduxjs/toolkit";
import { createSlice } from "@reduxjs/toolkit";
import type { PageResponse } from "../../models/base";

interface VideoFormatState {
  list: VideoFormatResponse[];
  loading: boolean;
  error: string | null;
  totalElements: number;
  totalPages: number;
  currentItem: VideoFormatResponse | null;
}

const initialState: VideoFormatState = {
  list: [],
  loading: false,
  error: null,
  totalElements: 0,
  totalPages: 0,
  currentItem: null,
};

const videoFormatSlice = createSlice({
  name: "videoFormat",
  initialState,
  reducers: {
    getAll: (state, _action: PayloadAction<VideoFormatSearchParams>) => {
      state.loading = true;
      state.error = null;
    },

    getById: (state, _action: PayloadAction<string>) => {
      state.loading = true;
      state.error = null;
    },

    getByIdSuccess: (state, action: PayloadAction<VideoFormatResponse>) => {
      state.loading = false;
      state.currentItem = action.payload;
    },

    create: (state, _action: PayloadAction<VideoFormatRequest>) => {
      state.loading = true;
    },

    update: (state, _action: PayloadAction<VideoFormatRequest>) => {
      state.loading = true;
    },

    setCurrentItem: (state, action: PayloadAction<VideoFormatResponse | null>) => {
      state.currentItem = action.payload;
    },

    delete: (state, _action: PayloadAction<string>) => {
      state.loading = true;
    },

    fetchSuccess: (state, action: PayloadAction<PageResponse<VideoFormatResponse>>) => {
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

export const videoFormatActions = videoFormatSlice.actions;
export const videoFormatReducer = videoFormatSlice.reducer;
export default videoFormatReducer;


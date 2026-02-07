import type { ProcessorSearchParams, ProcessorRequest, ProcessorResponse } from "../../api/processorApi";
import type { PayloadAction } from "@reduxjs/toolkit";
import { createSlice } from "@reduxjs/toolkit";
import type { PageResponse } from "../../models/base";

interface ProcessorState {
  list: ProcessorResponse[];
  loading: boolean;
  error: string | null;
  totalElements: number;
  totalPages: number;
  currentItem: ProcessorResponse | null;
}

const initialState: ProcessorState = {
  list: [],
  loading: false,
  error: null,
  totalElements: 0,
  totalPages: 0,
  currentItem: null,
};

const processorSlice = createSlice({
  name: "processor",
  initialState,
  reducers: {
    getAll: (state, _action: PayloadAction<ProcessorSearchParams>) => {
      state.loading = true;
      state.error = null;
    },

    getById: (state, _action: PayloadAction<string>) => {
      state.loading = true;
      state.error = null;
    },

    getByIdSuccess: (state, action: PayloadAction<ProcessorResponse>) => {
      state.loading = false;
      state.currentItem = action.payload;
    },

    create: (state, _action: PayloadAction<ProcessorRequest>) => {
      state.loading = true;
    },

    update: (state, _action: PayloadAction<ProcessorRequest>) => {
      state.loading = true;
    },

    setCurrentItem: (state, action: PayloadAction<ProcessorResponse | null>) => {
      state.currentItem = action.payload;
    },

    delete: (state, _action: PayloadAction<string>) => {
      state.loading = true;
    },

    fetchSuccess: (state, action: PayloadAction<PageResponse<ProcessorResponse>>) => {
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

export const processorActions = processorSlice.actions;
export const processorReducer = processorSlice.reducer;
export default processorReducer;


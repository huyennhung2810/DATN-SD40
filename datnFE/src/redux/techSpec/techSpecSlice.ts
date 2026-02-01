import type { TechSpecPageParams, TechSpecRequest, TechSpecResponse } from "../../models/techSpec";
import type { PayloadAction } from "@reduxjs/toolkit";
import { createSlice } from "@reduxjs/toolkit";
import type { PageResponse } from "../../models/base";

interface TechSpecState {
  list: TechSpecResponse[];
  loading: boolean;
  error: string | null;
  totalElements: number;
  totalPages: number;
  currentTechSpec: TechSpecResponse | null;
}

const initialState: TechSpecState = {
  list: [],
  loading: false,
  error: null,
  totalElements: 0,
  totalPages: 0,
  currentTechSpec: null,
};

const techSpecSlice = createSlice({
  name: "techSpec",
  initialState,
  reducers: {
    getAll: (state, _action: PayloadAction<TechSpecPageParams>) => {
      state.loading = true;
      state.error = null;
    },

    getTechSpecById: (state, _action: PayloadAction<string>) => {
      state.loading = true;
      state.error = null;
    },

    getTechSpecByIdSuccess: (state, action: PayloadAction<TechSpecResponse>) => {
      state.loading = false;
      state.currentTechSpec = action.payload;
    },

    addTechSpec: (state, _action: PayloadAction<TechSpecRequest>) => {
      state.loading = true;
    },

    updateTechSpec: (state, _action: PayloadAction<TechSpecRequest>) => {
      state.loading = true;
    },

    setCurrentTechSpec: (state, action: PayloadAction<TechSpecResponse | null>) => {
      state.currentTechSpec = action.payload;
    },

    deleteTechSpec: (state, _action: PayloadAction<string>) => {
      state.loading = true;
    },

    fetchSuccess: (state, action: PayloadAction<PageResponse<TechSpecResponse>>) => {
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

    resetCurrentTechSpec: (state) => {
      state.currentTechSpec = null;
      state.error = null;
    },
  },
});

export const techSpecActions = techSpecSlice.actions;
export const techSpecReducer = techSpecSlice.reducer;
export default techSpecReducer;


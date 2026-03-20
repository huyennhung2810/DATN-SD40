import type { TechSpecDefinitionSearchParams, TechSpecDefinitionRequest, TechSpecDefinitionResponse } from "../../models/techSpecGroup";
import type { PayloadAction } from "@reduxjs/toolkit";
import { createSlice } from "@reduxjs/toolkit";
import type { PageResponse } from "../../models/base";

interface TechSpecDefinitionState {
  list: TechSpecDefinitionResponse[];
  allActive: TechSpecDefinitionResponse[];
  loading: boolean;
  error: string | null;
  totalElements: number;
  totalPages: number;
  currentDefinition: TechSpecDefinitionResponse | null;
}

const initialState: TechSpecDefinitionState = {
  list: [],
  allActive: [],
  loading: false,
  error: null,
  totalElements: 0,
  totalPages: 0,
  currentDefinition: null,
};

const techSpecDefinitionSlice = createSlice({
  name: "techSpecDefinition",
  initialState,
  reducers: {
    getAll: (state, _action: PayloadAction<TechSpecDefinitionSearchParams>) => {
      state.loading = true;
      state.error = null;
    },
    getAllActiveDefinitions: (state) => {
      state.loading = true;
      state.error = null;
    },
    getAllActiveDefinitionsSuccess: (state, action: PayloadAction<TechSpecDefinitionResponse[]>) => {
      state.loading = false;
      state.allActive = action.payload;
    },
    getDefinitionById: (state, _action: PayloadAction<string>) => {
      state.loading = true;
      state.error = null;
    },
    getDefinitionByIdSuccess: (state, action: PayloadAction<TechSpecDefinitionResponse>) => {
      state.loading = false;
      state.currentDefinition = action.payload;
    },
    createDefinition: (state, _action: PayloadAction<TechSpecDefinitionRequest>) => {
      state.loading = true;
    },
    updateDefinition: (state, _action: PayloadAction<{ id: string; data: TechSpecDefinitionRequest }>) => {
      state.loading = true;
    },
    deleteDefinition: (state, _action: PayloadAction<string>) => {
      state.loading = true;
    },
    fetchSuccess: (state, action: PayloadAction<PageResponse<TechSpecDefinitionResponse>>) => {
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
    setCurrentDefinition: (state, action: PayloadAction<TechSpecDefinitionResponse | null>) => {
      state.currentDefinition = action.payload;
    },
    resetCurrentDefinition: (state) => {
      state.currentDefinition = null;
      state.error = null;
    },
  },
});

export const techSpecDefinitionActions = techSpecDefinitionSlice.actions;
export const techSpecDefinitionReducer = techSpecDefinitionSlice.reducer;
export default techSpecDefinitionReducer;

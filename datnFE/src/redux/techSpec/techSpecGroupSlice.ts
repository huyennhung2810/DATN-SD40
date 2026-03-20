import type { TechSpecGroupSearchParams, TechSpecGroupRequest, TechSpecGroupResponse } from "../../models/techSpecGroup";
import type { PayloadAction } from "@reduxjs/toolkit";
import { createSlice } from "@reduxjs/toolkit";
import type { PageResponse } from "../../models/base";

interface TechSpecGroupState {
  list: TechSpecGroupResponse[];
  loading: boolean;
  error: string | null;
  totalElements: number;
  totalPages: number;
  currentGroup: TechSpecGroupResponse | null;
}

const initialState: TechSpecGroupState = {
  list: [],
  loading: false,
  error: null,
  totalElements: 0,
  totalPages: 0,
  currentGroup: null,
};

const techSpecGroupSlice = createSlice({
  name: "techSpecGroup",
  initialState,
  reducers: {
    getAll: (state, _action: PayloadAction<TechSpecGroupSearchParams>) => {
      state.loading = true;
      state.error = null;
    },
    getGroupById: (state, _action: PayloadAction<string>) => {
      state.loading = true;
      state.error = null;
    },
    getGroupByIdSuccess: (state, action: PayloadAction<TechSpecGroupResponse>) => {
      state.loading = false;
      state.currentGroup = action.payload;
    },
    createGroup: (state, _action: PayloadAction<TechSpecGroupRequest>) => {
      state.loading = true;
    },
    updateGroup: (state, _action: PayloadAction<{ id: string; data: TechSpecGroupRequest }>) => {
      state.loading = true;
    },
    deleteGroup: (state, _action: PayloadAction<string>) => {
      state.loading = true;
    },
    fetchSuccess: (state, action: PayloadAction<PageResponse<TechSpecGroupResponse>>) => {
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
    setCurrentGroup: (state, action: PayloadAction<TechSpecGroupResponse | null>) => {
      state.currentGroup = action.payload;
    },
    resetCurrentGroup: (state) => {
      state.currentGroup = null;
      state.error = null;
    },
  },
});

export const techSpecGroupActions = techSpecGroupSlice.actions;
export const techSpecGroupReducer = techSpecGroupSlice.reducer;
export default techSpecGroupReducer;

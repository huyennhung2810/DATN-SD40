import type { SensorTypeSearchParams, SensorTypeRequest, SensorTypeResponse } from "../../api/sensorTypeApi";
import type { PayloadAction } from "@reduxjs/toolkit";
import { createSlice } from "@reduxjs/toolkit";
import type { PageResponse } from "../../models/base";

interface SensorTypeState {
  list: SensorTypeResponse[];
  loading: boolean;
  error: string | null;
  totalElements: number;
  totalPages: number;
  currentItem: SensorTypeResponse | null;
}

const initialState: SensorTypeState = {
  list: [],
  loading: false,
  error: null,
  totalElements: 0,
  totalPages: 0,
  currentItem: null,
};

const sensorTypeSlice = createSlice({
  name: "sensorType",
  initialState,
  reducers: {
    getAll: (state, _action: PayloadAction<SensorTypeSearchParams>) => {
      state.loading = true;
      state.error = null;
    },

    getById: (state, _action: PayloadAction<string>) => {
      state.loading = true;
      state.error = null;
    },

    getByIdSuccess: (state, action: PayloadAction<SensorTypeResponse>) => {
      state.loading = false;
      state.currentItem = action.payload;
    },

    create: (state, _action: PayloadAction<SensorTypeRequest>) => {
      state.loading = true;
    },

    update: (state, _action: PayloadAction<SensorTypeRequest>) => {
      state.loading = true;
    },

    setCurrentItem: (state, action: PayloadAction<SensorTypeResponse | null>) => {
      state.currentItem = action.payload;
    },

    delete: (state, _action: PayloadAction<string>) => {
      state.loading = true;
    },

    fetchSuccess: (state, action: PayloadAction<PageResponse<SensorTypeResponse>>) => {
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

export const sensorTypeActions = sensorTypeSlice.actions;
export const sensorTypeReducer = sensorTypeSlice.reducer;
export default sensorTypeReducer;


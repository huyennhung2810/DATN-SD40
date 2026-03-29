import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type {
  GHNProvince,
  GHNDistrict,
  GHNWard,
  GHNFeeRequest,
} from "../../models/ghnModels";

// ---- Action Types (strings for saga) ----
const SHIPPING_FETCH_PROVINCES = "shipping/fetchProvinces";
const SHIPPING_FETCH_DISTRICTS = "shipping/fetchDistricts";
const SHIPPING_FETCH_WARDS = "shipping/fetchWards";
const SHIPPING_CALCULATE_FEE = "shipping/calculateShippingFee";

// ---- Plain Action Creators ----
export const fetchProvinces = () => ({ type: SHIPPING_FETCH_PROVINCES });
export const fetchDistricts = (provinceId: number) => ({
  type: SHIPPING_FETCH_DISTRICTS,
  payload: provinceId,
});
export const fetchWards = (districtId: number) => ({
  type: SHIPPING_FETCH_WARDS,
  payload: districtId,
});
export const calculateShippingFeeRequest = (params: GHNFeeRequest) => ({
  type: SHIPPING_CALCULATE_FEE,
  payload: params,
});

// ---- Success / Failure actions (dispatched by saga) ----
export const fetchProvincesSuccess = (data: GHNProvince[]) => ({
  type: "shipping/fetchProvincesSuccess",
  payload: data,
});
export const fetchProvincesFailure = (error: string) => ({
  type: "shipping/fetchProvincesFailure",
  payload: error,
});
export const fetchDistrictsSuccess = (data: GHNDistrict[]) => ({
  type: "shipping/fetchDistrictsSuccess",
  payload: data,
});
export const fetchDistrictsFailure = (error: string) => ({
  type: "shipping/fetchDistrictsFailure",
  payload: error,
});
export const fetchWardsSuccess = (data: GHNWard[]) => ({
  type: "shipping/fetchWardsSuccess",
  payload: data,
});
export const fetchWardsFailure = (error: string) => ({
  type: "shipping/fetchWardsFailure",
  payload: error,
});
export const calculateShippingFeeSuccess = (fee: number) => ({
  type: "shipping/calculateShippingFeeSuccess",
  payload: fee,
});
export const calculateShippingFeeFailure = (error: string) => ({
  type: "shipping/calculateShippingFeeFailure",
  payload: error,
});

// Expose string constants for saga
export { SHIPPING_FETCH_PROVINCES, SHIPPING_FETCH_DISTRICTS, SHIPPING_FETCH_WARDS, SHIPPING_CALCULATE_FEE };

// ---- State ----
interface ShippingState {
  provinces: GHNProvince[];
  districts: GHNDistrict[];
  wards: GHNWard[];
  selectedProvinceCode: number | null;
  selectedDistrictId: number | null;
  selectedWardCode: string | null;
  shippingFee: number | null;
  loadingFee: boolean;
  loadingDistricts: boolean;
  loadingWards: boolean;
  error: string | null;
}

const initialState: ShippingState = {
  provinces: [],
  districts: [],
  wards: [],
  selectedProvinceCode: null,
  selectedDistrictId: null,
  selectedWardCode: null,
  shippingFee: null,
  loadingFee: false,
  loadingDistricts: false,
  loadingWards: false,
  error: null,
};

// ---- Slice ----
const shippingSlice = createSlice({
  name: "shipping",
  initialState,
  reducers: {
    setProvince: (
      state,
      action: PayloadAction<{ code: number; name: string }>
    ) => {
      state.selectedProvinceCode = action.payload.code;
      state.selectedDistrictId = null;
      state.selectedWardCode = null;
      state.districts = [];
      state.wards = [];
      state.shippingFee = null;
    },
    setDistrict: (
      state,
      action: PayloadAction<{ id: number; name: string }>
    ) => {
      state.selectedDistrictId = action.payload.id;
      state.selectedWardCode = null;
      state.wards = [];
      state.shippingFee = null;
    },
    setWard: (
      state,
      action: PayloadAction<{ code: string; name: string }>
    ) => {
      state.selectedWardCode = action.payload.code;
      state.shippingFee = null;
    },
    clearShippingFee: (state) => {
      state.shippingFee = null;
    },
    resetShippingAddress: (state) => {
      state.selectedProvinceCode = null;
      state.selectedDistrictId = null;
      state.selectedWardCode = null;
      state.districts = [];
      state.wards = [];
      state.shippingFee = null;
    },
    // ---- Saga result handlers ----
    fetchProvincesSuccess: (state, action) => {
      state.provinces = action.payload;
    },
    fetchDistrictsPending: (state) => {
      state.loadingDistricts = true;
    },
    fetchDistrictsSuccess: (state, action) => {
      state.loadingDistricts = false;
      state.districts = action.payload;
    },
    fetchDistrictsFailure: (state) => {
      state.loadingDistricts = false;
    },
    fetchWardsPending: (state) => {
      state.loadingWards = true;
    },
    fetchWardsSuccess: (state, action) => {
      state.loadingWards = false;
      state.wards = action.payload;
    },
    fetchWardsFailure: (state) => {
      state.loadingWards = false;
    },
    calculateShippingFeePending: (state) => {
      state.loadingFee = true;
      state.error = null;
    },
    calculateShippingFeeSuccess: (state, action) => {
      state.loadingFee = false;
      state.shippingFee = action.payload;
    },
    calculateShippingFeeFailure: (state) => {
      state.loadingFee = false;
    },
  },
});

export const {
  setProvince,
  setDistrict,
  setWard,
  clearShippingFee,
  resetShippingAddress,
  fetchDistrictsPending,
  fetchWardsPending,
  calculateShippingFeePending,
} = shippingSlice.actions;

export default shippingSlice.reducer;

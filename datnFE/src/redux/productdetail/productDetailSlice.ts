import type { PayloadAction } from "@reduxjs/toolkit";
import { createSlice } from "@reduxjs/toolkit";
import type {
  ProductDetailPageParams,
  ProductDetailFormValues,
  ProductDetailResponse,
} from "../../models/productdetail";

// Định nghĩa kiểu dữ liệu cho Payload của getById
interface GetByIdPayload {
  id: string;
  onSuccess?: (data: ProductDetailResponse) => void;
}

interface ProductDetailState {
  list: ProductDetailResponse[];
  loading: boolean;
  error: string | null;
  totalElements: number;
  totalPages: number;
  currentProductDetail: ProductDetailResponse | null;
}

const initialState: ProductDetailState = {
  list: [],
  loading: false,
  error: null,
  totalElements: 0,
  totalPages: 0,
  currentProductDetail: null,
};

const productDetailSlice = createSlice({
  name: "productDetail",
  initialState,
  reducers: {
    getAll: (state, _action: PayloadAction<ProductDetailPageParams>) => {
      state.loading = true;
      state.error = null;
    },

    
    getById: (state, _action: PayloadAction<GetByIdPayload>) => {
      state.loading = true;
      state.error = null;
    },

    add: (
      state,
      _action: PayloadAction<{
        data: ProductDetailFormValues;
        navigate?: () => void;
      }>
    ) => {
      state.loading = true;
    },

    update: (
      state,
      _action: PayloadAction<{
        id: string;
        data: ProductDetailFormValues;
        navigate?: () => void;
      }>
    ) => {
      state.loading = true;
    },

    changeStatus: (state, _action: PayloadAction<string>) => {
      state.loading = true;
    },

    exportExcel: (
      state,
      _action: PayloadAction<ProductDetailPageParams>
    ) => {
      state.loading = true;
    },
    fetchSuccess: (state, action: PayloadAction<any>) => {
      state.loading = false;
      state.list = action.payload; 
      state.totalElements = action.payload.length;
    },
    getByIdSuccess: (
      state,
      action: PayloadAction<ProductDetailResponse>
    ) => {
      state.loading = false;
      state.currentProductDetail = action.payload;
    },

    actionSuccess: (state) => {
      state.loading = false;
    },

    actionFailed: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    resetCurrent: (state) => {
      state.currentProductDetail = null;
      state.error = null;
    },
  },
});

export const productDetailActions = productDetailSlice.actions;
export const productDetailReducer = productDetailSlice.reducer;
export default productDetailReducer;
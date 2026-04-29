import type { PayloadAction } from "@reduxjs/toolkit";
import { createSlice } from "@reduxjs/toolkit";
import type {
  ProductDetailPageParams,
  ProductDetailFormValues,
  ProductDetailResponse,
} from "../../models/productdetail";

interface GetByIdPayload {
  id: string;
  onSuccess?: (data: ProductDetailResponse) => void;
}

interface ProductDetailState {
  list: ProductDetailResponse[];
  productList: any[]; // Bắt buộc phải có để chứa Sản phẩm cha
  loading: boolean;
  error: string | null;
  totalElements: number;
  currentProductDetail: ProductDetailResponse | null;
}

const initialState: ProductDetailState = {
  list: [],
  productList: [],
  loading: false,
  error: null,
  totalElements: 0,
  currentProductDetail: null,
};

const productDetailSlice = createSlice({
  name: "productDetail",
  initialState,
  reducers: {
    // 1. Actions cho Bảng SPCT
    getAll: (state, _action: PayloadAction<ProductDetailPageParams>) => {
      state.loading = true;
      state.error = null;
    },
    fetchSuccess: (state, action: PayloadAction<any>) => {
      state.loading = false;
      // Hứng đúng chữ 'data' từ JSON của Backend
      state.list = action.payload.data || action.payload.content || action.payload || []; 
      state.totalElements = action.payload.totalElements || state.list.length || 0;
    },

    // 2. Actions cho Select Sản phẩm cha
    getAllProduct: (state, _action: PayloadAction<any>) => {
      state.loading = true;
    },
    getAllProductSuccess: (state, action: PayloadAction<any>) => {
      state.loading = false;
      // Hứng đúng chữ 'data' từ JSON
      state.productList = action.payload.data || action.payload.content || action.payload || []; 
    },

    // 3. Actions CRUD khác
    getById: (state, _action: PayloadAction<GetByIdPayload>) => {
      state.loading = true;
    },
    getByIdSuccess: (state, action: PayloadAction<ProductDetailResponse>) => {
      state.loading = false;
      state.currentProductDetail = action.payload;
    },
    add: (state, _action: PayloadAction<{ data: any; navigate?: () => void; onError?: (error: any) => void }>) => {
      state.loading = true;
    },
    update: (state, _action: PayloadAction<{ id: string; data: any; navigate?: () => void; onError?: (error: any) => void }>) => {
      state.loading = true;
    },
    changeStatus: (state, _action: PayloadAction<string>) => {
      state.loading = true;
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
export default productDetailSlice.reducer;
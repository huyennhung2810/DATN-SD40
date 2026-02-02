import type { ProductPageParams, ProductRequest, ProductResponse } from "../../models/product";
import type { PayloadAction } from "@reduxjs/toolkit";
import { createSlice } from "@reduxjs/toolkit";
import type { PageResponse } from "../../models/base";

interface ProductState {
  list: ProductResponse[];
  loading: boolean;
  error: string | null;
  totalElements: number;
  totalPages: number;
  currentProduct: ProductResponse | null;
}

const initialState: ProductState = {
  list: [],
  loading: false,
  error: null,
  totalElements: 0,
  totalPages: 0,
  currentProduct: null,
};

const productSlice = createSlice({
  name: "product",
  initialState,
  reducers: {
    getAll: (state, _action: PayloadAction<ProductPageParams>) => {
      state.loading = true;
      state.error = null;
    },

    getProductById: (state, _action: PayloadAction<string>) => {
      state.loading = true;
      state.error = null;
    },

    getProductByIdSuccess: (state, action: PayloadAction<ProductResponse>) => {
      state.loading = false;
      state.currentProduct = action.payload;
    },

    addProduct: (state, _action: PayloadAction<ProductRequest>) => {
      state.loading = true;
    },

    updateProduct: (state, _action: PayloadAction<ProductRequest>) => {
      state.loading = true;
    },

    setCurrentProduct: (state, action: PayloadAction<ProductResponse | null>) => {
      state.currentProduct = action.payload;
    },

    deleteProduct: (state, _action: PayloadAction<string>) => {
      state.loading = true;
    },

    fetchSuccess: (state, action: PayloadAction<PageResponse<ProductResponse>>) => {
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

    resetCurrentProduct: (state) => {
      state.currentProduct = null;
      state.error = null;
    },
  },
});

export const productActions = productSlice.actions;
export const productReducer = productSlice.reducer;
export default productReducer;


import type { ProductCategoryPageParams, ProductCategoryRequest, ProductCategoryResponse } from "../../models/productCategory";
import type { PayloadAction } from "@reduxjs/toolkit";
import { createSlice } from "@reduxjs/toolkit";
import type { PageResponse } from "../../models/base";

interface ProductCategoryState {
  list: ProductCategoryResponse[];
  loading: boolean;
  error: string | null;
  totalElements: number;
  totalPages: number;
  currentCategory: ProductCategoryResponse | null;
}

const initialState: ProductCategoryState = {
  list: [],
  loading: false,
  error: null,
  totalElements: 0,
  totalPages: 0,
  currentCategory: null,
};

const productCategorySlice = createSlice({
  name: "productCategory",
  initialState,
  reducers: {
    getAll: (state, _action: PayloadAction<ProductCategoryPageParams>) => {
      state.loading = true;
      state.error = null;
    },

    getCategoryById: (state, _action: PayloadAction<string>) => {
      state.loading = true;
      state.error = null;
    },

    getCategoryByIdSuccess: (state, action: PayloadAction<ProductCategoryResponse>) => {
      state.loading = false;
      state.currentCategory = action.payload;
    },

    addCategory: (state, _action: PayloadAction<ProductCategoryRequest>) => {
      state.loading = true;
    },

    updateCategory: (state, _action: PayloadAction<ProductCategoryRequest>) => {
      state.loading = true;
    },

    setCurrentCategory: (state, action: PayloadAction<ProductCategoryResponse | null>) => {
      state.currentCategory = action.payload;
    },

    deleteCategory: (state, _action: PayloadAction<string>) => {
      state.loading = true;
    },

    fetchSuccess: (state, action: PayloadAction<PageResponse<ProductCategoryResponse>>) => {
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

    resetCurrentCategory: (state) => {
      state.currentCategory = null;
      state.error = null;
    },
  },
});

export const productCategoryActions = productCategorySlice.actions;
export const productCategoryReducer = productCategorySlice.reducer;
export default productCategoryReducer;


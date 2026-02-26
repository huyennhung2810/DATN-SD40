import type { ProductImageResponse } from "../../models/productImage";
import type { PayloadAction } from "@reduxjs/toolkit";
import { createSlice } from "@reduxjs/toolkit";

interface ProductImageState {
  list: ProductImageResponse[];
  loading: boolean;
  error: string | null;
}

const initialState: ProductImageState = {
  list: [],
  loading: false,
  error: null,
};

const productImageSlice = createSlice({
  name: "productImage",
  initialState,
  reducers: {
    getImagesByProduct: (state, _action: PayloadAction<string>) => {
      state.loading = true;
      state.error = null;
    },

    getImagesByProductSuccess: (state, action: PayloadAction<ProductImageResponse[]>) => {
      state.loading = false;
      state.list = action.payload;
      state.error = null;
    },

    uploadImage: (state, _action: PayloadAction<{ productId: string; file: File }>) => {
      state.loading = true;
    },

    uploadImageSuccess: (state) => {
      state.loading = false;
      state.error = null;
    },

    deleteImage: (state, _action: PayloadAction<string>) => {
      state.loading = true;
    },

    deleteImageSuccess: (state) => {
      state.loading = false;
      state.error = null;
    },

    actionFailed: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    resetImages: (state) => {
      state.list = [];
      state.error = null;
    },
  },
});

export const productImageActions = productImageSlice.actions;
export const productImageReducer = productImageSlice.reducer;
export default productImageReducer;


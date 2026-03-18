import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { Discount } from "../../models/Discount";

interface DiscountState {
  list: Discount[];
  loading: boolean;
  totalElements: number;
  currentDiscount: Discount | null;
  error: string | null | any;
}

const initialState: DiscountState = {
  list: [],
  loading: false,
  totalElements: 0,
  currentDiscount: null,
  error: null,
};

const discountSlice = createSlice({
  name: "discount",
  initialState,
  reducers: {
    // --- Lấy danh sách ---
    fetchDiscountsRequest: (state, _action: PayloadAction<any>) => {
      state.loading = true;
      state.error = null;
    },
  fetchDiscountsSuccess: (state, action) => {
      state.loading = false;
      const response = action.payload;

      // Nhặt đúng mảng dữ liệu từ JSON chuẩn của BE
      if (response?.data?.data && Array.isArray(response.data.data)) {
        state.list = response.data.data;
        state.totalElements = response.data.totalElements || response.data.data.length;
      } 
      else if (response?.data && Array.isArray(response.data)) {
        state.list = response.data;
        state.totalElements = response.totalElements || response.data.length;
      } 
      else {
        state.list = [];
        state.totalElements = 0;
      }
    },
    fetchDiscountsFailure: (state) => {
      state.loading = false;
      state.error = "Lỗi tải dữ liệu";
    },

    // --- Thêm mới ---
    addDiscountRequest: (
      state,
      _action: PayloadAction<{ data: any; navigate: () => void }>,
    ) => {
      state.loading = true;
    },
    addDiscountSuccess: (state, action: PayloadAction<any>) => {
      state.loading = false;
      // Thêm vào đầu danh sách hiển thị ngay lập tức
      state.list.unshift(action.payload);
    },
    addDiscountFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

   // --- Cập nhật ---
    updateDiscountRequest: (
      state,
      _action: PayloadAction<{ id?: string; data: any; navigate: () => void }>,
    ) => {
      state.loading = true;
      state.error = null; // Xóa lỗi cũ
    },
    updateDiscountSuccess: (state, action: PayloadAction<any>) => {
      state.loading = false;
      
      // Tùy chọn: Tìm và cập nhật item trong danh sách ngay lập tức
      const updatedItem = action.payload;
      const index = state.list.findIndex((item) => item.id === updatedItem.id);
      if (index !== -1) {
        state.list[index] = updatedItem;
      }
    },
    // THÊM MỚI DÒNG NÀY: Xử lý khi Update thất bại
    updateDiscountFailure: (state, action: PayloadAction<string>) => {
      state.loading = false; // QUAN TRỌNG: Tắt vòng xoay loading
      state.error = action.payload;
    },

    // --- Lấy chi tiết ---
    getDiscountByIdRequest: (state, _action: PayloadAction<string>) => {
      state.loading = true;
    },
    getDiscountByIdSuccess: (state, action: PayloadAction<Discount>) => {
      state.loading = false;
      state.currentDiscount = action.payload;
      // Logic map ID sản phẩm cho form (nếu cần) xử lý ở component hoặc saga
    },

    // --- Đổi trạng thái ---
    changeStatusDiscountRequest: (state, _action: PayloadAction<string>) => {
      state.loading = true;
    },
    changeStatusDiscountSuccess: (state, action: PayloadAction<string>) => {
      state.loading = false;
      // Cập nhật lại status trong list mà không cần load lại trang
      const item = state.list.find((d) => d.id === action.payload);
      if (item) {
        // Toggle logic: Nếu đang chạy (1) -> Dừng (2), Nếu chờ (0) -> Dừng (2)
        // Hoặc đơn giản là set lại status theo logic FE mong muốn hiển thị tạm thời
        item.status = item.status === 1 ? 2 : 1;
      }
    },

    resetCurrentDiscount: (state) => {
      state.currentDiscount = null;
    },
  },
});

export const {
  fetchDiscountsRequest,
  fetchDiscountsSuccess,
  fetchDiscountsFailure,
  addDiscountRequest,
  addDiscountSuccess,
  addDiscountFailure,
  updateDiscountRequest,
  updateDiscountSuccess,
  getDiscountByIdRequest,
  getDiscountByIdSuccess,
  changeStatusDiscountRequest,
  changeStatusDiscountSuccess,
  resetCurrentDiscount,
  updateDiscountFailure,
} = discountSlice.actions;

export default discountSlice.reducer;

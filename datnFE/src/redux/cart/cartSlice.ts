import { createSlice,type PayloadAction } from '@reduxjs/toolkit';

interface CartState {
  cartCount: number;
}

const initialState: CartState = {
  cartCount: 0,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    // Cập nhật lại toàn bộ số lượng (Dùng khi vừa load trang hoặc đăng nhập)
    setCartCount: (state, action: PayloadAction<number>) => {
      state.cartCount = action.payload;
    },
    // Cộng thêm số lượng (Dùng khi khách bấm nút "Thêm vào giỏ" ở trang sản phẩm)
    increaseCartCount: (state) => {
      state.cartCount += 1;
    },
    // Reset về 0 (Dùng khi khách đăng xuất)
    clearCartCount: (state) => {
      state.cartCount = 0;
    }
  },
});

export const { setCartCount, increaseCartCount, clearCartCount } = cartSlice.actions;
export default cartSlice.reducer;
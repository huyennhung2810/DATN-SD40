import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import guestCartService from '../../services/guestCartService';

interface CartState {
  cartCount: number;
  isGuestMode: boolean;
}

const initialState: CartState = {
  cartCount: 0,
  isGuestMode: false,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    setCartCount: (state, action: PayloadAction<number>) => {
      state.cartCount = action.payload;
    },
    increaseCartCount: (state) => {
      state.cartCount += 1;
    },
    clearCartCount: (state) => {
      state.cartCount = 0;
    },
    setGuestMode: (state, action: PayloadAction<boolean>) => {
      state.isGuestMode = action.payload;
    },
    syncGuestCartCount: (state) => {
      state.cartCount = guestCartService.getCartCount();
    },
  },
});

export const { setCartCount, increaseCartCount, clearCartCount, setGuestMode, syncGuestCartCount } = cartSlice.actions;
export default cartSlice.reducer;
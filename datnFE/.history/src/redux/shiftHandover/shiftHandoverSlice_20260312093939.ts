import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { 
  ShiftHandoverResponse, 
  CheckInRequest, 
  CheckOutRequest 
} from "../../models/shiftHandover";

interface ShiftState {
  currentShift: ShiftHandoverResponse | null;
  isLoading: boolean;
}

const initialState: ShiftState = {
  currentShift: JSON,
  isLoading: false,
};

const shiftHandoverSlice = createSlice({
  name: "shiftHandover",
  initialState,
  reducers: {
    // Check-in
    checkInRequest: (state, _action: PayloadAction<CheckInRequest>) => {
      state.isLoading = true;
    },
    checkInSuccess: (state, action: PayloadAction<ShiftHandoverResponse>) => {
      state.isLoading = false;
      state.currentShift = action.payload; 
    },
    checkInFailed: (state) => {
      state.isLoading = false;
    },

    // Check-out
    checkOutRequest: (state, _action: PayloadAction<CheckOutRequest>) => {
      state.isLoading = true;
    },
    checkOutSuccess: (state) => {
      state.isLoading = false;
      state.currentShift = null; 
    },
    checkOutFailed: (state) => {
      state.isLoading = false;
    }
  }
});

export const shiftActions = shiftHandoverSlice.actions;
export default shiftHandoverSlice.reducer;
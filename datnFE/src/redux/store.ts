import { configureStore } from "@reduxjs/toolkit";
import createSagaMiddleware from 'redux-saga';
import customerReducer from "./customer/customerSlice";
import rootSaga from "../store/rootSaga";
import voucherReducer from "./Voucher/voucherSlice"; // Import reducer mới
const sagaMiddleware = createSagaMiddleware();
import employeeReducer from "./employee/employeeSlice";


export const store = configureStore({
  reducer: {
    customer: customerReducer,
    employee: employeeReducer,
    voucher: voucherReducer, // Đăng ký voucher reducer vào store
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ 
      thunk: false,
      serializableCheck: false 
    }).concat(sagaMiddleware),
});

sagaMiddleware.run(rootSaga);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
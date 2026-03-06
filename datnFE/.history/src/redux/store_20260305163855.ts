import { configureStore } from "@reduxjs/toolkit";
import createSagaMiddleware from 'redux-saga';
import customerReducer from "./customer/customerSlice";
import rootSaga from "../store/rootSaga";
import voucherReducer from "./Voucher/voucherSlice"; 
const sagaMiddleware = createSagaMiddleware();
import employeeReducer from "./employee/employeeSlice";
import statisticsReducer from "./statistics/statisticsSlice";
import shiftHandoverReducer from "./shiftHandover/shiftHandoverSlice";
import discountReducer from "../redux/discount/discountSlice";


export const store = configureStore({
  reducer: {
    customer: customerReducer,
    employee: employeeReducer,
    statistics: statisticsReducer,
    voucher: voucherReducer,
    discount: discountReducer,
    shiftHandover: shiftHandoverReducer,
    shiftTemplate: shiftTem
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ 
      thunk: true,
      serializableCheck: false 
    }).concat(sagaMiddleware),
});

sagaMiddleware.run(rootSaga);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
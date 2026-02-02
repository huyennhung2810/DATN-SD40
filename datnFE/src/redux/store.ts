import { configureStore } from "@reduxjs/toolkit";
import createSagaMiddleware from 'redux-saga';
import customerReducer from "./customer/customerSlice";
import rootSaga from "../store/rootSaga";
const sagaMiddleware = createSagaMiddleware();
import employeeReducer from "./employee/employeeSlice";
import productCategoryReducer from "./productCategory/productCategorySlice";
import techSpecReducer from "./techSpec/techSpecSlice";
import productReducer from "./product/productSlice";
import productImageReducer from "./productImage/productImageSlice";


export const store = configureStore({
  reducer: {
    customer: customerReducer,
    employee: employeeReducer,
    productCategory: productCategoryReducer,
    techSpec: techSpecReducer,
    product: productReducer,
    productImage: productImageReducer,
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
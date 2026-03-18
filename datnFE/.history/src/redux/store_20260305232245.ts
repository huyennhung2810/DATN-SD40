import { configureStore } from "@reduxjs/toolkit";
import createSagaMiddleware from "redux-saga";

// Reducers
import customerReducer from "./customer/customerSlice";
import employeeReducer from "./employee/employeeSlice";
import voucherReducer from "./Voucher/voucherSlice";
import discountReducer from "../redux/discount/discountSlice";

import statisticsReducer from "./statistics/statisticsSlice";
import shiftHandoverReducer from "./shiftHandover/shiftHandoverSlice";
import shiftTemplateReducer from "./shiftTemplate/ShiftTemplateSlice";

import productCategoryReducer from "./productCategory/productCategorySlice";
import techSpecReducer from "./techSpec/techSpecSlice";
import productReducer from "./product/productSlice";
import productImageReducer from "./productImage/productImageSlice";

import sensorTypeReducer from "./techSpec/sensorTypeSlice";
import lensMountReducer from "./techSpec/lensMountSlice";
import resolutionReducer from "./techSpec/resolutionSlice";
import processorReducer from "./techSpec/processorSlice";
import imageFormatReducer from "./techSpec/imageFormatSlice";
import videoFormatReducer from "./techSpec/videoFormatSlice";

import rootSaga from "../store/rootSaga";

const sagaMiddleware = createSagaMiddleware();

export const store = configureStore({
  reducer: {
    customer: customerReducer,
    employee: employeeReducer,

    // Admin
    statistics: statisticsReducer,
    voucher: voucherReducer,
    discount: discountReducer,
    shiftHandover: shiftHandoverReducer,
    shiftTemplate: shiftTemplateReducer,

    // Product module
    productCategory: productCategoryReducer,
    techSpec: techSpecReducer,
    product: productReducer,
    productImage: productImageReducer,

    sensorType: sensorTypeReducer,
    lensMount: lensMountReducer,
    resolution: resolutionReducer,
    processor: processorReducer,
    imageFormat: imageFormatReducer,
    videoFormat: videoFormatReducer,
  },

  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      thunk: true,
      serializableCheck: false,
    }).concat(sagaMiddleware),
});

sagaMiddleware.run(rootSaga);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;